import React, { useState } from "react";
import books from "../books/books.json";
import { BookReader } from "../books/Books";
export function pageLabel(pages) {
  const out = [];
  let start = pages[0],
    last = start;
  for (const p of [...pages.slice(1), null]) {
    if (p === last + 1) {
      last = p;
      continue;
    }
    if (start !== undefined)
      out.push(start === last ? String(start) : `${start}–${last}`);
    start = p;
    last = p;
  }
  return out.join(", ");
}
export default function ChapterSources({ guide, onOpenScripts }) {
  const [reader, setReader] = useState(null);
  return (
    <section className="chapter-sources" aria-label="Quellen dieses Kapitels">
      <div className="section-heading">
        <div>
          <h3>
            {guide.citations.length
              ? "Deine Skripte als Lernquelle"
              : "Quellenstatus dieses Kapitels"}
          </h3>
          <p>
            Die Erklärungen unten kannst du sofort lesen. PDF-Import ist nur für
            Originalbilder und Originalseiten nötig.
          </p>
        </div>
        <button className="outline-button" onClick={onOpenScripts}>
          Skripte hier importieren / lesen
        </button>
      </div>
      {guide.citations.map((cite, i) => {
        const book = books.find((b) => b.id === cite.book);
        return (
          <article className="chapter-citation" key={book.id + i}>
            <div>
              <strong>
                {book.title} · {book.year}
              </strong>
              <p>{cite.section}</p>
              <small>
                PDF-Seiten {pageLabel(cite.pages)}
                {book.printedOffset
                  ? ` · gedruckte Skriptseiten ${pageLabel(cite.pages.map((p) => p - book.printedOffset))}`
                  : ""}
              </small>
            </div>
            <button
              className="text-button"
              onClick={() =>
                setReader({ bookId: book.id, page: cite.pages[0] })
              }
            >
              Originalabschnitt öffnen →
            </button>
          </article>
        );
      })}
      <p className="muted">{guide.sourceNote}</p>
      {reader && <BookReader {...reader} onClose={() => setReader(null)} />}
    </section>
  );
}
