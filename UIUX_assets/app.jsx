/* global React, ReactDOM */
/* ============================================================
   Roast Lab — main app shell.
   ============================================================ */

const DEFAULT_DOSSIER = {
  name: "",
  location: "",
  job: "",
  hobbies: "",
  quirks: "",
  weakness: "",
  insideJokes: "",
  avoid: "",
  chips: [],
  style: "playful",
  intensity: 5,
  fileNo: String(Math.floor(1000 + Math.random() * 9000))
};

function App() {
  const [dossier, setDossier] = useState(DEFAULT_DOSSIER);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("X");
  const [editing, setEditing] = useState(false);
  const [exportFlash, setExportFlash] = useState(false);

  const generate = useCallback(() => {
    if (!dossier.name.trim()) {
      setError("Subject name is required.");
      return;
    }
    setError(null);
    setScanning(true);
    setResult(null);
    setEditing(false);
    // Simulated archive search delay (real query is instant; this gives the lab feel)
    const t = 700 + Math.random() * 600;
    setTimeout(() => {
      try {
        const r = window.RoastEngine.generate(dossier);
        setResult(r);
        setScanning(false);
      } catch (err) {
        console.error(err);
        setError("Generator fault. Retry.");
        setScanning(false);
      }
    }, t);
  }, [dossier]);

  // ⌘↵ to generate
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [generate]);

  const onTextEdit = (txt) => setResult(r => r ? { ...r, text: txt } : r);
  const onCopy = () => {
    if (!result) return;
    try { navigator.clipboard.writeText(result.text); } catch (e) {}
  };
  const onExport = () => {
    setExportFlash(true);
    setTimeout(() => setExportFlash(false), 1200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar />

      {/* Main grid */}
      <main style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "minmax(380px, 460px) 1fr minmax(320px, 380px)",
        gap: 16,
        padding: 16,
        maxWidth: 1600,
        margin: "0 auto",
        width: "100%"
      }} className="lab-grid">

        {/* Column 1: Dossier */}
        <DossierPanel
          dossier={dossier}
          setDossier={setDossier}
          onGenerate={generate}
          generating={scanning}
        />

        {/* Column 2: Tweet preview + DNA */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div className="panel" style={{ padding: 18 }}>
            <Band num="02" title="Live Roast Output"
              right={
                <span className="t-stamp" style={{ color: scanning ? "var(--red)" : (result ? "var(--gold)" : "var(--ink-mute)") }}>
                  ● {scanning ? "GENERATING" : result ? "READY" : "IDLE"}
                </span>
              }/>
            <div style={{ paddingTop: 16 }}>
              {error && <ErrorBanner msg={error} onDismiss={() => setError(null)}/>}
              {scanning && !result && <ScanningState/>}
              <PostCard
                result={result}
                dossier={dossier}
                mode={mode}
                onModeChange={setMode}
                onTextEdit={onTextEdit}
                editing={editing}
                setEditing={setEditing}
                onCopy={onCopy}
                onExport={onExport}
                onRegen={generate}
              />
            </div>
          </div>
          <StyleDNAPanel result={result} dossier={dossier}/>
        </section>

        {/* Column 3: Archive matches */}
        <ArchiveDrawer result={result} dossier={dossier} scanning={scanning}/>
      </main>

      <Footer/>

      {exportFlash && <ExportFlash/>}
    </div>
  );
}

function TopBar() {
  return (
    <header style={{
      borderBottom: "1px solid var(--rule)",
      background: "var(--paper)",
      padding: "12px 20px",
      display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Wordmark */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "4px 10px",
          border: "1.5px solid var(--ink)",
          borderRadius: 3
        }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic", fontWeight: 700,
            fontSize: 18, lineHeight: 1, color: "var(--ink)"
          }}>D·R</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "var(--ink-soft)"
          }}>Roast Lab</span>
        </div>
        <div>
          <h1 className="t-h3" style={{ margin: 0 }}>Trump Roast Lab</h1>
          <div className="t-meta" style={{ marginTop: 2 }}>
            Turn friend facts into a parody Trump-style roast post.
          </div>
        </div>
      </div>
      <span style={{ flex: 1 }}/>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Stamp tone="red">PARODY · SATIRE</Stamp>
        <span className="t-meta">Archive · 16,180 posts · 2024-04-30 → 2026-04-30</span>
        <a href="design-system.html" className="btn btn--ghost"
           style={{ textDecoration: "none" }}>
          <Icon name="info" size={14}/> Design System
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--rule)",
      padding: "10px 20px",
      background: "var(--bone)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ink-soft)",
      letterSpacing: "0.12em", textTransform: "uppercase"
    }}>
      <span>Donald J Roster · v0.4.0 · build {Math.floor(Date.now() / 1000).toString(36)}</span>
      <span>All output is fictional satire · Not affiliated with any platform or person</span>
      <span>
        <span className="kbd">⌘</span> <span className="kbd">↵</span> generate ·{" "}
        <span className="kbd">R</span> regen
      </span>
    </footer>
  );
}

function ScanningState() {
  return (
    <div style={{
      padding: "10px 14px", marginBottom: 12,
      border: "1px dashed var(--rule)", borderRadius: 4,
      background: "var(--bone)",
      fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-soft)"
    }}>
      <ScanBar active />
      <div style={{ marginTop: 6 }}>
        Cross-referencing dossier against 16,180 archived posts…<br/>
        Matching cadence · nicknames · theme hooks · sign-offs.
      </div>
    </div>
  );
}

function ErrorBanner({ msg, onDismiss }) {
  return (
    <div style={{
      padding: "10px 12px", marginBottom: 12,
      border: "1.5px solid var(--red)", borderRadius: 4,
      background: "rgba(178,34,52,0.06)",
      display: "flex", alignItems: "center", gap: 10
    }}>
      <Stamp tone="red">FAULT</Stamp>
      <span style={{ flex: 1, fontSize: 13 }}>{msg}</span>
      <button className="btn btn--ghost" style={{ padding: "4px 8px" }} onClick={onDismiss}>
        <Icon name="x" size={12}/>
      </button>
    </div>
  );
}

function ExportFlash() {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      padding: "10px 14px",
      background: "var(--ink)", color: "var(--paper)",
      borderRadius: 6, fontSize: 13,
      boxShadow: "var(--shadow-pop)",
      display: "flex", alignItems: "center", gap: 8,
      zIndex: 50
    }}>
      <Icon name="download" size={14} color="var(--paper)"/>
      Roast card exported as parody-roast.png (demo)
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
