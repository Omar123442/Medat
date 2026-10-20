import React, { useState, useEffect, useRef } from "react";
import TaskView, { Shape } from "./TaskView";
export const formatTime = (n) =>
  `${Math.floor(Math.max(0, n) / 60)
    .toString()
    .padStart(2, "0")}:${(Math.max(0, n) % 60).toString().padStart(2, "0")}`;
export function Explanation({ task }) {
  return (
    <div className="logic-solution">
      <h3>Musterlösung</h3>
      <ol>
        {task.solution.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {task.kind === "figures" && (
        <Shape
          pieces={task.pieces}
          caption="Lösung: drei Teile bilden die Zielkontur"
        />
      )}
      <p>
        <strong>
          Richtige Antwort: {"ABCDE"[task.correct]} ·{" "}
          {task.options[task.correct]}
        </strong>
      </p>
      <p>Darauf achten: {task.error}</p>
    </div>
  );
}
export default function Session({ tasks, mode, seconds, onFinish, area }) {
  const [started] = useState(Date.now()),
    [index, setIndex] = useState(0),
    [answers, setAnswers] = useState({}),
    [checked, setChecked] = useState({}),
    [now, setNow] = useState(Date.now());
  const answersRef = useRef(answers),
    finished = useRef(false);
  answersRef.current = answers;
  const deadline = mode === "exam" ? started + seconds * 1000 : null,
    task = tasks[index];
  function finish(reason = "submitted") {
    if (finished.current) return;
    finished.current = true;
    const chosen = answersRef.current;
    onFinish({
      id: "kff-" + started + "-" + Math.random(),
      area,
      mode,
      at: new Date().toISOString(),
      tasks,
      answers: chosen,
      total: tasks.length,
      answered: Object.keys(chosen).length,
      correct: tasks.filter((t) => chosen[t.id] === t.correct).length,
      seconds: Math.round(
        (Math.min(Date.now(), deadline || Date.now()) - started) / 1000,
      ),
      reason,
      mistakes: tasks
        .filter((t) => chosen[t.id] !== t.correct)
        .map((t) => t.error),
    });
  }
  useEffect(() => {
    if (!deadline) return;
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [deadline]);
  useEffect(() => {
    if (deadline && now >= deadline) finish("timeout");
  }, [now, deadline]);
  function choose(i) {
    if (deadline && Date.now() >= deadline) {
      finish("timeout");
      return;
    }
    if (mode === "learn" && checked[task.id]) return;
    setAnswers({ ...answers, [task.id]: i });
  }
  return (
    <div className="kff-session">
      <div className="logic-session-head">
        <span className="eyebrow">
          {mode === "learn" ? "LERNMODUS" : "PRÜFUNGSMODUS"} · AUFGABE{" "}
          {index + 1}/{tasks.length}
        </span>
        {deadline ? (
          <strong className="timer" role="timer">
            {formatTime(Math.ceil((deadline - now) / 1000))}
          </strong>
        ) : (
          <span>Ohne Zeitdruck</span>
        )}
      </div>
      <div className="study-progress">
        <i
          style={{
            width: (Object.keys(answers).length / tasks.length) * 100 + "%",
          }}
        />
      </div>
      <TaskView
        task={task}
        interactive={mode === "learn" && !checked[task.id]}
      />
      <fieldset
        className={
          "logic-options " + (task.kind === "figures" ? "figure-options" : "")
        }
      >
        <legend className="sr-only">Wähle eine Antwort</legend>
        {task.options.map((o, i) => (
          <button
            key={i}
            aria-pressed={answers[task.id] === i}
            disabled={mode === "learn" && checked[task.id]}
            className={
              (answers[task.id] === i ? "chosen " : "") +
              (mode === "learn" && checked[task.id] && i === task.correct
                ? "correct"
                : "")
            }
            onClick={() => choose(i)}
          >
            <span>{"ABCDE"[i]}</span>
            {task.kind === "figures" ? (
              <Shape points={task.shapes[i]} caption={"Antwortfigur " + o} />
            ) : (
              o
            )}
          </button>
        ))}
      </fieldset>
      {mode === "learn" && checked[task.id] && (
        <>
          <p role="status">
            {answers[task.id] === task.correct
              ? "Richtig gelöst."
              : "Noch nicht richtig – prüfe den Lösungsweg."}
          </p>
          <Explanation task={task} />
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
        {mode === "learn" && !checked[task.id] ? (
          <button
            className="primary"
            disabled={answers[task.id] === undefined}
            onClick={() => setChecked({ ...checked, [task.id]: true })}
          >
            Antwort prüfen
          </button>
        ) : (
          <button
            className="primary"
            onClick={() =>
              index + 1 < tasks.length ? setIndex(index + 1) : finish()
            }
          >
            {index + 1 < tasks.length
              ? "Nächste Aufgabe"
              : "Training auswerten"}
          </button>
        )}
      </div>
      {mode === "exam" && (
        <>
          <div className="question-map">
            {tasks.map((t, i) => (
              <button
                key={t.id}
                aria-label={"Aufgabe " + (i + 1)}
                className={answers[t.id] !== undefined ? "answered" : ""}
                onClick={() => setIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button className="outline-button" onClick={() => finish()}>
            Jetzt abgeben
          </button>
        </>
      )}
      <button className="logic-abort" onClick={() => finish("ended")}>
        Training beenden und auswerten
      </button>
    </div>
  );
}
