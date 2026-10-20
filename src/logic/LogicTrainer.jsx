import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Target,
  X,
  RotateCcw,
} from "lucide-react";
import { foundations, logicTasks, sources } from "./tasks";
import "./logic.css";
const load = () => {
  try {
    return JSON.parse(localStorage.getItem("medat-logic-history") || "[]");
  } catch {
    return [];
  }
};
const letters = ["A", "B", "C", "D", "E"];
const time = (s) =>
  `${Math.floor(Math.max(0, s) / 60)
    .toString()
    .padStart(2, "0")}:${(Math.max(0, s) % 60).toString().padStart(2, "0")}`;
function shuffle(values) {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function Solution({ task, choice }) {
  return (
    <div className="logic-solution">
      <h3>Schrittweise Musterlösung</h3>
      <ol>
        {task.steps.map((s, i) => (
          <li key={i}>
            {s
              .replaceAll(/\bA\b/g, `„${task.names[0]}“`)
              .replaceAll(/\bB\b/g, `„${task.names[1]}“`)
              .replaceAll(/\bC\b/g, `„${task.names[2]}“`)}
          </li>
        ))}
      </ol>
      <p>
        <strong>Richtige Antwort {letters[task.correct]}:</strong>{" "}
        {task.options[task.correct].text}
      </p>
      <div className="logic-trap">
        <strong>Typischer Denkfehler:</strong> {task.error}
      </div>
      {choice !== undefined &&
        choice !== task.correct &&
        task.options[choice]?.counterexample && (
          <details>
            <summary>Konkretes Gegenbeispiel zu deiner Antwort</summary>
            <p>
              Folgende denkbare Situation erfüllt beide Prämissen, widerlegt
              aber deine Schlussfolgerung:
            </p>
            <ul>
              {task.options[choice].counterexample.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </details>
        )}
      <p className="muted">
        Geprüft anhand aller möglichen Belegungen von drei Mengen. „Einige“
        heißt mindestens eines; Allaussagen allein setzen keine Existenz voraus.
      </p>
    </div>
  );
}
function Basics() {
  const [answers, setAnswers] = useState({});
  return (
    <div className="logic-basics">
      <div className="logic-intro">
        <h2>Vom Verstehen zum zwingenden Schluss</h2>
        <p>
          Nutze nur die vorgegebenen Aussagen. Gesucht ist eine Aussage, die in
          jeder mit den Prämissen vereinbaren Situation wahr ist. „Klingt
          plausibel“ reicht dafür nicht.
        </p>
      </div>
      {foundations.map((f, i) => (
        <article className="logic-lesson" key={f.id}>
          <span className="eyebrow">GRUNDLAGE {i + 1}</span>
          <h3>{f.title}</h3>
          <p>{f.text}</p>
          <div className="logic-example">
            <strong>Beispiel</strong>
            <p>{f.example}</p>
          </div>
          {f.id === "sufficient" && (
            <table className="truth-table">
              <caption>Wahrheitstafel für P → Q</caption>
              <thead>
                <tr>
                  <th>P</th>
                  <th>Q</th>
                  <th>P → Q</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [true, true, true],
                  [true, false, false],
                  [false, true, true],
                  [false, false, true],
                ].map((r, i) => (
                  <tr key={i}>
                    {r.map((v, j) => (
                      <td key={j}>{v ? "wahr" : "falsch"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <fieldset className="foundation-question">
            <legend>{f.question}</legend>
            {f.options.map((o, j) => (
              <button
                key={o}
                className={answers[f.id] === j ? "chosen" : ""}
                aria-pressed={answers[f.id] === j}
                onClick={() => setAnswers({ ...answers, [f.id]: j })}
              >
                {letters[j]}. {o}
              </button>
            ))}
          </fieldset>
          {answers[f.id] !== undefined && (
            <div role="status" className="foundation-feedback">
              <strong>
                {answers[f.id] === f.correct
                  ? "Richtig."
                  : "Noch nicht richtig."}
              </strong>{" "}
              {f.solution}
              <p>Denkfehler vermeiden: {f.trap}.</p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
export default function LogicTrainer() {
  const [tab, setTab] = useState("Grundlagen"),
    [mode, setMode] = useState("learn"),
    [difficulty, setDifficulty] = useState("Alle"),
    [count, setCount] = useState(10),
    [minutes, setMinutes] = useState(10),
    [run, setRun] = useState(null),
    [index, setIndex] = useState(0),
    [answers, setAnswers] = useState({}),
    [checked, setChecked] = useState({}),
    [result, setResult] = useState(null),
    [history, setHistory] = useState(load),
    [now, setNow] = useState(Date.now()),
    [message, setMessage] = useState("");
  const finished = useRef(null);
  const latestAnswers = useRef(answers);
  latestAnswers.current = answers;
  const pool = logicTasks.filter(
    (t) => difficulty === "Alle" || t.level === difficulty,
  );
  const active = run?.tasks[index];
  const remaining = run?.deadline
    ? Math.max(0, Math.ceil((run.deadline - now) / 1000))
    : null;
  function finish(reason = "submitted") {
    if (!run || finished.current === run.id) return;
    finished.current = run.id;
    const chosen = latestAnswers.current;
    const correct = run.tasks.filter((t) => chosen[t.id] === t.correct).length;
    const summary = {
      id: run.id,
      at: new Date().toISOString(),
      mode: run.mode,
      total: run.tasks.length,
      correct,
      answered: Object.keys(chosen).length,
      seconds: Math.round(
        (Math.min(Date.now(), run.deadline || Date.now()) - run.started) / 1000,
      ),
      reason,
    };
    const next = [summary, ...history].slice(0, 50);
    setHistory(next);
    try {
      localStorage.setItem("medat-logic-history", JSON.stringify(next));
    } catch {
      setMessage(
        "Ergebnis kann auf diesem Gerät nicht dauerhaft gespeichert werden.",
      );
    }
    setResult({ ...summary, tasks: run.tasks, answers: chosen });
    setRun(null);
    setTab("Auswertung");
  }
  useEffect(() => {
    if (!run?.deadline) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [run?.deadline]);
  useEffect(() => {
    if (run?.deadline && now >= run.deadline) finish("timeout");
  }, [now, run?.deadline]);
  function start() {
    const amount = Math.min(
      pool.length,
      Math.max(1, Math.floor(Number(count) || 1)),
    );
    const started = Date.now();
    finished.current = null;
    setAnswers({});
    latestAnswers.current = {};
    setChecked({});
    setIndex(0);
    setResult(null);
    setRun({
      id: `${started}-${Math.random()}`,
      tasks: shuffle(pool).slice(0, amount),
      mode,
      started,
      deadline:
        mode === "exam"
          ? started + Math.max(1, Number(minutes) || 1) * 60000
          : null,
    });
    setNow(started);
    setMessage("");
  }
  function select(option) {
    if (run.deadline && Date.now() >= run.deadline) {
      finish("timeout");
      return;
    }
    if (run.mode === "learn" && checked[active.id]) return;
    setAnswers({ ...answers, [active.id]: option });
  }
  return (
    <section className="logic-root">
      <div className="panel">
        <div className="section-heading">
          <div>
            <h2>
              Implikationen erkennen{" "}
              <span className="subtle-tag">KFF · MedAT-H</span>
            </h2>
            <p>
              Eigene Aufgaben zu logischen Schlussfolgerungen. Verstehen, üben
              und unter Zeitdruck anwenden.
            </p>
          </div>
          <Target size={24} />
        </div>
        <div className="logic-format">
          <strong>Trainingsformat:</strong> Zwei Aussagen, fünf
          Antwortmöglichkeiten, genau eine richtige Antwort. 30 eigene
          Aufgabenvarianten auf Basis von zehn Schlussmustern. Keine
          Originalprüfungsfragen.
          <details>
            <summary>Formatstand und Quellen</summary>
            <p>
              Die aktuelle offizielle Beschreibung konnte bei der Entwicklung am
              20.10.2026 wegen HTTP-403-Zugriffssperren nicht abgerufen werden.
              Aufgabenformat und voreingestellte 10 Minuten für 10 Aufgaben sind
              deshalb Trainingsvorgaben, keine bestätigte aktuelle
              Prüfungssimulation. Prüfe die aktuellen offiziellen Vorgaben vor
              deiner Prüfung.
            </p>
            <ul>
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              Eigenständig verfasste Aufgaben und Erklärungen; keine
              übernommenen Buchtexte oder Abbildungen. Die Links dienen der
              weiteren Orientierung, nicht als Nachweis einer hier erfolgten
              Quellenprüfung.
            </p>
          </details>
        </div>
        {message && (
          <p role="status" className="error">
            {message}
          </p>
        )}
        {!run && (
          <div className="learning-tabs">
            {["Grundlagen", "Training", "Auswertung"].map((t) => (
              <button
                key={t}
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        {!run && tab === "Grundlagen" && (
          <>
            <Basics />
            <button className="primary" onClick={() => setTab("Training")}>
              Verstanden – jetzt trainieren <ArrowRight size={16} />
            </button>
          </>
        )}
        {!run && tab === "Training" && (
          <div className="logic-config">
            <h3>Dein Training, dein Tempo</h3>
            <div className="mode-grid">
              <button
                className={mode === "learn" ? "mode selected" : "mode"}
                aria-pressed={mode === "learn"}
                onClick={() => setMode("learn")}
              >
                <BookOpen size={23} />
                <strong>Lernmodus</strong>
                <span>
                  Ohne Zeitlimit. Nach jeder Antwort eine Erklärung und
                  Gegenbeispiele.
                </span>
              </button>
              <button
                className={mode === "exam" ? "mode selected" : "mode"}
                aria-pressed={mode === "exam"}
                onClick={() => setMode("exam")}
              >
                <Clock size={23} />
                <strong>Prüfungsmodus</strong>
                <span>
                  Mit Zeitlimit. Lösungen erst nach Abgabe oder Zeitablauf.
                </span>
              </button>
            </div>
            <div className="logic-config-fields">
              <label>
                Schwierigkeit
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {["Alle", "Leicht", "Mittel", "Schwer"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label>
                Anzahl Aufgaben
                <input
                  aria-label="Anzahl Aufgaben"
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
                    aria-label="Zeitlimit in Minuten"
                    type="number"
                    min="1"
                    step="1"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                  />
                </label>
              )}
            </div>
            <p className="muted">
              {pool.length} Varianten verfügbar. Diese Sitzung enthält{" "}
              {Math.min(
                pool.length,
                Math.max(1, Math.floor(Number(count) || 1)),
              )}{" "}
              Aufgaben. Aufgaben werden ohne Wiederholung zufällig ausgewählt.
              Varianten können denselben Schlussweg üben.
            </p>
            <div className="logic-rules">
              <h4>So arbeitest du</h4>
              <ol>
                <li>
                  Lies beide Aussagen als verbindliche Prämissen – unabhängig
                  von deinem Weltwissen.
                </li>
                <li>
                  Wähle nur einen Schluss, der logisch zwingend ist. „Einige“
                  bedeutet mindestens eines.
                </li>
                <li>
                  Falls A–D nicht zwingend folgen, wähle E. Allaussagen allein
                  behaupten keine Existenz.
                </li>
                {mode === "exam" && (
                  <li>
                    Du kannst Antworten ändern und Aufgaben überspringen. Nach
                    Ablauf der Zeit wird automatisch ausgewertet; unbeantwortete
                    Aufgaben zählen als nicht richtig.
                  </li>
                )}
              </ol>
            </div>
            <button className="primary" onClick={start}>
              {mode === "exam" ? "Prüfungsmodus starten" : "Lernmodus starten"}{" "}
              <ArrowRight size={17} />
            </button>
          </div>
        )}
        {run && active && (
          <div className="logic-exercise">
            <div className="logic-session-head">
              <span className="eyebrow">
                {run.mode === "exam" ? "PRÜFUNGSMODUS" : "LERNMODUS"} · AUFGABE{" "}
                {index + 1} / {run.tasks.length}
              </span>
              {remaining !== null ? (
                <strong
                  className={remaining <= 60 ? "timer urgent" : "timer"}
                  role="timer"
                  aria-label="Verbleibende Zeit"
                >
                  <Clock size={17} />
                  {time(remaining)}
                </strong>
              ) : (
                <span className="muted">Ohne Zeitdruck</span>
              )}
            </div>
            <div className="study-progress">
              <i
                style={{
                  width:
                    (Object.keys(answers).length / run.tasks.length) * 100 +
                    "%",
                }}
              />
            </div>
            <h3>Welche Schlussfolgerung folgt zwingend?</h3>
            <div className="logic-premises">
              {active.premises.map((p, i) => (
                <p key={i}>
                  <span>{i + 1}</span>
                  {p}
                </p>
              ))}
            </div>
            <fieldset className="logic-options">
              <legend className="sr-only">Wähle genau eine Antwort</legend>
              {active.options.map((o, i) => (
                <button
                  key={i}
                  aria-pressed={answers[active.id] === i}
                  disabled={run.mode === "learn" && checked[active.id]}
                  className={
                    (answers[active.id] === i ? "chosen " : "") +
                    (run.mode === "learn" &&
                    checked[active.id] &&
                    i === active.correct
                      ? "correct"
                      : "")
                  }
                  onClick={() => select(i)}
                >
                  <span>{letters[i]}</span>
                  {o.text}
                </button>
              ))}
            </fieldset>
            {run.mode === "learn" && checked[active.id] && (
              <>
                <p
                  role="status"
                  className={
                    answers[active.id] === active.correct
                      ? "feedback-good"
                      : "feedback-bad"
                  }
                >
                  {answers[active.id] === active.correct
                    ? "Richtig – zwingend abgeleitet."
                    : "Noch nicht richtig. Sieh dir den Schlussweg an."}
                </p>
                <Solution task={active} choice={answers[active.id]} />
              </>
            )}
            <div className="logic-controls">
              <button
                className="outline-button"
                disabled={!index}
                onClick={() => setIndex(index - 1)}
              >
                Vorherige Aufgabe
              </button>
              {run.mode === "learn" && !checked[active.id] ? (
                <button
                  className="primary"
                  disabled={answers[active.id] === undefined}
                  onClick={() => setChecked({ ...checked, [active.id]: true })}
                >
                  Antwort prüfen <Check size={16} />
                </button>
              ) : (
                <button
                  className="primary"
                  onClick={() =>
                    index + 1 < run.tasks.length
                      ? setIndex(index + 1)
                      : finish()
                  }
                >
                  {index + 1 < run.tasks.length
                    ? "Nächste Aufgabe"
                    : "Training auswerten"}{" "}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
            {run.mode === "exam" && (
              <>
                <div className="question-map" aria-label="Aufgabennavigation">
                  {run.tasks.map((t, i) => (
                    <button
                      aria-label={`Aufgabe ${i + 1}${answers[t.id] !== undefined ? ", beantwortet" : ""}`}
                      aria-current={index === i ? "step" : undefined}
                      className={answers[t.id] !== undefined ? "answered" : ""}
                      key={t.id}
                      onClick={() => setIndex(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button className="outline-button" onClick={() => finish()}>
                  Jetzt abgeben ({Object.keys(answers).length}/
                  {run.tasks.length} beantwortet)
                </button>
              </>
            )}
            <button className="logic-abort" onClick={() => finish("ended")}>
              Training beenden und auswerten
            </button>
          </div>
        )}
        {!run && tab === "Auswertung" && (
          <div className="logic-results">
            {result ? (
              <>
                <div className="logic-score">
                  <span className="icon-box green">
                    <Check size={25} />
                  </span>
                  <div>
                    <h3>
                      {result.correct} / {result.total} richtig ·{" "}
                      {Math.round((result.correct / result.total) * 100)} %
                    </h3>
                    <p>
                      {result.reason === "timeout"
                        ? "Zeit abgelaufen."
                        : result.reason === "ended"
                          ? "Training vorzeitig beendet."
                          : "Training abgeschlossen."}{" "}
                      {result.total - result.answered} unbeantwortet ·{" "}
                      {time(result.seconds)} ·{" "}
                      {result.mode === "exam" ? "Prüfungsmodus" : "Lernmodus"}
                    </p>
                  </div>
                </div>
                <h3>Deine Fehleranalyse</h3>
                {result.correct === result.total ? (
                  <p>
                    Alle Aufgaben richtig gelöst. Übe als Nächstes eine andere
                    Schwierigkeit.
                  </p>
                ) : (
                  <ul>
                    {[
                      ...new Set(
                        result.tasks
                          .filter((t) => result.answers[t.id] !== t.correct)
                          .map((t) => t.error),
                      ),
                    ].map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}
                <h3>Alle Aufgaben nachvollziehen</h3>
                {result.tasks.map((t, i) => (
                  <details className="result-task" key={t.id}>
                    <summary>
                      Aufgabe {i + 1} ·{" "}
                      {result.answers[t.id] === undefined
                        ? "Nicht beantwortet"
                        : result.answers[t.id] === t.correct
                          ? "Richtig"
                          : "Nicht richtig"}{" "}
                      · {t.level}
                    </summary>
                    <div className="logic-premises">
                      {t.premises.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>
                    <p>
                      Deine Antwort:{" "}
                      {result.answers[t.id] === undefined
                        ? "—"
                        : letters[result.answers[t.id]] +
                          ". " +
                          t.options[result.answers[t.id]].text}
                    </p>
                    <Solution task={t} choice={result.answers[t.id]} />
                  </details>
                ))}
                <button className="primary" onClick={() => setTab("Training")}>
                  <RotateCcw size={16} />
                  Neues Training
                </button>
              </>
            ) : (
              <p>
                Noch kein Ergebnis in dieser Sitzung. Starte ein Training oder
                sieh dir deine gespeicherte Übersicht an.
              </p>
            )}
            <h3>Letzte Trainings auf diesem Gerät</h3>
            {!history.length ? (
              <p className="muted">Noch keine abgeschlossenen Trainings.</p>
            ) : (
              <div className="logic-history">
                {history.map((h) => (
                  <div key={h.id}>
                    <span>{new Date(h.at).toLocaleString("de-AT")}</span>
                    <span>{h.mode === "exam" ? "Prüfung" : "Lernen"}</span>
                    <strong>
                      {h.correct}/{h.total}
                    </strong>
                    <span>{time(h.seconds)}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="muted">
              Bis zu 50 Ergebnisübersichten werden lokal gespeichert. Die
              ausführlichen Lösungen des aktuellen Trainings bleiben bis zum
              nächsten Training bzw. Neuladen sichtbar. Prozentwerte sind
              Trainingswerte, keine Vorhersage deiner MedAT-Punktzahl.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
