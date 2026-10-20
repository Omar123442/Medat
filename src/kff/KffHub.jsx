import React, { useState } from "react";
import { ArrowRight, Layers, Clock } from "lucide-react";
import { kffAreas, shuffle } from "./tasks";
import Session, { Explanation, formatTime } from "./Session";
import MemoryTrainer from "./MemoryTrainer";
import "./kff.css";
import ScriptMaterial from "../books/ScriptMaterial";
const readHistory = () => {
  try {
    return JSON.parse(localStorage.getItem("medat-kff-history") || "[]");
  } catch {
    return [];
  }
};
export default function KffHub({ onLogic }) {
  const [area, setArea] = useState(null),
    [mode, setMode] = useState("learn"),
    [difficulty, setDifficulty] = useState("Alle"),
    [count, setCount] = useState(10),
    [minutes, setMinutes] = useState(10),
    [peopleCount, setPeopleCount] = useState(8),
    [encodeSeconds, setEncodeSeconds] = useState(120),
    [delaySeconds, setDelaySeconds] = useState(60),
    [recallSeconds, setRecallSeconds] = useState(300),
    [run, setRun] = useState(null),
    [result, setResult] = useState(null),
    [history, setHistory] = useState(readHistory),
    [notice, setNotice] = useState("");
  const selected = kffAreas.find((x) => x.id === area),
    pool = (selected?.tasks || []).filter(
      (t) => difficulty === "Alle" || t.level === difficulty,
    );
  function finish(r) {
    const { tasks, answers, ...summary } = r;
    const next = [summary, ...history].slice(0, 100);
    setHistory(next);
    try {
      localStorage.setItem("medat-kff-history", JSON.stringify(next));
    } catch {
      setNotice("Dein Ergebnis konnte nicht dauerhaft gespeichert werden.");
    }
    setResult(r);
    setRun(null);
  }
  function start() {
    const tasks = shuffle(pool).slice(
      0,
      Math.min(pool.length, Math.max(1, Math.floor(+count || 1))),
    );
    setResult(null);
    setRun({
      key: Date.now(),
      area,
      mode,
      tasks,
      seconds: Math.max(1, +minutes || 1) * 60,
    });
  }
  return (
    <section className="panel kff-hub">
      <div className="section-heading">
        <div>
          <h2>KFF-Trainingscampus</h2>
          <p>
            Fünf getrennte Fähigkeiten – erst Strategien verstehen, dann üben.
          </p>
        </div>
        <Layers size={25} />
      </div>
      <div className="logic-format">
        <strong>Formatstand:</strong> Eigene Grundlagenaufgaben, keine
        Originalprüfungsfragen. Der aktuelle offizielle Aufgabenaufbau konnte
        wegen der Netzwerksperre nicht geprüft werden. Aufgabenmengen und Zeiten
        sind Trainingsvorgaben.{" "}
        <a
          href="https://www.medizinstudieren.at/"
          target="_blank"
          rel="noreferrer"
        >
          Aktuelle offizielle Informationen
        </a>
      </div>
      {notice && <p role="status">{notice}</p>}
      {!area && (
        <>
          <div className="kff-area-grid">
            {kffAreas.map((a, i) => (
              <button
                className="lesson-tile"
                key={a.id}
                onClick={() => {
                  if (a.id === "logic") onLogic();
                  else {
                    setArea(a.id);
                    setResult(null);
                  }
                }}
              >
                <small>KFF · {"ABCDE"[i]}</small>
                <h3>{a.title}</h3>
                <p>{a.description}</p>
                <span>
                  Training öffnen <ArrowRight size={15} />
                </span>
              </button>
            ))}
          </div>
          <h3>Deine letzten KFF-Trainings</h3>
          {!history.length ? (
            <p className="muted">Noch keine Ergebnisse gespeichert.</p>
          ) : (
            history.slice(0, 12).map((h) => (
              <div className="review-subject" key={h.id}>
                <span>{kffAreas.find((a) => a.id === h.area)?.title}</span>
                <strong>
                  {h.correct}/{h.total}
                </strong>
                <span>{formatTime(h.seconds)}</span>
                <span>{new Date(h.at).toLocaleDateString("de-AT")}</span>
              </div>
            ))
          )}
          <p className="muted">
            Implikationen erkennen führt einen eigenen Ergebnisverlauf. Andere
            KFF-Ergebnisse bleiben auf diesem Gerät gespeichert; sie sind keine
            Vorhersage des Testergebnisses.
          </p>
        </>
      )}
      {area && !run && (
        <button
          className="text-button"
          onClick={() => {
            setArea(null);
            setResult(null);
          }}
        >
          ← Alle KFF-Bereiche
        </button>
      )}
      {area && <h2>{selected.title}</h2>}
      {area && !run && !result && (
        <>
          <div className="kff-strategy">
            <h3>Strategie vor dem Start</h3>
            {area === "numbers" ? (
              <p>
                Bilde zunächst Differenzen und Quotienten. Prüfe danach getrennt
                die geraden und ungeraden Positionen. Eine Regel muss zu allen
                Übergängen passen. Endliche Zahlenfolgen sind theoretisch
                mehrdeutig; gesucht ist hier die beabsichtigte einfache Regel.
              </p>
            ) : area === "figures" ? (
              <p>
                Suche markante Außenkanten, gleiche Winkel und Gesamtfläche.
                Drehen erhält die Form; Spiegeln ist eine andere Operation. Die
                Teilrotation ist nur im Lernmodus verfügbar. Dieser eigene
                Einstiegspool verwendet drei Teile und flächenverschiedene
                Ablenker.
              </p>
            ) : area === "words" ? (
              <p>
                Suche häufige Vorsilben und Endungen, bilde mögliche Silben und
                überprüfe anschließend jede Buchstabenhäufigkeit. Der eigene
                Pool besteht überwiegend aus medizinisch-naturwissenschaftlichen
                Wörtern. Er ist keine umfassend lexikographisch geprüfte
                offizielle Wortliste.
              </p>
            ) : (
              <p>
                Verknüpfe jedes Merkmal mit Name und schematischem Gesicht. Im
                Prüfungsmodus wechseln Einprägung, Zwischenphase und Abfrage
                automatisch; während der Abfrage sind die Ausweise nicht
                sichtbar. Alle Daten sind erfunden.
              </p>
            )}
          </div>
          <ScriptMaterial kffArea={area} />
          <div className="mode-grid">
            <button
              className={mode === "learn" ? "mode selected" : "mode"}
              aria-pressed={mode === "learn"}
              onClick={() => setMode("learn")}
            >
              <strong>Lernmodus</strong>
              <span>Ohne Zeitdruck, mit Erklärungen.</span>
            </button>
            <button
              className={mode === "exam" ? "mode selected" : "mode"}
              aria-pressed={mode === "exam"}
              onClick={() => setMode("exam")}
            >
              <Clock size={22} />
              <strong>Prüfungsmodus</strong>
              <span>Mit Timer, ohne vorzeitige Lösungen.</span>
            </button>
          </div>
          <div className="logic-config-fields">
            {area !== "memory" ? (
              <>
                <label>
                  Schwierigkeit
                  <select
                    aria-label="KFF-Schwierigkeit"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    {["Alle", "Leicht", "Mittel", "Schwer"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Anzahl Aufgaben
                  <input
                    aria-label="KFF-Aufgabenanzahl"
                    type="number"
                    min="1"
                    max={pool.length}
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                  />
                </label>
                {mode === "exam" && (
                  <label>
                    Zeitlimit in Minuten
                    <input
                      aria-label="KFF-Zeitlimit"
                      type="number"
                      min="1"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                    />
                  </label>
                )}
              </>
            ) : (
              <>
                <label>
                  Ausweise
                  <input
                    aria-label="Anzahl Ausweise"
                    type="number"
                    min="2"
                    max="8"
                    value={peopleCount}
                    onChange={(e) =>
                      setPeopleCount(
                        Math.min(
                          8,
                          Math.max(2, Math.floor(+e.target.value || 2)),
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Einprägen (Sekunden)
                  <input
                    aria-label="Einprägezeit"
                    type="number"
                    min="1"
                    value={encodeSeconds}
                    onChange={(e) =>
                      setEncodeSeconds(
                        Math.max(1, Math.floor(+e.target.value || 1)),
                      )
                    }
                  />
                </label>
                <label>
                  Zwischenphase (Sekunden)
                  <input
                    aria-label="Zwischenphase"
                    type="number"
                    min="0"
                    value={delaySeconds}
                    onChange={(e) =>
                      setDelaySeconds(
                        Math.max(0, Math.floor(+e.target.value || 0)),
                      )
                    }
                  />
                </label>
                <label>
                  Abfrage (Sekunden)
                  <input
                    aria-label="Abfragezeit"
                    type="number"
                    min="1"
                    value={recallSeconds}
                    onChange={(e) =>
                      setRecallSeconds(
                        Math.max(1, Math.floor(+e.target.value || 1)),
                      )
                    }
                  />
                </label>
              </>
            )}
          </div>
          <p className="muted">
            {area === "memory"
              ? `${peopleCount} Ausweise · ${peopleCount * 3} Abfrageaufgaben. Im Lernmodus wechselst du die Phasen selbst; die Zeitangaben gelten nur im Prüfungsmodus.`
              : `${pool.length} Aufgaben im gewählten Pool · ${Math.min(pool.length, Math.max(1, Math.floor(+count || 1)))} in dieser Sitzung.`}
          </p>
          <button
            className="primary"
            disabled={area !== "memory" && !pool.length}
            onClick={start}
          >
            {mode === "learn" ? "Lerntraining starten" : "Zeittraining starten"}{" "}
            <ArrowRight size={16} />
          </button>
        </>
      )}
      {run &&
        (area === "memory" ? (
          <MemoryTrainer
            key={run.key}
            mode={run.mode}
            number={peopleCount}
            encodeSeconds={encodeSeconds}
            delaySeconds={delaySeconds}
            recallSeconds={recallSeconds}
            onFinish={finish}
          />
        ) : (
          <Session
            key={run.key}
            tasks={run.tasks}
            mode={run.mode}
            seconds={run.seconds}
            onFinish={finish}
            area={area}
          />
        ))}
      {result && !run && (
        <div className="kff-results">
          <div className="logic-score">
            <div>
              <h3>
                {result.correct}/{result.total} richtig ·{" "}
                {Math.round((result.correct / result.total) * 100)} %
              </h3>
              <p>
                {result.reason === "timeout"
                  ? "Zeit abgelaufen."
                  : "Training ausgewertet."}{" "}
                {result.total - result.answered} unbeantwortet ·{" "}
                {formatTime(result.seconds)}
              </p>
            </div>
          </div>
          <h3>Fehleranalyse</h3>
          {result.mistakes.length ? (
            <ul>
              {[...new Set(result.mistakes)].map((m) => (
                <li key={m}>
                  {m} ({result.mistakes.filter((x) => x === m).length})
                </li>
              ))}
            </ul>
          ) : (
            <p>Alle Aufgaben richtig gelöst.</p>
          )}
          <h3>Lösungen nachvollziehen</h3>
          {result.tasks.map((t, i) => (
            <details className="result-task" key={t.id}>
              <summary>
                Aufgabe {i + 1}:{" "}
                {result.answers[t.id] === undefined
                  ? "nicht beantwortet"
                  : result.answers[t.id] === t.correct
                    ? "richtig"
                    : "nicht richtig"}
              </summary>
              <Explanation task={t} />
            </details>
          ))}
          <button className="primary" onClick={() => setResult(null)}>
            Weitertrainieren
          </button>
        </div>
      )}
    </section>
  );
}
