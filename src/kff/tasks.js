export function shuffle(a, rng = Math.random) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
function pairOptions(pair, seed) {
  const [a, b] = pair;
  const wrong = [
    [a + 1, b],
    [a, b + 1],
    [a - 1, b - 1],
    [a + 2, b + 3],
  ];
  const options = shuffle([pair, ...wrong], () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  });
  return {
    options: options.map((x) => x.join(" · ")),
    correct: options.findIndex((x) => x[0] === a && x[1] === b),
  };
}
export const numberTasks = Array.from({ length: 36 }, (_, i) => {
  const variant = i % 6,
    family = Math.floor(i / 6),
    start = variant + 2;
  let values, rule, steps, level;
  if (family === 0) {
    const d = variant + 2;
    values = Array.from({ length: 9 }, (_, k) => start + k * d);
    rule = "Konstante Differenz";
    level = "Leicht";
    steps = [
      `Die Differenz benachbarter Zahlen beträgt stets ${d}.`,
      `Addiere zu jedem Glied ${d}.`,
      `Setze dieselbe Regel zweimal fort.`,
    ];
  }
  if (family === 1) {
    values = Array.from({ length: 9 }, (_, k) => start + (k * (k + 1)) / 2);
    rule = "Wachsende Differenzen";
    level = "Mittel";
    steps = [
      "Die Differenzen lauten 1, 2, 3, 4, 5, 6 …",
      "Die Differenz wächst jeweils um 1.",
      "Zu den letzten beiden Fortsetzungen werden 7 und 8 addiert.",
    ];
  }
  if (family === 2) {
    values = Array.from({ length: 9 }, (_, k) => (k + start) ** 2);
    rule = "Quadratzahlen";
    level = "Mittel";
    steps = [
      `Die Zahlen sind Quadrate aufeinanderfolgender Zahlen ab ${start}.`,
      "Ziehe gedanklich die Wurzel; die Basen steigen jeweils um 1.",
      "Quadriere die nächsten beiden Basen.",
    ];
  }
  if (family === 3) {
    values = Array.from({ length: 9 }, (_, k) =>
      k % 2 === 0
        ? start + Math.floor(k / 2) * 3
        : 30 + variant + Math.floor(k / 2) * 5,
    );
    rule = "Zwei verschränkte Folgen";
    level = "Schwer";
    steps = [
      "Betrachte die Positionen 1, 3, 5, 7, 9 und getrennt 2, 4, 6, 8.",
      "Die ungeraden Positionen steigen um 3, die geraden um 5.",
      "Für Position 8 setzt du die zweite Folge, für Position 9 die erste fort.",
    ];
  }
  if (family === 4) {
    values = Array.from({ length: 9 }, (_, k) => start * 2 ** k);
    rule = "Konstanter Faktor";
    level = "Leicht";
    steps = [
      "Der Quotient benachbarter Zahlen ist immer 2.",
      "Jede Zahl ist doppelt so groß wie ihre Vorgängerin.",
      "Verdopple zweimal.",
    ];
  }
  if (family === 5) {
    values = [start];
    for (let k = 1; k < 9; k++)
      values.push(k % 2 ? values[k - 1] + 3 : values[k - 1] * 2);
    rule = "Wechselnde Operationen";
    level = "Schwer";
    steps = [
      "Die Operationen wechseln zwischen +3 und ×2.",
      "Markiere die Übergänge, nicht nur die Zahlenpositionen.",
      "Vom siebten zum achten Glied gilt +3, danach ×2.",
    ];
  }
  return {
    id: "numbers-" + i,
    kind: "numbers",
    level,
    values: values.slice(0, 7),
    expected: values.slice(7),
    ...pairOptions(values.slice(7), i + 50),
    solution: [
      ...steps,
      `Die nächsten beiden Werte sind ${values[7]} und ${values[8]}.`,
    ],
    error: rule,
  };
});
// Independently authored list of conventional German words. No third-party dictionary copied.
const words = [
  "BLUTDRUCK",
  "ZELLKERN",
  "HERZKAMMER",
  "MIKROSKOP",
  "SAUERSTOFF",
  "NERVENZELLE",
  "KNOCHENMARK",
  "IMMUNSYSTEM",
  "RIBOSOM",
  "CHROMOSOM",
  "BAKTERIUM",
  "LYMPHKNOTEN",
  "BRUSTKORB",
  "LEBERZELLE",
  "BLUTPLASMA",
  "ZELLWAND",
  "MAGENSAFT",
  "KOHLENSTOFF",
  "STICKSTOFF",
  "WASSERSTOFF",
  "NATRIUM",
  "KALIUM",
  "GLUCOSE",
  "VORHOF",
];
const sorted = (s) => s.split("").sort().join("");
if (new Set(words.map(sorted)).size !== words.length)
  throw new Error("Mehrdeutiges Wortpaar im eigenen Pool");
export const wordTasks = words.map((word, i) => {
  let letters = shuffle(word.split(""), () => {
    let x = Math.sin(++i * 91) * 10000;
    return x - Math.floor(x);
  });
  if (letters.join("") === word) letters.reverse();
  const initials = [
    word[0],
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      .split("")
      .filter((x) => x !== word[0])
      .slice(i % 8, (i % 8) + 4),
  ];
  const options = shuffle(initials, () => {
    let x = Math.sin(++i * 31) * 10000;
    return x - Math.floor(x);
  });
  return {
    id: "word-" + word,
    kind: "words",
    word,
    letters,
    level: word.length < 8 ? "Leicht" : word.length < 11 ? "Mittel" : "Schwer",
    options,
    correct: options.indexOf(word[0]),
    solution: [
      `Ordne alle ${word.length} Buchstaben zu einem geläufigen deutschen Wort.`,
      `Eine passende Lösung ist ${word}. Alle vorgegebenen Buchstaben werden genau einmal verwendet.`,
      `Der Anfangsbuchstabe lautet ${word[0]}.`,
    ],
    error: "Buchstaben vollständig und mit richtiger Häufigkeit verwenden",
  };
});
export function polygonArea(points) {
  return (
    Math.abs(
      points.reduce((sum, [x, y], i) => {
        const [nx, ny] = points[(i + 1) % points.length];
        return sum + x * ny - nx * y;
      }, 0),
    ) / 2
  );
}
export const figureTasks = Array.from({ length: 18 }, (_, i) => {
  const w = 4 + (i % 3),
    hL = 2 + (i % 2),
    hR = 2 + ((i + 1) % 2),
    hM = 4 + Math.floor(i / 6),
    m = w / 2;
  const target = [
    [0, 0],
    [w, 0],
    [w, hR],
    [m, hM],
    [0, hL],
  ];
  const pieces = [
    [
      [0, 0],
      [m, 0],
      [0, hL],
    ],
    [
      [m, 0],
      [m, hM],
      [0, hL],
    ],
    [
      [m, 0],
      [w, 0],
      [w, hR],
      [m, hM],
    ],
  ];
  const distractors = [1, -1, 2, -2].map((d) => [
    [0, 0],
    [w + d * 0.35, 0],
    [w + d * 0.35, hR],
    [m, hM],
    [0, hL],
  ]);
  const shapes = shuffle([target, ...distractors], () => {
    const x = Math.sin(++i * 17) * 1000;
    return x - Math.floor(x);
  });
  return {
    id: "figure-" + w + "-" + hL + "-" + hM + "-" + i,
    kind: "figures",
    level: i % 3 === 0 ? "Leicht" : i % 3 === 1 ? "Mittel" : "Schwer",
    pieces,
    shapes,
    options: ["A", "B", "C", "D", "E"],
    correct: shapes.indexOf(target),
    target,
    area: polygonArea(target),
    solution: [
      "Drehen ist erlaubt, Spiegeln und Überlappen nicht. Verwende jedes Teil genau einmal.",
      "Die beiden Dreiecke bilden gemeinsam die linke Hälfte. Das Viereck schließt rechts an.",
      "Die farbige Lösung zeigt die gemeinsame Außenkontur. In diesem Grundlagenpool haben die Ablenker andere Flächen; damit kann keiner aus denselben Teilen entstehen.",
    ],
    error: "Fläche erhalten, Kanten vergleichen und Spiegelung vermeiden",
  };
});
export const kffAreas = [
  {
    id: "numbers",
    title: "Zahlenfolgen",
    description: "Differenzen, Faktoren und verschränkte Muster.",
    tasks: numberTasks,
  },
  {
    id: "figures",
    title: "Figuren zusammensetzen",
    description: "Drehe Einzelteile im Lernmodus und prüfe die Kontur.",
    tasks: figureTasks,
  },
  {
    id: "words",
    title: "Wortflüssigkeit",
    description: "Buchstaben ordnen und den Anfangsbuchstaben bestimmen.",
    tasks: wordTasks,
  },
  {
    id: "memory",
    title: "Gedächtnis & Merkfähigkeit",
    description: "Fiktive Ausweise einprägen, danach gezielt abrufen.",
  },
  {
    id: "logic",
    title: "Implikationen erkennen",
    description: "Aussagen prüfen und zwingende Schlüsse erkennen.",
  },
];
