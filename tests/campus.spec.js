const { test, expect } = require("@playwright/test");
const fs = require("fs");
test.beforeAll(async () => {
  const SQL = await require("sql.js")();
  const db = new SQL.Database();
  db.run("CREATE TABLE notes(id integer, mid integer, flds text, tags text)");
  db.run("CREATE TABLE cards(id integer,nid integer,did integer,ord integer)");
  db.run("CREATE TABLE col(models text,decks text)");
  const models = {
    1: {
      name: "Basic reverse",
      type: 0,
      flds: [{ name: "Front" }, { name: "Back" }],
      tmpls: [
        { qfmt: "{{Front}}", afmt: "{{Back}}" },
        { qfmt: "{{Back}}", afmt: "{{Front}}" },
      ],
    },
    2: {
      name: "Cloze",
      type: 1,
      flds: [{ name: "Text" }, { name: "Extra" }],
      tmpls: [{ qfmt: "{{cloze:Text}}", afmt: "{{cloze:Text}} {{Extra}}" }],
    },
  };
  db.run("INSERT INTO col VALUES(?,?)", [
    JSON.stringify(models),
    JSON.stringify({
      1: { name: "BMS::Biologie::Zelle" },
      2: { name: "BMS::Chemie" },
    }),
  ]);
  for (let i = 1; i <= 125; i++) {
    db.run("INSERT INTO notes VALUES(?,?,?,?)", [
      i,
      1,
      `Testfrage ${i}\x1fTestantwort ${i}<script>window.importAttack=true</script>`,
      "",
    ]);
    db.run("INSERT INTO cards VALUES(?,?,?,?)", [i, i, 1, 0]);
  }
  db.run("INSERT INTO cards VALUES(126,1,1,1)");
  db.run("INSERT INTO notes VALUES(126,2,?,?)", [
    "{{c1::Wasser}} ist {{c2::polar}}\x1fErklärung",
    "Chemie",
  ]);
  db.run("INSERT INTO cards VALUES(127,126,2,0)");
  db.run("INSERT INTO cards VALUES(128,126,2,1)");
  db.run("INSERT INTO notes VALUES(127,1,?,?)", [
    '<img src="pixel.png">\x1fBildantwort',
    "",
  ]);
  db.run("INSERT INTO cards VALUES(129,127,1,0)");
  const { zipSync, strToU8 } = require("fflate");
  fs.writeFileSync(
    "/tmp/medat-full-test.apkg",
    zipSync({
      "collection.anki2": db.export(),
      media: strToU8('{"0":"pixel.png"}'),
      0: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC1sAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  // Modern Anki schema, zstd database/media and protobuf metadata.
  const encodeField = (number, text) => {
    const value = Buffer.from(text);
    if (value.length >= 128) throw new Error("fixture field too long");
    return Buffer.concat([Buffer.from([number * 8 + 2, value.length]), value]);
  };
  db.run("DROP TABLE col");
  db.run("CREATE TABLE notetypes(id integer,name text,config blob)");
  db.run("CREATE TABLE fields(ntid integer,ord integer,name text)");
  db.run("CREATE TABLE templates(ntid integer,ord integer,config blob)");
  db.run("CREATE TABLE decks(id integer,name text)");
  for (const [id, model] of Object.entries(models)) {
    db.run("INSERT INTO notetypes VALUES(?,?,?)", [
      +id,
      model.name,
      new Uint8Array([8, model.type]),
    ]);
    model.flds.forEach((f, i) =>
      db.run("INSERT INTO fields VALUES(?,?,?)", [+id, i, f.name]),
    );
    model.tmpls.forEach((t, i) =>
      db.run("INSERT INTO templates VALUES(?,?,?)", [
        +id,
        i,
        new Uint8Array(
          Buffer.concat([encodeField(1, t.qfmt), encodeField(2, t.afmt)]),
        ),
      ]),
    );
  }
  db.run("INSERT INTO decks VALUES(1,?)", ["BMS\x1fBiologie\x1fZelle"]);
  db.run("INSERT INTO decks VALUES(2,?)", ["BMS\x1fChemie"]);
  const zstd = require("node:zlib").zstdCompressSync;
  const mediaEntry = encodeField(1, "pixel.png");
  const mediaMap = Buffer.concat([
    Buffer.from([10, mediaEntry.length]),
    mediaEntry,
  ]);
  fs.writeFileSync(
    "/tmp/medat-modern-test.apkg",
    zipSync({
      "collection.anki21b": zstd(db.export()),
      "collection.anki2": strToU8("placeholder"),
      media: zstd(mediaMap),
      0: zstd(
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC1sAAAAASUVORK5CYII=",
          "base64",
        ),
      ),
    }),
  );
  db.close();
});
async function upload(page) {
  await page.goto("/");
  await page
    .locator("input[type=file]")
    .setInputFiles("/tmp/medat-full-test.apkg");
  await expect(page.locator(".upload-zone")).toContainText(
    "129 Karten importiert",
  );
}
test("Alle Anki-Karten, Unterdecks, umgekehrte Karten und Cloze importieren", async ({
  page,
}) => {
  await upload(page);
  await page.getByRole("button", { name: /^Lernkarten/ }).click();
  await expect(page.locator(".import-report")).toContainText(
    "129 von 129 Anki-Karten · 127 Notizen",
  );
  await expect(page.locator(".library-card")).toHaveCount(50);
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await expect(page.locator(".library-card")).toHaveCount(29);
  await expect(page.locator(".library-card").last()).toContainText("Bildkarte");
  await page.locator(".search input").fill("Testantwort 1");
  await expect(page.locator(".library-card")).toHaveCount(38);
  await expect(page.locator(".library-card").last()).toContainText(
    "Testantwort 1",
  );
  await page.locator(".search input").fill("Chemie");
  await expect(page.locator(".library-card")).toHaveCount(2);
  await expect(page.locator(".library-card").first()).toContainText(
    "[…] ist polar",
  );
  await expect(page.locator(".library-card").last()).toContainText(
    "Wasser ist […]",
  );
  expect(await page.evaluate(() => window.importAttack)).toBeUndefined();
});
test("Unbegrenzte Sitzungen, Leseschritt und Fortschritt", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Lernkarten/ }).click();
  await page.getByRole("button", { name: /Auswahl lernen/ }).click();
  await page.getByLabel("Sitzungsgröße").fill("1");
  await page.getByRole("button", { name: "Lesen starten (1)" }).click();
  await expect(
    page.getByRole("heading", { name: "Zuerst lesen und verstehen" }),
  ).toBeVisible();
  await expect(page.locator(".reading-answer")).toContainText("ATP");
  await page.getByRole("button", { name: "Gelesen – Karten starten" }).click();
  await page.getByRole("button", { name: "Antwort aufdecken" }).click();
  await page.getByRole("button", { name: "Noch einmal" }).click();
  await expect(page.locator(".study .eyebrow")).toContainText("2 / 2");
  await page.getByRole("button", { name: "Antwort aufdecken" }).click();
  await page.getByRole("button", { name: "Gewusst" }).click();
  await expect(
    page.getByRole("heading", { name: "Ein Schritt weiter." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zur Übersicht" }).click();
  await page
    .getByRole("button", { name: "Einstellungen", exact: true })
    .click();
  await page.getByRole("spinbutton").fill("10000");
  await page.getByRole("button", { name: "Fertig" }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Einstellungen", exact: true })
    .click();
  await expect(page.getByRole("spinbutton")).toHaveValue("10000");
});
test("Deck bleibt nach Neuladen erhalten; Sitzungen können alle Karten enthalten", async ({
  page,
}) => {
  await upload(page);
  await page.reload();
  await expect(page.locator(".upload-zone")).toContainText(
    "129 Karten importiert",
  );
  await page.getByRole("button", { name: /^Lernkarten/ }).click();
  await page.getByRole("button", { name: /Auswahl lernen/ }).click();
  await page.getByRole("button", { name: "Alle Karten – ohne Limit" }).click();
  await page.getByLabel("Zuerst Fragen und Erklärungen lesen").uncheck();
  await page.getByRole("button", { name: "Karten starten (129)" }).click();
  await expect(page.locator(".study .eyebrow")).toContainText("1 / 129");
});
test("Lernstoff lesen, Verständnischeck und Lesefortschritt", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Jetzt verstehen" }).click();
  await expect(page.locator(".lesson-tile")).toHaveCount(49);
  await page.getByRole("button", { name: /Zelle und Organellen/ }).click();
  await expect(page.locator(".lesson")).toContainText("Prokaryoten");
  await page.getByRole("button", { name: "Lösung ansehen" }).click();
  await expect(page.locator(".comprehension")).toContainText("ATP");
  await page.getByRole("button", { name: "Verstanden und gelesen" }).click();
  await expect(
    page.getByRole("button", { name: "Als gelesen markiert" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Dein Deck als Lesestoff/ }).click();
  await expect(page.locator(".reading-card")).toHaveCount(4);
});
test("Mobilansicht ohne horizontalen Überlauf", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator(".mobile-toggle").click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Zuerst verstehen", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Erst verstehen. Dann behalten." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("Moderner komprimierter Anki-Export mit Protobuf-Vorlagen und Medien", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("input[type=file]")
    .setInputFiles("/tmp/medat-modern-test.apkg");
  await expect(page.locator(".upload-zone")).toContainText(
    "129 Karten importiert",
  );
  await page.getByRole("button", { name: /^Lernkarten/ }).click();
  await expect(page.locator(".import-report")).toContainText("129 von 129");
  await expect(page.locator(".import-report")).not.toContainText("Feldansicht");
  await expect(page.locator(".import-report")).not.toContainText(
    "nicht gelesen",
  );
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page.getByRole("button", { name: "Weiter", exact: true }).click();
  await page.locator(".library-card").last().click();
  await page.getByRole("button", { name: "Lesen starten (1)" }).click();
  await expect(page.locator(".reading-card img")).toHaveCount(1);
  await expect(page.locator(".reading-card img")).toHaveJSProperty(
    "complete",
    true,
  );
  expect(
    await page.locator(".reading-card img").evaluate((img) => img.naturalWidth),
  ).toBe(1);
});
