import React, { useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import Visual from "./Visual";
import ScriptMaterial from "../books/ScriptMaterial";
import CardLinks from "../learning/CardLinks";
import { sources } from "./sources";
export default function Lesson({
  chapter: c,
  cards,
  onPractice,
  onBack,
  read,
  onMark,
}) {
  const [answer, setAnswer] = useState(false);
  return (
    <article className="lesson rich-lesson">
      <button className="text-button" onClick={onBack}>
        <ChevronLeft size={15} />
        Alle Kapitel
      </button>
      <small className="eyebrow">
        {c.subject} / {c.topic} / {c.difficulty}
      </small>
      <h2>{c.title}</h2>
      <div className="lesson-meta">
        Stichwortvorschlag: {c.medatKeyword} · offizieller Abgleich offen
      </div>
      <section>
        <h3>1. Was lernst du?</h3>
        <p>{c.introduction}</p>
      </section>
      <section>
        <h3>2. Voraussetzungen</h3>
        <ul>
          {c.prerequisites.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>3. Die Zusammenhänge verstehen</h3>
        {c.paragraphs
          .filter((p) => p !== c.example)
          .map((p, i) => (
            <p key={i}>{p}</p>
          ))}
      </section>
      <ScriptMaterial chapterId={c.id} />
      {c.diagram && (
        <section>
          <h3>4. Schritt für Schritt sehen</h3>
          <Visual type={c.diagram} />
        </section>
      )}
      {c.formula && (
        <section>
          <h3>Formeln mit Bedeutung</h3>
          <div className="formula-box">
            <strong>{c.formula[0]}</strong>
            <p>{c.formula[1]}</p>
          </div>
        </section>
      )}
      <section>
        <h3>Ein Beispiel durchdenken</h3>
        <p>{c.example}</p>
      </section>
      <section className="logic-trap">
        <h3>Typischer Verständnisfehler</h3>
        <p>{c.mistake}</p>
      </section>
      <section>
        <h3>Das solltest du mitnehmen</h3>
        <ul>
          {c.summary.filter(Boolean).map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>
      <div className="comprehension">
        <strong>Verständnischeck</strong>
        <p>{c.question}</p>
        <button className="outline-button" onClick={() => setAnswer(!answer)}>
          {answer ? "Antwort ausblenden" : "Lösung ansehen"}
        </button>
        {answer && <p>{c.answer}</p>}
      </div>
      <div className="lesson-actions">
        <button className="outline-button" onClick={onMark}>
          {read ? "Als gelesen markiert" : "Verstanden und gelesen"}
          <Check size={16} />
        </button>
        <p className="muted">
          Als gelesen markierte Kapitel werden nach 7 Tagen zur inhaltlichen
          Wiederholung vorgeschlagen. Die Karten verwenden unabhängig davon
          FSRS.
        </p>
      </div>
      <CardLinks cards={cards} chapter={c} onPractice={onPractice} />
      <section>
        <h3>Weiterführende Quellen & Qualitätsstand</h3>
        <ul>
          {sources
            .filter((s) => c.sources.includes(s.id))
            .map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>{" "}
                · Referenzempfehlung; Lizenzprüfung offen
              </li>
            ))}
        </ul>
        <p className="muted">
          {c.reviewStatus}. Letzte externe fachliche Prüfung:{" "}
          {c.lastReviewed || "noch nicht erfolgt"}. Redaktioneller Stand:{" "}
          {c.lastUpdated}. Es wurden keine Buchtexte oder fremden Bilder
          übernommen.
        </p>
        {c.images.map((img) => (
          <p className="muted" key={img.id}>
            Grafik: {img.creator} · {img.license}
          </p>
        ))}
      </section>
    </article>
  );
}
