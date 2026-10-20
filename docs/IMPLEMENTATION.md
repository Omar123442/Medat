# Ausbauplan und überprüfter Stand

Redaktioneller Stand: 20.10.2026. Der angehängte Projektauftrag ist die Grundlage dieser Erweiterung. Bestehende Anki-Importfunktionen, die 33 bisherigen Kapitel-IDs und der Implikationstrainer wurden erhalten.

## Phase 1: Struktur, Quellen, Stoffabdeckung

Umgesetzt:

- Die ursprünglichen Inhalte liegen in vier JSON-Fachdateien. Vertiefungen liegen in separaten `*-extra.json`-Dateien. `src/curriculum.js` aggregiert sie, erhält die bestehenden IDs und ergänzt Metadaten.
- Kapitel besitzen Fach, Thema, Unterthema, Stichwortvorschlag, Schwierigkeit, Voraussetzungen, Inhalt, Fragen, Quellen-IDs, Grafik- und Lizenzangaben sowie einen expliziten Prüfstatus. `lastReviewed` bleibt null, solange keine externe Fachprüfung stattgefunden hat. Dynamische Kartenverknüpfungen werden getrennt gespeichert.
- Quellenregister mit allen im Projektauftrag vorgeschlagenen Büchern und Portalen. Keine Buchtexte, fremden Bilder oder Originalprüfungsaufgaben übernommen.
- Stoffabdeckung zeigt Erklärung, Übungsfrage, vom Nutzer gelernte und zur Wiederholung fällige Kapitel. Eigene aktuelle Themenlisten können mit Quellbezeichnung zeilenweise eingefügt und manuell mit Kapiteln verknüpft werden. Nicht behandelte Themen werden sichtbar.

Offener externer Abgleich:

Die aktuelle offizielle MedAT-Stichwortliste und KFF-Beschreibungen konnten aus dieser Umgebung nicht inhaltlich abgerufen werden (HTTP-403-Zugriffssperre). Deshalb bestimmt noch kein unabhängig verifizierter offizieller Katalog das Inhaltsverzeichnis. Der eingebaute Katalog ist ausdrücklich intern. Auch eine vom Nutzer eingegebene Abschrift wird nicht automatisch als offiziell verifiziert markiert. Der Abgleich muss anhand zugänglicher aktueller offizieller Unterlagen erfolgen. Ohne ihn gibt es keine belastbare Prozentangabe zur offiziellen Stoffabdeckung.

## Phase 2: BMS-Bibliothek

Umgesetzt:

- 49 Kapitel insgesamt: 33 erhaltene Grundlagenkapitel und 16 vertiefende Kapitel. Neue Themen umfassen Zellatmung/Atmungskette, Photosynthese, Aktionspotenzial, DNA-Replikation, Proteinbiosynthese, Keimblätter, Sinnesphysiologie, endokrine Regelkreise, Niere, chemische Gleichgewichte, Stereochemie, Löslichkeit, Linsen, Drehmoment, Formelumstellungen und Kombinatorik.
- Kapitelansicht mit Lernziel, Voraussetzungen, Erklärung, geeigneten Grafiken, gegebenenfalls Formel, Beispiel, häufigem Fehler, Zusammenfassung, Verständnisfrage und Quellen. Quellen sind Referenzempfehlungen, keine Behauptung einer inhaltlichen Auswertung dieser Bücher.
- Eigene schematische SVG-Visualisierungen für Zellaufbau, Membran, DNA, Translation, Zellteilung, Aktionspotenzial, Herz-Kreislauf, Atmungskette, Photosynthese, Bindungen, Gleichgewicht, Linsen und Schaltung. Interaktion über Schritte und Parameter; keine fremden Grafiken.
- Automatische Vorschläge für Themen anhand von Decknamen, Tags und Inhalt. Unsichere Vorschläge sind sichtbar. Jede Karte lässt sich einem anderen Kapitel zuordnen oder ausdrücklich ohne Zuordnung lassen. Alle Karten bleiben in der Sammlung erreichbar.
- Einmal berechnete Vorschläge werden für unveränderte Karten wiederverwendet. Ein lokaler Test mit 10.000 synthetischen kurzen Textkarten und 49 Kapiteln ergab etwa 467 ms für den ersten Durchlauf und 2 ms für den Cache-Durchlauf. Das ist keine Messung des nicht zugänglichen Original-Tanki-Decks und keine Geschwindigkeitsgarantie für beliebig große Medienkarten.

Noch offen:

Vollständigkeit nach dem aktuellen offiziellen Katalog und unabhängige fachliche Einzelprüfung aller Texte. Die 49 Kapitel sind kein als vollständig oder extern fachlich freigegeben ausgewiesenes Lehrbuch. Die Original-Anki-Datei ist wegen des 32-MB-Transferlimits in der Agent-Umgebung weiterhin nicht direkt prüfbar; sie wird vom Nutzer im Browser importiert. Besondere Image-Occlusion-Vorlagen werden weiterhin nicht vollständig nachgebildet.

## Phase 3: KFF

Umgesetzt:

- Zahlenfolgen: 36 deterministisch erstellte Aufgaben aus sechs Mustern; sieben vorgegebene Werte, Auswahl des nächsten Zahlenpaares, drei Schwierigkeitsstufen, Lösungsweg.
- Figuren zusammensetzen: 18 eigene SVG-Aufgaben mit drei Teilen und fünf Konturen. Teilrotation im Lernmodus, keine Rotationsbedienung im Prüfungsmodus. Die farbige Lösung zeigt die Zusammensetzung. Ablenker unterscheiden sich im Grundlagenpool auch in der Fläche; es handelt sich noch nicht um einen fortgeschrittenen flächengleichen MedAT-Pool.
- Wortflüssigkeit: 24 selbst zusammengestellte naturwissenschaftliche deutsche Wörter, Buchstabenumordnung, Wahl des Anfangsbuchstabens, vollständiger Buchstabenvergleich. AE/OE/UE werden bei Bedarf verwendet. Der Pool wurde nicht mit einem vollständigen Wörterbuch auf alle möglichen Anagramme geprüft; keine umfassende Eindeutigkeitsbehauptung.
- Gedächtnis: bis zu acht fiktive Ausweise mit selbst gezeichneten Avataren. Einprägen, optionale Zwischenphase und getrennte Abfrage. Zeiten konfigurierbar; im Prüfungsmodus automatische Phasenwechsel. Abfrage zu Geburtsdatum, Blutgruppe und Allergie mit Fehlerstatistik pro Merkmal.
- Implikationen: bestehender Trainer mit 30 Varianten aus zehn Schlussmustern, endlicher Modellprüfung, Grundlagen und Gegenbeispielen.
- Lern- und Zeitmodi mit zurückgehaltenen Prüfungslösungen, automatischer Auswertung, Fehleranalyse und lokalem Ergebnisverlauf. KFF-Pools sind endlich und Trainingsformen nicht als aktuelle offizielle Prüfungssimulation bestätigt.

Offen:

Verifikation der exakten aktuellen offiziellen Formate, Testzeiten und zulässigen Hilfsmittel. Erst nach diesem Abgleich kann „prüfungsnah“ genauer bewertet werden. Wortpool-Eindeutigkeit und fortgeschrittene Figurenaufgaben brauchen zusätzliche redaktionelle Qualitätssicherung.

## Phase 4: Lernsystem und Offlinebetrieb

Umgesetzt:

- Tatsächliche FSRS-Integration über `ts-fsrs` 5.4.2 (MIT), keine selbst erfundene Intervallformel. Vier Bewertungen: Noch einmal, Mit Mühe, Gewusst, Leicht. Ziel-Behalten 90 %, Fuzzing deaktiviert. Neue Wiederholungstermine, Stabilität und Rückfälle werden je Karte in IndexedDB gespeichert.
- Fällige und neue Karten, Fachübersicht, nächste Termine und Vorschläge aus Rückfällen. Kapitel-Lesewiederholung nach sieben Tagen ist davon getrennt und ausdrücklich als einfache inhaltliche Erinnerung gekennzeichnet.
- IndexedDB-Migration von Version 1 auf 2 erhält den Deckspeicher und ergänzt Reviews. Das Anki-Original wird lokal gespeichert. Externe Anki-Terminpläne werden nicht übernommen; Campus-Reviews beginnen mit der ersten Campus-Bewertung.
- Offline-Service-Worker im Produktionsbuild. Alle Anwendungsdateien einschließlich SQL-WASM und nachgeladener KFF-Module werden nach dem ersten erfolgreichen Online-Start gespeichert. Keine externen Schriftarten oder notwendigen APIs. Quelllinks benötigen weiterhin Internet. HTTPS oder localhost ist für Service Worker erforderlich.

Grenzen:

Kein Konto und keine Synchronisation zwischen Geräten. Das Löschen von Websitedaten löscht lokale Inhalte und Fortschritte. Ein laufendes KFF-Training wird bei Neuladen/Verlassen verworfen; abgeschlossene Übersichten bleiben gespeichert. Die App muss am Domain-Wurzelpfad bereitgestellt werden. Der Service Worker läuft nicht unter `npm run dev`, sondern im Produktionsbuild.

## Validierung

`npm test` baut die Anwendung und führt 25 Playwright-Tests mit System-Chromium aus. Geprüft wurden die erhaltenen Importfälle, vollständige Kartenlisten, moderne komprimierte Anki-Daten samt Bildern, Lernablauf und Tagesziel, Logikregeln und Timer, Inhaltsmetadaten, Kartenkorrekturen, FSRS-Persistenz, KFF-Pools, fehlende Prüfungshilfen, Gedächtnisphasen, Offline-Start inklusive nachgeladener KFF-Module und Mobilansichten. Alle 25 Tests bestanden. Automatische Tests ersetzen keine externe fachliche Inhaltsprüfung.
