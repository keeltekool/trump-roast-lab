/* global React */
/* ============================================================
   Small shared UI atoms used across the prototype.
   ============================================================ */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/** Hairline section band header. */
function Band({ num, title, right }) {
  return (
    <div className="band">
      <span className="band__num">{num}</span>
      <span className="band__title">{title}</span>
      <span className="band__rule" />
      {right}
    </div>
  );
}

/** Field row with mono uppercase label. */
function Field({ label, hint, right, children }) {
  return (
    <div className="field">
      <div className="field__label">
        <span>{label}</span>
        {right}
      </div>
      {children}
      {hint && <div className="field__hint">{hint}</div>}
    </div>
  );
}

/** Chip toggle. */
function Chip({ on, gold, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={"chip" + (on ? " chip--on" : "") + (gold ? " chip--gold" : "")}
    >
      {children}
    </button>
  );
}

/** Segmented control. */
function Seg({ options, value, onChange }) {
  return (
    <div className="seg" role="tablist">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          className={"seg__btn" + (value === o.value ? " seg__btn--on" : "")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Slider with tick rail and numeric stamp. */
function TickSlider({ value, min = 1, max = 10, onChange, stamps }) {
  return (
    <div className="slider-wrap">
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-mute)",
        letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2
      }}>
        {(stamps || ["mild","medium","spicy","scorched"]).map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
    </div>
  );
}

/** Stamp / classification pill. */
function Stamp({ tone = "red", children }) {
  return <span className={"stamp stamp--" + tone}>{children}</span>;
}

/** Generic icon (inline svg) — minimal stroke. */
function Icon({ name, size = 16, strokeWidth = 1.6, color = "currentColor" }) {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round"
  };
  switch (name) {
    case "reply":   return <svg {...props}><path d="M3 12a8 8 0 0 1 8-8h2a8 8 0 0 1 0 16H8l-5 4v-4Z"/></svg>;
    case "repost":  return <svg {...props}><path d="M4 7h12l-3-3M20 17H8l3 3"/></svg>;
    case "heart":   return <svg {...props}><path d="M12 21s-7-4.6-9.3-9.1C1 8.5 3 5 6.6 5c2 0 3.5 1 5.4 3.2C13.9 6 15.4 5 17.4 5c3.6 0 5.6 3.5 3.9 6.9C19 16.4 12 21 12 21Z"/></svg>;
    case "share":   return <svg {...props}><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6M16 6l-4-4-4 4M12 2v14"/></svg>;
    case "view":    return <svg {...props}><path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "verified":return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.4 14 4l2.5-.4L17 6l2 1.5-1 2.4 1 2.4-2 1.5-.5 2.4L16 16l-2 1.6-2-1.6-2.5.4L9 14l-2-1.5 1-2.4-1-2.4 2-1.5.5-2.4L10 4l2-1.6Z"/>
        <path d="m9.5 12 1.7 1.7L15 10" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case "more":    return <svg {...props}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>;
    case "regen":   return <svg {...props}><path d="M3 12a9 9 0 0 1 15.5-6.3M21 12a9 9 0 0 1-15.5 6.3M21 4v5h-5M3 20v-5h5"/></svg>;
    case "copy":    return <svg {...props}><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>;
    case "download":return <svg {...props}><path d="M12 3v12M6 11l6 6 6-6M4 21h16"/></svg>;
    case "bolt":    return <svg {...props}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>;
    case "shuffle": return <svg {...props}><path d="M3 6h4l10 12h4M3 18h4l3-3.5M14 9.5 17 6h4M17 3l4 3-4 3M17 15l4 3-4 3"/></svg>;
    case "search":  return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "x":       return <svg {...props}><path d="M5 5l14 14M19 5 5 19"/></svg>;
    case "info":    return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>;
    case "lock":    return <svg {...props}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
    case "spark":   return <svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>;
    case "stamp":   return <svg {...props}><rect x="4" y="14" width="16" height="6" rx="1"/><path d="M9 14V8a3 3 0 0 1 6 0v6"/></svg>;
    default: return null;
  }
}

/** Loading bar (deterministic) */
function ScanBar({ active }) {
  return (
    <div style={{
      height: 3, width: "100%", background: "var(--bone)", overflow: "hidden",
      borderRadius: 2, position: "relative"
    }}>
      <div style={{
        position: "absolute", height: "100%",
        width: active ? "40%" : "0%",
        background: "var(--red)",
        animation: active ? "scan 1.4s infinite ease-in-out" : "none"
      }} />
      <style>{`
        @keyframes scan {
          0%   { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { Band, Field, Chip, Seg, TickSlider, Stamp, Icon, ScanBar });
