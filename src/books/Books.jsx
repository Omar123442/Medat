import React, { useEffect, useRef, useState } from "react";
import { books, getBookDocument, importBook } from "./library";
import { listBooks } from "../storage";
import "./books.css";
export function PdfCanvas({ bookId, page, clip }) {
  const canvas = useRef(),
    [state, setState] = useState("loading"),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  useEffect(() => {
    const f = () => setVersion((n) => n + 1);
    window.addEventListener("medat-books", f);
    return () => window.removeEventListener("medat-books", f);
  }, []);
  const clipKey = JSON.stringify(clip || [0, 0, 1, 1]);
  useEffect(() => {
    let cancelled = false,
      task = null;
    setState("loading");
    (async () => {
      try {
        const doc = await getBookDocument(bookId);
        if (cancelled) return;
        if (!doc) {
          setState("missing");
          return;
        }
        const pdfPage = await doc.getPage(page);
        if (cancelled) return;
        const rect = JSON.parse(clipKey),
          raw = pdfPage.getViewport({ scale: 1 });
        const scale = Math.min(2.5, 1200 / (raw.width * (rect[2] - rect[0])));
        const viewport = pdfPage.getViewport({ scale });
        const target = canvas.current;
        target.width = Math.round(viewport.width * (rect[2] - rect[0]));
        target.height = Math.round(viewport.height * (rect[3] - rect[1]));
        task = pdfPage.render({
          canvasContext: target.getContext("2d"),
          viewport,
          transform: [
            1,
            0,
            0,
            1,
            -viewport.width * rect[0],
            -viewport.height * rect[1],
          ],
        });
        await task.promise;
        if (!cancelled) setState("ready");
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setState("error");
        }
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [bookId, page, clipKey, version]);
  return (
    <div className={"pdf-canvas " + state}>
      {state === "missing" && (
        <p>
          Originalabbildung verfügbar, sobald du das passende PDF unter
          „Skriptbibliothek“ importierst. Es bleibt auf deinem Gerät.
        </p>
      )}
      {state === "loading" && <p role="status">Originalseite wird geladen …</p>}
      {state === "error" && (
        <p role="status">
          Die PDF-Seite konnte nicht angezeigt werden: {error}
        </p>
      )}
      <canvas
        ref={canvas}
        hidden={state !== "ready"}
        role="img"
        aria-label={`Originalausschnitt aus ${books.find((b) => b.id === bookId)?.title}, PDF-Seite ${page}`}
      />
    </div>
  );
}
export function BookReader({ bookId, page = 1, onClose }) {
  const book = books.find((b) => b.id === bookId),
    [current, setCurrent] = useState(page);
  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const listener = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", listener);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", listener);
    };
  }, []);
  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Skript lesen"
    >
      <div className="study book-reader">
        <button
          className="close"
          autoFocus
          aria-label="Skript schließen"
          onClick={onClose}
        >
          ×
        </button>
        <h2>
          {book.title} · {book.year}
        </h2>
        <p className="muted">
          Historische Ausgabe, keine Bestätigung des aktuellen MedAT-Stoffs.
          Originaltexte und Abbildungen bleiben unverändert.
        </p>
        <div className="pagination">
          <button
            disabled={current <= 1}
            onClick={() => setCurrent((n) => n - 1)}
          >
            Vorherige Seite
          </button>
          <label>
            PDF-Seite
            <select
              aria-label="PDF-Seite"
              value={current}
              onChange={(e) => setCurrent(+e.target.value)}
            >
              {Array.from({ length: book.pages }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>{" "}
            / {book.pages}
          </label>
          <button
            disabled={current >= book.pages}
            onClick={() => setCurrent((n) => n + 1)}
          >
            Nächste Seite
          </button>
        </div>
        <PdfCanvas bookId={bookId} page={current} />
        <p className="muted">
          Quelle: {book.fileName}. Urheber- und Bildrechte verbleiben bei den im
          Skript genannten Rechteinhabern.
        </p>
      </div>
    </div>
  );
}
export function BookFigure({ reference }) {
  const [reader, setReader] = useState(false);
  const book = books.find((b) => b.id === reference.book);
  return (
    <figure className="book-figure">
      <h4>{reference.title}</h4>
      <PdfCanvas
        bookId={reference.book}
        page={reference.page}
        clip={reference.clip}
      />
      <figcaption>
        {book.title}, Ausgabe {book.year} · PDF-Seite {reference.page}
        {book.printedOffset
          ? ` (Skriptseite ${reference.page - book.printedOffset})`
          : ""}
        . {reference.clip ? "Unveränderter Bildausschnitt" : "Originalseite"}.
        Abbildungen können Dritturheber haben; Quellen im Originalskript
        beachten.
      </figcaption>
      <button className="outline-button" onClick={() => setReader(true)}>
        Originalseite lesen / vergrößern
      </button>
      {reader && (
        <BookReader
          bookId={book.id}
          page={reference.page}
          onClose={() => setReader(false)}
        />
      )}
    </figure>
  );
}
export default function Books() {
  const [inputVersion, setInputVersion] = useState(0),
    [present, setPresent] = useState([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [reading, setReading] = useState(null);
  const input = useRef();
  useEffect(() => {
    listBooks()
      .then(setPresent)
      .catch(() => setMessage("Lokaler Skriptspeicher ist nicht verfügbar."));
  }, [inputVersion]);
  async function upload(e) {
    const files = [...e.target.files];
    if (!files.length) return;
    setBusy(true);
    const notices = [];
    for (const file of files) {
      try {
        const book = await importBook(file);
        notices.push(book.title + " gespeichert.");
      } catch (error) {
        notices.push(error.message);
      }
    }
    setMessage(notices.join("\n"));
    setInputVersion((n) => n + 1);
    setBusy(false);
    e.target.value = "";
  }
  return (
    <section className="panel books-shelf">
      <h2>Deine Skriptbibliothek</h2>
      <p>
        Importiere die fünf hochgeladenen PDFs einmal auf diesem Gerät. Danach
        erscheinen echte Originalabbildungen in den passenden Kapiteln. Du
        kannst alle Seiten auch hier lesen. Die Dateien bleiben lokal in
        IndexedDB und werden nicht ins Repository oder an einen Server gesendet.
      </p>
      <input
        ref={input}
        aria-label="Skripte importieren"
        type="file"
        accept="application/pdf,.pdf"
        multiple
        hidden
        onChange={upload}
      />
      <button
        className="primary"
        disabled={busy}
        onClick={() => input.current.click()}
      >
        {busy ? "PDFs werden gespeichert …" : "PDF-Skripte importieren"}
      </button>
      <p className="muted">
        Die fünf Ausgaben werden anhand ihres Datei-Hashes erkannt, damit Seiten
        und Ausschnitte nicht mit einer anderen Version verwechselt werden.
        Historische Ausgaben von 2018–2022 ersetzen keine aktuelle offizielle
        Stichwortliste.
      </p>
      {message && (
        <p className="book-import-message" role="status">
          {message}
        </p>
      )}
      <div className="source-grid">
        {books.map((book) => (
          <article key={book.id}>
            <small>
              {book.year} · {book.pages} PDF-Seiten
            </small>
            <h3>{book.title}</h3>
            <p>{book.fileName}</p>
            <strong>
              {present.includes(book.id)
                ? "Lokal gespeichert"
                : "Noch nicht importiert"}
            </strong>
            <button
              className="outline-button"
              disabled={!present.includes(book.id)}
              onClick={() => setReading(book.id)}
            >
              Skript öffnen
            </button>
          </article>
        ))}
      </div>
      {reading && (
        <BookReader
          key={reading}
          bookId={reading}
          onClose={() => setReading(null)}
        />
      )}
    </section>
  );
}
