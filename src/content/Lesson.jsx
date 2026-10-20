import React, { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import Visual from "./Visual";
import ScriptMaterial from "../books/ScriptMaterial";
import CardLinks from "../learning/CardLinks";
import { sources } from "./sources";
import { studyFor } from "./study";
import ChapterSources from "./ChapterSources";
export default function Lesson({
  chapter: c,
  cards,
  onPractice,
  onBack,
  read,
  onMark,
  onOpenScripts,
  onPrevious,
  onNext,
}) {
  const [answer, setAnswer] = useState(false);
  const guide = studyFor(c);
  const base = c.id.startsWith("bms-")
    ? c.paragraphs
        .filter((p) => p !== c.example)
        .map((text, i) => ({
          title: i === 0 ? "Der Überblick" : "Grundwissen im Zusammenhang",
          text,
        }))
    : [];
  const sections = [...base, ...guide.sections];
  const anchor = (id) => `${c.id}-${id}`;
  const outline = [
    ["goals", "Lernziele"],
    ["terms", "Begriffe"],
    ["explanation", "Erklärung"],
    ["example", "Gelöstes Beispiel"],
    ["check", "Selbsttest"],
    ["cards", "Lernkarten"],
  ];
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
        {guide.citations.length
          ? "Lernkapitel mit Verweisen auf deine Skripte"
          : "Ergänzendes Lernkapitel"}{" "}
        · Stichwortvorschlag: {c.medatKeyword} · aktueller offizieller Abgleich
        offen
      </div>
      <nav className="lesson-outline" aria-label="Kapitelabschnitte">
        {outline.map(([id, label]) => (
          <button
            key={id}
            onClick={() =>
              document
                .getElementById(anchor(id))
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            {label}
          </button>
        ))}
      </nav>
      <ChapterSources guide={guide} onOpenScripts={onOpenScripts} />
      <section id={anchor("goals")}>
        <h3>1. Was lernst du?</h3>
        <p>{c.introduction}</p>
        <ul className="learning-goals">
          <li>
            Du kannst {guide.terms.map((t) => t.term).join(", ")} erklären und
            voneinander unterscheiden.
          </li>
          <li>Du kannst den Lösungsweg im Beispiel selbst begründen.</li>
          <li>
            Du kannst typische Fehler erkennen und dein Verständnis anschließend
            ohne sichtbare Lösung prüfen.
          </li>
        </ul>
        <details className="prerequisites">
          <summary>Das solltest du vorher wissen</summary>
          <ul>
            {c.prerequisites.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </details>
      </section>
      <section id={anchor("terms")}>
        <h3>2. Begriffe zuerst verstehen</h3>
        <dl className="chapter-glossary">
          {guide.terms.map((t) => (
            <div key={t.term}>
              <dt>{t.term}</dt>
              <dd>{t.definition}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section id={anchor("explanation")}>
        <h3>3. Die Zusammenhänge Schritt für Schritt</h3>
        {sections.map((s, i) => (
          <section className="explanation-block" key={i}>
            <span className="explanation-number">{i + 1}</span>
            <div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          </section>
        ))}
      </section>
      <ScriptMaterial chapterId={c.id} />
      {c.diagram && (
        <section>
          <h3>4. Am Bild nachvollziehen</h3>
          <p className="muted">
            Ordne die gezeigten Strukturen und Schritte den Begriffen aus der
            Erklärung zu.
          </p>
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
      <section id={anchor("example")} className="worked-example">
        <h3>5. Ein Beispiel vollständig lösen</h3>
        <p className="worked-question">{guide.workedExample.question}</p>
        <ol>
          {guide.workedExample.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <details>
          <summary>Weiteres Beispiel aus dem Grundlagenkapitel</summary>
          <p>{c.example}</p>
        </details>
      </section>
      <section className="logic-trap">
        <h3>6. Typischer Verständnisfehler</h3>
        <p>{c.mistake}</p>
        <p className="muted">
          Formuliere in einem eigenen Satz, warum diese Verwechslung zu einer
          falschen Antwort führen würde.
        </p>
      </section>
      <section>
        <h3>7. Das solltest du mitnehmen</h3>
        <ul>
          {c.summary.filter(Boolean).map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>
      <section id={anchor("check")} className="chapter-selftest">
        <h3>8. Prüfe dich ohne Hilfe</h3>
        <p className="muted">
          Beantworte die Fragen zuerst in eigenen Worten. Klappe erst danach die
          Musterantwort auf und vergleiche deine Begründung.
        </p>
        <div className="comprehension">
          <strong>Verständnischeck 1</strong>
          <p>{guide.checks[0].question}</p>
          <button className="outline-button" onClick={() => setAnswer(!answer)}>
            {answer ? "Antwort ausblenden" : "Lösung ansehen"}
          </button>
          {answer && <p>{guide.checks[0].answer}</p>}
        </div>
        {guide.checks.slice(1).map((check, i) => (
          <div className="comprehension transfer-check" key={i}>
            <strong>Transferfrage {i + 2}</strong>
            <p>{check.question}</p>
            <details>
              <summary>Musterantwort mit Begründung</summary>
              <p>{check.answer}</p>
            </details>
          </div>
        ))}
      </section>
      <div className="lesson-actions">
        <button className="outline-button" onClick={onMark}>
          {read ? "Als gelesen markiert" : "Verstanden und gelesen"}
          <Check size={16} />
        </button>
        <p className="muted">
          Kapitel werden nach 7 Tagen zur Lesewiederholung vorgeschlagen. Die
          Karten verwenden unabhängig davon FSRS.
        </p>
      </div>
      <section id={anchor("cards")}>
        <h3>9. Vom Verstehen zum Erinnern</h3>
        <p className="muted">
          Übe jetzt passende Karten. Automatische Themenvorschläge kannst du
          korrigieren; nicht zugeordnete Karten bleiben in deiner Sammlung.
        </p>
        <CardLinks cards={cards} chapter={c} onPractice={onPractice} />
      </section>
      <details className="further-reading">
        <summary>Weitere Literatur & Qualitätsstand</summary>
        <ul>
          {sources
            .filter((s) => c.sources.includes(s.id))
            .map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>{" "}
                · weiterführende Referenzempfehlung
              </li>
            ))}
        </ul>
        <p className="muted">
          {c.reviewStatus}. Letzte externe fachliche Prüfung:{" "}
          {c.lastReviewed || "noch nicht erfolgt"}. Redaktioneller Stand:{" "}
          {c.lastUpdated}. Die Lerntexte sind eigenständig formuliert.
          Originalabbildungen und Originalseiten werden aus deinen lokal
          importierten Skripten angezeigt.
        </p>
        {c.images.map((img) => (
          <p className="muted" key={img.id}>
            Eigenes Schema: {img.creator} · {img.license}
          </p>
        ))}
      </details>
      <div className="chapter-navigation">
        <button
          className="outline-button"
          disabled={!onPrevious}
          onClick={onPrevious}
        >
          <ChevronLeft size={15} />
          Vorheriges Kapitel
        </button>
        <button className="primary" disabled={!onNext} onClick={onNext}>
          Nächstes Kapitel
          <ChevronRight size={15} />
        </button>
      </div>
    </article>
  );
}
