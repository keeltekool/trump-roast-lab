/* global React */
/* ============================================================
   PostCard — original parody social-post chrome.
   No real platform branding; custom mark "DR" (Donald Roster).
   ============================================================ */

function ParodyAvatar({ size = 48 }) {
  // Hand-drawn flat geometric "DT" parody avatar — original art, not a logo.
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ borderRadius: "50%" }}>
      <defs>
        <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0E2238"/>
          <stop offset="1" stopColor="#081626"/>
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="24" fill="url(#bg)"/>
      {/* Hair swoop */}
      <path d="M9 22c2-9 11-13 17-12s11 5 12 11c-3-1-7 0-10 2-4 2-7 1-10 0-3-1-6-1-9-1Z" fill="#D9B978"/>
      {/* Face */}
      <ellipse cx="24" cy="29" rx="10" ry="11" fill="#E9C28E"/>
      {/* Brow */}
      <rect x="17" y="26" width="6" height="1.6" rx="0.5" fill="#5A3F1F"/>
      <rect x="26" y="26" width="6" height="1.6" rx="0.5" fill="#5A3F1F"/>
      {/* Eyes */}
      <circle cx="20" cy="29.5" r="0.9" fill="#0E1116"/>
      <circle cx="29" cy="29.5" r="0.9" fill="#0E1116"/>
      {/* Mouth — pursed */}
      <path d="M21 35c1.5-1 4.5-1 6 0" stroke="#7A2E2E" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      {/* Tie */}
      <path d="M22 40l2 6 2-6-2-1Z" fill="#B22234"/>
    </svg>
  );
}

function PostCard({ result, dossier, mode, onModeChange, onTextEdit, editing, setEditing, onCopy, onExport, onRegen }) {
  const handle = mode === "X" ? "@realDonaldTrump" : "@realDonaldTrump";
  const platformLabel = mode === "X" ? "DR" : "TS";

  const [copied, setCopied] = useState(false);
  useEffect(() => { if (copied) { const t = setTimeout(() => setCopied(false), 1400); return () => clearTimeout(t); } }, [copied]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Mode switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Seg
          options={[{ value: "X", label: "Roster Post" }, { value: "TS", label: "Truthful Social" }]}
          value={mode}
          onChange={onModeChange}
        />
        <span className="t-stamp" style={{ color: "var(--ink-mute)" }}>
          PREVIEW · {result ? new Date(result.generatedAt).toLocaleTimeString() : "—"}
        </span>
      </div>

      {/* Card */}
      <div className="post-card" style={{ background: mode === "TS" ? "#FBF7EF" : "#fff" }}>
        {/* Parody watermark */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.04, fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: 96, transform: "rotate(-12deg)", letterSpacing: "-0.04em"
        }}>PARODY</div>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <ParodyAvatar size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <span style={{
                fontWeight: 700, fontSize: 15, color: "var(--ink)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
              }}>
                Donald J. Trump
              </span>
              <span style={{ color: mode === "TS" ? "#0E2238" : "#1d9bf0", flex: "0 0 auto" }}>
                <Icon name="verified" size={16} />
              </span>
              <span style={{ marginLeft: "auto", color: "var(--ink-mute)", flex: "0 0 auto" }}>
                <Icon name="more" size={16} />
              </span>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, color: "var(--ink-mute)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1
            }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{handle}</span>
              <span>·</span>
              <span>now</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-mute)", fontFamily: "var(--font-mono)", marginTop: 2,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {platformLabel} · for {dossier.name || "subject"} · seed #{result ? Math.abs(hashStr(result.text)).toString(36).slice(0,6) : "------"}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ marginTop: 12 }}>
          {result ? (
            editing ? (
              <textarea
                className="textarea"
                value={result.text}
                onChange={(e) => onTextEdit(e.target.value)}
                style={{ fontSize: 18, lineHeight: 1.4, minHeight: 100,
                  fontFamily: mode === "TS" ? "var(--font-display)" : "var(--font-ui)",
                  background: "var(--paper)" }}
              />
            ) : (
              <p style={{
                margin: 0, fontSize: 19, lineHeight: 1.4, color: "var(--ink)",
                fontFamily: mode === "TS" ? "var(--font-display)" : "var(--font-ui)",
                whiteSpace: "pre-wrap"
              }}>
                {result.text}
              </p>
            )
          ) : (
            <EmptyPostBody />
          )}
        </div>

        {/* Engagement row */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 16, paddingTop: 12, borderTop: "1px solid #EDE7DA",
          color: "var(--ink-mute)", fontSize: 12, fontFamily: "var(--font-mono)"
        }}>
          <EngageStat icon="reply" n="2.4K" />
          <EngageStat icon="repost" n="18.6K" />
          <EngageStat icon="heart" n="91.2K" />
          <EngageStat icon="view" n="4.1M" />
          <EngageStat icon="share" />
        </div>

        {/* Parody label */}
        <div style={{
          marginTop: 12, display: "flex", alignItems: "center", gap: 8,
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "var(--ink-mute)"
        }}>
          <Stamp tone="red">PARODY · NOT A REAL POST</Stamp>
          <span>satirical work · all content fictional</span>
        </div>
      </div>

      {/* Action toolbar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn" onClick={onRegen} disabled={!result}>
          <Icon name="regen" size={14}/> Regenerate
        </button>
        <button className="btn" onClick={() => setEditing(!editing)} disabled={!result}>
          <Icon name="stamp" size={14}/> {editing ? "Done editing" : "Edit text"}
        </button>
        <button className="btn" onClick={() => { onCopy(); setCopied(true); }} disabled={!result}>
          <Icon name="copy" size={14}/> {copied ? "Copied!" : "Copy text"}
        </button>
        <button className="btn btn--ink" onClick={onExport} disabled={!result}>
          <Icon name="download" size={14} color="#fff"/> Export
        </button>
      </div>
    </div>
  );
}

function EngageStat({ icon, n }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Icon name={icon} size={15} />
      {n && <span>{n}</span>}
    </span>
  );
}

function EmptyPostBody() {
  return (
    <div style={{
      padding: "24px 0", display: "flex", flexDirection: "column", gap: 8,
      color: "var(--ink-mute)"
    }}>
      <div style={{ height: 14, width: "92%", background: "var(--bone)", borderRadius: 3 }}/>
      <div style={{ height: 14, width: "78%", background: "var(--bone)", borderRadius: 3 }}/>
      <div style={{ height: 14, width: "55%", background: "var(--bone)", borderRadius: 3 }}/>
      <div className="t-meta" style={{ marginTop: 6 }}>
        Awaiting dossier intake. Fill the form and press Generate.
      </div>
    </div>
  );
}

function hashStr(s) {
  let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return h;
}

Object.assign(window, { PostCard });
