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
import Books from "./books/Books";
import KffStudy from "./books/KffStudy";
import { studyFor } from "./content/study";
import { CardReading } from "./Reading";
export { CardReading, Preparation } from "./Reading";
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
      <div className="learn-welcome">
        <div>
          <span className="eyebrow">DEIN DIGITALES LERNSKRIPT</span>
          <h2>Aus deinen Skripten verstehen – dann mit Karten festigen.</h2>
          <p>
            49 Lernkapitel mit Erklärungen, Begriffen, Lösungswegen und
            Selbsttests. Die Texte sind sofort verfügbar; die PDFs ergänzen
            Originalbilder und Originalseiten.
          </p>
        </div>
        <button className="outline-button" onClick={() => setTab("books")}>
          Deine fünf Skripte öffnen
        </button>
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
      <div className="learning-tabs script-tabs">
        <button
          className={tab === "books" ? "selected" : ""}
          onClick={() => setTab("books")}
        >
          Deine Skripte
        </button>
        <button
          className={tab === "kff" ? "selected" : ""}
          onClick={() => setTab("kff")}
        >
          KFF-Lernwissen
        </button>
      </div>
      {tab === "books" && (
        <>
          {selected && (
            <button className="text-button" onClick={() => setTab("course")}>
              ← Zurück zu {selected.title}
            </button>
          )}
          <Books />
        </>
      )}
      {tab === "kff" && <KffStudy />}
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
              onOpenScripts={() => setTab("books")}
              onPrevious={
                lessons.indexOf(selected) > 0
                  ? () => {
                      setSelected(lessons[lessons.indexOf(selected) - 1]);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  : null
              }
              onNext={
                lessons.indexOf(selected) >= 0 &&
                lessons.indexOf(selected) < lessons.length - 1
                  ? () => {
                      setSelected(lessons[lessons.indexOf(selected) + 1]);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  : null
              }
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
                  <p className="chapter-card-detail">
                    {studyFor(l).citations.length
                      ? "Mit Quellen aus deinen Skripten"
                      : "Ergänzendes Lernwissen"}{" "}
                    · Begriffe · Beispiel · Selbsttest
                  </p>
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
