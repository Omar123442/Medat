const { test, expect } = require("@playwright/test");
function syntheticPdf(pages) {
  const objects = [];
  const add = (s) => (objects.push(s), objects.length);
  const catalog = add("");
  const tree = add("");
  const content = "q 0.2 0.6 0.3 rg 100 100 250 300 re f Q";
  const stream = add(
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  );
  const ids = Array.from({ length: pages }, () =>
    add(
      `<< /Type /Page /Parent ${tree} 0 R /MediaBox [0 0 595 842] /Resources << >> /Contents ${stream} 0 R >>`,
    ),
  );
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${tree} 0 R >>`;
  objects[tree - 1] =
    `<< /Type /Pages /Count ${pages} /Kids [${ids.map((id) => id + " 0 R").join(" ")}] >>`;
  let output = "%PDF-1.4\n",
    offsets = [0];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(output));
    output += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(output);
  output +=
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets
      .slice(1)
      .map((n) => String(n).padStart(10, "0") + " 00000 n \n")
      .join("") +
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(output);
}
test("Tagesziel kann geleert und neu eingegeben werden, ohne auf 1 zu springen", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ziel anpassen" }).click();
  const input = page.getByRole("spinbutton");
  await input.focus();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.press("Backspace");
  await expect(input).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Fertig", exact: true }),
  ).toBeDisabled();
  await page.keyboard.type("350");
  await expect(input).toHaveValue("350");
  expect(
    await page.evaluate(() => localStorage.getItem("medat-goal")),
  ).toBeNull();
  await page.getByRole("button", { name: "Fertig", exact: true }).click();
  await expect(page.locator(".daily-main")).toContainText("/ 350 Karten");
  await page.reload();
  await expect(page.locator(".daily-main")).toContainText("/ 350 Karten");
});
test("Ungültige Ziele überschreiben den gespeicherten Wert nicht", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("medat-goal", "75"));
  await page.reload();
  await page.getByRole("button", { name: "Ziel anpassen" }).click();
  await page.getByRole("spinbutton").fill("0");
  await expect(
    page.getByRole("button", { name: "Fertig", exact: true }),
  ).toBeDisabled();
  await page.getByRole("spinbutton").fill("2.5");
  await expect(
    page.getByRole("button", { name: "Fertig", exact: true }),
  ).toBeDisabled();
  await page.locator(".modal .close").click();
  await expect(page.locator(".daily-main")).toContainText("/ 75 Karten");
});
test("Unpassende PDF-Ausgabe wird nachvollziehbar zurückgewiesen", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Skriptbibliothek", exact: true })
    .click();
  await page.locator("input[type=file][accept*=pdf]").setInputFiles({
    name: "anderes-skript.pdf",
    mimeType: "application/pdf",
    buffer: syntheticPdf(1),
  });
  await expect(page.locator(".book-import-message")).toContainText(
    "keiner der fünf",
  );
  await expect(
    page.getByRole("button", { name: "Skript öffnen", exact: true }).first(),
  ).toBeDisabled();
});
test("Lokales Original-PDF wird als Bild gerendert und mit richtiger Seite geöffnet", async ({
  page,
}) => {
  await page.goto("/");
  const bytes = [...syntheticPdf(20)];
  await page.evaluate(async (data) => {
    const { saveBook } = await import("/src/storage.js");
    await saveBook(
      "biology",
      new File([new Uint8Array(data)], "test.pdf", { type: "application/pdf" }),
    );
  }, bytes);
  await page.getByRole("button", { name: "Jetzt verstehen" }).click();
  await page
    .locator(".lesson-tile")
    .filter({ hasText: "Zelle und Organellen" })
    .click();
  await expect(page.locator(".book-figure canvas").first()).toBeVisible();
  await expect(page.locator(".book-figure").first()).toContainText(
    "PDF-Seite 17",
  );
  await page
    .locator(".book-figure")
    .first()
    .getByRole("button", { name: "Originalseite lesen / vergrößern" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Skript lesen" }),
  ).toBeVisible();
  await expect(page.getByLabel("PDF-Seite", { exact: true })).toHaveValue("17");
  await page
    .getByRole("button", { name: "Nächste Seite", exact: true })
    .click();
  await expect(page.getByLabel("PDF-Seite", { exact: true })).toHaveValue("18");
  await expect(page.locator(".book-reader canvas")).toBeVisible();
  await page.getByRole("button", { name: "Skript schließen" }).click();
  await page.reload();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Skriptbibliothek", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Skript öffnen", exact: true }).last(),
  ).toBeEnabled();
});
test("Historisches Skript verbessert den Wortpool ohne Umlaut-Umschreibungen", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { wordTasks } = await import("/src/kff/tasks.js");
    const { people } = await import("/src/kff/memory.js");
    return {
      hasOld: wordTasks.some((t) => t.word === "WIRBELSAEULE"),
      hasNew: wordTasks.some((t) => t.word === "BRUSTKORB"),
      medication: people.every((p) => ["Ja", "Nein"].includes(p.medication)),
    };
  });
  expect(result).toEqual({ hasOld: false, hasNew: true, medication: true });
});

test("Originalabbildungen funktionieren auch bei erstem Öffnen ohne Netz", async ({
  page,
  context,
}) => {
  await page.goto("http://127.0.0.1:4173");
  await expect(
    page.getByRole("heading", { name: "Kleine Schritte. Großes Ziel." }),
  ).toBeVisible();
  const data = [...syntheticPdf(20)];
  await page.evaluate(async (bytes) => {
    await new Promise((resolve, reject) => {
      const r = indexedDB.open("medat-campus", 3);
      r.onsuccess = () => {
        const db = r.result;
        const tx = db.transaction("books", "readwrite");
        tx.objectStore("books").put({
          id: "biology",
          file: new File([new Uint8Array(bytes)], "synthetic.pdf", {
            type: "application/pdf",
          }),
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      r.onerror = () => reject(r.error);
    });
  }, data);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Jetzt verstehen" }).click();
  await page
    .locator(".lesson-tile")
    .filter({ hasText: "Zelle und Organellen" })
    .click();
  await expect(page.locator(".book-figure canvas").first()).toBeVisible();
});
