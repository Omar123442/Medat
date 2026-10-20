import React from "react";
import { cardKey, suggestChapter, loadMappings } from "./mapping";
import { isDue } from "./scheduler";
import { curriculum } from "../curriculum";
export default function ReviewDashboard({ cards, reviews, onPractice }) {
  const due = cards.filter((c) => isDue(reviews[cardKey(c)])),
    newCards = cards.filter((c) => !reviews[cardKey(c)]),
    saved = cards.filter((c) => reviews[cardKey(c)]);
  const groups = ["Biologie", "Chemie", "Physik", "Mathematik", "Import"];
  const overrides = loadMappings();
  const byChapter = {};
  for (const c of saved) {
    const id = suggestChapter(c, curriculum, overrides).chapterId;
    if (!id) continue;
    const entry = (byChapter[id] ??= {
      chapter: curriculum.find((ch) => ch.id === id),
      total: 0,
      lapses: 0,
    });
    entry.total++;
    entry.lapses += reviews[cardKey(c)].card.lapses || 0;
  }
  const weak = Object.values(byChapter)
    .filter((x) => x.chapter && x.lapses)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, 5);
  return (
    <section className="panel review-dashboard">
      <h2>Langfristig behalten · FSRS</h2>
      <p className="muted">
        FSRS berechnet aus deinen Bewertungen den nächsten Wiederholungstermin.
        Ziel-Behalten: 90 %. Das ist ein Algorithmusparameter und keine Zusage
        deines tatsächlichen Lernerfolgs.
      </p>
      <div className="review-metrics">
        <div>
          <strong>{due.length}</strong>
          <span>jetzt fällig</span>
        </div>
        <div>
          <strong>{newCards.length}</strong>
          <span>noch nicht bewertet</span>
        </div>
        <div>
          <strong>{saved.length}</strong>
          <span>mit Lernverlauf</span>
        </div>
      </div>
      <div className="lesson-actions">
        <button
          className="primary"
          disabled={!due.length}
          onClick={() => onPractice(null, due)}
        >
          Fällige Karten lernen ({due.length})
        </button>
        <button
          className="outline-button"
          disabled={!newCards.length}
          onClick={() => onPractice(null, newCards)}
        >
          Neue Karten lernen ({newCards.length})
        </button>
      </div>
      <h3>Deine Fächer im Blick</h3>
      {groups.map((s) => {
        const list = cards.filter((c) => c.subject === s);
        if (!list.length) return null;
        return (
          <div className="review-subject" key={s}>
            <strong>{s}</strong>
            <span>
              {list.filter((c) => isDue(reviews[cardKey(c)])).length} fällig
            </span>
            <span>
              {list.filter((c) => reviews[cardKey(c)]).length}/{list.length}{" "}
              bewertet
            </span>
          </div>
        );
      })}
      <h3>Wiederholungsvorschläge</h3>
      {weak.length ? (
        weak.map((w) => (
          <p key={w.chapter.id}>
            {w.chapter.title}: {w.lapses} von FSRS gezählte Rückfälle über{" "}
            {w.total} zugeordnete Karten. Lies die Erklärung erneut und
            bearbeite die fälligen Karten.
          </p>
        ))
      ) : (
        <p className="muted">
          Noch keine Rückfallmuster vorhanden. Bewertungen und Zuordnungen
          liefern mit der Zeit bessere Anhaltspunkte.
        </p>
      )}
      <h3>Nächste Termine</h3>
      {saved
        .sort(
          (a, b) =>
            new Date(reviews[cardKey(a)].card.due) -
            new Date(reviews[cardKey(b)].card.due),
        )
        .slice(0, 10)
        .map((c) => (
          <div className="review-subject" key={cardKey(c)}>
            <span>{c.q.slice(0, 110)}</span>
            <time>
              {new Date(reviews[cardKey(c)].card.due).toLocaleString("de-AT")}
            </time>
          </div>
        ))}
      <p className="muted">
        Lernverläufe sind lokal in IndexedDB gespeichert. Bereits im Anki-Deck
        enthaltene Terminpläne werden nicht importiert; der Campus-Verlauf
        beginnt mit deiner ersten Bewertung hier. Manuelles Lernen vor
        Fälligkeit ist möglich und beeinflusst den FSRS-Verlauf.
      </p>
    </section>
  );
}
