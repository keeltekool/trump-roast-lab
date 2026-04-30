# Donald J Roster — Implementation Guide

**Version:** 0.4.0
**Status:** Parody / satire prototype. All output is fictional.

---

## What's in this package

```
/
├── index.html                  ← Landing / entry point
├── Trump Roast Lab.html        ← The interactive prototype
├── design-system.html          ← Full design system showcase
├── tokens.css                  ← All design tokens + base components (CSS)
├── corpus.js                   ← Synthetic parody-pattern archive (20 entries)
├── engine.js                   ← Roast generator + scoring engine
├── ui.jsx                      ← Shared UI atoms (Band, Chip, Seg, Icon, etc.)
├── dossier.jsx                 ← Left-panel "Friend Dossier" form
├── postcard.jsx                ← Parody social post card (the live preview)
├── archive.jsx                 ← Archive Matches drawer + Style DNA panel
├── app.jsx                     ← React app shell (top bar, grid, footer)
├── tweaks-panel.jsx            ← (Optional) tweaks shell
└── IMPLEMENTATION.md           ← This file
```

---

## How to run it (zero-setup)

It's pure static HTML + Babel-in-the-browser. **Just open `index.html` in any modern browser.** No build step, no npm, no server required. For local development, you can also serve the folder with any static server:

```
# Python
python -m http.server 8080
# Node
npx serve .
```

Then visit `http://localhost:8080`.

---

## Architecture

### Three layers
1. **Tokens layer** — `tokens.css` defines every color, font, radius, spacing, shadow, and base component class (`.btn`, `.chip`, `.seg`, `.input`, `.panel`, `.band`, `.classified-bar`, `.stamp`, `.post-card`, `.placeholder-stripe`).
2. **Logic layer** — `corpus.js` (data) + `engine.js` (`window.RoastEngine.generate(dossier)` and `scoreCorpus`).
3. **View layer** — React JSX files compiled in-browser by Babel standalone.

### Data flow
```
DossierPanel (form)
   └─ onGenerate ──► RoastEngine.generate(dossier)
                              │
                              ├─► scoreCorpus(dossier, 5)   → top matches
                              ├─► nickname + theme hooks    → text assembly
                              └─► computeDNA(text)          → pattern percentages

  result = { text, nickname, matches, dna, style, intensity, generatedAt }

App state: { dossier, result, scanning, error, mode, editing }
```

---

## Design system — quick reference

### Colors (oklch-clean ivory ground + 3 accents)
| Token | Hex | Use |
|---|---|---|
| `--ivory` | `#F4EFE6` | Page background |
| `--paper` | `#FBF7F0` | Card surface |
| `--bone`  | `#ECE6D7` | Section bands, secondary fill |
| `--ink`   | `#0E1116` | Primary text + ink button |
| `--navy`  | `#0E2238` | Authority marks |
| `--red`   | `#B22234` | Primary action, parody stamps |
| `--gold`  | `#B8893A` | Single-use accent |
| `--rule`  | `#1F2733` | Hairline borders |

**Discipline:** Ivory + ink for ~90% of surface. Red is reserved for primary action and parody stamps. Gold is single-use — never two golds in one band.

### Type pairing (all from Google Fonts)
- **Newsreader** (italic) — display, parody display moments
- **Inter Tight** — UI, body
- **JetBrains Mono** — metadata, archive snippets, lab diagnostics

Mono is reserved for metadata. Sans is reserved for UI. Display italic is reserved for parody display moments only.

### Component vocabulary
- **`.band`** — section header band with mono number, uppercase title, hairline rule, and right-slot
- **`.classified-bar`** — diagonal-stripe ribbon for parody/legal labels
- **`.stamp`** — rotated rubber-stamp pill in red/navy/gold
- **`.chip`** — pill toggle for tags and style modes
- **`.seg`** — segmented control
- **`.post-card`** — original parody social-post chrome
- **`.placeholder-stripe`** — dashed striped placeholder for missing imagery

See `design-system.html` for live examples of every component.

---

## Customizing

### Change the corpus
Edit `corpus.js`. Each entry is shaped like:
```js
{ id, date, channel: "TS"|"X", text, tags: [...], dna: ["NICKNAME","REPETITION",...] }
```
The generator scores corpus entries against the dossier's blob of free text + style-mode tags + intensity preference. Higher tag overlap → higher rank. Top 5 are shown in the Archive Matches drawer.

### Tweak the generator voice
`engine.js` exposes:
- `NICKNAMES` — per-style mode (`playful`, `brutal`, `political`, `sports`, `media`, `sleepy`)
- `SIGNOFFS` — closers per style mode
- `REPEATERS` — interjection phrases
- `EXAGGERATIONS` — superlative phrases
- `THEME_HOOKS` — `{hobby}`, `{job}`, `{location}`, `{quirk}`, `{weakness}` template fragments

Intensity (1–10) controls: number of theme hooks used, whether all-caps bursts fire (≥7), whether a repeater line fires (≥5).

### Swap to a real archive
Replace `window.CORPUS` in `corpus.js` with your real dataset. Keep the schema (`text`, `tags`, `dna`). The 16,180-post counter in the top-bar is a string in `app.jsx` (`Archive · 16,180 posts · …`) — update both places.

### Add a new style mode
1. Add a key to `NICKNAMES`, `SIGNOFFS`, and `styleMap` in `engine.js`.
2. Add an entry to the `STYLES` array in `dossier.jsx`.

### Add a new dossier field
1. Add the key to `DEFAULT_DOSSIER` in `app.jsx`.
2. Add a `<Field>` block in `dossier.jsx`.
3. Reference it in `engine.js` (either in `scoreCorpus`'s blob or as a new theme hook).

---

## Wiring into a real builder / app

If you're moving this into a framework (Next.js, Vite + React, etc.), here's the lift:

1. **CSS** — copy `tokens.css` into your global stylesheet. The class names are framework-agnostic.
2. **Engine** — `engine.js` and `corpus.js` are vanilla. Convert to ES modules:
   ```js
   // engine.js
   export const RoastEngine = { generate, scoreCorpus };
   ```
   and import it into your component instead of relying on `window.RoastEngine`.
3. **Components** — the JSX files use `Object.assign(window, {...})` to share components across `<script>` tags. In a real bundler, replace those with `export` statements:
   ```js
   export { Band, Field, Chip, Seg, Icon };
   ```
4. **Fonts** — add the Google Fonts `<link>` from the HTML `<head>` to your app's root layout.
5. **Drop the Babel script tags** — your bundler handles JSX.

---

## Parody / legal hygiene

- The avatar is **original line art** (see `ParodyAvatar` in `postcard.jsx`).
- Platform chrome is **original** — wordmark "D·R Roast Lab", labels "Roster Post" / "Truthful Social". Verified-check icon is hand-drawn, not the real one.
- Every output surface carries a visible `PARODY · NOT A REAL POST` stamp.
- Footer reads: "All output is fictional satire · Not affiliated with any platform or person".
- The "Things to Avoid" field redacts banned terms from generated output.

Keep these guards in any fork.

---

## Keyboard shortcuts
- **⌘↵ / Ctrl+↵** — Generate roast

---

## States implemented
- **Empty** — landing state with placeholder body
- **Loading / scanning** — animated scan bar, "Cross-referencing dossier…" message
- **Generated** — full post, Style DNA bars filled, archive matches scored
- **Error** — "FAULT" stamp banner with dismiss
- **Editing** — inline textarea swap inside the post card
- **Mode switch** — Roster Post (sans body) ↔ Truthful Social (serif body, paper tint)
- **Export flash** — toast confirming export (demo)

---

## Responsive

- **≥1180px** — 3-column grid (dossier · preview · archive)
- **800–1180px** — 2-column, archive flows below full-width
- **<800px** — single column stack

---

That's the package. Open `Trump Roast Lab.html` to use it, `design-system.html` to reference the kit, and edit any of the JSX/CSS/JS files in place — no build step.
