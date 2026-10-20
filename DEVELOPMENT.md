# MedAT Campus

Deutschsprachiges React-Lernstudio für BMS mit lokalem Anki-Import.

## Start

Node.js 24 und npm verwenden. Im vorhandenen Checkout arbeiten.

```sh
npm ci --cache /tmp/medat-npm
npm run dev -- --port 5173
```

`npm run build` erstellt die statische Website in `dist/`. `npm run preview` startet den Produktionsbuild lokal. `public/sql-wasm.wasm` ist die lokale SQL.js-Laufzeit. Kein Backend und keine Zugangsdaten erforderlich.

## Lernablauf

- **Zuerst verstehen:** 33 ergänzende Grundlagenkapitel in Biologie, Chemie, Physik und Mathematik mit Erklärungen, Beispielen, Verständnisfragen und gespeichertem Lesefortschritt. Alternativ ist das gesamte importierte Deck als Fragen-und-Antworten-Lesestoff zugänglich.
- **Lernkarten:** Alle tatsächlich in der Anki-Tabelle `cards` gespeicherten Karten, inklusive mehrerer Karten je Notiz. Der Importbericht zeigt Notizen, Karten und Warnungen. Unterdecks können ausgewählt werden. Suche durchsucht Frage, Antwort, Fach, Deck und Tags. Die Liste hat Seiten mit je 50 Karten, der Lesemodus mit je 20; es gibt keine Gesamtbegrenzung.
- **Sitzung:** Anzahl frei wählen; `0` oder „Alle Karten“ bedeutet alle ausgewählten Karten. Standardmäßig folgt ein Lesedurchgang mit zehn Karten je Seite, dann das aktive Abrufen. Erfahrene Nutzer können den Leseschritt abwählen. „Noch einmal“ hängt die Karte ohne feste Wiederholungsobergrenze an.
- **Tagesziel:** Frei wählbares Motivationsziel, keine Begrenzung der Sitzung.

Das Originaldeck wird nach Import in IndexedDB gespeichert und beim Öffnen wiederhergestellt. Tagesziel, Wiederholungszahlen, Sitzungsgröße und Lesefortschritt bleiben im localStorage dieses Browsers. Löschen der Websitedaten entfernt diese Speicherung. Bei fehlender Speicherquote funktioniert der Import für die laufende Sitzung und zeigt einen Hinweis. Auf unterschiedlichen Ports/Domains gelten getrennte Browserspeicher.

## Tests

`npm test` prüft Import und vollständige Erreichbarkeit von 129 Karten aus 127 Notizen, Unterdecks, umgekehrte Karten, getrennte Cloze-Karten, HTML-Sicherheit, einen modernen Zstandard-/Protobuf-Export mit Bildern, Wiederherstellung nach Neuladen, freie Sitzungsgrößen, den vorgeschalteten Leseschritt, Wiederholungen, Lesefortschritt und Mobilnavigation. Die Fixtures werden in den Tests erzeugt.

Die Playwright-Konfiguration nutzt `/usr/bin/chromium` im Cloud-System. Auf anderen Rechnern den Browserpfad anpassen. Die Kompression der modernen Testfixture benötigt Node.js 24.

## Import und Grenzen

Unterstützt werden SQLite-basierte APKG-Sammlungen (`collection.anki2`, `collection.anki21`, `collection.anki21b`), Zstandard-Kompression, JSON- und Protobuf-Medienverzeichnisse, alte JSON- und neue tabellarische Notiztypen, einfache Anki-Vorlagen einschließlich Feldbedingungen und Cloze-Ordinals. Quellen der Protobuf-Strukturen:

- https://github.com/ankitects/anki/blob/main/proto/anki/notetypes.proto
- https://github.com/ankitects/anki/blob/main/proto/anki/import_export.proto

Karten werden aus `cards`, nicht aus `notes` gezählt. Keine Karte wird wegen fehlenden Fragetexts ausgefiltert; reine Bildkarten bleiben erhalten. Ohne passende Vorlage wird eine gekennzeichnete Feldansicht verwendet. Fachzuordnung erfolgt anhand von Decknamen und Tags. Nicht zuordenbare Karten bleiben unter „Import“ sowie in „Alle“ erreichbar.

Beliebiges JavaScript in Anki-Vorlagen, verschachtelte Spezialfilter, Image-Occlusion-Maskierungslogik und Audio werden nicht vollständig reproduziert. Solche Spezialkarten können zur korrekten Prüfung Anki erfordern. Importiertes HTML wird als Text behandelt; lokale Bildmedien werden separat angezeigt. Es gibt keine automatische offizielle Stoffabdeckungsprüfung und noch keine langfristige Spaced-Repetition-Terminierung.

Die vier Beispielkarten stammen nicht aus dem Tanki-Deck. Die hochgeladene Originaldatei überschreitet das 32-MB-Transferlimit der Agent-Umgebung und konnte deshalb hier nicht direkt untersucht werden. Sie muss im Browser importiert werden; ihre spezifische Darstellung wurde nicht geprüft. Die Testdateien belegen die unterstützten Importfälle, nicht die Vollständigkeit einer unbekannten Originaldatei.

Die 33 Grundlagenkapitel sind ergänzendes Lernmaterial, kein als vollständig oder fachlich unabhängig geprüft ausgewiesenes Lehrbuch. Die aktuelle offizielle BMS-Stichwortliste unter https://www.medizinstudieren.at/ bleibt der Maßstab für die Vorbereitung. Inhalte aus dem importierten Deck sind im separaten Lesemodus zugänglich. KFF, TV und SEK sind nicht Teil dieses BMS-Lernstudios.

## KFF: Implikationen erkennen

Über die Navigation erreichbar. Fünf Grundlagenlektionen, 30 eigene Aufgabenvarianten aus zehn logischen Mustern, Lernmodus ohne Zeitdruck und ein zeitbegrenzter Prüfungsmodus mit automatischer Auswertung. Der Aufgabenpool wird mittels endlicher Mengenmodelle auf zwingende Schlüsse geprüft. Details zu Formatstand, Semantik, Quellen und Grenzen stehen in `src/logic/README.md`. Das aktuelle offizielle MedAT-H-Format konnte wegen HTTP-403-Zugriffssperren nicht verifiziert werden; Voreinstellungen sind als Trainingsvorgaben gekennzeichnet. `npm test` führt jetzt auch die Logik- und Timerprüfungen aus.
