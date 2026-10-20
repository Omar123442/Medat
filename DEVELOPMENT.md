# MedAT Campus

Deutschsprachiges React-Lernstudio mit lokalem Anki-Import.

## Start

Node.js 24 und npm verwenden. Im vorhandenen Checkout arbeiten.

```sh
npm ci --cache /tmp/medat-npm
npm run dev -- --port 5173
```

`npm run build` erstellt die statische Website in `dist/`. `npm run preview` startet den Produktionsbuild lokal. `public/sql-wasm.wasm` ist die lokale SQL.js-Laufzeit.

## Tests

`npm test` prüft Lernablauf, gespeichertes Tagesziel, Import mit einer erzeugten APKG-Testdatei, HTML-Sicherheit und die Mobilnavigation. Die Playwright-Konfiguration nutzt `/usr/bin/chromium` im Cloud-System. Auf anderen Rechnern den Browserpfad entsprechend anpassen.

## Daten und Grenzen

Die mitgelieferten vier Beispielkarten stammen nicht aus dem hochgeladenen Tanki-Deck. Die Originaldatei war wegen des 32-MB-Übertragungslimits nicht serverseitig zugänglich. Sie wird vom Nutzer über „Importieren“ im Browser ausgewählt; die spezifische Originaldatei wurde nicht getestet.

Der Import unterstützt SQLite-basierte APKG-Sammlungen, Zstandard-komprimierte Sammlungen und JSON-Medienverzeichnisse. Die erste Notizspalte wird zur Frage, weitere Spalten zur Antwort. Einfache Lückentexte werden umgewandelt. Beliebige Anki-Vorlagen, Image-Occlusion-Logik, Audio und neuere binäre Medienverzeichnisse werden nicht vollständig reproduziert. Bei solchen Decks aus Anki im älteren kompatiblen Format exportieren. Fachzuordnung erfolgt anhand von Tags. Importiertes HTML wird als Text behandelt, eingebettete Bilder werden lokal angezeigt.

Karten und Medien bleiben im Arbeitsspeicher bis zum Neuladen. Tagesziel und Wiederholungszahlen werden im localStorage auf diesem Gerät gespeichert. „Noch einmal“ hängt die Karte in der laufenden Sitzung erneut an. Es gibt noch keine langfristige Spaced-Repetition-Terminierung oder Kontosynchronisation.

Die BMS-Fachbereiche ersetzen keine vollständige Vorbereitung auf alle MedAT-Testteile. Für KFF, TV und SEK sind zusätzliche Übungen erforderlich.
