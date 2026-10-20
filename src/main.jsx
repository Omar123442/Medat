import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  Layers,
  ChartNoAxesCombined,
  CalendarDays,
  Settings,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  Plus,
  Upload,
  Flame,
  Check,
  Clock,
  Target,
  X,
  Atom,
  Dna,
  FlaskConical,
  Calculator,
  Play,
  GraduationCap,
  Menu,
  RotateCcw,
} from "lucide-react";
import { importAnki } from "./import";
import "./style.css";
import Learn, { Preparation } from "./Learn";
import { loadDeck, saveDeck } from "./storage";
const demo = [
  {
    id: "d1",
    subject: "Biologie",
    q: "Welche Funktion haben die Mitochondrien in einer Zelle?",
    a: "Mitochondrien stellen durch Zellatmung ATP bereit. ATP ist ein zentraler Energieträger der Zelle.",
  },
  {
    id: "d2",
    subject: "Chemie",
    q: "Was beschreibt der pH-Wert einer wässrigen Lösung?",
    a: "Der pH-Wert ist der negative dekadische Logarithmus der Wasserstoffionenaktivität. Saure Lösungen haben bei 25 °C einen pH-Wert unter 7.",
  },
  {
    id: "d3",
    subject: "Physik",
    q: "Wie lautet das Ohmsche Gesetz?",
    a: "U = R · I. Die Spannung U ist das Produkt aus elektrischem Widerstand R und Stromstärke I.",
  },
  {
    id: "d4",
    subject: "Mathematik",
    q: "Wie berechnet man die Wahrscheinlichkeit zweier unabhängiger Ereignisse A und B?",
    a: "P(A ∩ B) = P(A) · P(B).",
  },
];
const subjects = [
  {
    name: "Biologie",
    desc: "Das Leben verstehen.",
    icon: Dna,
    color: "green",
    topics: "Zellbiologie · Genetik · Mensch",
  },
  {
    name: "Chemie",
    desc: "Verbindungen erkennen.",
    icon: FlaskConical,
    color: "orange",
    topics: "Atombau · Reaktionen · Organik",
  },
  {
    name: "Physik",
    desc: "Die Welt begreifen.",
    icon: Atom,
    color: "blue",
    topics: "Mechanik · Elektrizität · Optik",
  },
  {
    name: "Mathematik",
    desc: "Mit Logik zum Ergebnis.",
    icon: Calculator,
    color: "purple",
    topics: "Algebra · Geometrie · Stochastik",
  },
];
function read(k, f) {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? f;
  } catch {
    return f;
  }
}
function App() {
  const [cards, setCards] = useState(demo),
    [report, setReport] = useState(null),
    [deckFilter, setDeckFilter] = useState("Alle"),
    [listPage, setListPage] = useState(0),
    [sessionLimit, setSessionLimit] = useState(() =>
      read("medat-session-limit", 0),
    ),
    [prepare, setPrepare] = useState(null),
    [pending, setPending] = useState(null),
    [readFirst, setReadFirst] = useState(true),
    [imported, setImported] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [page, setPage] = useState("Übersicht"),
    [query, setQuery] = useState(""),
    [session, setSession] = useState(null),
    [index, setIndex] = useState(0),
    [reveal, setReveal] = useState(false),
    [done, setDone] = useState(false),
    [stats, setStats] = useState(() => read("medat-progress", {})),
    [goal, setGoal] = useState(() => read("medat-goal", 20)),
    [modal, setModal] = useState(""),
    [mobile, setMobile] = useState(false);
  const file = useRef();
  const today = new Date().toLocaleDateString("sv");
  const daily = stats[today] || 0;
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const filtered = cards.filter(
    (c) =>
      (deckFilter === "Alle" || c.deck === deckFilter) &&
      (
        c.q +
        " " +
        c.a +
        " " +
        c.subject +
        " " +
        (c.deck || "") +
        " " +
        (c.tags || "")
      )
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  useEffect(() => {
    let active = true;
    loadDeck()
      .then(async (f) => {
        if (!f || !active) return;
        setBusy(true);
        try {
          const result = await importAnki(f);
          if (active) {
            setCards(result.cards);
            setReport(result.report);
            setImported(true);
          }
        } catch (e) {
          if (active)
            setError(
              "Gespeichertes Deck konnte nicht geladen werden: " + e.message,
            );
        } finally {
          if (active) setBusy(false);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => setListPage(0), [query, deckFilter]);
  async function upload(e) {
    const f = e.target.files[0];
    if (!f) return;
    setBusy(true);
    setError("");
    try {
      const result = await importAnki(f);
      setCards(result.cards);
      setReport(result.report);
      setImported(true);
      setDeckFilter("Alle");
      setListPage(0);
      setModal("");
      try {
        await saveDeck(f);
      } catch {
        setError(
          "Deck importiert, aber der Browserspeicher reicht nicht zum dauerhaften Speichern. Nach einem Neuladen erneut importieren.",
        );
      }
    } catch (e) {
      setError(
        e.message +
          " Bitte gegebenenfalls mit Unterstützung älterer Anki-Versionen exportieren.",
      );
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }
  function begin(selected) {
    setSession(selected);
    setIndex(0);
    setReveal(false);
    setDone(false);
    setPrepare(null);
    setPending(null);
  }
  function start(subject, specific) {
    const selected =
      specific ||
      (subject ? cards.filter((c) => c.subject === subject) : cards);
    if (!selected.length) {
      setError("Für diesen Bereich wurden noch keine Karten importiert.");
      return;
    }
    setPending(selected);
    setModal("session");
  }
  function launch() {
    const selected =
      sessionLimit > 0 ? pending.slice(0, sessionLimit) : pending;
    setModal("");
    if (readFirst) setPrepare(selected);
    else begin(selected);
  }
  function rate(level) {
    const s = { ...stats, [today]: (stats[today] || 0) + 1 };
    setStats(s);
    localStorage.setItem("medat-progress", JSON.stringify(s));
    if (level === 0) setSession([...session, session[index]]);
    if (index + 1 >= session.length && level !== 0) setDone(true);
    else setIndex(index + 1);
    setReveal(false);
  }
  return (
    <div className="app">
      <input ref={file} type="file" accept=".apkg" hidden onChange={upload} />
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <a className="brand" onClick={() => setPage("Übersicht")}>
          <span className="brand-icon">
            <Plus size={25} />
          </span>
          medat<span className="brand-light">campus</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            <GraduationCap size={20} />
          </span>
          <div>
            Dein Lernstudio<small>MedAT-Vorbereitung</small>
          </div>
          <span className="tiny-dot" />
        </div>
        <div className="nav-label">DEIN CAMPUS</div>
        <nav>
          {[
            [LayoutDashboard, "Übersicht"],
            [BookOpen, "Zuerst verstehen"],
            [Layers, "Lernkarten"],
            [BookOpen, "Fachbereiche"],
            [ChartNoAxesCombined, "Fortschritt"],
            [CalendarDays, "Lernplan"],
          ].map(([Icon, label]) => (
            <button
              key={label}
              className={page === label ? "active" : ""}
              onClick={() => {
                setPage(label);
                setQuery("");
                setMobile(false);
              }}
            >
              <Icon size={19} />
              {label}
              {label === "Lernkarten" && (
                <span className="nav-count">{imported ? cards.length : 4}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="quote">
            <span>DEIN ZIEL. DEIN WEG.</span>
            <h3>
              Ein Schritt näher
              <br />
              zum weißen Kittel.
            </h3>
            <div className="quote-line" />
            <p>Jede Karte zählt.</p>
          </div>
          <button className="settings" onClick={() => setModal("settings")}>
            <Settings size={18} />
            Einstellungen
          </button>
          <div className="profile">
            <div className="avatar">DU</div>
            <div>
              Dein Campus<small>Bereit für deinen Weg</small>
            </div>
            <button onClick={() => setModal("settings")}>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <button className="mobile-toggle" onClick={() => setMobile(!mobile)}>
            <Menu />
          </button>
          <div className="breadcrumb">
            Dein Campus <ChevronRight size={14} />
            <span>{page}</span>
          </div>
          <div className="header-actions">
            <label className="search">
              <Search size={16} />
              <input
                placeholder="Lernkarten durchsuchen …"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value) setPage("Lernkarten");
                }}
              />
              <kbd>⌕</kbd>
            </label>
            <button
              className="notification"
              onClick={() => setModal("notifications")}
              aria-label="Mitteilungen"
            >
              <Bell size={19} />
              <i />
            </button>
            <div className="avatar small">DU</div>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">DEIN WEG ZUM MEDIZINSTUDIUM</div>
              <h1>
                {page === "Übersicht" ? "Kleine Schritte. Großes Ziel." : page}
              </h1>
              <p>
                {page === "Übersicht"
                  ? "Schön, dass du da bist. Mach heute den Unterschied."
                  : "Dein Wissen wächst mit jeder Wiederholung."}
              </p>
            </div>
            <span className="date">
              <CalendarDays size={16} />
              {new Date().toLocaleDateString("de-AT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          {error && (
            <div className="error">
              {error}
              <button onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {page === "Übersicht" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <span className="hero-tag">
                    <span />
                    DEIN TÄGLICHER FOKUS
                  </span>
                  <h2>
                    Dein Studienplatz beginnt
                    <br />
                    mit der nächsten Karte.
                  </h2>
                  <p>
                    Verstehen. Wiederholen. Über dich hinauswachsen.
                    <br />
                    Bring dein Wissen heute einen Schritt weiter.
                  </p>
                  <button
                    className="cream-button"
                    onClick={() => setPage("Zuerst verstehen")}
                  >
                    Jetzt verstehen <ArrowRight size={17} />
                  </button>
                  <div className="hero-caption">
                    <Clock size={13} /> Dein Tempo. Dein Fortschritt.
                  </div>
                </div>
                <div className="art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <span className="art-plus p1">+</span>
                  <span className="art-plus p2">+</span>
                  <div className="floating-tag">
                    <Check size={13} /> DU SCHAFFST DAS.
                  </div>
                  <div className="flashcard back" />
                  <div className="flashcard front">
                    <div className="card-top">
                      WISSEN, DAS BLEIBT <span>✧</span>
                    </div>
                    <Dna className="dna-art" strokeWidth={1.15} />
                    <div className="art-card-bottom">
                      Dein nächstes Kapitel.<span>01 / ∞</span>
                    </div>
                  </div>
                  <div className="art-badge">
                    <GraduationCap size={23} />
                  </div>
                </div>
              </section>
              <section className="stats-grid">
                <Stat
                  icon={Layers}
                  label="Lernkarten"
                  value={cards.length.toLocaleString("de")}
                  detail={
                    imported
                      ? "Aus deinem Anki-Deck"
                      : "Beispielkarten zum Ausprobieren"
                  }
                  color="green"
                />
                <Stat
                  icon={Check}
                  label="Heute wiederholt"
                  value={daily}
                  detail={`von ${goal} Karten im Tagesziel`}
                  color="blue"
                />
                <Stat
                  icon={Flame}
                  label="Aktive Lerntage"
                  value={Object.keys(stats).length}
                  detail="Jeder Lerntag bringt dich weiter"
                  color="orange"
                />
                <Stat
                  icon={Target}
                  label="Tagesziel"
                  value={Math.min(100, Math.round((daily / goal) * 100)) + " %"}
                  detail={
                    daily >= goal
                      ? "Geschafft. Gut gemacht!"
                      : "Du bestimmst dein Tempo"
                  }
                  color="purple"
                />
              </section>
            </>
          )}
          {(page === "Übersicht" || page === "Fachbereiche") && (
            <section className="subjects-section">
              <div className="section-heading">
                <div>
                  <h2>
                    Deine Fachbereiche <span className="subtle-tag">BMS</span>
                  </h2>
                  <p>Die Grundlagen für deinen Erfolg im MedAT.</p>
                </div>
                <button
                  className="text-button"
                  onClick={() =>
                    setPage(
                      page === "Fachbereiche" ? "Lernkarten" : "Fachbereiche",
                    )
                  }
                >
                  Alle Bereiche <ArrowRight size={15} />
                </button>
              </div>
              <div className="subject-grid">
                {subjects.map((s) => (
                  <button
                    className="subject-card"
                    key={s.name}
                    onClick={() => start(s.name)}
                  >
                    <div className="subject-top">
                      <span className={"icon-box " + s.color}>
                        <s.icon size={23} />
                      </span>
                      <ArrowUpRight size={18} />
                    </div>
                    <h3>{s.name}</h3>
                    <p>{s.desc}</p>
                    <div className="subject-divider" />
                    <small>
                      {cards
                        .filter((c) => c.subject === s.name)
                        .length.toLocaleString("de")}{" "}
                      Karten <span>{imported ? "Importiert" : "Beispiel"}</span>
                    </small>
                    <div className={"progress-track " + s.color}>
                      <i
                        style={{
                          width: Math.min(100, (daily / goal) * 100) + "%",
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
          {page === "Übersicht" && (
            <section className="learning-banner">
              <div>
                <h2>Wissen aufbauen, bevor du dich abfragst.</h2>
                <p>
                  BMS-Grundlagen lesen oder dein vollständiges Deck mit
                  Antworten durcharbeiten.
                </p>
              </div>
              <button
                className="primary"
                onClick={() => setPage("Zuerst verstehen")}
              >
                Zuerst verstehen <ArrowRight size={16} />
              </button>
            </section>
          )}
          {page === "Übersicht" && (
            <div className="bottom-grid">
              <section className="import-panel">
                <div className="section-heading">
                  <div>
                    <h2>Dein Wissen. An einem Ort.</h2>
                    <p>Deine Anki-Sammlung wird zu deinem Lerncampus.</p>
                  </div>
                  <span className="file-icon">
                    <Upload size={22} />
                  </span>
                </div>
                <div
                  className="upload-zone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    upload({
                      target: { files: e.dataTransfer.files, value: "" },
                    });
                  }}
                >
                  <div className="file-symbol">
                    <Layers size={24} />
                  </div>
                  <div>
                    <strong>
                      {imported
                        ? `${cards.length.toLocaleString("de")} Karten importiert`
                        : "MedAT-Tanki_2024.apkg"}
                    </strong>
                    <p>
                      {imported
                        ? "Dein Deck ist importiert und lokal gespeichert."
                        : "Ziehe dein Deck hierher oder wähle deine Datei."}
                    </p>
                    <span>ANKI-DECK · .APKG · LOKAL & PRIVAT</span>
                  </div>
                  <button
                    className="outline-button"
                    disabled={busy}
                    onClick={() => file.current.click()}
                  >
                    {busy
                      ? "Wird geladen …"
                      : imported
                        ? "Deck wechseln"
                        : "Importieren"}
                    <Upload size={14} />
                  </button>
                </div>
                <p className="privacy">
                  <Check size={13} />
                  Deine Karten bleiben in deinem Browser. Kein Upload an einen
                  Server.
                </p>
              </section>
              <section className="daily-panel">
                <div className="section-heading">
                  <h2>Dein Tagesziel</h2>
                  <Target size={18} />
                </div>
                <div className="daily-main">
                  <div
                    className="ring"
                    style={{
                      background: `conic-gradient(#246b55 ${Math.min(daily / goal, 1) * 360}deg, #e8ede8 0deg)`,
                    }}
                  >
                    <div>
                      <strong>
                        {Math.min(100, Math.round((daily / goal) * 100))}
                        <small>%</small>
                      </strong>
                    </div>
                  </div>
                  <div>
                    <strong>
                      {daily} <span>/ {goal} Karten</span>
                    </strong>
                    <p>
                      {daily >= goal
                        ? "Tagesziel erreicht!"
                        : "Ein guter Tag zum Lernen."}
                    </p>
                    <button
                      className="text-button"
                      onClick={() => setModal("settings")}
                    >
                      Ziel anpassen <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}
          {page === "Zuerst verstehen" && (
            <Learn cards={cards} onPractice={start} />
          )}
          {page === "Lernkarten" && (
            <section className="library">
              <div className="section-heading">
                <div>
                  <h2>
                    {imported ? "Deine Sammlung" : "Beispielsammlung"}{" "}
                    <span className="subtle-tag">{filtered.length}</span>
                  </h2>
                  <p>
                    {imported
                      ? "Aus deinem importierten Anki-Deck."
                      : "Importiere dein Deck, um mit deinen eigenen Inhalten zu lernen."}
                  </p>
                </div>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => file.current.click()}
                >
                  <Upload size={16} />
                  {busy ? "Import läuft …" : "Deck importieren"}
                </button>
              </div>
              <div className="filter-row">
                <select
                  aria-label="Deck auswählen"
                  value={deckFilter}
                  onChange={(e) => setDeckFilter(e.target.value)}
                >
                  <option>Alle</option>
                  {[...new Set(cards.map((c) => c.deck).filter(Boolean))]
                    .sort()
                    .map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                </select>
                <button
                  className="primary"
                  onClick={() => start(null, filtered)}
                >
                  Auswahl lernen ({filtered.length})
                </button>
              </div>
              {report && (
                <div className="import-report">
                  <strong>
                    Import geprüft: {report.imported} von {report.cards}{" "}
                    Anki-Karten · {report.notes} Notizen
                  </strong>
                  {report.warnings.map((w) => (
                    <p key={w}>{w}</p>
                  ))}
                </div>
              )}
              {filtered.slice(listPage * 50, (listPage + 1) * 50).map((c) => (
                <button
                  className="library-card"
                  key={c.id}
                  onClick={() => start(null, [c])}
                >
                  <span className="icon-box green">
                    <BookOpen size={18} />
                  </span>
                  <div>
                    <small>{c.subject}</small>
                    <p>{c.q.slice(0, 200)}</p>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
              {!filtered.length && <p>Keine Karten für „{query}“ gefunden.</p>}
              <div className="pagination">
                <button
                  disabled={!listPage}
                  onClick={() => setListPage(listPage - 1)}
                >
                  Zurück
                </button>
                <span>
                  Seite {listPage + 1} /{" "}
                  {Math.max(1, Math.ceil(filtered.length / 50))} · alle{" "}
                  {filtered.length} Karten erreichbar
                </span>
                <button
                  disabled={(listPage + 1) * 50 >= filtered.length}
                  onClick={() => setListPage(listPage + 1)}
                >
                  Weiter
                </button>
              </div>
            </section>
          )}
          {page === "Fortschritt" && (
            <>
              <section className="stats-grid">
                <Stat
                  icon={Check}
                  label="Wiederholungen gesamt"
                  value={total}
                  detail="Seit deinem ersten Lerntag"
                  color="green"
                />
                <Stat
                  icon={Flame}
                  label="Aktive Tage"
                  value={Object.keys(stats).length}
                  detail="Lokal auf diesem Gerät gespeichert"
                  color="orange"
                />
              </section>
              <section className="panel">
                <h2>Deine letzten sieben Tage</h2>
                <div className="chart">
                  {Array.from({ length: 7 }, (_, i) => {
                    let d = new Date();
                    d.setDate(d.getDate() - 6 + i);
                    let n = stats[d.toLocaleDateString("sv")] || 0;
                    return (
                      <div key={i}>
                        <span>{n}</span>
                        <div
                          className="bar"
                          style={{
                            height: Math.max(
                              4,
                              Math.min(
                                180,
                                (n /
                                  Math.max(goal, ...Object.values(stats), 1)) *
                                  180,
                              ),
                            ),
                          }}
                        />
                        <small>
                          {d.toLocaleDateString("de", { weekday: "short" })}
                        </small>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
          {page === "Lernplan" && (
            <section className="panel">
              <div className="section-heading">
                <div>
                  <h2>Ein Rhythmus, der zu dir passt.</h2>
                  <p>Plane jeden Tag eine kleine, machbare Lerneinheit.</p>
                </div>
                <button
                  className="outline-button"
                  onClick={() => setModal("settings")}
                >
                  Tagesziel ändern
                </button>
              </div>
              {subjects.map((s, i) => (
                <div className="plan-row" key={s.name}>
                  <span className={"icon-box " + s.color}>
                    <s.icon size={20} />
                  </span>
                  <div>
                    <strong>{s.name}</strong>
                    <p>{s.topics}</p>
                  </div>
                  <span>{Math.ceil(goal / 4)} Karten</span>
                  <button className="text-button" onClick={() => start(s.name)}>
                    Lernen <ArrowRight size={16} />
                  </button>
                </div>
              ))}
              <p className="muted">
                Dieser Plan deckt die BMS-Grundlagen ab. Kognitive Fähigkeiten,
                Textverständnis und sozial-emotionale Kompetenzen benötigen
                zusätzliche Übungen.
              </p>
            </section>
          )}
          <footer>
            <span>
              <span className="footer-dot" /> Mit jedem Tag ein Stück weiter.
            </span>
            <span>Dein Ziel im Blick. Dein Tempo im Campus.</span>
          </footer>
        </div>
      </main>
      {prepare && (
        <Preparation
          cards={prepare}
          onClose={() => setPrepare(null)}
          onStart={() => begin(prepare)}
        />
      )}
      {modal === "session" && pending && (
        <div className="overlay">
          <div className="modal">
            <button
              className="close"
              onClick={() => {
                setModal("");
                setPending(null);
              }}
            >
              <X />
            </button>
            <h2>Deine Lerneinheit</h2>
            <p>
              {pending.length.toLocaleString("de")} Karten verfügbar. Du
              bestimmst selbst, wie viele du lernst.
            </p>
            <label className="goal-label">
              Karten pro Sitzung (0 = alle)
              <input
                aria-label="Sitzungsgröße"
                type="number"
                min="0"
                value={sessionLimit}
                onChange={(e) => {
                  const n = Math.max(
                    0,
                    Math.floor(Number(e.target.value) || 0),
                  );
                  setSessionLimit(n);
                  localStorage.setItem(
                    "medat-session-limit",
                    JSON.stringify(n),
                  );
                }}
              />
            </label>
            <button
              className="outline-button"
              onClick={() => {
                setSessionLimit(0);
                localStorage.setItem("medat-session-limit", "0");
              }}
            >
              Alle Karten – ohne Limit
            </button>
            <label className="read-first">
              <input
                type="checkbox"
                checked={readFirst}
                onChange={(e) => setReadFirst(e.target.checked)}
              />
              Zuerst Fragen und Erklärungen lesen
            </label>
            <button className="primary" onClick={launch}>
              {readFirst ? "Lesen starten" : "Karten starten"} (
              {sessionLimit
                ? Math.min(sessionLimit, pending.length)
                : pending.length}
              ) <ArrowRight size={16} />
            </button>
            <p className="muted">
              Dein Tagesziel begrenzt die Sitzung nicht. „Noch einmal“
              wiederholt eine Karte ohne künstliche Obergrenze.
            </p>
          </div>
        </div>
      )}
      {modal && modal !== "session" && (
        <div className="overlay" onClick={() => setModal("")}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setModal("")}>
              <X />
            </button>
            <h2>
              {modal === "settings"
                ? "Dein Lernrhythmus"
                : "Deine Mitteilungen"}
            </h2>
            {modal === "settings" ? (
              <>
                <p>Wie viele Karten möchtest du täglich wiederholen?</p>
                <label className="goal-label">
                  Karten pro Tag
                  <input
                    type="number"
                    min="1"
                    value={goal}
                    onChange={(e) => {
                      const n = Math.max(
                        1,
                        Math.floor(Number(e.target.value) || 1),
                      );
                      setGoal(n);
                      localStorage.setItem("medat-goal", JSON.stringify(n));
                    }}
                  />
                </label>
                <p className="muted">
                  Fortschritt und Tagesziel bleiben auf diesem Gerät
                  gespeichert. Dein importiertes Deck wird in IndexedDB auf
                  diesem Gerät gespeichert und beim Öffnen wiederhergestellt,
                  solange der Browser die Websitedaten behält. Das Tagesziel ist
                  keine Lernbegrenzung.
                </p>
                <button className="primary" onClick={() => setModal("")}>
                  Fertig <Check size={16} />
                </button>
              </>
            ) : (
              <p>
                Alles auf dem aktuellen Stand. Dein nächster Schritt: eine
                kleine Lerneinheit.
              </p>
            )}
          </div>
        </div>
      )}
      {session && (
        <div className="overlay">
          <div className="study">
            <button
              className="close"
              aria-label="Lerneinheit schließen"
              onClick={() => setSession(null)}
            >
              <X />
            </button>
            {done ? (
              <div className="finished">
                <span className="icon-box green">
                  <Check size={30} />
                </span>
                <h2>Ein Schritt weiter.</h2>
                <p>Du hast {session.length} Karten wiederholt. Gut gemacht!</p>
                <button className="primary" onClick={() => setSession(null)}>
                  Zur Übersicht <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="eyebrow">
                  {session[index]?.subject} · {index + 1} / {session.length}
                </div>
                <div className="study-progress">
                  <i style={{ width: (index / session.length) * 100 + "%" }} />
                </div>
                <h2>{session[index]?.q}</h2>
                {session[index]?.images?.map((url, i) => (
                  <img
                    className="study-image"
                    key={i}
                    src={url}
                    alt="Abbildung aus der Lernkarte"
                  />
                ))}
                {reveal ? (
                  <>
                    <div className="answer">
                      {session[index]?.answerImages?.map((url, i) => (
                        <img
                          className="study-image"
                          key={i}
                          src={url}
                          alt="Abbildung zur Antwort"
                        />
                      ))}
                      {session[index]?.a ||
                        "Diese Karte enthält keine separate Textantwort. Prüfe die Abbildung beziehungsweise die Karte in Anki."}
                    </div>
                    <p className="muted">Wie gut konntest du dich erinnern?</p>
                    <div className="rating">
                      <button onClick={() => rate(0)}>
                        <RotateCcw size={16} />
                        Noch einmal
                      </button>
                      <button onClick={() => rate(1)}>Mit Mühe</button>
                      <button onClick={() => rate(2)}>
                        Gewusst <Check size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    className="primary reveal"
                    onClick={() => setReveal(true)}
                  >
                    Antwort aufdecken <ArrowRight size={17} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function Stat({ icon: Icon, label, value, detail, color }) {
  return (
    <div className="stat">
      <div className="stat-label">
        {label}
        <span className={"stat-icon " + color}>
          <Icon size={17} />
        </span>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
