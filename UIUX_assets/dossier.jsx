/* global React */
/* ============================================================
   Dossier — left panel form.
   ============================================================ */

const QUICK_CHIPS = [];

const STYLES = [
  { value: "playful",   label: "Playful" },
  { value: "brutal",    label: "Brutal" },
  { value: "political", label: "Political" },
  { value: "sports",    label: "Sports" },
  { value: "media",     label: "Fake Media" },
  { value: "sleepy",    label: "Low Energy" }
];

function DossierPanel({ dossier, setDossier, onGenerate, generating }) {
  const set = (k) => (e) => setDossier({ ...dossier, [k]: e.target.value });
  const toggleChip = (c) => {
    const has = dossier.chips.includes(c);
    setDossier({ ...dossier, chips: has ? dossier.chips.filter(x => x !== c) : [...dossier.chips, c] });
  };

  return (
    <section className="panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Band num="01" title="Friend Dossier"
        right={<span className="t-stamp" style={{ color: "var(--red)", whiteSpace: "nowrap" }}>● INTAKE</span>} />

      <div className="classified-bar">
        <span>Classification</span>
        <span style={{ color: "var(--red)" }}>PARODY · INTERNAL USE</span>
        <span>File No. {dossier.fileNo}</span>
      </div>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16, overflow: "auto" }}>

        {/* Identity grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Subject Name" hint="First or full name. Required.">
            <input className="input" placeholder="e.g. Marcus Lindgren"
              value={dossier.name} onChange={set("name")} />
          </Field>
          <Field label="Location / City">
            <input className="input" placeholder="e.g. Tallinn, Estonia"
              value={dossier.location} onChange={set("location")} />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Job / Background">
            <input className="input" placeholder="e.g. mid-level project manager"
              value={dossier.job} onChange={set("job")} />
          </Field>
          <Field label="Hobbies / Sports">
            <input className="input" placeholder="e.g. tennis, vinyl collecting"
              value={dossier.hobbies} onChange={set("hobbies")} />
          </Field>
        </div>

        <Field label="Personality Quirks">
          <textarea className="textarea" rows={2}
            placeholder="Speaks in long monologues. Uses 'literally' constantly."
            value={dossier.quirks} onChange={set("quirks")} />
        </Field>

        <Field label="Weaknesses / Funny Traits">
          <textarea className="textarea" rows={2}
            placeholder="Can't reverse-park. Cries at sad commercials."
            value={dossier.weakness} onChange={set("weakness")} />
        </Field>

        <Field label="Inside Jokes">
          <textarea className="textarea" rows={2}
            placeholder='e.g. "the great chair incident of 2023"'
            value={dossier.insideJokes} onChange={set("insideJokes")} />
        </Field>

        <Field label="Things to Avoid"
          hint="Comma-separated. These will be redacted from output.">
          <input className="input" placeholder="weight, family, hairline"
            value={dossier.avoid} onChange={set("avoid")} />
        </Field>

        {/* Style mode */}
        <Field label="Style Mode">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STYLES.map(s => (
              <Chip key={s.value} on={dossier.style === s.value}
                onClick={() => setDossier({ ...dossier, style: s.value })}>
                {s.label}
              </Chip>
            ))}
          </div>
        </Field>

        {/* Intensity */}
        <Field label="Roast Intensity"
          right={<span className="t-meta">
            {dossier.intensity}/10 · {intensityLabel(dossier.intensity)}
          </span>}>
          <TickSlider
            value={dossier.intensity}
            onChange={(v) => setDossier({ ...dossier, intensity: v })}
            stamps={["mild","medium","spicy","scorched"]}
          />
        </Field>
      </div>

      {/* Sticky CTA */}
      <div style={{
        borderTop: "1px solid var(--rule)",
        padding: 14, display: "flex", gap: 10, alignItems: "center",
        background: "var(--bone)"
      }}>
        <button
          className="btn btn--primary btn--lg"
          style={{ flex: 1 }}
          onClick={onGenerate}
          disabled={generating || !dossier.name.trim()}
        >
          <Icon name="bolt" size={16} color="#fff" />
          {generating ? "Searching archive…" : "Generate Roast"}
        </button>
        <span className="t-meta" style={{ whiteSpace: "nowrap" }}>
          <span className="kbd">⌘</span>&nbsp;<span className="kbd">↵</span>
        </span>
      </div>
    </section>
  );
}

function intensityLabel(i) {
  if (i <= 2) return "warm-up";
  if (i <= 4) return "playful";
  if (i <= 6) return "spicy";
  if (i <= 8) return "brutal";
  return "scorched earth";
}

Object.assign(window, { DossierPanel });
