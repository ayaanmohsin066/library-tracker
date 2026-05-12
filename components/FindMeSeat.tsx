"use client";

import { useState } from "react";
import Link from "next/link";

type Uni  = "waterloo" | "regina" | "uoft";
type Need = "quiet" | "group" | "computer";

interface LiveLoc {
  name: string;
  percentage: number;
  people: number;
  capacity: number;
  isOpen: boolean;
  hourSummary: string;
  subLocs?: { name: string; percentage: number; isOpen: boolean }[];
}

const UNI_CONFIG: Record<Uni, { label: string; href: string; city: string }> = {
  waterloo: { label: "Waterloo", href: "/waterloo", city: "Waterloo, Ontario" },
  regina:   { label: "Regina",   href: "/regina",   city: "Regina, Saskatchewan" },
  uoft:     { label: "UofT",     href: "/uoft",     city: "Toronto, Ontario" },
};

const NEEDS: { key: Need; emoji: string; label: string }[] = [
  { key: "quiet",    emoji: "🔇", label: "Quiet solo study" },
  { key: "group",    emoji: "👥", label: "Group space" },
  { key: "computer", emoji: "💻", label: "Computer lab" },
];

function ringColor(pct: number): string {
  return pct > 80 ? "#ffb4ab" : pct > 50 ? "#f59e0b" : "#34D399";
}

function mapsQuery(name: string, city: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`;
}

// ── Small 64px progress ring ─────────────────────────────────────────
function SmallRing({ pct }: { pct: number }) {
  const R    = 26;
  const circ = 2 * Math.PI * R;
  const color = ringColor(pct);
  return (
    <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
      <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(30,58,95,0.5)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={R} fill="none"
          stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          style={{ transition: "stroke-dashoffset 0.7s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontSize: 11, fontWeight: 800, color,
          fontFamily: "var(--font-geist-mono), monospace",
          lineHeight: 1,
        }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ── Special result card (non-data outcomes) ──────────────────────────
function ResultSpecial({
  icon, title, subtitle, href, linkLabel,
}: {
  icon: string; title: string; subtitle: string; href: string; linkLabel: string;
}) {
  return (
    <div className="glass-panel rounded-2xl" style={{ padding: 28, textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <h3 style={{
        margin: "0 0 8px", fontSize: "1rem", fontWeight: 700,
        color: "#e2e2e8", fontFamily: "Sora, sans-serif",
      }}>
        {title}
      </h3>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6B7FA3", lineHeight: 1.6 }}>
        {subtitle}
      </p>
      <Link
        href={href}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 24px", borderRadius: 9999, fontSize: 13, fontWeight: 700,
          background: "#6366F1", color: "#0A0F1C", textDecoration: "none",
          fontFamily: "Sora, sans-serif",
        }}
      >
        {linkLabel}
      </Link>
    </div>
  );
}

// ── Best spot result card ────────────────────────────────────────────
function ResultCard({
  result,
  uniMeta,
}: {
  result: LiveLoc;
  uniMeta: { label: string; href: string; city: string };
}) {
  const pct = Math.round(result.percentage * 100);

  return (
    <div className="glass-panel rounded-2xl" style={{ padding: 28 }}>
      <p style={{
        margin: "0 0 16px", fontSize: 11, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.15em", color: "#6B7FA3",
      }}>
        Best spot right now:
      </p>

      {/* Ring + name row */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
        <SmallRing pct={pct} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: "0 0 5px",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            fontWeight: 800, letterSpacing: "-0.02em",
            color: "#818CF8", fontFamily: "Sora, sans-serif", lineHeight: 1.2,
          }}>
            {result.name}
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "#6B7FA3", lineHeight: 1.55 }}>
            {result.hourSummary}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <a
          href={mapsQuery(result.name, uniMeta.city)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 20px", borderRadius: 9999, fontSize: 13, fontWeight: 700,
            background: "#6366F1", color: "#0A0F1C", textDecoration: "none",
            fontFamily: "Sora, sans-serif",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>directions</span>
          Get Directions →
        </a>
        <Link
          href={uniMeta.href}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "9px 20px", borderRadius: 9999, fontSize: 13, fontWeight: 600,
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.28)",
            color: "#818CF8", textDecoration: "none",
            fontFamily: "Sora, sans-serif",
          }}
        >
          See all libraries →
        </Link>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function FindMeSeat({
  sectionRef,
}: {
  sectionRef?: React.RefObject<HTMLElement>;
}) {
  const [uni,     setUni]     = useState<Uni | null>(null);
  const [need,    setNeed]    = useState<Need | null>(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<LiveLoc | null>(null);
  const [errKey,  setErrKey]  = useState<string | null>(null);
  const [show,    setShow]    = useState(false);

  function resetResult() {
    setResult(null);
    setErrKey(null);
    setShow(false);
  }

  async function handleFind() {
    if (!uni || !need) return;
    resetResult();

    if (need === "computer") {
      setErrKey("computer");
      setTimeout(() => setShow(true), 30);
      return;
    }

    if (uni === "uoft") {
      setErrKey("uoft_no_live");
      setTimeout(() => setShow(true), 30);
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`/api/live?uni=${uni}`);
      const json = await res.json() as { live?: unknown };
      const locs: LiveLoc[] = Array.isArray(json.live) ? (json.live as LiveLoc[]) : [];
      const open = locs.filter((l) => l.isOpen);

      if (!open.length) {
        setErrKey("none_open");
      } else {
        let sorted = [...open].sort((a, b) => a.percentage - b.percentage);
        if (need === "group") {
          const withGroup = sorted.filter((l) =>
            l.subLocs?.some((s) => s.name.toLowerCase().includes("group"))
          );
          if (withGroup.length) sorted = withGroup;
        }
        setResult(sorted[0]);
      }
    } catch {
      setErrKey("fetch_failed");
    } finally {
      setLoading(false);
      setTimeout(() => setShow(true), 30);
    }
  }

  const canFind   = uni !== null && need !== null && !loading;
  const uniMeta   = uni ? UNI_CONFIG[uni] : null;
  const hasResult = result !== null || errKey !== null;

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        zIndex: 1,
        backgroundColor: "rgba(10,15,28,0.98)",
        borderTop: "1px solid rgba(30,58,95,0.5)",
        padding: "80px 24px 96px",
      }}
    >
      <style>{`
        @keyframes fms-slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Section heading */}
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.22em", color: "#6366F1",
          marginBottom: 14, fontFamily: "Sora, sans-serif",
        }}>
          ✦ Smart Recommendation
        </p>
        <h2 style={{
          fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 800,
          letterSpacing: "-0.02em", color: "#e2e2e8",
          marginBottom: 10, fontFamily: "Sora, sans-serif",
        }}>
          Find Me a Seat
        </h2>
        <p style={{
          fontSize: 15, color: "#6B7FA3", marginBottom: 52, lineHeight: 1.6,
        }}>
          Tell us where you are and what you need — we&apos;ll surface the quietest open spot right now.
        </p>

        {/* ── Step 1: University ── */}
        <div style={{ marginBottom: 36 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.15em", color: "#6B7FA3", marginBottom: 14,
          }}>
            Step 1 — Your university
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {(Object.keys(UNI_CONFIG) as Uni[]).map((u) => {
              const sel = uni === u;
              return (
                <button
                  key={u}
                  onClick={() => { setUni(u); resetResult(); }}
                  style={{
                    padding: "10px 24px", borderRadius: 9999, fontSize: 14, fontWeight: 600,
                    cursor: "pointer",
                    background: sel ? "#6366F1" : "rgba(13,20,36,0.8)",
                    color:      sel ? "#0A0F1C" : "#b9cacb",
                    border:     sel ? "1px solid transparent" : "1px solid rgba(30,58,95,0.5)",
                    boxShadow:  sel ? "0 0 20px rgba(99,102,241,0.4)" : "none",
                    fontFamily: "Sora, sans-serif",
                    transition: "background 150ms, color 150ms, box-shadow 150ms",
                    minHeight: 42,
                  }}
                >
                  {UNI_CONFIG[u].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Step 2: What do you need? (appears after Step 1) ── */}
        {uni && (
          <div style={{ marginBottom: 36, animation: "fms-slide-in 300ms ease both" }}>
            <p style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.15em", color: "#6B7FA3", marginBottom: 14,
            }}>
              Step 2 — What do you need?
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {NEEDS.map(({ key, emoji, label }) => {
                const sel = need === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setNeed(key); resetResult(); }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "10px 20px", borderRadius: 9999, fontSize: 14, fontWeight: 600,
                      cursor: "pointer",
                      background:   sel ? "rgba(99,102,241,0.15)" : "rgba(13,20,36,0.8)",
                      color:        sel ? "#818CF8" : "#b9cacb",
                      border:       sel ? "1px solid rgba(99,102,241,0.45)" : "1px solid rgba(30,58,95,0.5)",
                      boxShadow:    sel ? "0 0 16px rgba(99,102,241,0.2)" : "none",
                      fontFamily:  "Sora, sans-serif",
                      transition:  "background 150ms, color 150ms, border-color 150ms, box-shadow 150ms",
                      minHeight: 42,
                    }}
                  >
                    <span>{emoji}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Find button (appears after Step 2) ── */}
        {uni && need && (
          <div style={{ marginBottom: hasResult ? 36 : 0, animation: "fms-slide-in 300ms ease both" }}>
            <button
              onClick={handleFind}
              disabled={!canFind}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: canFind ? "#6366F1" : "rgba(30,58,95,0.5)",
                color:      canFind ? "#0A0F1C" : "#6B7FA3",
                fontWeight: 700, fontSize: "0.95rem",
                padding: "14px 34px", borderRadius: 9999,
                border: "none", cursor: canFind ? "pointer" : "default",
                fontFamily: "Sora, sans-serif",
                boxShadow: canFind ? "0 4px 20px rgba(99,102,241,0.28)" : "none",
                transition: "background 200ms, box-shadow 200ms",
                minHeight: 48,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    display: "inline-block",
                    width: 14, height: 14,
                    border: "2px solid rgba(10,15,28,0.35)",
                    borderTopColor: "#0A0F1C",
                    borderRadius: "50%",
                    animation: "fms-spin 0.7s linear infinite",
                  }} />
                  Searching…
                </>
              ) : (
                "Find Best Spot →"
              )}
            </button>
            <style>{`@keyframes fms-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Result area ── */}
        {hasResult && (
          <div style={{
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 400ms ease, transform 400ms ease",
          }}>
            {errKey === "computer" && (
              <ResultSpecial
                icon="💻"
                title="Head to the Computer Labs"
                subtitle="Filter by building, hours, and amenities — find an available lab seat instantly."
                href="/labs"
                linkLabel="Browse Computer Labs →"
              />
            )}
            {errKey === "uoft_no_live" && (
              <ResultSpecial
                icon="📊"
                title="Live data unavailable for UofT"
                subtitle="We show historical busy patterns for University of Toronto. Click below to see typical times and book a room."
                href="/uoft"
                linkLabel="View UofT Libraries →"
              />
            )}
            {errKey === "none_open" && uniMeta && (
              <ResultSpecial
                icon="🌙"
                title="No libraries open right now"
                subtitle="All libraries at this university are currently closed. Check back during opening hours."
                href={uniMeta.href}
                linkLabel={`See ${uniMeta.label} Libraries →`}
              />
            )}
            {errKey === "fetch_failed" && (
              <ResultSpecial
                icon="⚠️"
                title="Couldn't fetch live data"
                subtitle="Something went wrong connecting to the server. Try again in a moment."
                href={uniMeta?.href ?? "/"}
                linkLabel="View Libraries →"
              />
            )}
            {result && uniMeta && (
              <ResultCard result={result} uniMeta={uniMeta} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
