# MedAT Campus

Kostenloses deutschsprachiges React-/Vite-Lernstudio mit lokalem Anki-Import, BMS-Bibliothek, KFF-Grundlagentraining und langfristigen FSRS-Wiederholungen.

## Lokal starten

Node.js 24 und npm verwenden. Im vorhandenen Checkout arbeiten.

```sh
npm ci
npm run dev
```

In der Cloud bei Bedarf `npm ci --cache /tmp/medat-npm` verwenden. Vite zeigt die lokale Adresse an. Die hochgeladene `MedAT-Tanki_2024.apkg` wird über „Importieren“ im Browser ausgewählt. Die vier Beispielkarten sind nicht aus diesem Deck.

## Produktionsbuild und Offlinebetrieb

```sh
npm run build
npm run preview
```

Die statische Website liegt in `dist/` und wird am Domain-Wurzelpfad gehostet. `scripts/build-offline.cjs` erzeugt den Service Worker aus den gebauten Dateien. Nach einem erfolgreichen ersten Online-Start und abgeschlossenem Service-Worker-Setup kann der Produktionsbuild ohne Netzwerk wieder geöffnet werden, einschließlich Anki-WASM und KFF-Module. HTTPS oder localhost erforderlich. Der Entwicklungsserver ist kein Offlinebuild. Quelllinks benötigen Netz; die Lernfunktionen benötigen kein Backend. Externe Schriftabhängigkeiten wurden entfernt.

## Lernen

- **Zuerst verstehen:** 49 strukturierte Kapitel; 33 bestehende IDs erhalten, 16 vertiefende Kapitel ergänzt. Eigene Grafiken und interaktive Parameter. Unter „Dein Deck als Lesestoff“ ist das vollständige importierte Deck lesbar.
- **Stoffabdeckung & Quellen:** interner Katalog mit Lernstatus, Quellenregister, eigene aktuelle Themenlisten und manuelle Kapitelverknüpfung. Kein verifizierter offizieller Stoffkatalog.
- **Kartenzuordnung:** Vorschläge aus Decknamen, Tags und Inhalt, sichtbar unsichere Zuordnungen und manuelle Korrektur. Keine Karte wird dadurch entfernt.
- **Lernkarten:** tatsächliche Anki-Karten statt bloßer Notizen; alle über Seiten erreichbar. Suche und Unterdeckfilter. Frei wählbare Sitzungsgröße, `0` bedeutet alle Karten. Optionaler vorgeschalteter Lesedurchgang. Tagesziel begrenzt die Sitzung nicht.
- **Wiederholungen:** FSRS über `ts-fsrs` mit gespeicherten Reviewzuständen, nächsten Terminen, fälligen/neuen Karten und Rückfallvorschlägen. Kein Import vorhandener Anki-Terminpläne.
- **KFF-Training:** Zahlenfolgen (36 Aufgaben), Figuren (18), Wortflüssigkeit (24) und fiktive Ausweise für Gedächtnis. Lern-/Zeitmodus, Erklärungen und gespeicherte Ergebnisübersichten.
- **Implikationen erkennen:** bestehender separater Logiktrainer (30 Varianten), Grundlagen, Musterlösungen und Gegenbeispiele.

## Datenhaltung

Original-Deck und FSRS-Reviewzustände liegen in IndexedDB auf diesem Gerät. Tagesziel, Zuordnungen, Lesestatus und Ergebnisübersichten liegen in localStorage. Kein Upload von Deckinhalten. Bei fehlender Speicherquote erfolgt ein Hinweis; Datensicherung und Gerätesynchronisation sind nicht implementiert. Löschen der Websitedaten entfernt diese Speicherung. Andere Domains/Ports haben getrennte Speicher. Laufende KFF-Sitzungen werden nicht wiederhergestellt; abgeschlossene Übersichten bleiben gespeichert.

## Tests

```sh
npm test
```

Baut die Website und führt 25 Playwright-Tests aus. Die Konfiguration startet Entwicklungs- und Produktionsserver und verwendet `/usr/bin/chromium`. Auf anderen Rechnern den Browserpfad in `playwright.config.js` anpassen. Node.js 24 wird auch für die moderne Anki-Kompression der Testfixtures benötigt. Die Testdateien werden synthetisch erzeugt; das Originaldeck war wegen des 32-MB-Transferlimits nicht direkt zugänglich.

## Importgrenzen

APKG mit SQLite (`collection.anki2`, `.anki21`, `.anki21b`), Zstandard, JSON-/Protobuf-Medien, alte und neue Notiztypen, einfache Bedingungen, Rückseiten- und Cloze-Karten werden unterstützt. Image-Occlusion-Logik, beliebiges Vorlagen-JavaScript, komplexe Filter und Audio sind nicht vollständig reproduziert. Importiertes HTML wird als Text behandelt; Bilder werden aus lokalen Medien getrennt angezeigt. Unbekannte Vorlagen verwenden eine gekennzeichnete Feldansicht. Nicht erkannte Karten bleiben zugänglich.

## Quellen und Qualität

Der aktuelle offizielle MedAT-Stoff und die exakten aktuellen KFF-Formate konnten wegen HTTP-403-Netzwerksperren nicht geprüft werden. Zeiten und Aufgabenformen sind ausdrücklich Trainingsvorgaben. Die verlinkten Lehrbücher sind Referenzempfehlungen, keine Behauptung einer erfolgten Lizenz- oder Inhaltsprüfung. Keine Buchtexte, Originalprüfungsfragen oder Fremdbilder wurden übernommen. Die 49 Kapitel sind eigenständig verfasste Erklärungen mit offenem externem Fachprüfstatus. Keine Aussage über vollständige offizielle Stoffabdeckung.

Der vollständige Umsetzungsstand und konkrete offene Punkte stehen in [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md). Der bestehende Logiktrainer ist unter [src/logic/README.md](src/logic/README.md) dokumentiert.
