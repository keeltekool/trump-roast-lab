# Trump Roast Lab — Design Document

**Date:** 2026-04-30
**Updated:** 2026-05-01
**Status:** Approved
**Version:** 1.1

---

## 1. What It Is

Single-page satirical web app. User enters details about a friend → app searches 2,818 filtered Trump insult posts for matching patterns → feeds matches + dossier to Claude Opus 4.6 → generates an original Trump-style roast → renders as a pixel-perfect X/Twitter tweet card exportable as PNG for sharing on WhatsApp/Messenger/social media.

## 2. The Output — This Is The Product

The generated roast renders as an exact replica of an X/Twitter post screenshot. This is the critical deliverable — without a convincing tweet card, the app fails.

### Tweet Card Spec

- **Profile photo:** Trump's real profile image — `assets/trump-tweet-card/trump-profile.jpg` (400x400)
- **Name row:** "Donald J. Trump" · blue verified checkmark (`verified-badge.svg`) · @realDonaldTrump
- **Timestamp:** Realistic date (current date or user-selectable)
- **Tweet body:** Generated roast text, proper X typography (~15-16px, dark, system font stack matching X's actual rendering)
- **Engagement row:** Reply / Repost / Like / Bookmark / Share icons (`icon-*.svg`) with randomized realistic numbers (likes 2K-15K, reposts 100-500, replies 30-150)
- **Parody label:** Small subtle "PARODY / NOT A REAL POST" text below the card. Does NOT appear in the exported PNG.

**Reference screenshot:** `assets/trump-tweet-card/reference-tweet.png` — pixel-match this layout exactly.

### Live Preview Panel (CRITICAL — v1.1 addition)

The tweet card renders as a **live preview** inside the workspace, not as a secondary element. It is the dominant visual on the right panel.

- **"Tweet Preview" header** with **"LIVE TARGET"** status badge (pink/red, top-right)
- The tweet card is always visible — shows placeholder state when empty, live-updates when generated
- The preview IS the product — users see exactly what they'll share before exporting

### Action Buttons Row (below tweet card, inside the preview panel)

Three equally-weighted action buttons in a row, clearly visible:

| Button | Icon | Action |
|--------|------|--------|
| **REGENERATE** | Refresh/cycle icon | Generate a new roast with same dossier |
| **COPY TEXT** | Clipboard icon | Copy roast text to clipboard |
| **EXPORT IMAGE** | Download icon | Export tweet card as PNG (without parody label) |

### Social Share Buttons (below action buttons)

Direct share-to-platform buttons — the viral loop. Do NOT make users download → open app → attach manually.

- **WhatsApp** — opens WhatsApp with exported image via Web Share API or `whatsapp://send?` deep link
- **Facebook** — share dialog with image
- **X/Twitter** — compose tweet with text
- **Copy Link** — copy shareable link (if we add a share URL later, otherwise copy text)

Implementation: Use **Web Share API** (`navigator.share()`) as primary — it handles platform selection natively on mobile. Fall back to individual platform deep links on desktop.

### The WhatsApp Test

If you drop the exported PNG into a group chat, people should do a double-take before realizing it's fake. That's the bar.

## 3. The Input — Simplified Dossier

Left panel of a two-column layout:

| Field | Type | Required |
|---|---|---|
| Friend's name | Text input | Yes |
| Tell me about them | Freeform textarea | Yes |
| Inside jokes | Textarea | No |
| Quick tags | Clickable chips | No |
| Intensity | Slider 1-10 | Yes (default: 5) |

### Quick Tags (pre-built chips)
"fake genius", "low energy", "sports fraud", "coffee addict", "thinks he's tough", "bad dancer", "fashion disaster", "always late", "crybaby", "tiny country", "plays tennis", "bad hair", "talks too much", "loud chewer", "thinks he's funny", "amateur hour"

### What Was Cut (and why)
- Separate fields for location/job/hobbies/quirks/weakness → single freeform textarea. Claude extracts structure.
- Style modes (Playful/Brutal/Political/Sports/Media/Low Energy) → cut. Intensity slider + freeform text gives Claude enough signal.
- "Things to avoid" field → cut. v2 if needed.
- Style DNA panel → cut. Nobody analyzes linguistics of their joke.
- Archive Matches third column → cut. Demoted to optional collapsible under tweet card.
- X vs Truth Social mode toggle → cut. X-style only.
- File number on dossier → cut.

## 4. Data Flow

```
User fills dossier (name + freeform + tags + intensity)
    ↓
Client sends to API route: POST /api/generate
    ↓
Step 1: Keyword search against bundled 2,818 posts JSON
        Text overlap matching with dossier keywords → top 10-15 posts
    ↓
Step 2: Claude Opus 4.6 API call
        System prompt: parody Trump tweet generator instructions
        User message: matched posts + full dossier + intensity level
        → returns: generated roast text + nickname
    ↓
Client renders tweet card with text + randomized engagement numbers
    ↓
User clicks "Save as Image" → PNG export → shares on WhatsApp
```

## 5. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 | Standard, Vercel-native |
| Styling | Tailwind + tokens.css from design system | Assets already built |
| AI | Claude API, Opus 4.6 | Best style mimicry for roast quality |
| Data | Static JSON (2,818 posts baked at build time) | Dataset is historical, no runtime dependency |
| Image export | html2canvas or dom-to-image-more | PNG export of tweet card |
| Deployment | Vercel | Standard |
| Database | None | Not needed |
| Auth | None | Public app |

## 6. Claude Prompt Design

### System Prompt (core logic)
Instructs Claude to:
- Study provided real Trump post examples for style patterns
- Generate an ORIGINAL roast (never copy real posts verbatim)
- Use Trump's rhetorical signature: nicknames, ALL CAPS emphasis, repetition, exaggeration, exclamation stacking, "Many people are saying", parenthetical insults, signoff closers
- Create a unique nickname for the target based on their traits
- Scale intensity: 1-3 = mild dig, 4-6 = classic roast, 7-10 = nuclear
- Keep output tweet-length at low intensity (~280 chars), allow longer Truth Social-style posts at high intensity
- Incorporate inside jokes naturally if provided
- Never mention real political figures as targets — the roast is about the friend

### User Message Structure
```
Friend: {name}
Details: {freeform text + selected tags}
Inside jokes: {if provided}
Intensity: {1-10}

Reference Trump posts (style examples only):
{top 10-15 matched posts}
```

## 7. Design System

From UIUX_assets/ already in the project:

### Colors
- Page: `--ivory` #F4EFE6
- Cards: `--paper` #FBF7F0
- Primary action: `--red` #B22234 (Generate button)
- Authority: `--navy` #0E2238
- Accent: `--gold` #B8893A
- Text: `--ink` #0E1116

### Typography
- UI: Inter Tight
- Display: Newsreader (italic, for app title/headers)
- Mono: JetBrains Mono (metadata, labels)

### Components (from tokens.css)
- `.band` — section headers
- `.chip` — quick tags
- `.btn--primary` — Generate Roast button
- `.slider` — intensity control
- `.stamp` — PARODY label
- `.post-card` — tweet card base

### Tweet Card (separate from app design system)
The tweet card itself uses X/Twitter's actual design language — white background, system font stack (-apple-system, BlinkMacSystemFont, "Segoe UI"), real icon proportions, proper padding/spacing. This is intentionally different from the app's design system.

## 8. Layout

### Desktop (≥1024px)
Two columns:
- Left (440px): Dossier form
- Right (flex): Tweet card preview + action buttons

### Mobile (<1024px)
Single column stacked:
- Dossier form
- Tweet card below
- Sticky "Generate Roast" button at bottom

## 9. States

| State | What shows |
|---|---|
| Empty | Tweet card area shows placeholder: "Enter friend details and hit Generate" |
| Generating | Loading animation in tweet card area, "Searching 2,818 posts..." |
| Generated | Full tweet card with roast text, action buttons appear |
| Error | Inline error message, retry button |

## 10. Key Interactions

- **Generate Roast** — primary action, campaign red button in dossier panel
- **Regenerate** — action button below tweet card, generates new roast with same dossier
- **Copy Text** — action button below tweet card, copies roast text to clipboard
- **Export Image** — action button below tweet card, exports PNG (without parody label)
- **Social Share** — WhatsApp / Facebook / X buttons below action row, direct-share to platforms
- **Edit text** — click tweet text to edit inline before exporting
- **Ctrl+Enter** — keyboard shortcut to generate

### Asset Files (ready)

All tweet card visual assets are in `assets/trump-tweet-card/`:
- `trump-profile.jpg` — 400x400 profile photo
- `verified-badge.svg` — blue checkmark
- `icon-reply.svg`, `icon-repost.svg`, `icon-like.svg`, `icon-bookmark.svg`, `icon-share.svg` — engagement row icons
- `reference-tweet.png` — real X post screenshot for pixel-matching layout
- `x-logo.svg` — X platform logo

## 11. Data Source

- **Source:** Google Sheet `1R_-0DjkNCOdsOtXIbdZxgMez5nFBDG4ucW01eGLyO6U`, tab "Roast Posts"
- **Format:** CSV download → converted to JSON at build time
- **Records:** 2,818 filtered Trump insult/mockery posts (2024-04-30 to 2026-04-30)
- **Columns used:** `text`, `target`, `nickname`, `insult_type`, `rhetorical_moves`, `intensity`
- **Search fields:** `text` for keyword matching, `insult_type` + `intensity` for filtering

## 12. Project Location

- **Root:** `C:\Users\Kasutaja\Claude_Projects\trump-roast-lab\`
- **Assets:** `UIUX_assets/` (design system, component references)
- **Deployment:** Vercel via `vercel` CLI

## 13. Legal / Parody Hygiene

- App title: "Trump Roast Lab"
- Subtitle: "Turn friend facts into a parody Trump-style roast post"
- Visible PARODY · SATIRE stamp in the app UI
- Footer: "All output is fictional satire. Not affiliated with any platform or person."
- Parody label does NOT appear in exported PNG (the joke needs to land)
- Generated text is always original, never verbatim copies of real posts
