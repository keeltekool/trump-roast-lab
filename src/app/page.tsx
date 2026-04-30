"use client";

import { useState, useCallback, useEffect } from "react";
import DossierForm from "@/components/DossierForm";
import type { Dossier } from "@/components/DossierForm";
import TweetCard from "@/components/TweetCard";

interface GenerateResult {
  text: string;
  matches: { text: string; nickname: string; insult_type: string }[];
}

export default function Home() {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDossier, setLastDossier] = useState<Dossier | null>(null);

  const generate = useCallback(async (dossier: Dossier) => {
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
    <div className="min-h-screen flex flex-col bg-ivory">
      {/* ─── Top bar ─── */}
      <header className="border-b border-rule bg-paper px-5 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 border-[1.5px] border-ink rounded">
            <span className="font-[family-name:var(--font-display)] italic font-bold text-lg leading-none text-ink">
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
        <span className="font-mono text-[11.5px] text-ink-mute hidden sm:inline">
          Archive · 2,808 posts
        </span>
      </header>

      {/* ─── Main grid ─── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-4 p-4 max-w-[1200px] mx-auto w-full">
        {/* Left: Dossier */}
        <div className="bg-paper border border-rule rounded-lg p-5">
          <DossierForm onGenerate={generate} generating={loading} />
        </div>

        {/* Right: Tweet preview */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="bg-paper border border-rule rounded-lg p-5">
            {/* Status bar */}
            <div className="flex items-center gap-3 pb-3 border-b border-rule mb-4">
              <span className="font-mono text-[10px] tracking-[0.2em] bg-paper border border-rule px-1.5 py-0.5 rounded-sm">
                02
              </span>
              <span className="text-[13px] font-semibold tracking-wide uppercase">
                Tweet Preview
              </span>
              <span className="flex-1 h-px bg-rule/40" />
              {loading ? (
                <span className="px-2 py-0.5 rounded-sm bg-red/10 text-red font-mono text-[10px] font-bold tracking-[0.16em] uppercase animate-pulse">
                  GENERATING
                </span>
              ) : result ? (
                <span className="px-2 py-0.5 rounded-sm bg-[#fce4ec] text-red font-mono text-[10px] font-bold tracking-[0.16em] uppercase">
                  LIVE TARGET
                </span>
              ) : (
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase font-semibold text-ink-mute">
                  ● IDLE
                </span>
              )}
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
                  className="text-ink-mute hover:text-ink text-lg leading-none cursor-pointer"
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
                Searching 2,808 archived posts for matching patterns...
              </div>
            )}

            {/* Empty state */}
            {!result && !loading && (
              <div className="flex items-center justify-center h-64 border border-dashed border-rule rounded bg-bone/50">
                <p className="font-mono text-[11.5px] text-ink-mute text-center">
                  Enter friend details and hit Generate.
                  <br />
                  <span className="text-[10px]">
                    <kbd className="px-1 py-0.5 border border-rule rounded bg-paper text-[10px]">
                      Ctrl
                    </kbd>
                    {" + "}
                    <kbd className="px-1 py-0.5 border border-rule rounded bg-paper text-[10px]">
                      ↵
                    </kbd>
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
                onRegenerate={regenerate}
              />
            )}
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-rule px-5 py-2.5 bg-bone flex flex-wrap justify-between items-center font-mono text-[10.5px] text-ink-soft tracking-[0.12em] uppercase gap-2">
        <span>Trump Roast Lab · v1.0</span>
        <span>
          All output is fictional satire · Not affiliated with any platform or
          person
        </span>
        <span className="hidden sm:inline">
          <kbd className="px-1 py-0.5 border border-rule rounded bg-paper text-[10px]">
            Ctrl
          </kbd>{" "}
          <kbd className="px-1 py-0.5 border border-rule rounded bg-paper text-[10px]">
            ↵
          </kbd>{" "}
          generate
        </span>
      </footer>
    </div>
  );
}
