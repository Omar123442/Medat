import React, { useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
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
