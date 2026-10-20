import React, { useState } from "react";
import {
  ArrowRight,
  Check,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { curriculum } from "./curriculum";
import Lesson from "./content/Lesson";
import Coverage from "./learning/Coverage";
import CardLinks from "./learning/CardLinks";
export function CardReading({ card }) {
  return (
    <article className="reading-card">
      <small>
        {card.subject} · {card.deck || "Beispielsammlung"}
      </small>
      <h3>{card.q}</h3>
      {card.images?.map((u, i) => (
        <img
          className="study-image"
          src={u}
          key={"q" + i}
          alt="Abbildung der Frage"
        />
      ))}
      <div className="reading-answer">
        {card.a || "Kein separater Antworttext vorhanden."}
      </div>
      {card.answerImages?.map((u, i) => (
        <img
          className="study-image"
          src={u}
          key={"a" + i}
          alt="Abbildung der Antwort"
        />
      ))}
      {card.unsupported && (
        <p className="error">
          Diese Spezialvorlage benötigt zur vollständigen Darstellung Anki. Die
          Bildmaskierung kann hier abweichen.
        </p>
      )}
    </article>
  );
}
export function Preparation({ cards, onStart, onClose }) {
  const [step, setStep] = useState(0);
  const size = 10;
  const pages = Math.ceil(cards.length / size);
  return (
    <div className="overlay">
      <div className="study preparation">
        <button className="close" onClick={onClose}>
          ×
        </button>
        <div className="eyebrow">1 VERSTEHEN → 2 AKTIV ERINNERN</div>
        <h2>Zuerst lesen und verstehen</h2>
        <p className="muted">
          Lies die Fragen mit ihren Antworten in Ruhe. Erkläre die Zusammenhänge
          in eigenen Worten. Danach übst du dieselben Karten ohne sichtbare
          Antwort.
        </p>
        <div className="prep-list">
          {cards.slice(step * size, (step + 1) * size).map((c) => (
            <CardReading key={c.id} card={c} />
          ))}
        </div>
        <div className="pagination">
          <button
            disabled={!step}
            onClick={() => {
              setStep(step - 1);
              document.querySelector(".preparation").scrollTop = 0;
            }}
          >
            <ChevronLeft size={16} />
            Zurück
          </button>
          <span>
            Leseseite {step + 1} / {pages} · {cards.length} Karten
          </span>
          {step + 1 < pages ? (
            <button
              className="primary"
              onClick={() => {
                setStep(step + 1);
                document.querySelector(".preparation").scrollTop = 0;
              }}
            >
              Weiterlesen <ArrowRight size={16} />
            </button>
          ) : (
            <button className="primary" onClick={onStart}>
              Gelesen – Karten starten <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default function Learn({ cards, onPractice, reviews = {} }) {
  const [subject, setSubject] = useState("Alle"),
    [selected, setSelected] = useState(null),
    [tab, setTab] = useState("course"),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(0),
    [answer, setAnswer] = useState(false),
    [read, setRead] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem("medat-lessons") || "[]");
      } catch {
        return [];
      }
    });
  const lessons = curriculum.filter(
    (l) =>
      (subject === "Alle" || l.subject === subject) &&
      (l.title + " " + l.topic + " " + l.paragraphs.join(" "))
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const deckCards = cards.filter(
    (c) =>
      (subject === "Alle" || c.subject === subject) &&
      (c.q + " " + c.a + " " + (c.deck || ""))
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(deckCards.length / 20));
  function mark() {
    const updated = [...new Set([...read, selected.id])];
    setRead(updated);
    localStorage.setItem("medat-lessons", JSON.stringify(updated));
    localStorage.setItem(
      "medat-lesson-due-" + selected.id,
      new Date(Date.now() + 7 * 86400000).toISOString(),
    );
  }
  return (
    <section className="panel learn-panel">
      <div className="section-heading">
        <div>
          <h2>Erst verstehen. Dann behalten.</h2>
          <p>
            Erklärungen lesen → Verständnis prüfen → mit deinen Karten festigen.
          </p>
        </div>
        <BookOpen size={24} />
      </div>
      <div className="learning-tabs">
        <button
          className={tab === "course" ? "selected" : ""}
          onClick={() => {
            setTab("course");
            setSelected(null);
          }}
        >
          BMS-Grundlagen · {curriculum.length} Kapitel
        </button>
        <button
          className={tab === "deck" ? "selected" : ""}
          onClick={() => {
            setTab("deck");
            setSelected(null);
          }}
        >
          Dein Deck als Lesestoff · {cards.length}
        </button>
      </div>
      <div className="learning-tabs secondary-tabs">
        <button
          className={tab === "coverage" ? "selected" : ""}
          onClick={() => {
            setTab("coverage");
            setSelected(null);
          }}
        >
          Stoffabdeckung & Quellen
        </button>
        <button
          className={tab === "mapping" ? "selected" : ""}
          onClick={() => {
            setTab("mapping");
            setSelected(null);
          }}
        >
          Kartenzuordnung
        </button>
      </div>
      {tab === "coverage" && (
        <Coverage
          reviews={reviews}
          onOpen={(c) => {
            setSelected(c);
            setTab("course");
          }}
        />
      )}
      {tab === "mapping" && <CardLinks cards={cards} onPractice={onPractice} />}
      <div className="filter-row">
        <select
          aria-label="Lernfach"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setPage(0);
            setSelected(null);
          }}
        >
          {["Alle", "Biologie", "Chemie", "Physik", "Mathematik", "Import"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
        <input
          aria-label="Lernstoff suchen"
          placeholder="Thema oder Begriff suchen …"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
      </div>
      {tab === "course" && (
        <>
          <p className="muted">
            Ergänzende Grundlagen, keine Abschrift deines Decks. {read.length} /{" "}
            {curriculum.length} Kapitel als gelesen markiert. Gleiche deine
            Themen mit der{" "}
            <a
              href="https://www.medizinstudieren.at/"
              target="_blank"
              rel="noreferrer"
            >
              aktuellen offiziellen BMS-Stichwortliste
            </a>{" "}
            ab.
          </p>
          {selected ? (
            <Lesson
              key={selected.id}
              chapter={selected}
              cards={cards}
              onPractice={onPractice}
              onBack={() => setSelected(null)}
              read={read.includes(selected.id)}
              onMark={mark}
            />
          ) : (
            <div className="lesson-grid">
              {lessons.map((l) => (
                <button
                  className="lesson-tile"
                  key={l.id}
                  onClick={() => {
                    setSelected(l);
                    setAnswer(false);
                  }}
                >
                  <small>
                    {l.subject} · {l.topic}
                  </small>
                  <h3>{l.title}</h3>
                  <span>
                    {read.includes(l.id) ? (
                      <>
                        <Check size={14} />
                        Gelesen
                      </>
                    ) : (
                      <>
                        Kapitel lesen <ArrowRight size={14} />
                      </>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
          {!lessons.length && (
            <p>
              Keine Kapitel gefunden. Unter „Dein Deck als Lesestoff“ kannst du
              alle importierten Inhalte lesen.
            </p>
          )}
        </>
      )}
      {tab === "deck" && (
        <>
          <p className="muted">
            Alle Fragen und Antworten deines Decks, einschließlich Unterdecks.
            Es gibt keine Gesamtbegrenzung; die Seitenaufteilung hält die
            Darstellung schnell.
          </p>
          {deckCards.slice(page * 20, (page + 1) * 20).map((c) => (
            <CardReading card={c} key={c.id} />
          ))}
          {!deckCards.length && <p>Keine passenden Karten gefunden.</p>}
          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={16} />
              Zurück
            </button>
            <span>
              Seite {page + 1} / {pages} · {deckCards.length} Karten
            </span>
            <button
              disabled={page + 1 >= pages}
              onClick={() => setPage(page + 1)}
            >
              Weiter
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
