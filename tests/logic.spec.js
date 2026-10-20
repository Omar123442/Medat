const { test, expect } = require("@playwright/test");
async function open(page) {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Implikationen erkennen", exact: true })
    .click();
}
async function train(page) {
  await open(page);
  await page.getByRole("button", { name: "Training", exact: true }).click();
}
test("Logikregeln, eindeutige Aufgaben und Gegenmodelle", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const {
      holds,
      statement: s,
      modelsFor,
      entailed,
      negate,
    } = await import("/src/logic/engine.js");
    const { logicTasks } = await import("/src/logic/tasks.js");
    const errors = [];
    for (const task of logicTasks) {
      const models = modelsFor(task.rawPremises);
      const valid = task.options
        .slice(0, 4)
        .map((o, i) => (entailed(o.statement, models) ? i : null))
        .filter((i) => i !== null);
      if (valid.length > 1 || task.correct !== (valid[0] ?? 4))
        errors.push(task.id);
      for (const o of task.options.slice(0, 4)) {
        if (entailed(o.statement, models) && o.counterexample !== null)
          errors.push("invalid witness");
        if (!entailed(o.statement, models) && !o.counterexample)
          errors.push("missing witness");
      }
    }
    const invalidReverse = !entailed(
      s("all", 2, 0),
      modelsFor([s("all", 0, 1), s("all", 1, 2)]),
    );
    const someNotTransitive = !entailed(
      s("some", 0, 2),
      modelsFor([s("some", 0, 1), s("some", 1, 2)]),
    );
    const noExistence = !entailed(
      s("some", 0, 2),
      modelsFor([s("all", 0, 1), s("all", 1, 2)]),
    );
    let complementary = true;
    for (const kind of ["all", "none", "some", "notall"])
      for (let model = 0; model < 256; model++) {
        const st = s(kind, 0, 2);
        if (holds(st, model) === holds(negate(st), model))
          complementary = false;
      }
    return {
      errors,
      count: logicTasks.length,
      invalidReverse,
      someNotTransitive,
      noExistence,
      complementary,
    };
  });
  expect(result).toEqual({
    errors: [],
    count: 30,
    invalidReverse: true,
    someNotTransitive: true,
    noExistence: true,
    complementary: true,
  });
});
test("Grundlagen mit notwendigen Bedingungen und Negationen", async ({
  page,
}) => {
  await open(page);
  await expect(
    page.getByRole("heading", {
      name: "Notwendig und hinreichend",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "B. Eine ungerade Zahl ist nicht durch 4 teilbar.",
    })
    .click();
  await expect(page.locator(".foundation-feedback")).toContainText("Richtig.");
  await expect(page.getByRole("table")).toContainText("falsch");
  await expect(
    page.getByRole("heading", { name: "Negationen und De-Morgan-Regeln" }),
  ).toBeVisible();
});
test("Lernmodus zeigt Lösung nach Prüfung und speichert Ergebnis", async ({
  page,
}) => {
  await train(page);
  await page.getByLabel("Anzahl Aufgaben").fill("1");
  await page
    .getByRole("button", { name: "Lernmodus starten", exact: true })
    .click();
  await expect(page.getByRole("timer")).toHaveCount(0);
  await expect(page.locator(".logic-solution")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Antwort prüfen" }),
  ).toBeDisabled();
  await page.locator(".logic-options button").first().click();
  await page.getByRole("button", { name: "Antwort prüfen" }).click();
  await expect(
    page.getByRole("heading", { name: "Schrittweise Musterlösung" }),
  ).toBeVisible();
  await expect(page.locator(".logic-trap")).toContainText(
    "Typischer Denkfehler",
  );
  await page.getByRole("button", { name: "Training auswerten" }).click();
  await expect(page.locator(".logic-score")).toContainText("/ 1 richtig");
  await expect(page.locator(".logic-history>div")).toHaveCount(1);
  await page.reload();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Implikationen erkennen", exact: true })
    .click();
  await page.getByRole("button", { name: "Auswertung", exact: true }).click();
  await expect(page.locator(".logic-history>div")).toHaveCount(1);
});
test("Prüfungsmodus hält Lösungen zurück und erlaubt Navigation", async ({
  page,
}) => {
  await train(page);
  await page
    .getByRole("button", { name: /Prüfungsmodus Mit Zeitlimit/ })
    .click();
  await page.getByLabel("Anzahl Aufgaben").fill("2");
  await page
    .getByRole("button", { name: "Prüfungsmodus starten", exact: true })
    .click();
  await expect(page.getByRole("timer")).toContainText("10:");
  await page.locator(".logic-options button").first().click();
  await expect(page.locator(".logic-solution")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Antwort prüfen" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Nächste Aufgabe" }).click();
  await page.getByRole("button", { name: "Vorherige Aufgabe" }).click();
  await expect(page.locator(".logic-options button").first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: /Jetzt abgeben/ }).click();
  await expect(page.locator(".logic-score")).toContainText("1 unbeantwortet");
  await page.locator(".result-task summary").first().click();
  await expect(
    page.getByRole("heading", { name: "Schrittweise Musterlösung" }),
  ).toBeVisible();
});
test("Zeitablauf wertet automatisch aus und nimmt keine späteren Antworten an", async ({
  page,
}) => {
  await page.clock.install();
  await train(page);
  await page
    .getByRole("button", { name: /Prüfungsmodus Mit Zeitlimit/ })
    .click();
  await page.getByLabel("Anzahl Aufgaben").fill("2");
  await page.getByLabel("Zeitlimit in Minuten").fill("1");
  await page
    .getByRole("button", { name: "Prüfungsmodus starten", exact: true })
    .click();
  await page.locator(".logic-options button").first().click();
  await page.clock.fastForward(61000);
  await expect(page.locator(".logic-score")).toContainText("Zeit abgelaufen");
  await expect(page.locator(".logic-score")).toContainText("1 unbeantwortet");
  await expect(page.locator(".logic-score")).toContainText("01:00");
  await expect(page.locator(".logic-options")).toHaveCount(0);
  await expect(page.locator(".logic-history>div")).toHaveCount(1);
});
test("Mobil und mit Tastatur bedienbar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator(".mobile-toggle").click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Implikationen erkennen", exact: true })
    .click();
  await page.getByRole("button", { name: "Training", exact: true }).click();
  await page.getByLabel("Anzahl Aufgaben").fill("1");
  await page
    .getByRole("button", { name: "Lernmodus starten", exact: true })
    .click();
  await page.locator(".logic-options button").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".logic-options button").first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
