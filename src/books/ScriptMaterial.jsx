import React from "react";
import { BookFigure } from "./Books";
import { references, bookNotes, kffBookNotes } from "./references";
import books from "./books.json";
export default function ScriptMaterial({ chapterId, kffArea }) {
  const note = kffArea ? kffBookNotes[kffArea] : bookNotes[chapterId],
    figures = kffArea
      ? [
          {
            book: "kff",
            page: note?.page,
            title: "Strategieabschnitt im KFF-Skript 2021",
          },
        ]
      : references[chapterId] || [];
  if (!note && !figures.length) return null;
  return (
    <section className="script-material">
      <h3>Aus deinen hochgeladenen Skripten</h3>
      {note && (
        <div className="script-note">
          <p>{note.text}</p>
          {note.caution && (
            <p>
              <strong>Beim Lesen beachten:</strong> {note.caution}
            </p>
          )}
          {!kffArea && (
            <small>
              Abgleich mit {books.find((b) => b.id === note.book)?.title} ·
              PDF-Seiten {note.pages.join(", ")}. Eigenständig formulierte
              Einordnung.
            </small>
          )}
        </div>
      )}
      {figures.map((ref, i) => (
        <BookFigure key={ref.book + ref.page + i} reference={ref} />
      ))}
    </section>
  );
}
