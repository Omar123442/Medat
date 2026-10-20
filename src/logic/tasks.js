import {
  statement as s,
  conclusions,
  modelsFor,
  entailed,
  describe,
  witness,
} from "./engine";
const patterns = [
  {
    id: "chain",
    p: [s("all", 0, 1), s("all", 1, 2)],
    level: "Leicht",
    error: "Umkehrung einer Allaussage",
    steps: [
      "A liegt vollständig in B; B liegt vollständig in C.",
      "Damit liegt A vollständig in C. Die Richtung der Kette bleibt erhalten.",
      "C kann weitere Elemente außerhalb von A enthalten. Aus einer Allaussage folgt außerdem nicht, dass A existiert.",
    ],
  },
  {
    id: "exclude",
    p: [s("all", 0, 1), s("none", 1, 2)],
    level: "Leicht",
    error: "Unzulässige Existenzannahme",
    steps: [
      "Jedes A gehört zu B.",
      "B und C haben keine gemeinsamen Elemente. Also können auch A und C nichts gemeinsam haben.",
      "Dass es überhaupt A gibt, wird nicht behauptet. Eine Aussage „Einige A …“ ist deshalb nicht automatisch ableitbar.",
    ],
  },
  {
    id: "exists",
    p: [s("some", 0, 1), s("all", 1, 2)],
    level: "Mittel",
    error: "Von einigen auf alle schließen",
    steps: [
      "Mindestens ein Objekt gehört gleichzeitig zu A und B.",
      "Jedes B gehört zu C, also gehört auch dieses konkrete Objekt zu C.",
      "Damit gibt es mindestens ein Objekt in A und C. Über die übrigen A wird nichts ausgesagt.",
    ],
  },
  {
    id: "outside",
    p: [s("some", 0, 1), s("none", 1, 2)],
    level: "Mittel",
    error: "„Einige“ als „alle“ lesen",
    steps: [
      "Mindestens ein Objekt gehört zu A und B.",
      "Kein B gehört zu C; das genannte Objekt gehört deshalb nicht zu C.",
      "Einige A sind also keine C. Andere A könnten dennoch C sein.",
    ],
  },
  {
    id: "shared",
    p: [s("all", 0, 1), s("all", 2, 1)],
    level: "Schwer",
    error: "Gemeinsame Obergruppe mit Überschneidung verwechseln",
    steps: [
      "A und C liegen beide in B.",
      "Sie können sich innerhalb von B überschneiden, getrennt liegen oder leer sein.",
      "Zwischen A und C ergibt sich daher keine der angebotenen Beziehungen zwingend.",
    ],
  },
  {
    id: "different",
    p: [s("some", 0, 1), s("some", 1, 2)],
    level: "Schwer",
    error: "Verschiedene Existenzzeugen gleichsetzen",
    steps: [
      "Es gibt ein Objekt in A und B und ein Objekt in B und C.",
      "Die beiden Aussagen müssen nicht dasselbe Objekt meinen.",
      "A und C können disjunkt sein oder sich überschneiden. Eine Verbindung folgt nicht zwingend.",
    ],
  },
  {
    id: "reverse-exists",
    p: [s("all", 1, 0), s("some", 1, 2)],
    level: "Mittel",
    error: "Zulässige und unzulässige Umkehrung verwechseln",
    steps: [
      "Es existiert ein Objekt, das B und C ist.",
      "Jedes B ist A; das Objekt ist daher auch A.",
      "Es liegt somit in A und C. „Einige A sind C“ und „Einige C sind A“ sind gleichbedeutend.",
    ],
  },
  {
    id: "cross-exclude",
    p: [s("none", 0, 1), s("all", 2, 1)],
    level: "Leicht",
    error: "Richtung einer Zuordnung übersehen",
    steps: [
      "A und B sind disjunkt.",
      "C liegt vollständig in B und kann deshalb keine Elemente aus A enthalten.",
      "Also sind A und C disjunkt. Die Aussage lässt sich in diesem Fall auch umkehren.",
    ],
  },
  {
    id: "negative-exists",
    p: [s("all", 0, 1), s("notall", 2, 1)],
    level: "Schwer",
    error: "Existenzinformation in der falschen Gruppe anwenden",
    steps: [
      "Mindestens ein C ist kein B.",
      "Da alle A zu B gehören, kann dieses C auch kein A sein.",
      "Einige C sind keine A. Daraus folgt keine Aussage darüber, ob A existiert.",
    ],
  },
  {
    id: "subset-exists",
    p: [s("some", 1, 0), s("all", 1, 2)],
    level: "Mittel",
    error: "Existenzzeugnis verlieren",
    steps: [
      "Einige B sind A; dieselben Objekte sind damit auch A und B.",
      "Alle B sind C. Das bezeugte Objekt gehört deshalb auch zu C.",
      "Einige A sind C. Weitere Objekte spielen für diesen Schluss keine Rolle.",
    ],
  },
];
const worlds = [
  ["Lerchen", "Vögel", "Tiere"],
  ["Zellforscher", "Laborpersonen", "Studierende"],
  ["Rosen", "Pflanzen", "Lebewesen"],
  ["Geiger", "Musiker", "Künstler"],
  ["Läufer", "Sportler", "Vereinsmitglieder"],
  ["Maler", "Gestalter", "Aussteller"],
];
export const logicTasks = patterns.flatMap((p, i) =>
  Array.from({ length: 3 }, (_, variant) => {
    const names = worlds[(i + variant) % worlds.length];
    const models = modelsFor(p.p);
    if (!models.length) throw new Error("Widersprüchliche Aufgabe");
    const valid = conclusions.filter((c) => entailed(c, models));
    const invalid = conclusions.filter((c) => !entailed(c, models));
    // Exactly one answer among A–D, or none and E. Equivalent conclusions are never offered together.
    let candidates = valid.length
      ? [valid[0], ...invalid.slice(0, 3)]
      : invalid.slice(0, 4);
    const shift = (i + variant) % 4;
    candidates = [...candidates.slice(shift), ...candidates.slice(0, shift)];
    const options = candidates.map((c) => ({
      text: describe(c, names),
      statement: c,
      counterexample: witness(c, models, names),
    }));
    options.push({
      text: "Keine der Schlussfolgerungen A–D folgt zwingend.",
      statement: null,
    });
    const correct = valid.length
      ? candidates.findIndex((c) => entailed(c, models))
      : 4;
    return {
      id: `${p.id}-${variant}`,
      level: p.level,
      premises: p.p.map((x) => describe(x, names)),
      rawPremises: p.p,
      names,
      options,
      correct,
      error: p.error,
      steps: p.steps,
      modelCount: models.length,
    };
  }),
);
export const foundations = [
  {
    id: "sufficient",
    title: "Notwendig und hinreichend",
    text: "Wenn P gilt, dann gilt Q (P → Q). P ist hinreichend für Q: Sobald P erfüllt ist, muss Q gelten. Q ist notwendig für P: Ohne Q kann P nicht gelten. Die Bedingung sagt nicht, dass Q nur durch P eintreten kann.",
    example:
      "Wenn eine Zahl durch 4 teilbar ist, ist sie gerade. Durch 4 teilbar zu sein ist hinreichend für Geradzahligkeit. Gerade zu sein ist notwendig für Teilbarkeit durch 4, aber nicht hinreichend: 6 ist gerade und nicht durch 4 teilbar.",
    question:
      "„Wenn eine Zahl durch 4 teilbar ist, ist sie gerade.“ Was folgt zwingend?",
    options: [
      "Jede gerade Zahl ist durch 4 teilbar.",
      "Eine ungerade Zahl ist nicht durch 4 teilbar.",
      "Eine nicht durch 4 teilbare Zahl ist ungerade.",
    ],
    correct: 1,
    solution:
      "Die Kontraposition ¬Q → ¬P ist gleichbedeutend mit P → Q. Die Umkehrung Q → P und die Verneinung des Vordersatzes ¬P → ¬Q sind nicht zulässig.",
    trap: "Bejahung des Nachsatzes und Verneinung des Vordersatzes",
  },
  {
    id: "quantifiers",
    title: "Alle, keine, einige",
    text: "„Alle A sind B“ erlaubt keine Ausnahme unter den A. „Keine A sind B“ bedeutet, dass A und B disjunkt sind. „Einige“ bedeutet mindestens eines, nicht „einige, aber nicht alle“. Allaussagen allein behaupten keine Existenz.",
    example:
      "„Alle Drachen sind grün“ legt ohne weitere Existenzannahme nicht fest, dass Drachen existieren. „Einige Drachen sind grün“ behauptet dagegen mindestens einen grünen Drachen.",
    question: "Was ist die genaue Negation von „Alle A sind B“?",
    options: ["Keine A sind B.", "Alle B sind A.", "Einige A sind keine B."],
    correct: 2,
    solution:
      "Eine Allaussage wird durch ein einziges Gegenbeispiel widerlegt. Daher lautet die Negation: Es gibt mindestens ein A, das kein B ist.",
    trap: "Eine Allaussage zu stark verneinen",
  },
  {
    id: "negation",
    title: "Negationen und De-Morgan-Regeln",
    text: "Eine Negation muss den Wahrheitswert der gesamten Aussage umkehren. ¬(P ∧ Q) ist gleichbedeutend mit ¬P ∨ ¬Q. ¬(P ∨ Q) ist gleichbedeutend mit ¬P ∧ ¬Q. Das logische „oder“ ist einschließend, sofern nicht ausdrücklich „entweder … oder, aber nicht beides“ gesagt wird.",
    example:
      "„Es ist nicht der Fall, dass Anna lernt und Ben schläft“ bedeutet: Anna lernt nicht oder Ben schläft nicht (oder beides). Es verlangt nicht, dass beide Teilaussagen falsch sind.",
    question: "Was ist die Negation von „P oder Q“ beim einschließenden Oder?",
    options: ["Nicht P und nicht Q.", "Nicht P oder nicht Q.", "P und Q."],
    correct: 0,
    solution:
      "P ∨ Q ist nur dann falsch, wenn sowohl P als auch Q falsch sind. Deshalb müssen beide negiert und mit „und“ verbunden werden.",
    trap: "Beim Negieren den Verknüpfungstyp unverändert lassen",
  },
  {
    id: "implication",
    title: "Aussagenlogik und Gegenbeispiele",
    text: "Eine Implikation P → Q ist genau dann falsch, wenn P wahr und Q falsch ist. Eine Schlussfolgerung ist logisch zwingend, wenn sie in jeder Situation wahr ist, in der alle Prämissen wahr sind. Weltwissen ersetzt keine angegebene Prämisse.",
    example:
      "Aus „Einige A sind B“ und „Einige B sind C“ folgt nicht zwingend „Einige A sind C“. Das erste Objekt kann A und B sein, ein anderes B und C. Beide Prämissen sind dann wahr, obwohl A und C disjunkt sind.",
    question: "Wann ist P → Q falsch?",
    options: [
      "Wenn P falsch und Q wahr ist.",
      "Wenn P wahr und Q falsch ist.",
      "Immer, wenn P falsch ist.",
    ],
    correct: 1,
    solution:
      "Die Regel verspricht Q nur für den Fall P. Eine Verletzung tritt ausschließlich ein, wenn P tatsächlich gilt, Q aber ausbleibt.",
    trap: "Möglichkeit mit logischer Notwendigkeit verwechseln",
  },
  {
    id: "equivalence",
    title: "Äquivalenz und „nur wenn“",
    text: "P ↔ Q bedeutet zugleich P → Q und Q → P. P ist dann notwendig und hinreichend für Q. „P nur wenn Q“ bedeutet P → Q; das Wort „nur“ macht Q zur notwendigen Bedingung. „P wenn Q“ bedeutet dagegen Q → P.",
    example:
      "„Ein Zutritt ist nur mit Ausweis möglich“ bedeutet: Zutritt → Ausweis. Ein Ausweis allein garantiert den Zutritt nicht; es könnte zusätzlich eine Eintrittskarte erforderlich sein.",
    question: "„P nur wenn Q“ – welche Richtung ist richtig?",
    options: ["Q → P.", "P → Q.", "P ↔ Q."],
    correct: 1,
    solution:
      "Ohne Q ist P ausgeschlossen: ¬Q → ¬P. Durch Kontraposition ergibt sich P → Q. Die andere Richtung ist nicht mitbehauptet.",
    trap: "„Wenn“ und „nur wenn“ gleich lesen",
  },
];
export const sources = [
  {
    name: "Offizielle MedAT-Erklärvideos",
    url: "https://www.medizinstudieren.at/der-aufnahmetest-medat/testinhalte/vorbereitungsunterlagen/erklaervideos-testteile-medat/",
  },
  {
    name: "OpenStax · Contemporary Mathematics",
    url: "https://openstax.org/details/books/contemporary-mathematics",
  },
  { name: "Open Logic Project", url: "https://openlogicproject.org/" },
];
