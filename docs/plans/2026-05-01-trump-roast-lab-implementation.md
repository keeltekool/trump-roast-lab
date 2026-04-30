# Trump Roast Lab — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a satirical Trump-style roast tweet generator that takes friend details, searches a 2,818-post archive for matching insult patterns, generates an original roast via Claude Opus 4.6, and renders a pixel-perfect X/Twitter tweet card exportable as PNG.

**Architecture:** Next.js 16 single-page app with two-column layout. Static JSON dataset bundled at build time. One API route (`/api/generate`) handles keyword search + Claude API call. Client renders the tweet card and exports via html2canvas. No database, no auth.

**Tech Stack:** Next.js 16, Tailwind CSS, Claude API (Opus 4.6), html2canvas, Vercel

**Design doc:** `docs/plans/2026-04-30-trump-roast-lab-design.md`
**Design system assets:** `UIUX_assets/` (tokens.css, component JSX references)

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.js`, `tsconfig.json`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.env.local` (placeholder for API key)
- Create: `.gitignore`

**Step 1: Initialize Next.js 16 with Tailwind**

```bash
cd C:/Users/Kasutaja/Claude_Projects/trump-roast-lab
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --yes
```

If the folder is non-empty, move `UIUX_assets/` and `docs/` aside temporarily, scaffold, then move them back.

**Step 2: Configure Tailwind with design system tokens**

Extend `tailwind.config.js` with the design system colors from `UIUX_assets/tokens.css`:

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F4EFE6",
        paper: "#FBF7F0",
        bone: "#ECE6D7",
        ink: { DEFAULT: "#0E1116", soft: "#2A2F38", mute: "#6A6A66" },
        navy: { DEFAULT: "#0E2238", deep: "#081626" },
        red: { DEFAULT: "#B22234", deep: "#8E1A28" },
        gold: { DEFAULT: "#B8893A", soft: "#D9B978" },
        rule: "#1F2733",
        "line-warm": "#D8CFB8",
      },
      fontFamily: {
        ui: ['"Inter Tight"', '"Inter"', "system-ui", "sans-serif"],
        display: ['"Newsreader"', '"Georgia"', "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
```

**Step 3: Set up globals.css with Google Fonts + base tokens**

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Newsreader:ital,wght@1,400;1,600;1,700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: #F4EFE6;
  color: #0E1116;
  font-family: "Inter Tight", "Inter", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

**Step 4: Create .env.local placeholder**

```
ANTHROPIC_API_KEY=your-key-here
```

**Step 5: Create .gitignore entries**

Ensure `.env.local`, `node_modules/`, `.next/` are ignored.

**Step 6: Verify dev server starts**

```bash
npm run dev
```

Visit `http://localhost:3000` — should show default Next.js page with ivory background.

**Step 7: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 16 project with Tailwind and design tokens"
```

---

## Task 2: Download and Bundle Dataset

**Files:**
- Create: `scripts/build-dataset.mjs`
- Create: `src/data/roast-posts.json`

**Step 1: Write build script that downloads CSV from Google Sheets and converts to JSON**

```js
// scripts/build-dataset.mjs
import fs from "fs";
import path from "path";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1R_-0DjkNCOdsOtXIbdZxgMez5nFBDG4ucW01eGLyO6U/gviz/tq?tqx=out:csv&sheet=Roast%20Posts";

async function main() {
  console.log("Fetching roast posts CSV...");
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const csv = await res.text();

  const lines = parseCSV(csv);
  const headers = lines[0];
  const rows = lines.slice(1);

  // Find column indices we need
  const idx = (name) => {
    const i = headers.findIndex(
      (h) => h.toLowerCase().trim() === name.toLowerCase()
    );
    if (i === -1) throw new Error(`Column "${name}" not found. Headers: ${headers.join(", ")}`);
    return i;
  };

  const posts = rows
    .map((row) => ({
      id: row[idx("id")],
      date: row[idx("date")],
      text: row[idx("text")],
      platform: row[idx("platform")],
      target: row[idx("target")] || "",
      nickname: row[idx("nickname")] || "",
      insult_type: row[idx("insult_type")] || "",
      rhetorical_moves: row[idx("rhetorical_moves")] || "",
      intensity: parseInt(row[idx("intensity")] || "3", 10),
    }))
    .filter((p) => p.text && p.text.trim().length > 20);

  const outPath = path.join(process.cwd(), "src", "data", "roast-posts.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(posts, null, 0));
  console.log(`Wrote ${posts.length} posts to ${outPath}`);
}

// Simple CSV parser that handles quoted fields with commas/newlines
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else {
        field += ch;
      }
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

**Step 2: Run the build script**

```bash
node scripts/build-dataset.mjs
```

Expected: `Wrote ~2818 posts to src/data/roast-posts.json`

**Step 3: Verify the JSON**

```bash
node -e "const d = require('./src/data/roast-posts.json'); console.log('Posts:', d.length); console.log('Sample:', JSON.stringify(d[0], null, 2))"
```

Expected: ~2818 posts, each with `id`, `date`, `text`, `target`, `nickname`, `insult_type`, `rhetorical_moves`, `intensity`.

**Step 4: Add dataset build to package.json scripts**

```json
"scripts": {
  "build:data": "node scripts/build-dataset.mjs",
  "prebuild": "node scripts/build-dataset.mjs"
}
```

**Step 5: Commit**

```bash
git add scripts/build-dataset.mjs src/data/roast-posts.json package.json
git commit -m "feat: add dataset build script, bundle 2818 roast posts as JSON"
```

---

## Task 3: Search Engine

**Files:**
- Create: `src/lib/search.ts`

**Step 1: Build keyword search function**

```ts
// src/lib/search.ts
import posts from "@/data/roast-posts.json";

export interface RoastPost {
  id: string;
  date: string;
  text: string;
  platform: string;
  target: string;
  nickname: string;
  insult_type: string;
  rhetorical_moves: string;
  intensity: number;
}

const allPosts = posts as RoastPost[];

export function searchPosts(
  keywords: string,
  tags: string[],
  intensity: number,
  limit = 15
): RoastPost[] {
  const terms = keywords
    .toLowerCase()
    .split(/[\s,;.!?]+/)
    .filter((t) => t.length > 2);

  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  const scored = allPosts.map((post) => {
    let score = 0;
    const textLower = post.text.toLowerCase();
    const typeLower = post.insult_type.toLowerCase();

    // Keyword hits in post text
    for (const term of terms) {
      if (textLower.includes(term)) score += 3;
    }

    // Tag overlap with insult_type
    for (const tag of tagSet) {
      if (typeLower.includes(tag.replace(/\s+/g, "-"))) score += 2;
      if (textLower.includes(tag)) score += 1;
    }

    // Intensity proximity bonus
    const intDiff = Math.abs(post.intensity - intensity);
    score += Math.max(0, 3 - intDiff);

    // Small random noise for variety on regenerate
    score += Math.random() * 0.8;

    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}
```

**Step 2: Verify import works**

```bash
npx tsx -e "import { searchPosts } from './src/lib/search'; const r = searchPosts('tennis sports loser', ['sports fraud'], 7, 5); console.log(r.length, r[0]?.text?.slice(0, 80))"
```

Expected: 5 results, first one should be sports/loser related.

**Step 3: Commit**

```bash
git add src/lib/search.ts
git commit -m "feat: add keyword search engine for roast post matching"
```

---

## Task 4: Claude API Route

**Files:**
- Create: `src/app/api/generate/route.ts`
- Create: `src/lib/prompt.ts`

**Step 1: Create the system prompt**

```ts
// src/lib/prompt.ts
export const SYSTEM_PROMPT = `You are a parody Trump-style roast tweet generator. Your job is to write a single, original, fictional satirical tweet that sounds exactly like Donald J. Trump mocking someone.

VOICE RULES:
- Write in first person as Trump
- Use Trump's exact rhetorical patterns: ALL CAPS for emphasis, exclamation marks, repetition, hyperbole
- Create a unique insulting nickname for the target (like "Sleepy Joe", "Crooked Hillary", "Lyin' Ted")
- Use signature phrases: "Many people are saying", "Believe me", "Nobody knows more about X than me", "SAD!", "PATHETIC!", "Thank you for your attention to this matter!"
- Use parenthetical asides to add extra insults: "(which is a total disaster!)"
- End with a Trump-style signoff
- Reference specific details from the friend dossier — their job, hobbies, location, quirks
- Weave in inside jokes if provided, as if Trump somehow knows about them
- The tone should be funny and absurd, not genuinely hurtful

INTENSITY SCALE:
- 1-3: Light teasing, backhanded compliments, gentle nickname
- 4-6: Classic Trump roast — clear insults but still funny
- 7-10: Full nuclear — ALL CAPS bursts, multiple insults, relentless

LENGTH:
- Intensity 1-5: Keep it tweet-length (~280 characters)
- Intensity 6-8: Can go longer, up to 500 characters
- Intensity 9-10: Full Truth Social rant, up to 800 characters

OUTPUT FORMAT:
Return ONLY the tweet text. No quotes, no prefix, no explanation. Just the raw tweet as Trump would post it.

IMPORTANT: Never copy real posts verbatim. Use the reference posts for STYLE ONLY — cadence, structure, rhetorical moves. The content must be original and about the target person.`;

export function buildUserMessage(
  name: string,
  details: string,
  insideJokes: string,
  tags: string[],
  intensity: number,
  matchedPosts: string[]
): string {
  let msg = \`TARGET FRIEND: \${name}
DETAILS: \${details}
\${tags.length ? \`TAGS: \${tags.join(", ")}\` : ""}
\${insideJokes ? \`INSIDE JOKES: \${insideJokes}\` : ""}
INTENSITY: \${intensity}/10

REFERENCE TRUMP POSTS (style examples only — do NOT copy these, use them for voice/cadence):
\`;
  for (let i = 0; i < matchedPosts.length; i++) {
    msg += \`\n[\${i + 1}] \${matchedPosts[i]}\`;
  }
  return msg;
}
```

**Step 2: Create the API route**

```ts
// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchPosts } from "@/lib/search";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/prompt";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, details, insideJokes, tags, intensity } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Search archive for matching posts
    const searchQuery = [name, details, insideJokes, ...(tags || [])].join(" ");
    const matches = searchPosts(searchQuery, tags || [], intensity || 5, 15);
    const matchedTexts = matches.map((m) => m.text);

    // Call Claude Opus 4.6
    const message = await anthropic.messages.create({
      model: "claude-opus-4-6-20250530",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserMessage(
            name,
            details || "",
            insideJokes || "",
            tags || [],
            intensity || 5,
            matchedTexts
          ),
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      text,
      matches: matches.slice(0, 5).map((m) => ({
        text: m.text.slice(0, 200),
        nickname: m.nickname,
        insult_type: m.insult_type,
      })),
    });
  } catch (err: unknown) {
    console.error("Generate error:", err);
    const errorMessage = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
```

**Step 3: Install Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

**Step 4: Commit**

```bash
git add src/lib/prompt.ts src/app/api/generate/route.ts
git commit -m "feat: add Claude API route with search + prompt construction"
```

---

## Task 5: Tweet Card Component (THE PRODUCT)

**Files:**
- Create: `src/components/TweetCard.tsx`

This is the most critical component. It must pixel-perfectly replicate an X/Twitter post.

**Step 1: Build the TweetCard component**

```tsx
// src/components/TweetCard.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface TweetCardProps {
  text: string;
  onTextChange?: (text: string) => void;
  editable?: boolean;
}

function randomEngagement() {
  return {
    replies: Math.floor(30 + Math.random() * 120),
    reposts: Math.floor(100 + Math.random() * 400),
    likes: Math.floor(2000 + Math.random() * 13000),
  };
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function formatDate(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${h12}:${m} ${ampm} · ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

export default function TweetCard({ text, onTextChange, editable = false }: TweetCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [engagement] = useState(randomEngagement);

  const handleExport = async () => {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = "trump-roast.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div>
      {/* The exportable card — ref captures only this div */}
      <div
        ref={cardRef}
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #CFD9DE",
          padding: "16px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          maxWidth: 598,
          width: "100%",
        }}
      >
        {/* Header row: avatar + name + handle */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <img
            src="/trump-profile.jpg"
            alt=""
            style={{ width: 48, height: 48, borderRadius: "50%" }}
          />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#0F1419" }}>
                Donald J. Trump
              </span>
              {/* Blue verified checkmark — inline SVG */}
              <svg viewBox="0 0 22 22" width={18} height={18} style={{ flexShrink: 0 }}>
                <path
                  d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.144.271.587.703 1.087 1.24 1.443s1.167.554 1.813.571c.646-.017 1.276-.215 1.817-.571s.972-.856 1.245-1.443c.607.227 1.264.274 1.897.144.634-.131 1.218-.437 1.687-.883.445-.469.75-1.054.882-1.69.13-.633.083-1.29-.14-1.896.587-.273 1.084-.705 1.438-1.245.355-.54.553-1.17.57-1.817z"
                  fill="#1D9BF0"
                />
                <path
                  d="M9.585 14.929l-3.28-3.28 1.168-1.168 2.112 2.112 4.716-4.716 1.168 1.168z"
                  fill="#fff"
                />
              </svg>
            </div>
            <span style={{ fontSize: 15, color: "#536471" }}>@realDonaldTrump</span>
          </div>
        </div>

        {/* Tweet text */}
        {editing ? (
          <textarea
            value={text}
            onChange={(e) => onTextChange?.(e.target.value)}
            onBlur={() => setEditing(false)}
            autoFocus
            style={{
              width: "100%",
              minHeight: 80,
              fontSize: 15,
              lineHeight: "20px",
              color: "#0F1419",
              border: "1px solid #CFD9DE",
              borderRadius: 4,
              padding: 8,
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
        ) : (
          <div
            onClick={() => editable && setEditing(true)}
            style={{
              fontSize: 15,
              lineHeight: "20px",
              color: "#0F1419",
              whiteSpace: "pre-wrap",
              cursor: editable ? "text" : "default",
              marginBottom: 12,
            }}
          >
            {text}
          </div>
        )}

        {/* Timestamp */}
        <div style={{ fontSize: 15, color: "#536471", marginBottom: 12 }}>
          {formatDate()}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #EFF3F4", marginBottom: 12 }} />

        {/* Engagement row */}
        <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 425 }}>
          <EngagementBtn icon="reply" count={engagement.replies} />
          <EngagementBtn icon="repost" count={engagement.reposts} />
          <EngagementBtn icon="like" count={engagement.likes} />
          <EngagementBtn icon="bookmark" />
          <EngagementBtn icon="share" />
        </div>
      </div>

      {/* Parody label — OUTSIDE the export ref */}
      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "#6A6A66",
          marginTop: 8,
          fontFamily: '"JetBrains Mono", monospace',
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        PARODY · NOT A REAL POST · FOR ENTERTAINMENT ONLY
      </p>

      {/* Action buttons — OUTSIDE the export ref */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
        <button onClick={handleExport} className="btn btn--primary">
          Save as Image
        </button>
        <button onClick={handleCopy} className="btn btn--ghost">
          Copy Text
        </button>
      </div>
    </div>
  );
}

function EngagementBtn({ icon, count }: { icon: string; count?: number }) {
  const icons: Record<string, JSX.Element> = {
    reply: (
      <svg viewBox="0 0 24 24" width={18.75} height={18.75}>
        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.893 4.306-2.394 5.793l-5.85 5.78c-.279.279-.732.279-1.011 0l-5.85-5.78A8.072 8.072 0 011.751 10zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 1.627.647 3.19 1.8 4.34l5.45 5.36 5.45-5.37A6.072 6.072 0 0018.25 10.13c0-3.39-2.74-6.13-6.129-6.13H9.756z" fill="#536471"/>
      </svg>
    ),
    repost: (
      <svg viewBox="0 0 24 24" width={18.75} height={18.75}>
        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" fill="#536471"/>
      </svg>
    ),
    like: (
      <svg viewBox="0 0 24 24" width={18.75} height={18.75}>
        <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" fill="#536471"/>
      </svg>
    ),
    bookmark: (
      <svg viewBox="0 0 24 24" width={18.75} height={18.75}>
        <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" fill="#536471"/>
      </svg>
    ),
    share: (
      <svg viewBox="0 0 24 24" width={18.75} height={18.75}>
        <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" fill="#536471"/>
      </svg>
    ),
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#536471", fontSize: 13 }}>
      {icons[icon]}
      {count != null && <span>{formatCount(count)}</span>}
    </div>
  );
}
```

**Step 2: Add Trump profile image**

Place the Trump profile image at `public/trump-profile.jpg`. This will come from the assets folder prepared by the other AI, or download directly.

**Step 3: Install html2canvas**

```bash
npm install html2canvas
```

**Step 4: Verify component renders**

Import into `page.tsx` temporarily with hardcoded text to verify layout matches a real tweet screenshot. Compare against `UIUX_assets/uploads/pasted-1777581561023-0.png` and the reference tweet screenshot in `assets/trump-tweet-card/`.

**Step 5: Commit**

```bash
git add src/components/TweetCard.tsx public/trump-profile.jpg
git commit -m "feat: add pixel-perfect X/Twitter tweet card component with PNG export"
```

---

## Task 6: Dossier Form Component

**Files:**
- Create: `src/components/DossierForm.tsx`

**Step 1: Build the dossier form**

```tsx
// src/components/DossierForm.tsx
"use client";

import { useState } from "react";

const QUICK_TAGS = [
  "fake genius", "low energy", "sports fraud", "coffee addict",
  "thinks he's tough", "bad dancer", "fashion disaster", "always late",
  "crybaby", "tiny country", "plays tennis", "bad hair",
  "talks too much", "loud chewer", "thinks he's funny", "amateur hour",
];

interface Dossier {
  name: string;
  details: string;
  insideJokes: string;
  tags: string[];
  intensity: number;
}

interface DossierFormProps {
  onGenerate: (dossier: Dossier) => void;
  generating: boolean;
  hasResult: boolean;
  onRegenerate: () => void;
}

export default function DossierForm({
  onGenerate,
  generating,
  hasResult,
  onRegenerate,
}: DossierFormProps) {
  const [dossier, setDossier] = useState<Dossier>({
    name: "",
    details: "",
    insideJokes: "",
    tags: [],
    intensity: 5,
  });

  const toggleTag = (tag: string) => {
    setDossier((d) => ({
      ...d,
      tags: d.tags.includes(tag)
        ? d.tags.filter((t) => t !== tag)
        : [...d.tags, tag],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(dossier);
  };

  const intensityLabel = (v: number) => {
    if (v <= 3) return "Mild Dig";
    if (v <= 6) return "Classic Roast";
    if (v <= 8) return "Brutal";
    return "Nuclear";
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-3 border-b border-rule">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink bg-paper border border-rule px-1.5 py-0.5 rounded-sm">
          01
        </span>
        <span className="text-[13px] font-semibold tracking-wide uppercase">
          Friend Dossier
        </span>
        <span className="flex-1 h-px bg-rule/40" />
      </div>

      {/* Name */}
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ink-soft font-semibold">
          Friend's Name
        </span>
        <input
          type="text"
          required
          placeholder="e.g. Mart Roosma"
          value={dossier.name}
          onChange={(e) => setDossier((d) => ({ ...d, name: e.target.value }))}
          className="w-full bg-paper border border-rule rounded px-3 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-[3px] focus:ring-ink/8"
        />
      </label>

      {/* Details */}
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ink-soft font-semibold">
          Tell Me About Them
        </span>
        <textarea
          required
          rows={4}
          placeholder="Works in finance, plays tennis badly, from Tallinn, thinks he's tough, covers volleyball for the local paper..."
          value={dossier.details}
          onChange={(e) =>
            setDossier((d) => ({ ...d, details: e.target.value }))
          }
          className="w-full bg-paper border border-rule rounded px-3 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-[3px] focus:ring-ink/8 resize-y min-h-[80px]"
        />
        <span className="font-mono text-[11.5px] text-ink-mute">
          Job, hobbies, location, quirks, weaknesses — anything Trump can use.
        </span>
      </label>

      {/* Inside jokes */}
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ink-soft font-semibold">
          Inside Jokes
          <span className="ml-2 text-ink-mute font-normal">(optional)</span>
        </span>
        <textarea
          rows={2}
          placeholder="That time he fell off the boat, the pizza incident..."
          value={dossier.insideJokes}
          onChange={(e) =>
            setDossier((d) => ({ ...d, insideJokes: e.target.value }))
          }
          className="w-full bg-paper border border-rule rounded px-3 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-[3px] focus:ring-ink/8 resize-y"
        />
      </label>

      {/* Quick tags */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ink-soft font-semibold">
            Quick Tags
          </span>
          <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ink-mute">
            {dossier.tags.length} selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                dossier.tags.includes(tag)
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-ink border-rule hover:bg-bone"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Intensity slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ink-soft font-semibold">
            Roast Intensity
          </span>
          <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-red font-bold">
            {dossier.intensity}/10 — {intensityLabel(dossier.intensity)}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={dossier.intensity}
          onChange={(e) =>
            setDossier((d) => ({ ...d, intensity: Number(e.target.value) }))
          }
          className="w-full accent-red"
        />
        <div className="flex justify-between font-mono text-[10px] text-ink-mute">
          <span>Mild Dig</span>
          <span>Classic</span>
          <span>Nuclear</span>
        </div>
      </div>

      {/* Generate button */}
      <button
        type="submit"
        disabled={generating || !dossier.name.trim()}
        className="w-full py-3.5 rounded bg-red text-white font-semibold text-sm border border-red-deep shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_6px_14px_-6px_rgba(178,34,52,0.5)] hover:bg-red-deep active:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? "Generating..." : "Generate Roast"}
      </button>

      {/* Regenerate */}
      {hasResult && !generating && (
        <button
          type="button"
          onClick={onRegenerate}
          className="w-full py-2.5 rounded bg-transparent text-ink border border-rule text-sm font-semibold hover:bg-bone transition-colors"
        >
          Regenerate
        </button>
      )}
    </form>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/DossierForm.tsx
git commit -m "feat: add dossier form with quick tags, intensity slider, and generate button"
```

---

## Task 7: Main Page — Wire Everything Together

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Build the main page with two-column layout**

```tsx
// src/app/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import DossierForm from "@/components/DossierForm";
import TweetCard from "@/components/TweetCard";

interface GenerateResult {
  text: string;
  matches: { text: string; nickname: string; insult_type: string }[];
}

export default function Home() {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDossier, setLastDossier] = useState<any>(null);

  const generate = useCallback(async (dossier: any) => {
    setLoading(true);
    setError(null);
    setLastDossier(dossier);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dossier),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerate = useCallback(() => {
    if (lastDossier) generate(lastDossier);
  }, [lastDossier, generate]);

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (lastDossier) regenerate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [regenerate, lastDossier]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-rule bg-paper px-5 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 border-[1.5px] border-ink rounded">
            <span className="font-display italic font-bold text-lg leading-none text-ink">
              D·R
            </span>
            <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-ink-soft">
              Roast Lab
            </span>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Trump Roast Lab
            </h1>
            <p className="font-mono text-[11.5px] text-ink-mute mt-0.5">
              Turn friend facts into a parody Trump-style roast post.
            </p>
          </div>
        </div>
        <span className="flex-1" />
        <span className="inline-flex items-center gap-1.5 border-[1.5px] border-red text-red px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold tracking-[0.18em] uppercase -rotate-[1.5deg]">
          PARODY · SATIRE
        </span>
        <span className="font-mono text-[11.5px] text-ink-mute">
          Archive · 2,818 posts
        </span>
      </header>

      {/* Main grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-4 p-4 max-w-[1200px] mx-auto w-full">
        {/* Left: Dossier */}
        <div className="bg-paper border border-rule rounded-lg p-5">
          <DossierForm
            onGenerate={generate}
            generating={loading}
            hasResult={!!result}
            onRegenerate={regenerate}
          />
        </div>

        {/* Right: Tweet preview */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="bg-paper border border-rule rounded-lg p-5">
            {/* Status bar */}
            <div className="flex items-center gap-3 pb-3 border-b border-rule mb-4">
              <span className="font-mono text-[10px] tracking-[0.2em] text-ink bg-paper border border-rule px-1.5 py-0.5 rounded-sm">
                02
              </span>
              <span className="text-[13px] font-semibold tracking-wide uppercase">
                Live Roast Output
              </span>
              <span className="flex-1 h-px bg-rule/40" />
              <span className={`font-mono text-[10px] tracking-[0.16em] uppercase font-semibold ${
                loading ? "text-red" : result ? "text-gold" : "text-ink-mute"
              }`}>
                ● {loading ? "GENERATING" : result ? "READY" : "IDLE"}
              </span>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 border-[1.5px] border-red rounded bg-red/5 flex items-center gap-3">
                <span className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase text-red border-[1.5px] border-current px-2 py-0.5 rounded-sm">
                  FAULT
                </span>
                <span className="flex-1 text-sm">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-ink-mute hover:text-ink text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* Loading state */}
            {loading && !result && (
              <div className="p-3 border border-dashed border-rule rounded bg-bone font-mono text-[11.5px] text-ink-soft">
                <div className="h-1 bg-line-warm rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-red rounded-full animate-pulse w-2/3" />
                </div>
                Searching 2,818 archived posts for matching patterns...
              </div>
            )}

            {/* Empty state */}
            {!result && !loading && (
              <div className="flex items-center justify-center h-64 border border-dashed border-rule rounded bg-bone/50">
                <p className="font-mono text-[11.5px] text-ink-mute text-center">
                  Enter friend details and hit Generate.<br />
                  <span className="text-[10px]">
                    <kbd className="px-1 py-0.5 border border-rule rounded bg-paper text-[10px]">Ctrl</kbd>
                    {" + "}
                    <kbd className="px-1 py-0.5 border border-rule rounded bg-paper text-[10px]">↵</kbd>
                    {" to generate"}
                  </span>
                </p>
              </div>
            )}

            {/* Generated tweet card */}
            {result && (
              <TweetCard
                text={result.text}
                onTextChange={(text) =>
                  setResult((r) => (r ? { ...r, text } : r))
                }
                editable
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-rule px-5 py-2.5 bg-bone flex justify-between items-center font-mono text-[10.5px] text-ink-soft tracking-[0.12em] uppercase">
        <span>Trump Roast Lab · v1.0</span>
        <span>All output is fictional satire · Not affiliated with any platform or person</span>
        <span>
          <kbd className="px-1 py-0.5 border border-rule rounded bg-paper text-[10px]">Ctrl</kbd>
          {" "}
          <kbd className="px-1 py-0.5 border border-rule rounded bg-paper text-[10px]">↵</kbd>
          {" generate"}
        </span>
      </footer>
    </div>
  );
}
```

**Step 2: Update layout.tsx with fonts and metadata**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trump Roast Lab",
  description: "Turn friend facts into a parody Trump-style roast post.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Step 3: Start dev server and verify two-column layout renders**

```bash
npm run dev
```

Visit `http://localhost:3000`. Verify: ivory background, left dossier form, right preview area, top bar, footer.

**Step 4: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: wire up main page with two-column layout, dossier form, and tweet card"
```

---

## Task 8: End-to-End Test with Real API Key

**Step 1: Add real API key to .env.local**

User provides the Anthropic API key. Add to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

**Step 2: Test full flow**

1. Start dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Enter: Name = "Mart Roosma", Details = "Sports journalist from Estonia, covers volleyball, thinks he's tough, deadlift PB is only 500 pounds"
4. Select tags: "sports fraud", "tiny country", "thinks he's tough"
5. Set intensity to 7
6. Click "Generate Roast"
7. Verify: tweet card renders with Trump-style text, engagement numbers, profile photo
8. Click "Save as Image" — verify PNG downloads
9. Click "Copy Text" — verify clipboard
10. Click tweet text to edit inline — verify editing works
11. Click "Regenerate" — verify new roast generated

**Step 3: Commit**

```bash
git commit -m "test: verify end-to-end roast generation flow"
```

---

## Task 9: Mobile Responsiveness

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/DossierForm.tsx`

**Step 1: Verify mobile layout**

The grid already uses `grid-cols-1 lg:grid-cols-[440px_1fr]` which stacks on mobile. Verify:

1. Open Chrome DevTools → toggle device toolbar → iPhone 14 Pro
2. Verify single-column stack: dossier form → tweet card
3. Verify all inputs are touch-friendly (min 44px tap targets)
4. Verify tweet card is full-width and scrollable

**Step 2: Add sticky generate button on mobile**

On mobile, add a sticky bottom bar with the Generate button so users don't have to scroll back up after filling the form.

**Step 3: Test PNG export on mobile**

Verify html2canvas works on mobile Chrome/Safari and the exported image looks correct.

**Step 4: Commit**

```bash
git commit -m "fix: mobile responsiveness and sticky generate button"
```

---

## Task 10: Deploy to Vercel

**Step 1: Create GitHub repo**

```bash
cd C:/Users/Kasutaja/Claude_Projects/trump-roast-lab
gh repo create trump-roast-lab --public --source=. --push
```

**Step 2: Deploy to Vercel**

```bash
vercel --yes
```

**Step 3: Add environment variable**

```bash
vercel env add ANTHROPIC_API_KEY production
```

Paste the API key when prompted.

**Step 4: Deploy to production**

```bash
vercel --prod
```

**Step 5: Verify live deployment**

Open the Vercel URL in browser. Run full E2E test: enter dossier → generate → export PNG → share.

**Step 6: Commit any deployment config**

```bash
git add -A
git commit -m "chore: deploy to Vercel"
```

---

## Summary

| Task | What | Commit |
|------|------|--------|
| 1 | Scaffold Next.js + Tailwind + design tokens | `chore: scaffold...` |
| 2 | Download dataset, bundle as JSON | `feat: add dataset...` |
| 3 | Keyword search engine | `feat: add keyword search...` |
| 4 | Claude API route + prompt | `feat: add Claude API route...` |
| 5 | Tweet card component (THE PRODUCT) | `feat: add tweet card...` |
| 6 | Dossier form component | `feat: add dossier form...` |
| 7 | Main page — wire together | `feat: wire up main page...` |
| 8 | E2E test with real API key | `test: verify E2E...` |
| 9 | Mobile responsiveness | `fix: mobile responsiveness...` |
| 10 | Deploy to Vercel | `chore: deploy...` |
