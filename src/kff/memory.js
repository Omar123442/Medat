import { shuffle } from "./tasks";
export const people = [
  ["Mara Leitner", "12.03.1998", "A+", "Österreich", "Pollen", "483719"],
  ["Leon Berger", "27.08.2001", "B−", "Deutschland", "Milch", "715382"],
  ["Nora Fink", "05.11.1996", "AB+", "Italien", "Nüsse", "926451"],
  ["Emil Wolf", "19.02.2000", "0−", "Schweiz", "Ei", "362847"],
  ["Lina Stein", "30.06.1999", "A−", "Slowenien", "Soja", "847263"],
  ["Paul Kern", "08.12.1997", "B+", "Ungarn", "Fisch", "591634"],
  ["Alma Roth", "23.04.2002", "AB−", "Kroatien", "Weizen", "638925"],
  ["Theo Lang", "14.09.1995", "0+", "Tschechien", "Hausstaub", "274186"],
].map(([name, birthday, blood, country, allergy, number], i) => ({
  id: "person-" + i,
  name,
  birthday,
  blood,
  country,
  allergy,
  number,
  avatar: i,
}));
export function memoryTasks(selected) {
  return selected.flatMap((p) =>
    ["birthday", "blood", "allergy"].map((field) => {
      const values = shuffle(
        people.filter((x) => x[field] !== p[field]).map((x) => x[field]),
      ).slice(0, 4);
      const options = shuffle([p[field], ...values]);
      const labels = {
        birthday: "Welches Geburtsdatum gehört zu",
        blood: "Welche Blutgruppe gehört zu",
        allergy: "Welche Allergie gehört zu",
      };
      return {
        id: p.id + "-" + field,
        kind: "memory",
        person: p,
        field,
        level: "Mittel",
        prompt: labels[field] + " " + p.name + "?",
        options,
        correct: options.indexOf(p[field]),
        solution: [
          `Rufe das Bild und den Namen ${p.name} gemeinsam ab.`,
          `Im fiktiven Ausweis steht: ${field === "birthday" ? "Geburtsdatum" : field === "blood" ? "Blutgruppe" : "Allergie"} ${p[field]}.`,
          "Verknüpfe Name und Merkmal mit einer eigenen bildhaften Eselsbrücke statt nur die Reihenfolge zu merken.",
        ],
        error:
          field === "birthday"
            ? "Geburtsdatum verwechselt"
            : field === "blood"
              ? "Blutgruppe verwechselt"
              : "Allergie verwechselt",
      };
    }),
  );
}
