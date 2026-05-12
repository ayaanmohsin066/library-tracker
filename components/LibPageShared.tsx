"use client";

import { useState } from "react";
import Link from "next/link";

// ── Color helper ────────────────────────────────────────────────────
export function occupancyColor(pct: number): string {
  return pct > 80 ? "#EF4444" : pct > 50 ? "#F59E0B" : "#34D399";
}

// ── Occupancy Ticker ────────────────────────────────────────────────
export type TickerLib = { name: string; percentage: number; isOpen: boolean };

export function OccupancyTicker({ libs }: { libs: TickerLib[] }) {
  if (!libs.length) return null;
  const duration = Math.max(20, libs.length * 8);
  const doubled = [...libs, ...libs];

  return (
    <div style={{
      overflow: "hidden",
      borderBottom: "1px solid rgba(30,58,95,0.45)",
      background: "rgba(10,15,28,0.9)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    }}>
      <style>{`
        @keyframes lc-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
      <div style={{
        display: "flex",
        width: "max-content",
        animation: `lc-ticker ${duration}s linear infinite`,
        padding: "9px 0",
        alignItems: "center",
      }}>
        {doubled.map((lib, i) => {
          const pct   = Math.round(lib.percentage * 100);
          const color = lib.isOpen ? occupancyColor(pct) : "#6B7FA3";
          return (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "0 22px",
              fontSize: 12, fontWeight: 600,
              fontFamily: "Sora, sans-serif",
              whiteSpace: "nowrap",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: color,
                display: "inline-block", flexShrink: 0,
                boxShadow: lib.isOpen ? `0 0 6px ${color}80` : "none",
              }} />
              <span style={{ color: "#b9cacb" }}>{lib.name}</span>
              <span style={{ color }}>{pct}% full</span>
              <span style={{ color: "rgba(107,127,163,0.35)" }}>·</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Live Page Header ────────────────────────────────────────────────
export function LivePageHeader({
  title,
  dataUpdatedAt,
  refetch,
  showMapLink,
}: {
  title: string;
  dataUpdatedAt: string | null;
  refetch: () => void;
  showMapLink?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 12,
      padding: "28px 0 20px",
      borderBottom: "1px solid rgba(30,58,95,0.4)",
      marginBottom: 24,
    }}>
      {/* Left: title + live dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          color: "#e2e2e8",
          fontFamily: "Sora, sans-serif",
          lineHeight: 1.1,
        }}>
          {title}
        </h1>
        <div style={{ position: "relative", width: 14, height: 14, flexShrink: 0 }}>
          <div style={{
            position: "absolute", inset: 2, borderRadius: "50%",
            background: "#34D399",
            boxShadow: "0 0 10px rgba(52,211,153,0.75)",
          }} />
          <div className="animate-live-ring" style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "1.5px solid rgba(52,211,153,0.65)",
          }} />
        </div>
      </div>

      {/* Right: timestamp + buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {dataUpdatedAt && (
          <span style={{
            fontSize: 11, color: "#6B7FA3",
            fontFamily: "var(--font-geist-mono), monospace",
          }}>
            {dataUpdatedAt}
          </span>
        )}
        <button
          onClick={() => refetch()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 600,
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.28)",
            color: "#818CF8",
            cursor: "pointer",
            fontFamily: "Sora, sans-serif",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
          Refresh
        </button>
        {showMapLink && (
          <Link
            href="/map"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 600,
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.22)",
              color: "#34D399",
              textDecoration: "none",
              fontFamily: "Sora, sans-serif",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>map</span>
            Campus Map →
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Stat Chip ───────────────────────────────────────────────────────
function StatChip({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", gap: 5,
        background: "rgba(13,20,36,0.78)",
        border: `1px solid ${hov ? "rgba(99,102,241,0.38)" : "rgba(30,58,95,0.5)"}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 14,
        padding: "12px 18px",
        minWidth: 120,
        boxShadow: hov ? "0 0 28px rgba(99,102,241,0.13)" : "none",
        transition: "border-color 180ms ease, box-shadow 180ms ease",
        cursor: "default",
      }}
    >
      <span style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.14em", color: "#6B7FA3",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 14, fontWeight: 700,
        color: accent ?? "#818CF8",
        fontFamily: "var(--font-geist-mono), monospace",
      }}>
        {value}
      </span>
    </div>
  );
}

// ── Stat Chips Row ──────────────────────────────────────────────────
export function StatChipsRow({
  total, openNow, quietest, busiest,
}: {
  total: number;
  openNow: number;
  quietest: { name: string; pct: number } | null;
  busiest:  { name: string; pct: number } | null;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
      <StatChip label="Total Libraries" value={String(total)} />
      <StatChip label="Open Now"        value={String(openNow)} accent="#34D399" />
      <StatChip
        label="Quietest"
        value={quietest ? `${quietest.name.split(" ")[0]} · ${quietest.pct}%` : "—"}
        accent="#34D399"
      />
      <StatChip
        label="Busiest"
        value={busiest ? `${busiest.name.split(" ")[0]} · ${busiest.pct}%` : "—"}
        accent={busiest ? (busiest.pct > 80 ? "#EF4444" : "#818CF8") : undefined}
      />
    </div>
  );
}

// ── Progress Ring ───────────────────────────────────────────────────
function ProgressRing({ pct, isOpen }: { pct: number; isOpen: boolean }) {
  const circumference = 251.2;
  const offset = circumference - (circumference * pct) / 100;
  const stroke = !isOpen
    ? "#1E3A5F"
    : pct > 80 ? "#EF4444"
    : pct > 50 ? "#F59E0B"
    : "#34D399";

  return (
    <svg viewBox="0 0 100 100" width="128" height="128" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="transparent" strokeWidth="8" stroke="#1E2A3A" />
      <circle
        cx="50" cy="50" r="40" fill="transparent"
        strokeWidth="8" strokeLinecap="round"
        strokeDasharray="251.2" strokeDashoffset={offset}
        className="progress-ring-circle"
        style={{ stroke }}
      />
    </svg>
  );
}

// ── Library Card ────────────────────────────────────────────────────
export interface LibProps {
  name: string;
  percentage: number;
  people: number;
  capacity: number;
  isOpen: boolean;
  hourSummary: string;
  subLocs: { name: string; percentage: number; people: number; capacity: number; isOpen: boolean }[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function LibraryCard({
  name, percentage, people, capacity, isOpen, hourSummary, subLocs,
  isFavorite = false, onToggleFavorite,
}: LibProps) {
  const [floorsOpen, setFloorsOpen] = useState(true);
  const pct          = Math.round(percentage * 100);
  const color        = occupancyColor(pct);
  const displayColor = isOpen ? color : "#6B7FA3";
  const ringStroke   = !isOpen ? "#1E3A5F" : pct > 80 ? "#EF4444" : pct > 50 ? "#F59E0B" : "#34D399";

  return (
    <div
      className="glass-panel glass-highlight rounded-2xl"
      style={{ opacity: isOpen ? 1 : 0.5, padding: 24, display: "flex", flexDirection: "column" }}
    >
      {/* ── Header row ─── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
        <h3 style={{
          margin: 0, fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.3,
          color: "#e2e2e8", fontFamily: "Sora, sans-serif", flex: 1,
        }}>
          {name}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 700,
            background: isOpen ? "rgba(52,211,153,0.12)" : "rgba(255,180,171,0.1)",
            border: `1px solid ${isOpen ? "rgba(52,211,153,0.3)" : "rgba(255,180,171,0.25)"}`,
            color: isOpen ? "#34D399" : "#ffb4ab",
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: isOpen ? "#34D399" : "#ffb4ab",
              boxShadow: isOpen ? "0 0 5px rgba(52,211,153,0.8)" : "none",
            }} />
            {isOpen ? "Open" : "Closed"}
          </span>
          <span className="material-symbols-outlined" style={{ color: "#6B7FA3", fontSize: 18 }}>
            sensors
          </span>
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              aria-label={isFavorite ? "Remove from saved" : "Save library"}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 2, display: "flex", alignItems: "center",
                color: isFavorite ? "#6366F1" : "#6B7FA3",
                transition: "color 150ms ease",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 18,
                  fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {isFavorite ? "bookmark" : "bookmark_add"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── Ring + percentage centered ─── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ position: "relative", width: 128, height: 128 }}>
          <ProgressRing pct={pct} isOpen={isOpen} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontSize: "1.5rem", fontWeight: 900, lineHeight: 1,
              color: displayColor,
              fontFamily: "var(--font-geist-mono), monospace",
            }}>
              {pct}%
            </span>
            <span style={{ fontSize: 10, color: "#6B7FA3", marginTop: 3 }}>occupied</span>
          </div>
        </div>
        <p style={{
          margin: 0, fontSize: 12, color: "#b9cacb",
          fontFamily: "var(--font-geist-mono), monospace",
        }}>
          {people.toLocaleString()} / {capacity.toLocaleString()} seats
        </p>
      </div>

      {/* ── Glowing occupancy bar ─── */}
      <div style={{
        height: 6, borderRadius: 9999,
        background: "rgba(30,58,95,0.5)",
        marginBottom: 12, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 9999,
          width: `${pct}%`,
          background: isOpen
            ? `linear-gradient(90deg, ${ringStroke}99, ${ringStroke})`
            : "#1E3A5F",
          boxShadow: isOpen ? `0 0 12px ${ringStroke}60` : "none",
          transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>

      {/* ── Hour summary ─── */}
      <p style={{
        margin: "0 0 16px", fontSize: 11, color: "#6B7FA3",
        fontFamily: "Sora, sans-serif", letterSpacing: "0.01em",
      }}>
        {hourSummary}
      </p>

      {/* ── Floor breakdown (collapsible) ─── */}
      {subLocs.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(30,58,95,0.4)", paddingTop: 14 }}>
          <button
            onClick={() => setFloorsOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", background: "none", border: "none", cursor: "pointer",
              padding: 0, marginBottom: floorsOpen ? 12 : 0,
            }}
          >
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.15em", color: "#6B7FA3",
            }}>
              By Floor
            </span>
            <span style={{
              fontSize: 10, color: "#6B7FA3",
              display: "inline-block",
              transform: floorsOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 200ms ease",
            }}>
              ▾
            </span>
          </button>

          {floorsOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {subLocs.map((loc) => {
                const lp = Math.round(loc.percentage * 100);
                const lc = occupancyColor(lp);
                return (
                  <div key={loc.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 11, color: "#b9cacb", flexShrink: 0,
                      width: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {loc.name}
                    </span>
                    <div style={{
                      flex: 1, height: 4, borderRadius: 9999,
                      background: "rgba(30,58,95,0.5)", overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: 9999,
                        width: `${lp}%`, background: lc,
                        transition: "width 0.65s ease",
                      }} />
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: lc,
                      fontFamily: "var(--font-geist-mono), monospace",
                      flexShrink: 0, width: 34, textAlign: "right",
                    }}>
                      {lp}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Skeleton Card ───────────────────────────────────────────────────
export function SkeletonLibCard() {
  return (
    <div className="glass-panel rounded-2xl" style={{
      padding: 24, minHeight: 340,
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div className="animate-shimmer" style={{ height: 14, width: 160, borderRadius: 6 }} />
        <div className="animate-shimmer" style={{ height: 22, width: 60, borderRadius: 9999 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div className="animate-shimmer" style={{ width: 128, height: 128, borderRadius: "50%" }} />
        <div className="animate-shimmer" style={{ height: 11, width: 120, borderRadius: 6 }} />
      </div>
      <div className="animate-shimmer" style={{ height: 6, width: "100%", borderRadius: 9999 }} />
      <div style={{ borderTop: "1px solid rgba(30,58,95,0.35)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="animate-shimmer" style={{ height: 10, width: 100, borderRadius: 5, flexShrink: 0 }} />
            <div className="animate-shimmer" style={{ height: 4, flex: 1, borderRadius: 9999 }} />
            <div className="animate-shimmer" style={{ height: 10, width: 30, borderRadius: 5, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Favorite mini-card (used in My Libraries section) ───────────────
function FavoriteMiniCard({
  lib,
  onRemove,
}: {
  lib: LibProps;
  onRemove: () => void;
}) {
  const pct   = Math.round(lib.percentage * 100);
  const color = occupancyColor(pct);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", borderRadius: 12,
      background: "rgba(99,102,241,0.06)",
      border: "1px solid rgba(99,102,241,0.22)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    }}>
      {/* Status dot */}
      <span style={{
        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        background: lib.isOpen ? color : "#6B7FA3",
        boxShadow: lib.isOpen ? `0 0 6px ${color}80` : "none",
      }} />

      {/* Name */}
      <span style={{
        flex: 1, minWidth: 0,
        fontSize: 13, fontWeight: 600, color: "#e2e2e8",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        fontFamily: "Sora, sans-serif",
      }}>
        {lib.name}
      </span>

      {/* Occupancy or Closed */}
      {lib.isOpen ? (
        <span style={{
          fontSize: 12, fontWeight: 700, color, flexShrink: 0,
          fontFamily: "var(--font-geist-mono), monospace",
        }}>
          {pct}%
        </span>
      ) : (
        <span style={{ fontSize: 11, color: "#6B7FA3", flexShrink: 0 }}>Closed</span>
      )}

      {/* Remove button */}
      <button
        onClick={onRemove}
        aria-label={`Remove ${lib.name} from saved`}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#6B7FA3", fontSize: 18, lineHeight: 1,
          padding: "0 2px", flexShrink: 0,
          display: "flex", alignItems: "center",
          transition: "color 150ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ffb4ab")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7FA3")}
      >
        ×
      </button>
    </div>
  );
}

// ── My Libraries section ─────────────────────────────────────────────
export function MyLibrariesSection({
  libs,
  favorites,
  removeFavorite,
}: {
  libs: LibProps[];
  favorites: string[];
  removeFavorite: (name: string) => void;
}) {
  const favLibs = libs.filter((l) => favorites.includes(l.name));
  if (!favLibs.length) return null;

  return (
    <div id="my-libraries" style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 16, color: "#6366F1", fontVariationSettings: "'FILL' 1" }}
        >
          bookmark
        </span>
        <h2 style={{
          margin: 0, fontSize: "0.9rem", fontWeight: 700,
          color: "#e2e2e8", fontFamily: "Sora, sans-serif",
        }}>
          Your saved libraries
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {favLibs.map((lib) => (
          <FavoriteMiniCard
            key={lib.name}
            lib={lib}
            onRemove={() => removeFavorite(lib.name)}
          />
        ))}
      </div>
      <div style={{ height: 1, background: "rgba(30,58,95,0.4)", marginTop: 24 }} />
    </div>
  );
}
