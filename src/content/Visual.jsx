import React, { useState } from "react";
const stages = {
  dna: [
    "DNA-Doppelstrang",
    "Helicase öffnet die Stränge",
    "Primer und 5′→3′-Synthese",
    "Zwei semikonservative Doppelstränge",
  ],
  translation: [
    "mRNA entsteht und wird verarbeitet",
    "Ribosom bindet am Startcodon",
    "tRNA liefert Aminosäuren",
    "Stoppcodon und Freisetzung",
  ],
  division: [
    "DNA wird in der S-Phase verdoppelt",
    "Mitose: Schwesterchromatiden trennen",
    "Meiose I: homologe Chromosomen trennen",
    "Meiose II: Schwesterchromatiden trennen",
  ],
  respiration: [
    "NADH liefert Elektronen",
    "I, III und IV pumpen H⁺ nach außen",
    "O₂ nimmt Elektronen auf; Wasser entsteht",
    "H⁺ strömt durch ATP-Synthase zurück → ATP",
  ],
  photosynthesis: [
    "Licht trifft Photosystem II",
    "Wasserspaltung liefert Elektronen und O₂",
    "Photosystem I ermöglicht NADPH-Bildung",
    "ATP und NADPH versorgen den Calvin-Zyklus",
  ],
  potential: [
    "Ruhepotenzial",
    "Depolarisation durch Na⁺-Einstrom",
    "Repolarisation durch K⁺-Ausstrom",
    "Nachhyperpolarisation und Erholung",
  ],
  heart: [
    "Körper → rechter Vorhof → rechte Kammer",
    "Rechte Kammer → Lungenarterie → Lunge",
    "Lunge → Lungenvenen → linker Vorhof",
    "Linke Kammer → Aorta → Körper",
  ],
  equilibrium: [
    "Hin- und Rückreaktion laufen gleichzeitig",
    "Im Gleichgewicht sind beide Geschwindigkeiten gleich",
    "Konzentrationsänderung ändert Q",
    "Katalysator beschleunigt beide Richtungen, K bleibt gleich",
  ],
  bond: [
    "Elektronenpaare können Bindungen bilden",
    "Elektronegativität beeinflusst Bindungspolarität",
    "Die Geometrie entscheidet über den Gesamtdipol",
  ],
  membrane: [
    "Phospholipide bilden eine Doppelschicht",
    "Kanäle lassen ausgewählte Teilchen passieren",
    "Aktiver Transport benötigt eine Energiequelle",
  ],
  cell: [
    "Zellkern: genetische Information",
    "Ribosomen: Proteinsynthese",
    "Mitochondrien: Energieumwandlung",
  ],
};
export default function Visual({ type }) {
  const [step, setStep] = useState(0),
    [value, setValue] = useState(type === "optics" ? 200 : 100),
    [on, setOn] = useState(true);
  const texts = stages[type] || [];
  const box = (x, y, w, h, label, color = "#e6eedc") => (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        fill={color}
        stroke="#648961"
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 5}
        textAnchor="middle"
        fill="#304e34"
        fontSize="14"
      >
        {label}
      </text>
    </g>
  );
  return (
    <figure className="bms-visual">
      <svg
        viewBox="0 0 640 310"
        role="img"
        aria-label={"Schematische Darstellung: " + type}
      >
        <defs>
          <marker
            id={"arrow-" + type}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#5d8056" />
          </marker>
        </defs>
        {type === "cell" && (
          <>
            <ellipse
              cx="320"
              cy="155"
              rx="240"
              ry="125"
              fill="#eef5e5"
              stroke="#6c945e"
              strokeWidth="4"
            />
            <ellipse
              cx="270"
              cy="160"
              rx="70"
              ry="55"
              fill={step === 0 ? "#c7dbb6" : "#dce9cf"}
              stroke="#7a9b69"
            />
            <text x="270" y="165" textAnchor="middle">
              Zellkern · DNA
            </text>
            <ellipse
              cx="420"
              cy="110"
              rx="55"
              ry="27"
              fill={step === 2 ? "#f0d6a7" : "#eee0c4"}
              stroke="#bd935c"
            />
            <path
              d="M385 110q15-25 25 0t25 0t20 0"
              fill="none"
              stroke="#aa865a"
              strokeWidth="3"
            />
            <text x="420" y="70" textAnchor="middle" fontSize="13">
              Mitochondrium
            </text>
            {[0, 1, 2, 3, 4].map((i) => (
              <circle
                key={i}
                cx={365 + i * 22}
                cy={205 - (i % 2) * 10}
                r={step === 1 ? 6 : 4}
                fill="#6f8b60"
              />
            ))}
            <text x="420" y="245" textAnchor="middle" fontSize="13">
              Ribosomen
            </text>
            <text x="140" y="45" fontSize="13">
              Zellmembran
            </text>
          </>
        )}
        {type === "membrane" && (
          <>
            {[0, 1].map((row) =>
              Array.from({ length: 17 }, (_, i) => (
                <g key={row + "-" + i}>
                  <circle
                    cx={50 + i * 33}
                    cy={row ? 185 : 115}
                    r="11"
                    fill="#8fae76"
                  />
                  <path
                    d={`M${45 + i * 33} ${row ? 174 : 126}v${row ? -22 : 22} M${55 + i * 33} ${row ? 174 : 126}v${row ? -22 : 22}`}
                    stroke="#c0d3a9"
                    strokeWidth="4"
                  />
                </g>
              )),
            )}
            {box(270, 98, 64, 105, "Kanal", "#d6e4ef")}
            <path
              d="M302 45v200"
              stroke="#5d8056"
              strokeWidth="3"
              markerEnd={"url(#arrow-" + type + ")"}
            />
            <text x="330" y="55" fontSize="14">
              selektiver Transport
            </text>
            <text x="70" y="280" fontSize="13">
              Hydrophile Köpfe außen · hydrophobe Schwänze innen
            </text>
          </>
        )}
        {type === "dna" && (
          <>
            {[0, 1].map((row) => (
              <g key={row}>
                <path
                  d={`M75 ${90 + row * 110}H565`}
                  stroke={row ? "#7196a6" : "#76975c"}
                  strokeWidth="5"
                />
                {Array.from({ length: 12 }, (_, i) => (
                  <path
                    key={i}
                    d={`M${90 + i * 40} ${90 + row * 110}v${row ? -35 : 35}`}
                    stroke={step > 1 ? "#b78c63" : "#91a980"}
                    strokeWidth="6"
                  />
                ))}
                <text x="30" y={95 + row * 110} fontSize="15">
                  {row ? "3′" : "5′"}
                </text>
                <text x="580" y={95 + row * 110} fontSize="15">
                  {row ? "5′" : "3′"}
                </text>
              </g>
            ))}
            <text x="320" y="155" textAnchor="middle" fontSize="17">
              {step === 0
                ? "antiparallele Stränge"
                : step === 1
                  ? "Strangtrennung"
                  : "Neue DNA immer 5′ → 3′"}
            </text>
            <text x="320" y="275" textAnchor="middle" fontSize="13">
              {step === 3
                ? "Jede Tochter-DNA enthält einen alten und einen neuen Strang."
                : "Leitstrang kontinuierlich · Folgestrang in Okazaki-Fragmenten"}
            </text>
          </>
        )}
        {type === "translation" && (
          <>
            <path d="M60 185H580" stroke="#7b9b61" strokeWidth="6" />
            {["AUG", "GCU", "UAA"].map((c, i) => (
              <text
                key={c}
                x={160 + i * 140}
                y="218"
                textAnchor="middle"
                fontSize="23"
              >
                {c}
              </text>
            ))}
            <ellipse
              cx={160 + Math.min(step, 2) * 140}
              cy="168"
              rx="63"
              ry="47"
              fill="#d7e3c7"
              opacity=".8"
              stroke="#72915a"
            />
            <text x="320" y="65" textAnchor="middle" fontSize="17">
              mRNA → Ribosom → Polypeptid
            </text>
            <path
              d="M160 125v-35h180"
              fill="none"
              stroke="#b58b62"
              strokeWidth="4"
            />
            {Array.from({ length: step + 1 }, (_, i) => (
              <circle key={i} cx={170 + i * 40} cy="90" r="12" fill="#d9bd8e" />
            ))}
            <text x="80" y="260">
              5′
            </text>
            <text x="550" y="260">
              3′
            </text>
          </>
        )}
        {type === "division" && (
          <>
            {(step === 0
              ? [320]
              : step < 3
                ? [175, 465]
                : [80, 240, 400, 560]
            ).map((x, i) => (
              <g key={i}>
                <circle
                  cx={x}
                  cy="155"
                  r={step < 2 ? 80 : 65}
                  fill="#edf4e4"
                  stroke="#7c9a68"
                  strokeWidth="2"
                />
                <text x={x} y="160" textAnchor="middle" fontSize="29">
                  {step === 0
                    ? "XX"
                    : step === 1
                      ? "||"
                      : step === 2
                        ? "X"
                        : "|"}
                </text>
              </g>
            ))}
            <text x="320" y="280" textAnchor="middle" fontSize="14">
              {step < 2
                ? "Mitose: zwei Tochterzellen mit erhaltenem Chromosomensatz"
                : "Meiose: Reduktion des Chromosomensatzes; vier haploide Produkte (schematisch)"}
            </text>
          </>
        )}
        {(type === "respiration" || type === "photosynthesis") && (
          <>
            <rect
              x="35"
              y="132"
              width="570"
              height="40"
              rx="6"
              fill="#bed29e"
            />
            <text x="320" y="30" textAnchor="middle" fontSize="14">
              {type === "respiration"
                ? "Intermembranraum · H⁺-Anreicherung"
                : "Thylakoidlumen · H⁺-Anreicherung"}
            </text>
            <text x="320" y="292" textAnchor="middle" fontSize="14">
              {type === "respiration" ? "Matrix" : "Stroma"}
            </text>
            {(type === "respiration"
              ? ["I", "II", "III", "IV"]
              : ["PS II", "Kette", "PS I", "NADPH"]
            ).map((n, i) => (
              <g key={n}>
                {box(55 + i * 110, 112, 75, 80, n)}
                {(type === "respiration" ? i !== 1 : i === 1) && (
                  <path
                    d={`M${93 + i * 110} 225V62`}
                    stroke="#628356"
                    strokeWidth={step === 1 ? 4 : 2}
                    markerEnd={"url(#arrow-" + type + ")"}
                  />
                )}
              </g>
            ))}
            {box(510, 95, 75, 110, "ATPase", "#ead8b6")}
            <path
              d="M547 60v187"
              stroke="#8d7452"
              strokeWidth={step === 3 ? 5 : 2}
              markerEnd={"url(#arrow-" + type + ")"}
            />
            <text x="485" y="265" fontSize="13">
              ADP + Pᵢ → ATP
            </text>
            {type === "respiration" && (
              <text x="370" y="230" fontSize="13">
                O₂ → H₂O
              </text>
            )}
          </>
        )}
        {type === "potential" && (
          <>
            <path d="M65 35V250H600" stroke="#9da894" fill="none" />
            <text x="20" y="35" fontSize="13">
              mV
            </text>
            <text x="550" y="280" fontSize="13">
              Zeit
            </text>
            <path
              d="M65 210H170L225 180L280 50L325 95L375 245L440 220L490 210H590"
              stroke="#5b8451"
              fill="none"
              strokeWidth="4"
            />
            {[-70, 0, 30].map((v, i) => (
              <text key={v} x="20" y={[214, 105, 55][i]} fontSize="12">
                {v}
              </text>
            ))}
            <circle
              cx={[135, 265, 340, 405][step]}
              cy={[210, 87, 140, 236][step]}
              r="9"
              fill="#be8d55"
            />
            <text x="330" y="30" textAnchor="middle" fontSize="14">
              typisches neuronales Aktionspotenzial (schematisch)
            </text>
          </>
        )}
        {type === "heart" && (
          <>
            {box(30, 110, 120, 65, "Körper", "#e6d5c3")}
            {box(210, 65, 170, 55, "Rechtes Herz", "#dbe7ed")}
            {box(465, 110, 130, 65, "Lunge", "#e6efd9")}
            {box(210, 215, 170, 55, "Linkes Herz", "#f1d9cf")}
            <path
              d="M90 110V92H210 M380 92H525V110 M525 175V242H380 M210 242H90V175"
              stroke="#73906a"
              strokeWidth="3"
              fill="none"
              markerEnd={"url(#arrow-" + type + ")"}
            />
            <text x="320" y="165" textAnchor="middle" fontSize="13">
              Rechts → Lunge → Links → Körper
            </text>
          </>
        )}
        {type === "equilibrium" && (
          <>
            {box(40, 95, 175, 100, "Edukte A + B")}
            {box(425, 95, 175, 100, "Produkte C + D")}
            <path
              d="M235 125H405 M405 165H235"
              stroke="#658659"
              strokeWidth={step === 3 ? 5 : 3}
              markerEnd={"url(#arrow-" + type + ")"}
            />
            <text x="320" y="245" textAnchor="middle" fontSize="16">
              v(hin) = v(rück) im Gleichgewicht
            </text>
            <text x="320" y="275" textAnchor="middle" fontSize="13">
              Gleiche Geschwindigkeiten ≠ gleiche Konzentrationen
            </text>
          </>
        )}
        {type === "bond" && (
          <>
            <circle cx="240" cy="150" r="57" fill="#d8e6c9" stroke="#71935f" />
            <circle cx="355" cy="150" r="57" fill="#e6d7c0" stroke="#a88b64" />
            <circle cx="293" cy="140" r="5" fill="#496544" />
            <circle cx="303" cy="160" r="5" fill="#496544" />
            <text x="240" y="155" textAnchor="middle" fontSize="24">
              A
            </text>
            <text x="355" y="155" textAnchor="middle" fontSize="24">
              B
            </text>
            <text x="320" y="55" textAnchor="middle">
              Kovalente Bindung: geteiltes Elektronenpaar
            </text>
            <text x="320" y="265" textAnchor="middle" fontSize="14">
              Polarität hängt von Elektronegativität und Molekülgeometrie ab.
            </text>
          </>
        )}
        {type === "circuit" && (
          <>
            <path
              d={"M90 90H280 M360 90H550V235H90V90"}
              fill="none"
              stroke="#6c8e5d"
              strokeWidth="4"
            />
            <path
              d={on ? "M280 90H360" : "M280 90L350 55"}
              stroke="#a17f4e"
              strokeWidth="5"
            />
            <rect
              x="475"
              y="135"
              width="150"
              height="50"
              transform="rotate(90 550 160)"
              fill="#e3edd7"
              stroke="#69845a"
            />
            <path d="M77 190h26 M70 170h40" stroke="#435a3d" strokeWidth="4" />
            <text x="125" y="200" fontSize="15">
              U = 12 V
            </text>
            <text x="375" y="200" fontSize="15">
              R = {value} Ω
            </text>
            <text x="320" y="285" textAnchor="middle" fontSize="17">
              I = {on ? (12 / value).toFixed(3) : "0,000"} A · P ={" "}
              {on ? (144 / value).toFixed(2) : "0"} W
            </text>
          </>
        )}
        {type === "optics" && (
          <>
            <path d="M30 170H610" stroke="#a2b294" strokeDasharray="5 5" />
            <ellipse
              cx="300"
              cy="170"
              rx="12"
              ry="115"
              fill="#d6e7e8"
              stroke="#84a6a5"
            />
            <path
              d={`M${300 - value} 170v-60`}
              stroke="#466c44"
              strokeWidth="5"
              markerEnd={"url(#arrow-" + type + ")"}
            />
            <path
              d={`M${300 - value} 110H300L${300 + (90 * value) / (value - 90)} ${170 + (60 * 90) / (value - 90)} M${300 - value} 110L${300 + (90 * value) / (value - 90)} ${170 + (60 * 90) / (value - 90)}`}
              stroke="#bc925f"
              strokeWidth="2"
              fill="none"
            />
            <path
              d={`M${300 + (90 * value) / (value - 90)} 170v${(60 * 90) / (value - 90)}`}
              stroke="#7499a3"
              strokeWidth="5"
            />
            {[210, 390].map((x) => (
              <g key={x}>
                <circle cx={x} cy="170" r="4" fill="#657d54" />
                <text x={x} y="195" fontSize="13">
                  F
                </text>
              </g>
            ))}
            <text x="320" y="290" textAnchor="middle" fontSize="14">
              f = 90 · g = {value} · b ={" "}
              {((90 * value) / (value - 90)).toFixed(1)} (gleiche Längeneinheit)
            </text>
          </>
        )}
      </svg>
      {texts.length > 0 && (
        <div className="visual-controls">
          <button
            className="outline-button"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            Zurück
          </button>
          <p aria-live="polite">
            {step + 1}/{texts.length}: {texts[step]}
          </p>
          <button
            className="outline-button"
            disabled={step === texts.length - 1}
            onClick={() => setStep(step + 1)}
          >
            Weiter
          </button>
        </div>
      )}
      {type === "optics" && (
        <label>
          Gegenstandsweite g: {value}
          <input
            aria-label="Gegenstandsweite"
            type="range"
            min="150"
            max="260"
            value={value}
            onChange={(e) => setValue(+e.target.value)}
          />
        </label>
      )}
      {type === "circuit" && (
        <>
          <label>
            Widerstand: {value} Ω
            <input
              aria-label="Widerstand"
              type="range"
              min="20"
              max="300"
              step="10"
              value={value}
              onChange={(e) => setValue(+e.target.value)}
            />
          </label>
          <button className="outline-button" onClick={() => setOn(!on)}>
            {on ? "Schalter öffnen" : "Schalter schließen"}
          </button>
        </>
      )}
      <figcaption>
        Eigene schematische SVG-Grafik · MedAT Campus · ISC. Nicht
        maßstabsgetreu.
      </figcaption>
    </figure>
  );
}
