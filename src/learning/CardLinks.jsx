import React, { useMemo, useState } from "react";
import { curriculum } from "../curriculum";
import { suggestChapter, cardKey, loadMappings, saveMappings } from "./mapping";
export default function CardLinks({ cards, chapter, onPractice }) {
  const [overrides, setOverrides] = useState(loadMappings),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(0),
    [notice, setNotice] = useState("");
  const linked = useMemo(
    () =>
      cards.map((card) => ({
        card,
        ...suggestChapter(card, curriculum, overrides),
      })),
    [cards, overrides],
  );
  const selected = linked.filter(
    (x) =>
      (!chapter || x.chapterId === chapter.id) &&
      (!query ||
        (x.card.q + " " + x.card.deck + " " + x.card.tags)
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const pages = Math.max(1, Math.ceil(selected.length / 25));
  function assign(card, id) {
    const next = { ...overrides, [cardKey(card)]: id || null };
    try {
      saveMappings(next);
      setOverrides(next);
      setNotice("Zuordnung lokal gespeichert.");
    } catch {
      setNotice("Zuordnung konnte nicht gespeichert werden.");
    }
  }
  return (
    <section className="card-links">
      <div className="section-heading">
        <div>
          <h3>
            {chapter ? "Passende Anki-Karten" : "Thematische Kartenzuordnung"}
          </h3>
          <p>
            {selected.length} Karten · Vorschläge aus Decknamen, Tags und
            Kartentext
          </p>
        </div>
        <button
          className="primary"
          disabled={!selected.length}
          onClick={() =>
            onPractice(
              null,
              selected.map((x) => x.card),
            )
          }
        >
          Diese Karten lernen ({selected.length})
        </button>
      </div>
      <p className="muted">
        Automatische Vorschläge sind keine fachlich bestätigte Zuordnung. Du
        kannst sie korrigieren oder „Nicht zugeordnet“ wählen. Keine Karte wird
        dadurch aus deiner Sammlung gelöscht.
      </p>
      {!chapter && (
        <p className="muted">
          {linked.filter((x) => !x.chapterId).length} nicht zugeordnet ·{" "}
          {linked.filter((x) => x.confidence === "unsicherer Vorschlag").length}{" "}
          unsichere Vorschläge
        </p>
      )}
      <input
        className="full-input"
        aria-label="Zuordnung durchsuchen"
        placeholder="Karte, Deck oder Tag suchen …"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
      />
      {selected.slice(page * 25, (page + 1) * 25).map((x) => (
        <article className="mapping-row" key={cardKey(x.card)}>
          <div>
            <strong>{x.card.q.slice(0, 220)}</strong>
            <small>
              {x.card.deck || x.card.subject} · {x.confidence}
            </small>
          </div>
          <select
            aria-label={"Thema für Karte " + x.card.id}
            value={x.chapterId || ""}
            onChange={(e) => assign(x.card, e.target.value)}
          >
            <option value="">Nicht zugeordnet</option>
            {curriculum.map((c) => (
              <option key={c.id} value={c.id}>
                {c.subject} · {c.title}
              </option>
            ))}
          </select>
        </article>
      ))}
      {!selected.length && (
        <p>
          Keine Karten zu diesem Thema gefunden. Importiere dein Deck oder ordne
          Karten im Reiter „Kartenzuordnung“ manuell zu.
        </p>
      )}
      <div className="pagination">
        <button disabled={!page} onClick={() => setPage(page - 1)}>
          Zurück
        </button>
        <span>
          Seite {Math.min(page + 1, pages)} / {pages}
        </span>
        <button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>
          Weiter
        </button>
      </div>
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
