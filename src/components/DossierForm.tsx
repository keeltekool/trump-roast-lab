"use client";

import { useState } from "react";

export interface Dossier {
  name: string;
  details: string;
  insideJokes: string;
  tags: string[];
  intensity: number;
}

interface DossierFormProps {
  onGenerate: (dossier: Dossier) => void;
  generating: boolean;
}

export default function DossierForm({
  onGenerate,
  generating,
}: DossierFormProps) {
  const [dossier, setDossier] = useState<Dossier>({
    name: "",
    details: "",
    insideJokes: "",
    tags: [],
    intensity: 5,
  });

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
        <span className="font-mono text-[10px] tracking-[0.2em] bg-paper border border-rule px-1.5 py-0.5 rounded-sm">
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
          Friend&apos;s Name
        </span>
        <input
          type="text"
          required
          placeholder="e.g. Mart Roosma"
          value={dossier.name}
          onChange={(e) => setDossier((d) => ({ ...d, name: e.target.value }))}
          className="w-full bg-paper border border-rule rounded px-3 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-[3px] focus:ring-ink/8 placeholder:text-ink-mute"
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
          className="w-full bg-paper border border-rule rounded px-3 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-[3px] focus:ring-ink/8 resize-y min-h-[80px] placeholder:text-ink-mute"
        />
        <span className="font-mono text-[11px] text-ink-mute">
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
          className="w-full bg-paper border border-rule rounded px-3 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-[3px] focus:ring-ink/8 resize-y placeholder:text-ink-mute"
        />
      </label>

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
        className="w-full py-3.5 rounded bg-red text-white font-semibold text-sm border border-red-deep shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_6px_14px_-6px_rgba(178,34,52,0.5)] hover:bg-red-deep active:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {generating ? "Generating..." : "Generate Roast"}
      </button>
    </form>
  );
}
