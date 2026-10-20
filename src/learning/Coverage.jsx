import React, { useState } from "react";
import { curriculum } from "../curriculum";
import { sourceStatus, sources } from "../content/sources";
import { normalize } from "./mapping";
const gaps = [
  ["Biologie", "Embryonale Keimblätter und Organentwicklung"],
  ["Biologie", "Detaillierte Sinnesphysiologie"],
  ["Chemie", "Löslichkeit und Löslichkeitsprodukt"],
  ["Physik", "Drehmoment und Hebel"],
  ["Mathematik", "Kombinatorik mit und ohne Wiederholung"],
];
const initial = [
  ...curriculum.map((c) => ({
    id: c.id,
    label: c.title,
    subject: c.subject,
    chapterId: c.id,
  })),
  ...gaps
    .filter(([, label]) => !curriculum.some((c) => c.title === label))
    .map(([subject, label], i) => ({
      id: "gap-" + i,
      label,
      subject,
      chapterId: "",
    })),
];
function load() {
  try {
    return JSON.parse(localStorage.getItem("medat-checklist"));
  } catch {
    return null;
  }
}
export default function Coverage({ reviews = {}, onOpen }) {
  const [list, setList] = useState(
      () =>
        load() || {
          name: "Interner Lernkatalog (kein offizieller Abgleich)",
          official: false,
          source: "Redaktionelle Themenplanung",
          topics: initial,
        },
    ),
    [subject, setSubject] = useState("Alle"),
    [text, setText] = useState(""),
    [name, setName] = useState(""),
    [notice, setNotice] = useState("");
  const learned = (() => {
    try {
      return JSON.parse(localStorage.getItem("medat-lessons") || "[]");
    } catch {
      return [];
    }
  })();
  function save(next) {
    try {
      localStorage.setItem("medat-checklist", JSON.stringify(next));
      setList(next);
      setNotice("Themenliste lokal gespeichert.");
    } catch {
      setNotice("Speichern fehlgeschlagen. Bitte Browserspeicher prüfen.");
    }
  }
  function importList() {
    const labels = text
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!labels.length || !name.trim()) {
      setNotice("Bitte Quellbezeichnung und mindestens ein Thema eingeben.");
      return;
    }
    save({
      name: name.trim(),
      official: false,
      source: "Vom Nutzer eingegeben; nicht unabhängig verifiziert",
      topics: labels.map((label, i) => {
        const match = curriculum.find(
          (c) => normalize(c.title) === normalize(label),
        );
        return {
          id: "user-" + i,
          label,
          subject: match?.subject || "Offen",
          chapterId: match?.id || "",
        };
      }),
    });
    setText("");
  }
  const visible = list.topics.filter(
    (t) => subject === "Alle" || t.subject === subject,
  );
  const explained = list.topics.filter((t) =>
    curriculum.some((c) => c.id === t.chapterId),
  ).length;
  return (
    <section className="panel coverage">
      <h2>Stoffabdeckung & Quellen</h2>
      <p className="muted">{sourceStatus.note}</p>
      <div className="import-report">
        <strong>{list.name}</strong>
        <p>
          {explained}/{list.topics.length} Themen mit Erklärung ·{" "}
          {list.topics.length - explained} ohne verknüpftes Kapitel. Diese Quote
          bezieht sich ausschließlich auf diese Liste, nicht auf den
          vollständigen offiziellen MedAT-Stoff.
        </p>
        <p>Quelle: {list.source}</p>
      </div>
      <div className="filter-row">
        <select
          aria-label="Stoffabdeckung Fach"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {["Alle", ...new Set(list.topics.map((t) => t.subject))].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="coverage-list">
        {visible.map((t) => {
          const c = curriculum.find((c) => c.id === t.chapterId);
          const due =
            learned.includes(c?.id) &&
            Date.now() >=
              new Date(
                localStorage.getItem("medat-lesson-due-" + c?.id) ||
                  "9999-01-01",
              ).getTime();
          return (
            <article key={t.id}>
              <div>
                <strong>{t.label}</strong>
                <small>{t.subject}</small>
                <div className="status-chips">
                  <span>
                    {c ? "Erklärung vorhanden" : "Thema noch nicht behandelt"}
                  </span>
                  {c?.question && <span>Übungsfrage vorhanden</span>}
                  {learned.includes(c?.id) && <span>Vom Nutzer gelernt</span>}
                  {due && <span className="due">Zur Wiederholung fällig</span>}
                </div>
              </div>
              <div>
                <select
                  aria-label={"Kapitel für " + t.label}
                  value={t.chapterId}
                  onChange={(e) =>
                    save({
                      ...list,
                      topics: list.topics.map((x) =>
                        x.id === t.id
                          ? {
                              ...x,
                              chapterId: e.target.value,
                              subject:
                                curriculum.find((c) => c.id === e.target.value)
                                  ?.subject || x.subject,
                            }
                          : x,
                      ),
                    })
                  }
                >
                  <option value="">Nicht behandelt / nicht zugeordnet</option>
                  {curriculum.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.subject} · {c.title}
                    </option>
                  ))}
                </select>
                {c && (
                  <button className="text-button" onClick={() => onOpen(c)}>
                    Kapitel öffnen →
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <details className="checklist-import">
        <summary>
          Eigene Themenliste aus aktuellen offiziellen Unterlagen übernehmen
        </summary>
        <p>
          Öffne die offizielle Stichwortliste selbst und füge die Themen hier
          zeilenweise ein. Nur die eingegebene Liste wird gespeichert; es wird
          keine unabhängige offizielle Prüfung behauptet. Bestehende Lernkapitel
          bleiben erhalten.
        </p>
        <label>
          Quellbezeichnung / Version
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. BMS-Stichwortliste, Ausgabe …"
          />
        </label>
        <label>
          Ein Thema je Zeile
          <textarea
            rows="7"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button className="primary" onClick={importList}>
          Themenliste übernehmen
        </button>
        <button
          className="outline-button"
          onClick={() =>
            save({
              name: "Interner Lernkatalog (kein offizieller Abgleich)",
              official: false,
              source: "Redaktionelle Themenplanung",
              topics: initial,
            })
          }
        >
          Interne Liste wiederherstellen
        </button>
      </details>
      {notice && <p role="status">{notice}</p>}
      <h3>Quellenregister</h3>
      <p className="muted">
        Verweise zum eigenständigen Nachlesen. Keine übernommenen Lehrbuchtexte
        oder Fremdbilder. Lizenz- und fachliche Einzelprüfung der externen
        Quellen offen.
      </p>
      <div className="source-grid">
        {sources.map((s) => (
          <article key={s.id}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>
            <p>
              {s.subject} · {s.license}
            </p>
            <small>Zugriff / Inhaltsprüfung nicht bestätigt</small>
          </article>
        ))}
      </div>
    </section>
  );
}
