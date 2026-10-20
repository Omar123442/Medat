const { test, expect } = require("@playwright/test");
async function learn(page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Jetzt verstehen", exact: true })
    .click();
  await expect(page.locator(".lesson-tile")).toHaveCount(49);
}
test("Skriptbibliothek ist direkt in Zuerst verstehen integriert", async ({
  page,
}) => {
  await learn(page);
  await page
    .getByRole("button", { name: "Deine Skripte", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Deine Skriptbibliothek" }),
  ).toBeVisible();
  await expect(page.locator(".books-shelf .source-grid>article")).toHaveCount(
    5,
  );
  await expect(
    page.getByRole("button", { name: "PDF-Skripte importieren" }),
  ).toBeVisible();
});
test("Alle Kapitel besitzen ausgearbeitete Leitfäden ohne erfundene Skriptabdeckung", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { curriculum } = await import("/src/curriculum.js");
    const { studyFor } = await import("/src/content/study/index.js");
    const books = (await import("/src/books/books.json")).default;
    const guides = curriculum.map((c) => studyFor(c));
    return {
      count: guides.length,
      complete: guides.every(
        (g) =>
          g.terms.length >= 2 &&
          g.sections.length >= 2 &&
          g.workedExample.steps.length >= 3 &&
          g.checks.length >= 2,
      ),
      validPages: guides.every((g) =>
        g.citations.every(
          (s) =>
            s.pages.length > 0 &&
            s.pages.every(
              (p) => p > 0 && p <= books.find((b) => b.id === s.book).pages,
            ),
        ),
      ),
      noInvented:
        studyFor(curriculum.find((c) => c.id === "math-combinatorics"))
          .citations.length === 0,
    };
  });
  expect(result).toEqual({
    count: 49,
    complete: true,
    validPages: true,
    noInvented: true,
  });
});
test("Lerntext und genaue Skriptquellen sind ohne PDF-Import lesbar", async ({
  page,
}) => {
  await learn(page);
  await page
    .locator(".lesson-tile")
    .filter({ hasText: "Zelle und Organellen" })
    .click();
  await expect(page.locator(".chapter-citation")).toContainText(
    "Biologie-Skript",
  );
  await expect(page.locator(".chapter-citation")).toContainText("17–24");
  await expect(page.locator(".chapter-glossary")).toContainText("Kompartiment");
  await expect(page.locator(".explanation-block")).toHaveCount(4);
  await expect(page.locator(".worked-example")).toContainText("Drüsenzelle");
  await expect(page.locator(".worked-example li")).toHaveCount(3);
  await expect(page.locator(".chapter-selftest .comprehension")).toHaveCount(2);
  await expect(page.locator(".transfer-check details")).not.toHaveAttribute(
    "open",
    "",
  );
  await page.locator(".transfer-check summary").click();
  await expect(page.locator(".transfer-check")).toContainText("Cytosol");
  await page
    .getByRole("button", { name: "Skripte hier importieren / lesen" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Deine Skriptbibliothek" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "← Zurück zu Zelle und Organellen" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Zelle und Organellen", exact: true }),
  ).toBeVisible();
});
test("Kapitel lassen sich abschnittsweise und der Reihe nach lesen", async ({
  page,
}) => {
  await learn(page);
  await page
    .locator(".lesson-tile")
    .filter({ hasText: "Zelle und Organellen" })
    .click();
  await page
    .getByRole("navigation", { name: "Kapitelabschnitte" })
    .getByRole("button", { name: "Selbsttest", exact: true })
    .click();
  await expect(page.locator(".chapter-selftest")).toBeInViewport();
  await page
    .getByRole("button", { name: "Nächstes Kapitel", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Membran und Stofftransport",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Vorheriges Kapitel", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Zelle und Organellen", exact: true }),
  ).toBeVisible();
});
test("Alle fünf KFF-Skriptbereiche haben lesbare Lernhinweise", async ({
  page,
}) => {
  await learn(page);
  await page
    .getByRole("button", { name: "KFF-Lernwissen", exact: true })
    .click();
  await expect(page.locator(".kff-study-chapter")).toHaveCount(5);
  await expect(page.locator(".kff-study")).toContainText("Differenzen");
  await expect(page.locator(".kff-study")).toContainText("Weltwissen");
  await expect(
    page.locator(".kff-study-chapter").first().locator(".comprehension"),
  ).toContainText("gleiche Fläche");
});
test("Detailliertes Skriptkapitel bleibt mobil ohne horizontalen Überlauf", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await learn(page);
  await page
    .locator(".lesson-tile")
    .filter({ hasText: "Zelle und Organellen" })
    .click();
  await expect(page.locator(".chapter-glossary")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
