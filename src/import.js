import { unzipSync, strFromU8 } from "fflate";
import { decompress } from "fzstd";
import initSqlJs from "sql.js";
const decode = (bytes) =>
  bytes?.[0] === 0x28 && bytes?.[1] === 0xb5 ? decompress(bytes) : bytes;
// Minimal protobuf wire reader for Anki's documented notetype/media messages.
function proto(bytes) {
  const fields = {};
  let pos = 0;
  const varint = () => {
    let n = 0,
      factor = 1,
      count = 0;
    while (pos < bytes.length && count++ < 10) {
      const b = bytes[pos++];
      n += (b & 127) * factor;
      if (!(b & 128)) return n;
      factor *= 128;
    }
    throw new Error("Ungültige Protobuf-Daten");
  };
  while (pos < bytes.length) {
    const tag = varint(),
      field = Math.floor(tag / 8),
      type = tag % 8;
    let value;
    if (type === 0) value = varint();
    else if (type === 2) {
      const len = varint();
      if (pos + len > bytes.length)
        throw new Error("Unvollständige Protobuf-Daten");
      value = bytes.slice(pos, pos + len);
      pos += len;
    } else if (type === 1) {
      pos += 8;
      continue;
    } else if (type === 5) {
      pos += 4;
      continue;
    } else throw new Error("Unbekanntes Protobuf-Format");
    (fields[field] ??= []).push(value);
  }
  return fields;
}
const textField = (f, n) =>
  f[n]?.[0] instanceof Uint8Array ? strFromU8(f[n][0]) : "";
function rows(db, sql) {
  try {
    const r = db.exec(sql)[0];
    return r
      ? r.values.map((v) =>
          Object.fromEntries(r.columns.map((k, i) => [k, v[i]])),
        )
      : [];
  } catch {
    return [];
  }
}
function clean(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc
    .querySelectorAll("script,style,iframe,object,embed,link,meta,svg")
    .forEach((e) => e.remove());
  doc.querySelectorAll("br").forEach((e) => e.replaceWith("\n"));
  doc.querySelectorAll("div,p,li,tr").forEach((e) => e.append("\n"));
  return doc.body.textContent.replace(/\n{3,}/g, "\n\n").trim();
}
function render(template, fields, ordinal, answer, front = "") {
  let html = template || "";
  for (let i = 0; i < 5; i++)
    html = html.replace(
      /{{([#^])([^}]+)}}([\s\S]*?){{\/\2}}/g,
      (_, op, name, body) =>
        Boolean(fields[name]?.trim()) === (op === "#") ? body : "",
    );
  html = html
    .replace(/{{FrontSide}}/g, front)
    .replace(/{{([^}]+)}}/g, (_, token) => {
      const name = token.split(":").pop();
      const value = fields[name] || "";
      if (token.startsWith("cloze:"))
        return value.replace(
          /{{c(\d+)::([\s\S]*?)(?:::(.*?))?}}/g,
          (_, n, text, hint) =>
            Number(n) === ordinal + 1
              ? answer
                ? text
                : `[${hint || "…"}]`
              : text,
        );
      return value;
    });
  return html;
}
export async function importAnki(file) {
  const zip = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const key = [
    "collection.anki21b",
    "collection.anki21",
    "collection.anki2",
  ].find((k) => zip[k]);
  if (!key) throw new Error("Keine Anki-Sammlung gefunden.");
  const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
  const db = new SQL.Database(decode(zip[key]));
  try {
    const notes = rows(db, "SELECT id, mid, flds, tags FROM notes");
    if (!notes.length) throw new Error("Die Sammlung enthält keine Notizen.");
    const col = rows(db, "SELECT models, decks FROM col")[0] || {};
    let models = {},
      decks = {};
    try {
      models = JSON.parse(col.models || "{}");
      decks = JSON.parse(col.decks || "{}");
    } catch {}
    for (const n of rows(db, "SELECT id, name, config FROM notetypes")) {
      const config = proto(n.config);
      models[n.id] = {
        name: n.name,
        type: config[1]?.[0] || 0,
        flds: [],
        tmpls: [],
      };
    }
    for (const f of rows(db, "SELECT ntid, ord, name FROM fields ORDER BY ord"))
      if (models[f.ntid]) models[f.ntid].flds[f.ord] = { name: f.name };
    for (const t of rows(
      db,
      "SELECT ntid, ord, config FROM templates ORDER BY ord",
    ))
      if (models[t.ntid]) {
        const config = proto(t.config);
        models[t.ntid].tmpls[t.ord] = {
          qfmt: textField(config, 1),
          afmt: textField(config, 2),
        };
      }
    for (const d of rows(db, "SELECT id, name FROM decks"))
      decks[d.id] = { name: d.name.replaceAll("\x1f", "::") };
    const allCards = rows(db, "SELECT id, nid, did, ord FROM cards");
    if (!allCards.length)
      throw new Error(
        "Die Sammlung enthält keine Karten. Bitte als vollständiges Anki-Deck exportieren.",
      );
    let media = {},
      mediaWarning = "";
    if (zip.media) {
      try {
        media = JSON.parse(strFromU8(decode(zip.media)));
      } catch {
        try {
          const entries = proto(decode(zip.media))[1] || [];
          entries.forEach((raw, i) => {
            const entry = proto(raw);
            media[entry[255]?.[0] ?? i] = textField(entry, 1);
          });
        } catch {
          mediaWarning =
            "Das Medienverzeichnis konnte nicht gelesen werden. Textkarten wurden importiert; für Bilder bitte mit Unterstützung älterer Anki-Versionen exportieren.";
        }
      }
    }
    const urls = {};
    for (const [k, name] of Object.entries(media)) {
      if (zip[k]) {
        const type = /\.png$/i.test(name)
          ? "image/png"
          : /\.svg$/i.test(name)
            ? "image/svg+xml"
            : /\.webp$/i.test(name)
              ? "image/webp"
              : /\.gif$/i.test(name)
                ? "image/gif"
                : "image/jpeg";
        urls[name] = URL.createObjectURL(new Blob([decode(zip[k])], { type }));
      }
    }
    const pics = (html) =>
      [
        ...new DOMParser()
          .parseFromString(html, "text/html")
          .querySelectorAll("img"),
      ]
        .map(
          (e) =>
            urls[e.getAttribute("src")] ||
            urls[decodeURIComponent(e.getAttribute("src") || "")],
        )
        .filter(Boolean);
    const byId = new Map(notes.map((n) => [String(n.id), n]));
    let fallback = 0;
    const cards = allCards.map((card) => {
      const n = byId.get(String(card.nid));
      if (!n)
        throw new Error(`Karte ${card.id} verweist auf eine fehlende Notiz.`);
      const f = n.flds.split("\x1f"),
        model = models[n.mid],
        deck = decks[card.did]?.name || "Nicht zugeordnet";
      const fields = Object.fromEntries(
        (model?.flds || []).map((v, i) => [v.name, f[i] || ""]),
      );
      Object.assign(fields, {
        Tags: n.tags,
        Deck: deck,
        Subdeck: deck.split("::").pop(),
        Type: model?.name || "",
      });
      let front, back;
      const template = model?.tmpls?.[model.type === 1 ? 0 : card.ord];
      if (template) {
        front = render(template.qfmt, fields, card.ord, false);
        back = render(template.afmt, fields, card.ord, true, front);
      } else {
        fallback++;
        const cloze = f.some((x) => /{{c\d+::/.test(x));
        if (cloze) {
          const text = f.join("\n");
          front = text.replace(
            /{{c(\d+)::([\s\S]*?)(?:::(.*?))?}}/g,
            (_, num, t, h) => (+num === card.ord + 1 ? `[${h || "…"}]` : t),
          );
          back = text.replace(/{{c\d+::([\s\S]*?)(?:::(.*?))?}}/g, "$1");
        } else {
          const reverse = card.ord % 2 === 1;
          front = f[reverse ? 1 : 0] || "";
          back = (reverse ? [f[0], ...f.slice(2)] : f.slice(1)).join("\n");
        }
      }
      const identity = deck + " " + n.tags;
      const subject = /chem/i.test(identity)
        ? "Chemie"
        : /phys|mechanik|elektriz/i.test(identity)
          ? "Physik"
          : /math|algebra|geometr/i.test(identity)
            ? "Mathematik"
            : /biol|zelle|genetik|anatom|histolog|physiolog/i.test(identity)
              ? "Biologie"
              : "Import";
      const q = clean(front),
        a = clean(back);
      const unsupported =
        /image.?occlusion|image.?mask/i.test(model?.name || "") ||
        /{{[^}]+}}/.test(q);
      return {
        id: String(card.id),
        noteId: String(n.id),
        ordinal: card.ord,
        q: q || "Bildkarte / Karte ohne Fragetext",
        a,
        images: pics(front),
        answerImages: pics(back),
        subject,
        deck,
        tags: n.tags,
        unsupported,
      };
    });
    const warnings = [
      mediaWarning,
      fallback
        ? `${fallback} Karten verwenden die Feldansicht, da keine passende Anki-Vorlage verfügbar ist.`
        : "",
      cards.some((c) => c.unsupported)
        ? "Einige Karten verwenden spezielle Anki-Vorlagen (z. B. Image Occlusion). Ihre Maskierungslogik wird hier nicht vollständig nachgebildet."
        : "",
    ].filter(Boolean);
    return {
      cards,
      report: {
        notes: notes.length,
        cards: allCards.length,
        imported: cards.length,
        decks: Object.keys(decks).length,
        warnings,
      },
    };
  } finally {
    db.close();
  }
}
