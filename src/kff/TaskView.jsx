import React, { useState } from "react";
export function Shape({ points, pieces, caption }) {
  return (
    <svg
      className="kff-shape"
      viewBox="-1 -1 8 8"
      role="img"
      aria-label={caption || "Geometrische Figur"}
    >
      {pieces ? (
        pieces.map((p, i) => (
          <polygon
            key={i}
            points={p.map((x) => x.join(",")).join(" ")}
            fill={["#abc58d", "#d5b784", "#94b7c5"][i]}
            stroke="#466541"
            strokeWidth=".06"
          />
        ))
      ) : (
        <polygon
          points={points.map((x) => x.join(",")).join(" ")}
          fill="#e3edda"
          stroke="#466541"
          strokeWidth=".1"
        />
      )}
    </svg>
  );
}
export function Pieces({ task, interactive }) {
  const [angles, setAngles] = useState([90, 180, 270]);
  return (
    <div className="pieces">
      {task.pieces.map((p, i) => (
        <div key={i}>
          <svg
            viewBox="-2 -2 10 10"
            role="img"
            aria-label={"Einzelteil " + (i + 1)}
          >
            <g transform={`rotate(${angles[i]} 3 3)`}>
              <polygon
                points={p.map((x) => x.join(",")).join(" ")}
                fill={["#abc58d", "#d5b784", "#94b7c5"][i]}
                stroke="#466541"
                strokeWidth=".08"
              />
            </g>
          </svg>
          {interactive && (
            <button
              className="outline-button"
              aria-label={"Teil " + (i + 1) + " drehen"}
              onClick={() =>
                setAngles(angles.map((a, j) => (j === i ? a + 90 : a)))
              }
            >
              ↻ 90°
            </button>
          )}
          <small>Teil {i + 1}</small>
        </div>
      ))}
    </div>
  );
}
export default function TaskView({ task, interactive }) {
  if (task.kind === "numbers")
    return (
      <>
        <p>
          Welche zwei Zahlen setzen die Folge nach der beabsichtigten einfachen
          Regel fort?
        </p>
        <div className="number-sequence">
          {task.values.map((n, i) => (
            <span key={i}>{n}</span>
          ))}
          <span>?</span>
          <span>?</span>
        </div>
      </>
    );
  if (task.kind === "words")
    return (
      <>
        <p>
          Ordne alle Buchstaben zu einem deutschen Wort. Welchen
          Anfangsbuchstaben hat die gesuchte Lösung?
        </p>
        <div className="letter-sequence">
          {task.letters.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
        <p className="muted">
          Jeder Buchstabe wird genau einmal verwendet. Der Pool enthält keine
          Umlaute oder ß und keine AE/OE/UE-Umschreibungen für Umlaute. Der
          eigene Wortpool wurde redaktionell zusammengestellt, nicht mit einem
          vollständigen deutschen Wörterbuch auf alle Anagramme geprüft.
        </p>
      </>
    );
  if (task.kind === "figures")
    return (
      <>
        <p>
          Welche Außenkontur lässt sich aus den drei Teilen ohne Überlappung
          zusammensetzen? Drehen ist erlaubt, Spiegeln nicht.
        </p>
        <Pieces key={task.id} task={task} interactive={interactive} />
        <p className="muted">
          Eigene SVG-Aufgaben. Die Ablenker dieses Grundlagenpools unterscheiden
          sich auch in der Fläche. Die Darstellung ist ein Einstieg in
          räumliches Denken, keine bestätigte offizielle Aufgabenreplik.
        </p>
      </>
    );
  return <h3>{task.prompt}</h3>;
}
export function Avatar({ index }) {
  return (
    <svg
      viewBox="0 0 90 100"
      role="img"
      aria-label="Fiktive schematische Person"
    >
      <rect
        width="90"
        height="100"
        rx="10"
        fill={["#e0eacb", "#e8d9be", "#dbe9ee", "#eadce5"][index % 4]}
      />
      <path
        d="M12 100q3-33 33-33t33 33"
        fill={["#829d68", "#a88c64", "#718f9f", "#9b7e91"][index % 4]}
      />
      <ellipse cx="45" cy="43" rx="23" ry="29" fill="#edd5bb" />
      <path
        d={
          index % 2
            ? "M23 45V18q22-18 44 0v27l-10-25-25 9z"
            : "M22 35q-3-34 25-29t22 30L56 19 25 32z"
        }
        fill={index % 3 ? "#6f5541" : "#3a352e"}
      />
      <circle cx="36" cy="43" r="2" />
      <circle cx="54" cy="43" r="2" />
      {index % 2 === 0 && (
        <g stroke="#52604c" fill="none">
          <circle cx="35" cy="43" r="8" />
          <circle cx="55" cy="43" r="8" />
          <path d="M43 43h4" />
        </g>
      )}
      <path d="M38 59q7 5 14 0" fill="none" stroke="#936f59" strokeWidth="2" />
    </svg>
  );
}
