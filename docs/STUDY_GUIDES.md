# „Zuerst verstehen“ als integriertes digitales Skript

Stand: 20.10.2026. Der Lernbereich ist nicht mehr nur eine Kapitelliste mit einzelnen PDF-Zusätzen. Die hochgeladenen Skripte sind direkt in der Leseansicht erschlossen.

## Direkt verfügbare Inhalte

- 49 Kapitel mit gegliedertem Lernleitfaden; die 33 bisherigen kurzen Grundlagenkapitel enthalten zusätzliche eigenständig formulierte Erklärabschnitte. Die 16 bereits längeren Vertiefungskapitel erhalten benannte Abschnitte und weitere Lernhilfen.
- Insgesamt 131 Begriffserklärungen, 49 schrittweise gelöste Beispiele und 98 Verständnis-/Transferfragen einschließlich der erhaltenen ursprünglichen Fragen.
- Kapitelgliederung: Lernziele und Vorwissen, Begriffe, Erklärabschnitte, Originalmaterial/eigene Visualisierung, Formeln, gelöstes Beispiel, Denkfehler, Zusammenfassung, Selbsttest und zugeordnete Anki-Karten.
- Sprungnavigation innerhalb des Kapitels und Navigation zum vorherigen/nächsten Kapitel der aktuellen Auswahl.
- Fünf KFF-Lernabschnitte mit Strategieerklärung, eigenem Beispiel und Selbsttest, direkt unter „KFF-Lernwissen“; dazu die passende Stelle im bereitgestellten KFF-Skript.

Alle neu formulierten Lerntexte sind sofort lesbar, ohne dass die PDFs erst importiert werden müssen. Die Texte sind eigenständig geschrieben, keine vollständigen Abschriften oder automatischen Übersetzungen der Bücher.

## Skripte im selben Lernbereich

Unter „Zuerst verstehen → Deine Skripte“ steht dieselbe lokale Skriptbibliothek wie im bisherigen Navigationspunkt zur Verfügung. Sie benutzt dieselben IndexedDB-Einträge; ein zweiter Import ist nicht nötig. Ein geöffnetes Kapitel kann direkt zur Skriptansicht wechseln und anschließend wieder geöffnet werden.

Jedes Kapitel zeigt seinen Quellenstatus vor der Erklärung. 44 Kapitel haben zugeordnete Grundlagen- oder Vertiefungsseiten aus den tatsächlichen Uploads. Angaben enthalten Titel, Jahr, Fachabschnitt und physische PDF-Seiten; bei Mathematik und Physik werden auch die abweichenden gedruckten Seiten angegeben. Ein Seitenverweis behauptet keine vollständige Abdeckung sämtlicher Ergänzungen des Kapitels durch das Skript.

Für fünf Kapitel wird keine direkte Skriptabdeckung behauptet: Arbeit/Energie/Leistung, Wahrscheinlichkeit/Statistik, Löslichkeitsprodukt, Drehmoment/Hebel und Kombinatorik. Diese bleiben als eigenständige Ergänzungen sichtbar. Die vorhandenen Skripte enthalten hierfür keine passend zugeordneten vollständigen Fachabschnitte.

Originalabbildungen und Originalseiten werden weiterhin ausschließlich aus den vom Nutzer lokal importierten PDFs gelesen. Die neuen Lerntexte und Seitenverweise sind Teil der Website. OpenStax-Links bleiben als weitere Literatur separat und sind nicht mehr die einzige sichtbare Quellenangabe eines mit Uploads verknüpften Kapitels.

## Struktur

`src/content/study/biology.json`, `chemistry.json`, `physics.json` und `mathematics.json` enthalten die neuen Fachleitfäden der Grundlagenkapitel. `advanced.json` ergänzt die Vertiefungskapitel. `study/index.js` führt sie mit den vorhandenen Kapiteln zusammen und erhält alle IDs. `ChapterSources.jsx` zeigt Quellen und öffnet den Originalabschnitt. `Lesson.jsx` stellt den gegliederten Lernweg dar. `KffStudy.jsx` enthält das vorgeschaltete KFF-Lernwissen.

Karten-Lesedurchgang und Kartendarstellung sind nach `src/Reading.jsx` ausgelagert. Dadurch kann die erweiterte Lernbibliothek separat geladen werden. Alle neuen Module und Inhalte werden im Produktionsbuild für Offlinebetrieb vorgehalten.

## Qualität und Prüfung

Die hochgeladenen Skripte stammen aus 2018–2022. Sie bestätigen keine aktuelle offizielle MedAT-Stoffliste. Bekannte Einheiten-/Begriffsprobleme werden in den ergänzenden Hinweisen richtiggestellt; die Originalseiten selbst bleiben unverändert. Eine externe fachliche Freigabe sämtlicher Texte wird nicht behauptet.

Build und alle 37 Playwright-Tests bestanden, darunter die sechs neuen Tests zu integrierter Bibliothek, Vollständigkeit der Lernleitfäden, Seitenbereichen, ohne PDF lesbaren Inhalten, Kapitel- und Abschnittsnavigation, KFF-Lernwissen und mobiler Darstellung. Vorhandene Tests für Import, Tagesziel, FSRS, Original-PDF-Darstellung, KFF und Offlinebetrieb bestehen weiterhin.
