# Implikationen erkennen

Eigenständiges KFF-Modul. Bestehende BMS- und Importfunktionen bleiben in ihren Modulen.

## Aufbau und Umsetzung

1. `engine.js`: Mengenlogik mit den Quantoren alle, keine, einige, einige nicht. Drei Mengen ergeben acht Venn-Regionen; alle 256 Belegungen werden geprüft. Ein Schluss gilt genau dann, wenn jede mit den Prämissen vereinbare Belegung ihn erfüllt. Allaussagen setzen keine Existenz voraus.
2. `tasks.js`: Zehn selbst entwickelte Schlussmuster mit je drei sprachlichen Varianten. Optionen A–D enthalten genau einen zwingenden Schluss oder keinen; im letzteren Fall ist E korrekt. Äquivalente Aussagen stehen nicht gleichzeitig als gültige Optionen zur Wahl. Kein Kopieren offizieller Prüfungsaufgaben.
3. `LogicTrainer.jsx`: Grundlagen mit Verständnischecks, Lernmodus ohne Zeitlimit, Prüfungsmodus mit einstellbarem Limit, freie Navigation, automatische Abgabe, Auswertung und lokale Ergebnisübersichten.
4. `logic.css`: Ergänzungen zum bestehenden responsiven Design. Native Buttons und sichtbarer Auswahlzustand ermöglichen Tastaturbedienung.
5. `tests/logic.spec.js`: Prüft eindeutige Lösungen aller Varianten, Quantornegationen über alle Modelle, klassische Fehlschlüsse, Grundlagen, Feedback, Ergebniswiederherstellung, Prüfung ohne Lösungsanzeige, automatischen Zeitablauf und Mobilbedienung. Bestehende Tests bleiben aktiv.

## Format- und Quellenstand

Am 20.10.2026 konnten die vom Nutzer genannten Domains aufgrund HTTP-403-Zugriffssperren der Ausführungsumgebung nicht inhaltlich abgerufen werden. Das aktuelle offizielle Format ist deshalb ausdrücklich **nicht verifiziert**. Zwei Prämissen, fünf Antwortoptionen und der einstellbare Standard von zehn Aufgaben in zehn Minuten sind Trainingsvorgaben. Der Trainer behauptet keine offiziell bestätigte Prüfungssimulation oder Übereinstimmung mit einer bestimmten Testversion.

Weiterführende, vom Nutzer vorgeschlagene Quellen:

- Offizielle MedAT-Erklärvideos: https://www.medizinstudieren.at/der-aufnahmetest-medat/testinhalte/vorbereitungsunterlagen/erklaervideos-testteile-medat/
- OpenStax Contemporary Mathematics: https://openstax.org/details/books/contemporary-mathematics
- Open Logic Project: https://openlogicproject.org/

Aufgaben und deutsche Erklärungen sind eigenständig verfasst. Es wurden keine Texte, Bilder oder Aufgaben aus diesen Werken übernommen; deren konkrete Lizenzen wurden nicht verifiziert. Eine Quellenverlinkung behauptet keine externe fachliche Freigabe. Weiterer Abgleich mit den aktuellen offiziellen Aufgabenbeispielen ist offen, sobald sie zugänglich sind.

## Semantik und Grenzen

„Einige“ bedeutet mindestens eines. „Oder“ ist einschließend, sofern nichts anderes angegeben ist. Die Gültigkeit wird unabhängig von der tatsächlichen Weltbedeutung der Begriffe geprüft. Alle Texte in den Aufgaben stammen aus dem lokalen eigenen Pool.

Der Pool hat 30 Varianten und zehn strukturelle Muster. Er ist endlich und nicht adaptiv; ähnliche Schlusswege können in einer Sitzung mehrfach vorkommen. Unterschiede in den Gruppenbezeichnungen bedeuten keine neue logische Struktur.

Das Zeitlimit basiert auf einer absoluten Deadline und wird beim Sichtbarwerden des Tabs sowie regelmäßig geprüft. Antworten nach der Deadline werden abgewiesen. Bis zu 50 Ergebnisübersichten bleiben in localStorage; ausführliche aktuelle Aufgabenlösungen liegen im Arbeitsspeicher. Navigation aus dem Bereich oder Neuladen verwirft ein noch laufendes Training. Ein erneuter Besuch stellt keine laufende Prüfung wieder her.

## Größerer Projektauftrag

Der angehängte Projektauftrag dient als Kontext für die langfristige BMS-/KFF-Roadmap. Diese Änderung implementiert ausdrücklich den in der Chatnachricht angefragten Teil E. Zahlenfolgen, Figuren zusammensetzen, Wortflüssigkeit, Gedächtnistraining, vollständige BMS-Stoffabdeckung, neue Anki-Zuordnung und FSRS sind damit nicht als umgesetzt ausgewiesen.
