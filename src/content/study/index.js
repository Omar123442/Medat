import biology from "./biology.json";
import chemistry from "./chemistry.json";
import physics from "./physics.json";
import mathematics from "./mathematics.json";
import advanced from "./advanced.json";
const guides = {
  ...biology,
  ...chemistry,
  ...physics,
  ...mathematics,
  ...advanced,
};
export function studyFor(chapter) {
  const guide = guides[chapter.id];
  if (!guide) throw new Error("Fehlender Lernleitfaden: " + chapter.id);
  return {
    ...guide,
    sections:
      guide.sections ||
      chapter.paragraphs.map((text, i) => ({
        title: guide.sectionTitles[i] || "Zusammenhang " + (i + 1),
        text,
      })),
    checks: [
      { question: chapter.question, answer: chapter.answer },
      ...guide.checks,
    ],
  };
}
export const studyGuides = guides;
