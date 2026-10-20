import biology from "./content/biology.json";
import chemistry from "./content/chemistry.json";
import physics from "./content/physics.json";
import mathematics from "./content/mathematics.json";
import biologyExtra from "./content/biology-extra.json";
import chemistryExtra from "./content/chemistry-extra.json";
import physicsExtra from "./content/physics-extra.json";
import mathematicsExtra from "./content/mathematics-extra.json";
import { keywords, formulas, pitfalls, diagrams } from "./content/metadata";
import { subjectSources } from "./content/sources";
export const curriculum = [
  ...biology,
  ...chemistry,
  ...physics,
  ...mathematics,
  ...biologyExtra,
  ...chemistryExtra,
  ...physicsExtra,
  ...mathematicsExtra,
].map((c) => ({
  ...c,
  subtopic: c.title,
  medatKeyword: c.topic,
  officialMatch: "nicht geprüft",
  difficulty: c.id.startsWith("bms-") ? "Grundlage" : "Vertiefung",
  introduction:
    c.introduction ||
    `Du lernst die zentralen Zusammenhänge zu „${c.title}“ und prüfst sie anschließend an einer Verständnisfrage.`,
  prerequisites: c.prerequisites || [
    c.subject === "Mathematik"
      ? "Grundrechenarten und Einheiten"
      : "Grundbegriffe aus " + c.subject,
  ],
  keywords: c.keywords || keywords[c.id] || [],
  formula: c.formula || formulas[c.id] || null,
  mistake: c.mistake || pitfalls[c.id],
  diagram: c.diagram || diagrams[c.id] || null,
  example: c.example || c.paragraphs[2],
  summary: c.summary || [c.paragraphs[0], pitfalls[c.id]],
  sources: subjectSources[c.subject],
  linkedCards: [],
  images:
    c.diagram || diagrams[c.id]
      ? [
          {
            id: c.diagram || diagrams[c.id],
            creator: "MedAT Campus",
            license: "ISC · eigene schematische SVG-Grafik",
          },
        ]
      : [],
  lastReviewed: null,
  lastUpdated: "2026-10-20",
  reviewStatus: "redaktioneller Entwurf; externe fachliche Prüfung offen",
}));
