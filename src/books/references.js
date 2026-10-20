// Page numbers are physical PDF pages, independently inspected in the uploaded editions.
export const references = {
  "bms-0": [
    {
      book: "biology",
      page: 17,
      clip: [0.46, 0.13, 1, 0.385],
      title: "Tierische Zelle mit beschrifteten Organellen",
    },
    {
      book: "biology",
      page: 19,
      clip: [0.55, 0.68, 0.99, 0.89],
      title: "Mitochondrium: Membranen und Cristae",
    },
  ],
  "bms-1": [
    {
      book: "biology",
      page: 19,
      clip: [0.52, 0.1, 0.995, 0.32],
      title: "Aufbau einer Biomembran",
    },
  ],
  "bms-3": [
    {
      book: "biology",
      page: 94,
      title: "DNA und genetische Information im Skript",
    },
  ],
  "bms-4": [
    {
      book: "biology",
      page: 119,
      clip: [0.11, 0.5, 0.89, 0.64],
      title: "Meiotische Teilungen: homologe Chromosomen und Chromatiden",
    },
  ],
  "bms-13": [
    {
      book: "chemistry",
      page: 24,
      clip: [0.15, 0.135, 0.85, 0.48],
      title: "Zwischenmolekulare Kräfte im Vergleich",
    },
  ],
  "bms-15": [
    {
      book: "chemistry",
      page: 31,
      clip: [0.3, 0.19, 0.7, 0.425],
      title: "Konzentrationsverlauf beim Einstellen eines Gleichgewichts",
    },
  ],
  "bms-16": [
    {
      book: "chemistry",
      page: 40,
      title: "Brønsted-Modell und starke bzw. schwache Säuren",
    },
  ],
  "bms-19": [
    {
      book: "physics",
      page: 7,
      title: "Physikalische Größen und SI-Einheiten",
    },
  ],
  "bms-23": [
    {
      book: "physics",
      page: 27,
      clip: [0.08, 0.12, 0.92, 0.65],
      title: "Kirchhoff-Regeln und elektrische Schaltungen",
    },
  ],
  "bms-25": [
    {
      book: "physics",
      page: 42,
      clip: [0.22, 0.105, 0.78, 0.265],
      title: "Sammellinse: Gegenstands- und Bildweite",
    },
  ],
  "bms-27": [
    { book: "mathematics", page: 12, title: "Potenzen und ihre Rechenregeln" },
  ],
  "bms-28": [
    { book: "mathematics", page: 21, title: "Gleichungen und Ungleichungen" },
  ],
  "bms-30": [
    {
      book: "mathematics",
      page: 46,
      clip: [0.07, 0.1, 0.93, 0.91],
      title: "Dreiecksarten und Satz des Pythagoras",
    },
  ],
  "bms-31": [{ book: "mathematics", page: 50, title: "Vektoren und Betrag" }],
  "bio-respiration": [
    {
      book: "biology",
      page: 19,
      clip: [0.55, 0.68, 0.99, 0.89],
      title: "Mitochondrium als Ort der oxidativen Phosphorylierung",
    },
  ],
  "bio-photosynthesis": [
    {
      book: "biology",
      page: 132,
      clip: [0.02, 0.43, 0.51, 0.94],
      title: "Photosysteme und Elektronentransport",
    },
  ],
  "bio-protein-synthesis": [
    {
      book: "biology",
      page: 99,
      title: "Proteinbiosynthese im Biologie-Skript",
    },
  ],
  "chem-equilibrium": [
    {
      book: "chemistry",
      page: 31,
      clip: [0.3, 0.19, 0.7, 0.425],
      title:
        "Gleichgewicht: konstante Konzentrationen, weiterlaufende Reaktionen",
    },
  ],
  "chem-stereochemistry": [
    { book: "chemistry", page: 65, title: "Isomerie im Chemie-Skript" },
  ],
  "phys-lenses": [
    {
      book: "physics",
      page: 42,
      clip: [0.22, 0.105, 0.78, 0.265],
      title: "Reeller Strahlengang an einer Sammellinse",
    },
  ],
};
export const bookNotes = {
  "bms-15": {
    book: "chemistry",
    pages: [31, 34],
    text: "Das Skript trennt zu Recht Gleichgewichtsgeschwindigkeit und Konzentrationsverlauf. Für das Verständnis ist entscheidend: Gleiche Geschwindigkeiten bedeuten nicht gleiche Konzentrationen. Eine Katalyse verändert die Aktivierungsbarrieren, nicht die thermodynamische Gleichgewichtslage.",
    caution:
      "Auf PDF-Seite 33 werden Konzentration und Stoffmenge bei den Einheiten vermischt. Konzentration hat beispielsweise die Einheit mol/l, nicht mol. Die thermodynamische Gleichgewichtskonstante wird bei festgelegten Standardzuständen durch die Temperatur bestimmt; eine Druckänderung kann die Zusammensetzung verändern.",
  },
  "chem-equilibrium": {
    book: "chemistry",
    pages: [31, 32, 33, 34],
    text: "Die Beispiele zu Konzentrations-, Temperatur- und Druckänderungen eignen sich, um Q und K auseinanderzuhalten. Prüfe bei Gasen zuerst die stöchiometrische Zahl gasförmiger Teilchen. Die Wirkung eines Katalysators ist davon getrennt.",
    caution:
      "Die Rechnung mit Konzentrationen ist eine Näherung. Der thermodynamische Ausdruck verwendet Aktivitäten; weder die Konzentrationen noch Hin- und Rückreaktionsgeschwindigkeiten müssen als einzelne Zahlen gleichgesetzt werden.",
  },
  "bms-30": {
    book: "mathematics",
    pages: [44, 45, 46, 47],
    text: "Der Geometrieabschnitt ordnet Vierecke, Dreiecke und Kreise nebeneinander. Zeichne zuerst eine Skizze, trage die gegebenen Längen ein und entscheide dann, ob Pythagoras überhaupt anwendbar ist. Er gilt nur im rechtwinkligen Dreieck.",
    caution:
      "Längen, Flächen und Volumina haben unterschiedliche Einheiten. Beim Umrechnen muss der Umrechnungsfaktor entsprechend potenziert werden.",
  },
  "phys-lenses": {
    book: "physics",
    pages: [41, 42],
    text: "Das Skript zeigt getrennt, wie sich achsenparallele Strahlen und Strahlen durch die optische Mitte verhalten. Nutze mindestens zwei Strahlen zur Bildkonstruktion. Vergleiche anschließend deine Zeichnung mit der Linsengleichung.",
    caution:
      "PDF-Seite und gedruckte Skriptseite unterscheiden sich um zwei Seiten. Eine historische Skriptausgabe ist keine Bestätigung des aktuellen Prüfungsstoffs.",
  },
  "bio-respiration": {
    book: "biology",
    pages: [19, 20],
    text: "Die beschriftete Mitochondrienabbildung hilft, Matrix, innere Membran und Intermembranraum zu unterscheiden. Ordne danach jeden Vorgang räumlich zu: Citratzyklus in der Matrix, Atmungskette an der inneren Membran und Protonenrückfluss in die Matrix.",
    caution:
      "Das Protonengefälle ist kein Vorrat an ATP. Seine Energie kann erst durch die Kopplung an die ATP-Synthase für die ATP-Bildung genutzt werden.",
  },
  "bms-27": {
    book: "mathematics",
    pages: [12, 13],
    text: "Bearbeite Potenz- und Logarithmusregeln in zwei Richtungen: Ausdruck zusammenfassen und anschließend wieder aufteilen. Prüfe bei Logarithmen zuerst den Definitionsbereich und bei Wurzeln das Vorzeichen.",
    caution:
      "Aus √(x²) folgt |x|. Außerdem ist log(x+y) im Allgemeinen nicht log(x)+log(y).",
  },
};
export const kffBookNotes = {
  numbers: {
    page: 17,
    text: "Das KFF-Skript 2021 beschreibt sieben vorgegebene ganze Zahlen und die Suche nach den nächsten zwei Werten. Es empfiehlt, Differenzen, Faktoren und verschränkte Teilfolgen systematisch zu prüfen. Die damaligen Mengen und Zeiten sind keine aktuellen offiziellen Vorgaben.",
  },
  figures: {
    page: 8,
    text: "Der Skriptabschnitt empfiehlt Winkel, Außenkanten und die Vollständigkeit der Zielfigur zu vergleichen. Die hier vorhandenen eigenen SVG-Aufgaben bleiben separat; die Originalabbildung dient nur dem nachvollziehbaren Lesen des historischen Skripts.",
  },
  words: {
    page: 20,
    text: "Im Skript 2021 werden Anagramme von Hauptwörtern ohne Umlaute oder ß beschrieben. Gesucht ist der Anfangsbuchstabe. Die bisherigen AE/OE/UE-Umschreibungen wurden deshalb aus unserem Pool entfernt.",
  },
  memory: {
    page: 9,
    text: "Der historische Skriptaufbau nennt Foto, Name, Geburtstag, Medikamenteneinnahme Ja/Nein, Blutgruppe, Allergien, Ausweisnummer und Ausstellungsland. Die Campus-Ausweise sind weiterhin erfunden. Medikamenteneinnahme wird jetzt ebenfalls angezeigt.",
  },
  logic: {
    page: 22,
    text: "Das Skript unterscheidet ausdrücklich logische Folgerichtigkeit vom eigenen Sachwissen. Prüfe eine Schlussfolgerung gegen alle mit den Prämissen vereinbaren Situationen.",
  },
};
