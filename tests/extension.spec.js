const { test, expect } = require("@playwright/test");
async function navigate(page, name) {
  await page
    .getByRole("navigation")
    .getByRole("button", {
      name: name === "Lernkarten" ? /^Lernkarten/ : name,
      exact: name !== "Lernkarten",
    })
    .click();
}
async function kff(page, title) {
  await page.goto("/");
  await navigate(page, "KFF-Training");
  await page
    .locator(".kff-area-grid")
    .getByRole("button", { name: new RegExp(title) })
    .click();
}
test("Erweiterte Inhaltsstruktur bewahrt 33 IDs und besitzt vollständige Metadaten", async ({
  page,
}) => {
  await page.goto("/");
  const data = await page.evaluate(async () => {
    const { curriculum } = await import("/src/curriculum.js");
    return {
      count: curriculum.length,
      old: curriculum.filter((c) => /^bms-\d+$/.test(c.id)).length,
      unique: new Set(curriculum.map((c) => c.id)).size,
      metadata: curriculum.every(
        (c) =>
          c.sources.length &&
          c.keywords.length &&
          c.question &&
          c.answer &&
          c.mistake &&
          c.summary.length &&
          c.introduction &&
          c.prerequisites.length &&
          c.lastReviewed === null,
      ),
    };
  });
  expect(data).toEqual({ count: 49, old: 33, unique: 49, metadata: true });
});
test("Vertiefung lesen und interaktive Atmungskette bedienen", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Jetzt verstehen" }).click();
  await page.getByLabel("Lernstoff suchen").fill("Atmungskette");
  await page
    .locator(".lesson-tile")
    .filter({ hasText: "Zellatmung und Atmungskette" })
    .click();
  await expect(page.locator(".rich-lesson")).toContainText("Komplex II");
  await expect(page.locator(".visual-controls")).toContainText("NADH");
  await page
    .locator(".visual-controls")
    .getByRole("button", { name: "Weiter", exact: true })
    .click();
  await expect(page.locator(".visual-controls")).toContainText("pumpen");
  await expect(page.locator(".rich-lesson")).toContainText(
    "noch nicht erfolgt",
  );
});
test("Stoffabdeckung zeigt Lücken und übernimmt eigene Themenlisten ohne falschen Verifizierungsstatus", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Jetzt verstehen" }).click();
  await page.getByRole("button", { name: "Stoffabdeckung & Quellen" }).click();
  await expect(page.locator(".coverage .import-report")).toContainText(
    "kein offizieller Abgleich",
  );
  await page.locator(".checklist-import summary").click();
  await page
    .getByLabel("Quellbezeichnung / Version")
    .fill("Meine geprüfte Themenabschrift");
  await page
    .getByLabel("Ein Thema je Zeile")
    .fill("Zelle und Organellen\nNoch unbekanntes Prüfungsthema");
  await page.getByRole("button", { name: "Themenliste übernehmen" }).click();
  await expect(page.locator(".coverage .import-report")).toContainText("1/2");
  await expect(page.locator(".coverage-list")).toContainText(
    "Thema noch nicht behandelt",
  );
  await expect(page.locator(".coverage .import-report")).toContainText(
    "nicht unabhängig verifiziert",
  );
  await page.reload();
  await page.getByRole("button", { name: "Jetzt verstehen" }).click();
  await page.getByRole("button", { name: "Stoffabdeckung & Quellen" }).click();
  await expect(page.locator(".coverage-list>article")).toHaveCount(2);
});
test("Kartenzuordnung ist korrigierbar und verliert keine Karten", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Jetzt verstehen" }).click();
  await page
    .getByRole("button", { name: "Kartenzuordnung", exact: true })
    .click();
  await expect(page.locator(".mapping-row")).toHaveCount(4);
  await page.getByLabel("Thema für Karte d1").selectOption("bio-respiration");
  await expect(page.locator(".mapping-row").first()).toContainText("manuell");
  await page.reload();
  await page.getByRole("button", { name: "Jetzt verstehen" }).click();
  await page
    .getByRole("button", { name: "Kartenzuordnung", exact: true })
    .click();
  await expect(page.getByLabel("Thema für Karte d1")).toHaveValue(
    "bio-respiration",
  );
  await page.getByLabel("Thema für Karte d1").selectOption("");
  await expect(page.locator(".mapping-row")).toHaveCount(4);
});
test("FSRS speichert echte Intervalle und stellt sie nach Neustart wieder her", async ({
  page,
}) => {
  await page.goto("/");
  await navigate(page, "Lernkarten");
  await page.getByRole("button", { name: /Auswahl lernen/ }).click();
  await page.getByLabel("Sitzungsgröße").fill("1");
  await page.getByLabel("Zuerst Fragen und Erklärungen lesen").uncheck();
  await page.getByRole("button", { name: "Karten starten (1)" }).click();
  await page.getByRole("button", { name: "Antwort aufdecken" }).click();
  await page.getByRole("button", { name: "Leicht", exact: true }).click();
  await page.getByRole("button", { name: "Zur Übersicht" }).click();
  await navigate(page, "Wiederholungen");
  await expect(page.locator(".review-metrics>div").last()).toContainText("1");
  const records = await page.evaluate(async () => {
    const { loadReviews } = await import("/src/storage.js");
    return Object.values(await loadReviews()).map((r) => ({
      reps: r.card.reps,
      stability: r.card.stability,
      due: new Date(r.card.due).getTime(),
    }));
  });
  expect(records[0].reps).toBe(1);
  expect(records[0].stability).toBeGreaterThan(0);
  expect(records[0].due).toBeGreaterThan(Date.now());
  await page.reload();
  await navigate(page, "Wiederholungen");
  await expect(page.locator(".review-metrics>div").last()).toContainText("1");
});
test("KFF-Pools enthalten unterschiedliche gültige Antwortmöglichkeiten und konsistente Figuren", async ({
  page,
}) => {
  await page.goto("/");
  const check = await page.evaluate(async () => {
    const { numberTasks, wordTasks, figureTasks, polygonArea } =
      await import("/src/kff/tasks.js");
    return {
      numbers: numberTasks.length,
      words: wordTasks.length,
      figures: figureTasks.length,
      unique: [numberTasks, wordTasks, figureTasks].every(
        (pool) => new Set(pool.map((t) => t.id)).size === pool.length,
      ),
      validNumbers: numberTasks.every(
        (t) =>
          new Set(t.options).size === 5 &&
          t.options[t.correct] === t.expected.join(" · "),
      ),
      validWords: wordTasks.every(
        (t) =>
          t.letters.slice().sort().join("") ===
            t.word.split("").sort().join("") &&
          t.options[t.correct] === t.word[0] &&
          new Set(t.options).size === 5,
      ),
      validShapes: figureTasks.every(
        (t) =>
          Math.abs(t.pieces.reduce((n, p) => n + polygonArea(p), 0) - t.area) <
            1e-8 &&
          t.shapes.every((p, i) =>
            i === t.correct
              ? Math.abs(polygonArea(p) - t.area) < 1e-8
              : Math.abs(polygonArea(p) - t.area) > 1e-8,
          ),
      ),
    };
  });
  expect(check).toEqual({
    numbers: 36,
    words: 24,
    figures: 18,
    unique: true,
    validNumbers: true,
    validWords: true,
    validShapes: true,
  });
});
test("Zahlenfolgen: Lernmodus mit Musterlösung und gespeichertem Ergebnis", async ({
  page,
}) => {
  await kff(page, "Zahlenfolgen");
  await page.getByLabel("KFF-Aufgabenanzahl").fill("1");
  await page.getByRole("button", { name: "Lerntraining starten" }).click();
  await expect(page.locator(".number-sequence>span")).toHaveCount(9);
  await page.locator(".logic-options button").first().click();
  await page.getByRole("button", { name: "Antwort prüfen" }).click();
  await expect(
    page.getByRole("heading", { name: "Musterlösung", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Training auswerten" }).click();
  await expect(page.locator(".kff-results")).toContainText("/1 richtig");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("medat-kff-history")).length,
    ),
  ).toBe(1);
});
test("Figuren drehen nur im Lernmodus; Prüfungsmodus zeigt keine Lösungen", async ({
  page,
}) => {
  await kff(page, "Figuren zusammensetzen");
  await page.getByLabel("KFF-Aufgabenanzahl").fill("1");
  await page.getByRole("button", { name: "Lerntraining starten" }).click();
  await page.getByRole("button", { name: "Teil 1 drehen" }).click();
  await page.locator(".logic-options button").first().click();
  await page.getByRole("button", { name: "Antwort prüfen" }).click();
  await expect(page.locator(".logic-solution svg")).toBeVisible();
  await page.getByRole("button", { name: "Training auswerten" }).click();
  await page.getByRole("button", { name: "Weitertrainieren" }).click();
  await page.getByRole("button", { name: /Prüfungsmodus Mit Timer/ }).click();
  await page.getByRole("button", { name: "Zeittraining starten" }).click();
  await expect(page.getByRole("button", { name: "Teil 1 drehen" })).toHaveCount(
    0,
  );
  await expect(page.locator(".logic-solution")).toHaveCount(0);
  await expect(page.getByRole("timer")).toBeVisible();
});
test("Wortflüssigkeit verwendet alle Buchstaben und zeigt eine Lösung", async ({
  page,
}) => {
  await kff(page, "Wortflüssigkeit");
  await page.getByLabel("KFF-Aufgabenanzahl").fill("1");
  await page.getByRole("button", { name: "Lerntraining starten" }).click();
  await expect(page.locator(".letter-sequence")).toBeVisible();
  await page.locator(".logic-options button").first().click();
  await page.getByRole("button", { name: "Antwort prüfen" }).click();
  await expect(page.locator(".logic-solution")).toContainText(
    "Anfangsbuchstabe",
  );
});
test("Gedächtnis trennt Einprägen und Abfragen und wertet Fehler aus", async ({
  page,
}) => {
  await kff(page, "Gedächtnis");
  await page.getByLabel("Anzahl Ausweise").fill("2");
  await page.getByLabel("Zwischenphase", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Lerntraining starten" }).click();
  await expect(page.locator(".identity-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Zur Abfrage", exact: true }).click();
  await expect(page.locator(".identity-card")).toHaveCount(0);
  await expect(page.locator(".kff-session h3")).toContainText("gehört zu");
  await page.locator(".logic-options button").first().click();
  await page.getByRole("button", { name: "Antwort prüfen" }).click();
  await expect(page.locator(".logic-solution")).toContainText(
    "fiktiven Ausweis",
  );
  await page
    .getByRole("button", { name: "Training beenden und auswerten" })
    .click();
  await expect(page.locator(".kff-results")).toContainText("Fehleranalyse");
  await expect(page.locator(".kff-results")).toContainText("/6 richtig");
});
test("Gedächtnis-Prüfung wechselt Phasen und beendet bei Zeitablauf", async ({
  page,
}) => {
  await page.clock.install();
  await kff(page, "Gedächtnis");
  await page.getByRole("button", { name: /Prüfungsmodus Mit Timer/ }).click();
  await page.getByLabel("Anzahl Ausweise").fill("2");
  await page.getByLabel("Einprägezeit").fill("2");
  await page.getByLabel("Zwischenphase", { exact: true }).fill("1");
  await page.getByLabel("Abfragezeit").fill("2");
  await page.getByRole("button", { name: "Zeittraining starten" }).click();
  await page.clock.fastForward(2200);
  await expect(page.locator(".identity-card")).toHaveCount(0);
  await page.clock.fastForward(1300);
  await expect(page.locator(".logic-options")).toBeVisible();
  await page.clock.fastForward(2500);
  await expect(page.locator(".kff-results")).toContainText("Zeit abgelaufen");
  await expect(page.locator(".kff-results")).toContainText("6 unbeantwortet");
});
test("Offline-Produktion öffnet BMS und nachgeladenen KFF-Bereich ohne Netz", async ({
  page,
  context,
}) => {
  await page.goto("http://127.0.0.1:4173");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Kleine Schritte. Großes Ziel." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Jetzt verstehen" }).click();
  await expect(page.locator(".lesson-tile")).toHaveCount(49);
  await navigate(page, "KFF-Training");
  await expect(
    page.getByRole("heading", { name: "KFF-Trainingscampus" }),
  ).toBeVisible();
  await page
    .locator(".kff-area-grid")
    .getByRole("button", { name: /Zahlenfolgen/ })
    .click();
  await page.getByRole("button", { name: "Lerntraining starten" }).click();
  await expect(page.locator(".number-sequence")).toBeVisible();
});
test("Erweiterte Bibliothek und KFF bleiben mobil ohne horizontalen Überlauf", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Jetzt verstehen" }).click();
  await page.getByLabel("Lernstoff suchen").fill("Aktionspotenzial Schritt");
  await page.locator(".lesson-tile").click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator(".mobile-toggle").click();
  await navigate(page, "KFF-Training");
  await page
    .locator(".kff-area-grid")
    .getByRole("button", { name: /Figuren zusammensetzen/ })
    .click();
  await page.getByRole("button", { name: "Lerntraining starten" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
