# Trump Roast Lab

Satirical Trump-style roast tweet generator. Users enter friend details, app searches 2,808 filtered Trump insult posts, Claude generates an original parody roast, rendered as a pixel-perfect X/Twitter tweet card exportable as PNG.

**Live:** https://trump-roast-lab.vercel.app
**Repo:** https://github.com/keeltekool/trump-roast-lab
**Last updated:** 2026-05-01

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 |
| Styling | Tailwind CSS + custom design tokens (ivory/navy/red/gold) |
| AI | Claude API (Opus 4) via @anthropic-ai/sdk |
| Data | Static JSON — 2,808 filtered Trump posts bundled at build time |
| Image export | html2canvas |
| Hosting | Vercel |
| Database | None |
| Auth | None |

## Services

| Service | Purpose | Env Var |
|---------|---------|---------|
| Claude API | Roast text generation | `ANTHROPIC_API_KEY` |

## Features

- Dossier form: name, freeform details, inside jokes, intensity slider (1-10)
- Keyword search across 2,808 Trump insult posts for style matching
- Claude Opus 4 generates original Trump-style roast with nickname, ALL CAPS, signoffs
- Pixel-perfect X/Twitter tweet card with profile photo, verified badge, engagement numbers
- PNG export (parody label excluded from export)
- Social sharing: native Web Share API, WhatsApp, X deep links
- Inline text editing before export
- Regenerate with same dossier
- Mobile responsive (single-column stack)

## Data Source

- Google Sheet: `1R_-0DjkNCOdsOtXIbdZxgMez5nFBDG4ucW01eGLyO6U` (Roast Posts tab)
- Original full archive: `1gR1DFTyXac_rEpN_0tEmmeGvsRHt0CaVZYmSWpWWj1Q` (16,180 posts)
- Build script: `scripts/build-dataset.mjs` (uses gws CLI to fetch from Sheets)
- Dataset is static/historical — no runtime Google Sheets dependency

## Gotchas

- Claude Opus 4.6 model IDs not available on all API keys — using `claude-opus-4-20250514`
- Google Sheets CSV export URL returns 401 for this sheet — must use `gws` CLI for data fetching
- html2canvas requires `useCORS: true` for the Trump profile image
