# Hochgeladene Skripte: Einbindung und Abgleich

Stand: 20.10.2026. Diese Ergänzung behebt zugleich den Eingabefehler beim Tagesziel: Ein leeres Feld wird nicht mehr sofort auf 1 zurückgesetzt. Eine positive ganze Zahl wird erst mit „Fertig“ gespeichert. Ungültige Eingaben oder Schließen des Dialogs überschreiben das bisherige Ziel nicht.

## Fünf tatsächlich geprüfte Uploads

- `Chemie2020.pdf` – Chemie-Skript der ÖH Med Wien, 2020; 81 PDF-Seiten.
- `Mathe-Skirpt-Ueberarbeitungsversion-Juni-2022.pdf` – Mathematik, 2022; 57 PDF-Seiten.
- `Physik-2018.pdf` – Physik-Skript der ÖH Med Wien, 2018; 52 PDF-Seiten.
- `KFFSkript2021.pdf` – KFF, SEK und TV, 2021; 28 PDF-Seiten.
- `Bioskript-Ueberarbeitungsversion-2022-Juni.pdf` – Biologie-Skript der ÖH Med Wien, 2022; 144 PDF-Seiten.

Inhaltsverzeichnisse und ausgewählte relevante Seiten wurden aus den tatsächlichen Uploads gelesen; ausgewählte Originalseiten und Bildausschnitte wurden visuell geprüft. Dies ist keine vollständige fachliche Begutachtung aller Skriptseiten. Die Ausgaben von 2018–2022 bestätigen nicht den aktuellen offiziellen Prüfungsaufbau oder die aktuelle Stichwortliste.

## Originalabbildungen ohne erneute Veröffentlichung der Bücher

`src/books/books.json` identifiziert die Ausgaben mittels SHA-256. Unter „Skriptbibliothek“ werden die fünf PDFs vom Nutzer auf seinem Gerät importiert. Die Dateien liegen in IndexedDB (Schema 3, neuer Store `books`); Anki-Deck und Reviewdaten bleiben erhalten. Kein Upload an einen Server und keine Aufnahme der PDFs oder unklar lizenzierter Bildkopien ins Git-Repository.

`src/books/references.js` enthält die geprüften physischen PDF-Seiten und gegebenenfalls normalisierte Ausschnittsrechtecke. PDF.js rendert die Originalseiten lokal in ein Canvas. Es handelt sich um echte Buchabbildungen, keine KI-generierten Nachbildungen. „Originalseite lesen / vergrößern“ öffnet die unveränderte Seite mit Navigation durch das vollständige lokale Skript. Herkunft, Jahr und PDF-Seite stehen direkt bei der Abbildung. Bei Mathematik und Physik werden zusätzlich die abweichenden gedruckten Skriptseiten angegeben.

Originale sind unter anderem mit Zellaufbau, Membran, Mitochondrien, Meiose, zwischenmolekularen Kräften, Gleichgewicht, Schaltungen, Linsen, Dreiecken und Photosynthese verknüpft. KFF-Bereiche führen zum passenden historischen Strategieabschnitt. Eigene interaktive Schemata bleiben daneben erhalten. Nicht jedes der 49 Kapitel besitzt schon einen Originalausschnitt.

Die Urheber- und Abbildungsrechte verbleiben bei den im Skript genannten Rechteinhabern. Das Chemie- und Physikskript verweist auf verschiedene Drittquellen; für die gesamte Bildsammlung wurde keine pauschale Weiterveröffentlichungslizenz festgestellt. Darum werden die Bilder aus den lokal vom Nutzer bereitgestellten PDFs gelesen. Eine neue ISC-Lizenz wird für diese Fremdbilder nicht behauptet. Die Auflösung eines alten eingebetteten Rasterbildes wird nicht künstlich verbessert.

## Konkrete inhaltliche Verbesserungen

- Chemie, PDF-Seiten 31–34: eigene Einordnung von dynamischem Gleichgewicht, Aktivierungsenergie und Katalyse. Der Lernhinweis korrigiert die im Skript teilweise vermischten Begriffe Stoffmenge/Konzentration und erläutert Aktivitäten bzw. Einheiten. Originalseiten werden nicht nachträglich retuschiert.
- Mathematik, PDF-Seiten 12–13 und 44–47: Hinweise zu Definitionsbereichen, Potenz-/Logarithmusregeln, Pythagoras und Einheiten.
- Physik, PDF-Seiten 41–42: Strahlengänge zusammen mit vorhandener interaktiver Linsendarstellung.
- Biologie, PDF-Seiten 19–20: räumliche Zuordnung der mitochondrialen Vorgänge; weitere Originalabbildungen bei passenden Kapiteln.
- KFF, PDF-Seiten 7–9, 17, 20 und 22: historische Strategiehinweise. Der Umlaut-Umschreibungsfall `WIRBELSAEULE` wurde aus dem eigenen Wortpool entfernt und durch `BRUSTKORB` ersetzt. Fiktive Ausweise zeigen zusätzlich Medikamenteneinnahme Ja/Nein. Mengen und Zeiten aus dem Jahr 2021 werden nicht als aktuell amtlich bestätigt übernommen.

## Technik und Tests

PDF.js wird erst geladen, wenn ein lokales Skript tatsächlich vorhanden ist. Der Worker wird lokal gebaut und zusammen mit dem Renderer im Offline-Cache vorgehalten. Rendering zeigt keine interaktiven PDF-Skripte oder Formularaktionen an; `isEvalSupported` ist deaktiviert. Datei-Hashes verhindern, dass andere Ausgaben mit falschen Seiten oder Ausschnitten angezeigt werden.

Automatisierte Tests erzeugen eigene synthetische PDFs und prüfen das Leeren/Neusetzen des Ziels, Ablehnung ungültiger Ziele, Hash-Ablehnung unbekannter Ausgaben, Canvas-Darstellung, Seitennavigation, lokale Speicherung und erstmalige PDF-Darstellung im Offlinebetrieb. Die fünf echten Uploads wurden zusätzlich im Browser importiert; Seitenzahlen und Textlesbarkeit wurden für alle fünf Dateien geprüft, Originalabbildungen aus Biologie und KFF visuell kontrolliert. Die Originaldateien selbst sind keine Testfixtures im öffentlichen Repository.

Validierung dieses Stands: Produktionsbuild und alle 31 automatisierten Tests bestanden.
