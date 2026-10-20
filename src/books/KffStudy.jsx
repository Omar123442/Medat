import React from "react";
import ScriptMaterial from "./ScriptMaterial";
const topics = [
  [
    "figures",
    "Figuren zusammensetzen",
    "Bevor du Teile gedanklich zusammenlegst, prüfe die Außenkontur: Welche Winkel, Rundungen und langen Kanten müssen erhalten bleiben? Eine Drehung verändert keine Seitenlängen, eine Spiegelung ist eine andere Operation. Die Summe der Teilflächen muss zur Zielkontur passen.",
    "Markiere zwei auffällige Kanten. Drehe ein Teil gedanklich um 90°. Prüfe dann, ob die Randrichtungen zusammenpassen, ohne die Teile überlappen zu lassen.",
    "Warum reicht allein die gleiche Fläche nicht als Beweis?",
    "Verschiedene Formen können die gleiche Fläche besitzen. Zusätzlich müssen Kanten, Winkel und eine lückenlose Zusammensetzung passen.",
  ],
  [
    "numbers",
    "Zahlenfolgen systematisch prüfen",
    "Notiere zuerst Differenzen benachbarter Zahlen. Sind sie nicht konstant, prüfe Veränderungen der Differenzen und einfache Faktoren. Teste danach getrennt die ungeraden und geraden Positionen. Jede angenommene Regel muss zu allen beobachteten Übergängen passen.",
    "Bei 3, 10, 6, 15, 9, 20, 12 zerfällt die Folge in 3, 6, 9, 12, … und 10, 15, 20, … . Deshalb folgen 25 und 15.",
    "Warum sollte man die erste gefundene Regel nicht sofort übernehmen?",
    "Eine Regel, die nur zwei Übergänge erklärt, kann zufällig passen. Sie muss an allen gegebenen Positionen geprüft werden.",
  ],
  [
    "words",
    "Wortflüssigkeit durch Silben statt Raten",
    "Das Skript beschreibt Hauptwörter ohne Umlaute und ß. Gruppiere mögliche Endungen und Anfänge und zähle anschließend jeden Buchstaben nach. Ein bekannt klingendes Wort ist nur passend, wenn es genau die vorgegebene Buchstabenmenge nutzt.",
    "Prüfe beim eigenen Beispiel BRUSTKORB zuerst mögliche Wortteile: BRUST und KORB. Streiche beim Zusammensetzen gedanklich jeden verwendeten Buchstaben genau einmal.",
    "Warum genügt es nicht, nur den Anfangsbuchstaben schnell zu erraten?",
    "Der Buchstabe muss zu einem vollständig aus den gegebenen Buchstaben gebildeten passenden Wort gehören. Ein zufällig plausibler Anfang kann zum falschen Wort führen.",
  ],
  [
    "memory",
    "Gedächtnis: Informationen verknüpfen",
    "Bilde für jede fiktive Person ein unterscheidbares inneres Bild. Verknüpfe dann Name, Geburtstag, Blutgruppe und weitere Merkmale mit diesem Bild. Ein fester gedanklicher Ort je Person kann verhindern, dass du richtige Merkmale der falschen Person zuordnest. Übe den Abruf, nicht nur wiederholtes Anschauen.",
    "Decke die Ausweise ab und beantworte zunächst drei unterschiedliche Merkmale einer Person. Kontrolliere danach gezielt, ob ein Merkmal falsch erinnert oder nur zwischen Personen vertauscht wurde.",
    "Worin unterscheidet sich Wiedererkennen vom freien Abruf?",
    "Wiedererkennen nutzt angebotene Hinweise. Beim freien Abruf musst du die Information selbst erzeugen. Beides kann sich unterschiedlich schwierig anfühlen.",
  ],
  [
    "logic",
    "Implikationen: Muss gelten oder kann gelten?",
    "Verwende nur die Prämissen. Alle A sind B erlaubt nicht den umgekehrten Schluss, dass alle B auch A sind. Einige bedeutet mindestens eines; zwei Einige-Aussagen müssen nicht dasselbe Objekt beschreiben. Ein Gegenbeispiel genügt, um eine behauptete zwingende Folgerung zu widerlegen.",
    "Alle A sind B und alle B sind C erzwingen alle A sind C. Die Aussage alle C sind A bleibt dagegen offen, weil C zusätzliche Elemente außerhalb von A enthalten kann.",
    "Warum darf Weltwissen eine fehlende Prämisse nicht ersetzen?",
    "Die Aufgabe fragt nach der Folgerung aus den angegebenen Aussagen, nicht nach typischen Zusammenhängen in der realen Welt.",
  ],
];
export default function KffStudy() {
  return (
    <section className="kff-study">
      <h2>KFF zuerst verstehen</h2>
      <p className="muted">
        Eigenständig formulierte Lernhinweise zu deinem KFF-Skript 2021. Die
        historische Ausgabe bestätigt keine aktuellen offiziellen Testzeiten
        oder Formate. Originalseiten erscheinen nach lokalem PDF-Import.
      </p>
      {topics.map(([id, title, text, example, q, a]) => (
        <article className="kff-study-chapter" key={id}>
          <h3>{title}</h3>
          <p>{text}</p>
          <div className="worked-example">
            <h4>Strategie am Beispiel</h4>
            <p>{example}</p>
          </div>
          <div className="comprehension">
            <strong>Verständnisfrage</strong>
            <p>{q}</p>
            <details>
              <summary>Musterantwort</summary>
              <p>{a}</p>
            </details>
          </div>
          <details className="kff-source-details">
            <summary>Quellenabschnitt im KFF-Skript lesen</summary>
            <ScriptMaterial kffArea={id} />
          </details>
        </article>
      ))}
    </section>
  );
}
