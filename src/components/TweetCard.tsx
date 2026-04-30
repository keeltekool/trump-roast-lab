"use client";

import { useRef, useState, useCallback } from "react";

interface TweetCardProps {
  text: string;
  onTextChange?: (text: string) => void;
  editable?: boolean;
  onRegenerate?: () => void;
}

function randomEngagement() {
  return {
    replies: Math.floor(30 + Math.random() * 120),
    reposts: Math.floor(100 + Math.random() * 400),
    likes: Math.floor(2000 + Math.random() * 13000),
    views: Math.floor(800000 + Math.random() * 20000000),
  };
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function formatDate(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${h12}:${m} ${ampm} · ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

export default function TweetCard({
  text,
  onTextChange,
  editable = false,
  onRegenerate,
}: TweetCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [engagement] = useState(randomEngagement);
  const [copied, setCopied] = useState(false);

  const handleExport = useCallback(async () => {
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
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        if (cardRef.current) {
          const html2canvas = (await import("html2canvas")).default;
          const canvas = await html2canvas(cardRef.current, {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true,
          });
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png")
          );
          if (blob) {
            const file = new File([blob], "trump-roast.png", { type: "image/png" });
            await navigator.share({ files: [file] });
            return;
          }
        }
        await navigator.share({ text });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  }, [text, handleCopy]);

  const tweetFont =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  return (
    <div>
      {/* ─── The exportable card ─── */}
      <div
        ref={cardRef}
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #CFD9DE",
          padding: "16px",
          fontFamily: tweetFont,
          maxWidth: 598,
          width: "100%",
        }}
      >
        {/* Header: avatar + name + handle */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <img
            src="/trump-profile.jpg"
            alt=""
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#0F1419",
                  lineHeight: "20px",
                }}
              >
                Donald J. Trump
              </span>
              <img
                src="/verified-badge.svg"
                alt="Verified"
                style={{ width: 18, height: 18, flexShrink: 0 }}
              />
            </div>
            <span
              style={{ fontSize: 15, color: "#536471", lineHeight: "20px" }}
            >
              @realDonaldTrump
            </span>
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
              fontFamily: tweetFont,
              resize: "vertical",
              outline: "none",
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

        {/* Timestamp + views */}
        <div
          style={{
            fontSize: 15,
            color: "#536471",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>{formatDate()}</span>
          <span>·</span>
          <span style={{ fontWeight: 700, color: "#0F1419" }}>
            {formatCount(engagement.views)}
          </span>
          <span>Views</span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #EFF3F4", marginBottom: 12 }} />

        {/* Engagement row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: 425,
          }}
        >
          <EngagementBtn icon="reply" count={engagement.replies} />
          <EngagementBtn icon="repost" count={engagement.reposts} />
          <EngagementBtn icon="like" count={engagement.likes} />
          <EngagementBtn icon="bookmark" />
          <EngagementBtn icon="share" />
        </div>
      </div>

      {/* ─── PARODY label (outside export ref) ─── */}
      <p className="text-center font-mono text-[10px] tracking-[0.14em] uppercase text-ink-mute mt-2">
        PARODY / NOT A REAL POST
      </p>

      {/* ─── Action buttons row ─── */}
      <div className="flex gap-2 mt-4 justify-center">
        {onRegenerate && (
          <ActionButton
            icon={
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
            }
            label="REGENERATE"
            onClick={onRegenerate}
          />
        )}
        <ActionButton
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
          }
          label={copied ? "COPIED!" : "COPY TEXT"}
          onClick={handleCopy}
        />
        <ActionButton
          icon={
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
          }
          label="EXPORT IMAGE"
          onClick={handleExport}
        />
      </div>

      {/* ─── Social share buttons ─── */}
      <div className="flex gap-2 mt-3 justify-center">
        <ShareButton
          label="Share"
          onClick={handleShare}
          className="bg-ink text-paper hover:bg-black"
        />
        <ShareButton
          label="WhatsApp"
          onClick={() => {
            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(url, "_blank");
          }}
          className="bg-[#25D366] text-white hover:bg-[#1da851]"
        />
        <ShareButton
          label="X"
          onClick={() => {
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            window.open(url, "_blank");
          }}
          className="bg-black text-white hover:bg-ink-soft"
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 px-4 py-3 border border-rule rounded-lg bg-paper hover:bg-bone transition-colors min-w-[90px]"
    >
      <span className="text-ink">{icon}</span>
      <span className="font-mono text-[9px] tracking-[0.14em] uppercase font-bold text-ink-soft">
        {label}
      </span>
    </button>
  );
}

function ShareButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${className}`}
    >
      {label}
    </button>
  );
}

function EngagementBtn({
  icon,
  count,
}: {
  icon: string;
  count?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        color: "#536471",
        fontSize: 13,
      }}
    >
      <img
        src={`/icon-${icon}.svg`}
        alt=""
        style={{ width: 18.75, height: 18.75, opacity: 0.8 }}
      />
      {count != null && <span>{formatCount(count)}</span>}
    </div>
  );
}
