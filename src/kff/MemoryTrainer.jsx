import React, { useState, useEffect } from "react";
import { people, memoryTasks } from "./memory";
import { shuffle } from "./tasks";
import { Avatar } from "./TaskView";
import Session, { formatTime } from "./Session";
export default function MemoryTrainer({
  mode,
  number,
  encodeSeconds,
  delaySeconds,
  recallSeconds,
  onFinish,
}) {
  const [selected] = useState(() => shuffle(people).slice(0, number)),
    [stage, setStage] = useState("encode"),
    [now, setNow] = useState(Date.now()),
    [deadline, setDeadline] = useState(Date.now() + encodeSeconds * 1000);
  const [tasks] = useState(() => memoryTasks(selected));
  function recall() {
    setStage("recall");
  }
  function next() {
    if (stage === "encode" && delaySeconds > 0) {
      setStage("delay");
      setDeadline(Date.now() + delaySeconds * 1000);
    } else recall();
  }
  useEffect(() => {
    if (stage === "recall" || mode === "learn") return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [stage, mode]);
  useEffect(() => {
    if (mode === "exam" && stage !== "recall" && now >= deadline) {
      if (stage === "encode" && delaySeconds > 0) {
        setStage("delay");
        setDeadline(deadline + delaySeconds * 1000);
      } else recall();
    }
  }, [now, deadline, stage, mode]);
  if (stage === "recall")
    return (
      <Session
        tasks={tasks}
        mode={mode}
        seconds={recallSeconds}
        area="memory"
        onFinish={onFinish}
      />
    );
  return (
    <section className="memory-stage">
      <div className="logic-session-head">
        <h3>
          {stage === "encode"
            ? "Einprägen: Fiktive Ausweise"
            : "Zwischenphase: Informationen ruhen lassen"}
        </h3>
        {mode === "exam" && (
          <strong role="timer">
            {formatTime(Math.ceil((deadline - now) / 1000))}
          </strong>
        )}
      </div>
      {stage === "encode" ? (
        <>
          <p>
            Verknüpfe Name, Aussehen und Daten. Alle Personen und Daten sind
            erfunden. Es handelt sich um Gedächtnistraining und keine
            medizinischen Informationen.
          </p>
          <div className="memory-grid">
            {selected.map((p) => (
              <article className="identity-card" key={p.id}>
                <div>
                  <Avatar index={p.avatar} />
                  <h4>{p.name}</h4>
                </div>
                <dl>
                  {[
                    ["Geburtsdatum", p.birthday],
                    ["Blutgruppe", p.blood],
                    ["Land", p.country],
                    ["Allergie", p.allergy],
                    ["Ausweisnummer", p.number],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <details>
            <summary>Merkstrategie</summary>
            <p>
              Verknüpfe pro Person ein markantes Bild mit Namen, Blutgruppe und
              Geburtsdatum. Nutze einen festen mentalen Ort pro Ausweis und rufe
              die Merkmale dort aktiv ab. Aufwendige Eselsbrücken sind nur
              hilfreich, wenn sie innerhalb deiner Zeitvorgabe funktionieren.
            </p>
          </details>
        </>
      ) : (
        <div className="memory-delay">
          <p>
            Die Ausweise sind ausgeblendet. Richte deine Aufmerksamkeit auf die
            Umgebung und zähle rückwärts in Siebener-Schritten, beginnend bei
            140. Deine Rechnung wird nicht bewertet.
          </p>
          <p className="muted">
            Diese frei konfigurierbare Zwischenphase ist ein
            Trainingshilfsmittel, keine bestätigte offizielle Prüfungsphase.
          </p>
        </div>
      )}
      {mode === "learn" && (
        <button className="primary" onClick={next}>
          {stage === "encode" && delaySeconds > 0
            ? "Zur Zwischenphase"
            : "Zur Abfrage"}
        </button>
      )}
      {mode === "exam" && (
        <p className="muted">
          Die nächste Phase startet nach Ablauf automatisch. Lernen{" "}
          {encodeSeconds}s · Zwischenphase {delaySeconds}s · Abfrage{" "}
          {recallSeconds}s. Die Abfrage zeigt die Ausweise nicht mehr an.
        </p>
      )}
    </section>
  );
}
