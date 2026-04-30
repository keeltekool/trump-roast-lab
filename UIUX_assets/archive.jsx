/* global React */
/* ============================================================
   ArchivePanel — shows top-N matching corpus snippets and the
   Style DNA bar chart for the generated post.
   ============================================================ */

const DNA_LABELS = {
  NICKNAME:      "Nickname stamp",
  REPETITION:    "Repetition cadence",
  EXAGGERATION:  "Superlative / exaggeration",
  ALLCAPS_BURST: "ALL-CAPS burst",
  INSULT_THEME:  "Themed insult hooks",
  SIGNOFF:       "Sign-off punctuation",
  EXCLAMATIONS:  "Exclamation density"
};

function ArchiveDrawer({ result, dossier, scanning }) {
  const matches = result?.matches || (window.RoastEngine ? window.RoastEngine.scoreCorpus(dossier, 5) : []);

  return (
    <section className="panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Band num="03" title="Archive Matches"
        right={
          <span className="t-stamp" style={{ display: "inline-flex", gap: 8, alignItems: "center", color: "var(--ink-mute)" }}>
            <Icon name="search" size={11}/> 16,180 posts indexed
          </span>
        }/>

      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--rule)" }}>
        <ScanBar active={scanning}/>
        <div className="t-meta" style={{ marginTop: 6 }}>
          {scanning
            ? "Searching archive for cadence + nickname + theme matches…"
            : `Top 5 pattern matches · sorted by relevance · style="${dossier.style}"`}
        </div>
      </div>

      <div style={{ overflow: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {matches.map((m, idx) => (
          <article key={m.id} style={{
            border: "1px solid var(--rule)",
            borderRadius: "var(--r-sm)",
            background: "var(--paper)",
            padding: 12
          }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
              <span className="t-stamp" style={{ color: "var(--navy)" }}>
                #{String(idx + 1).padStart(2, "0")} · {m.id} · {m.channel}
              </span>
              <span className="t-meta">{m.date}</span>
            </header>
            <p style={{
              margin: "8px 0 6px",
              fontFamily: "var(--font-mono)",
              fontSize: 12.5, lineHeight: 1.45, color: "var(--ink-soft)"
            }}>
              "{m.text.replace(/SUBJECT/g, dossier.name || "SUBJECT")}"
            </p>
            <footer style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {m.dna.map(d => (
                <span key={d} style={{
                  fontFamily: "var(--font-mono)", fontSize: 9.5,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  padding: "2px 6px", borderRadius: 3,
                  background: "var(--bone)", color: "var(--ink-soft)"
                }}>{d}</span>
              ))}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function StyleDNAPanel({ result, dossier }) {
  const dna = result?.dna || {};
  const keys = ["NICKNAME","REPETITION","EXAGGERATION","ALLCAPS_BURST","INSULT_THEME","SIGNOFF","EXCLAMATIONS"];

  return (
    <section className="panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Band num="04" title="Style DNA"
        right={<span className="t-stamp" style={{ color: "var(--gold)" }}>● ANALYZED</span>} />

      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>

        {!result && (
          <div className="t-meta">
            DNA breakdown appears after generation.
          </div>
        )}

        {keys.map(k => {
          const v = dna[k] || 0;
          return (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span className="t-stamp" style={{ color: "var(--ink-soft)" }}>{DNA_LABELS[k]}</span>
                <span className="t-meta">{Math.round(v)}%</span>
              </div>
              <div style={{ height: 6, background: "var(--bone)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: v + "%",
                  background: barColor(k),
                  transition: "width 400ms ease"
                }}/>
              </div>
            </div>
          );
        })}

        {result && (
          <div style={{
            marginTop: 6, padding: 10, border: "1px dashed var(--rule)",
            borderRadius: 4, background: "var(--bone)",
            fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-soft)",
            lineHeight: 1.5
          }}>
            <strong style={{ color: "var(--ink)" }}>Reading:</strong>{" "}
            Nickname "<em>{result.nickname}</em>" applied · style="{result.style}" · intensity {result.intensity}/10.
            Detected {Math.round(dna.REPETITION || 0)}% repetition cadence and {Math.round(dna.ALLCAPS_BURST || 0)}% all-caps burst.
          </div>
        )}
      </div>
    </section>
  );
}

function barColor(k) {
  switch (k) {
    case "NICKNAME": return "var(--navy)";
    case "REPETITION": return "var(--red)";
    case "EXAGGERATION": return "var(--gold)";
    case "ALLCAPS_BURST": return "var(--red-deep)";
    case "INSULT_THEME": return "var(--navy-deep)";
    case "SIGNOFF": return "var(--ink)";
    case "EXCLAMATIONS": return "var(--gold-soft)";
    default: return "var(--ink-soft)";
  }
}

Object.assign(window, { ArchiveDrawer, StyleDNAPanel });
