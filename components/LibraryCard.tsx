"use client";

import { useState } from "react";

interface SubLocation {
  name: string;
  percentage: number;
  people: number;
  capacity: number;
  isOpen: boolean;
}

interface LibraryCardProps {
  name: string;
  percentage: number;
  people: number;
  capacity: number;
  isOpen: boolean;
  hourSummary: string;
  subLocs: SubLocation[];
  compareSummary?: string;
  hasFloorStack?: boolean;
}

type Level = "low" | "medium" | "high";

function level(pct: number): Level {
  if (pct >= 0.8) return "high";
  if (pct >= 0.5) return "medium";
  return "low";
}

const BADGE_STYLE: Record<Level, React.CSSProperties> = {
  low:    { color: "var(--green)", backgroundColor: "var(--green-dim)", border: "1px solid rgba(16,185,129,0.2)" },
  medium: { color: "var(--amber)", backgroundColor: "var(--amber-dim)", border: "1px solid rgba(245,158,11,0.2)" },
  high:   { color: "var(--red)",   backgroundColor: "var(--red-dim)",   border: "1px solid rgba(239,68,68,0.2)" },
};

const BAR_CLASS: Record<Level, string> = {
  low:    "bar-fill-green",
  medium: "bar-fill-amber",
  high:   "bar-fill-red",
};

// Color palette for floor panels (hovered vs normal)
function floorPalette(pct: number, hovered: boolean) {
  if (pct >= 0.8) return {
    bg:     hovered ? "rgba(239,68,68,0.28)" : "rgba(239,68,68,0.13)",
    border: "rgba(239,68,68,0.5)",
    depth:  "rgba(153,27,27,0.7)",
    accent: "var(--red)",
  };
  if (pct >= 0.5) return {
    bg:     hovered ? "rgba(245,158,11,0.28)" : "rgba(245,158,11,0.13)",
    border: "rgba(245,158,11,0.5)",
    depth:  "rgba(146,64,14,0.7)",
    accent: "var(--amber)",
  };
  return {
    bg:     hovered ? "rgba(16,185,129,0.28)" : "rgba(16,185,129,0.13)",
    border: "rgba(16,185,129,0.5)",
    depth:  "rgba(6,78,59,0.7)",
    accent: "var(--green)",
  };
}

function Badge({ pct }: { pct: number }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums"
      style={BADGE_STYLE[level(pct)]}
    >
      {Math.round(pct * 100)}%
    </span>
  );
}

function GlowBar({ pct }: { pct: number }) {
  const clamped = Math.min(1, Math.max(0, pct));
  return (
    <div className="bar-track">
      <div className={BAR_CLASS[level(pct)]} style={{ width: `${clamped * 100}%` }} />
    </div>
  );
}

function SubLocRow({ loc }: { loc: SubLocation }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-28 shrink-0 truncate text-xs sm:w-36"
        style={{ color: "var(--text-secondary)" }}
      >
        {loc.name}
      </span>
      <div className="flex-1">
        <GlowBar pct={loc.percentage} />
      </div>
      <Badge pct={loc.percentage} />
    </div>
  );
}

// ── Chevron icon ──────────────────────────────────────
function ChevronDown({ rotated }: { rotated: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-3 w-3 shrink-0"
      style={{
        color: "var(--text-muted)",
        transform: rotated ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Floor panel + accordion ───────────────────────────
function FloorPanel({
  loc,
  isHovered,
  isExpanded,
  onHover,
  onLeave,
  onToggle,
}: {
  loc: SubLocation;
  isHovered: boolean;
  isExpanded: boolean;
  onHover: () => void;
  onLeave: () => void;
  onToggle: () => void;
}) {
  const colors = floorPalette(loc.percentage, isHovered);
  const pctLabel = `${Math.round(loc.percentage * 100)}%`;

  return (
    <div>
      {/* The 3D shelf panel */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${loc.name} — ${pctLabel} full. ${isExpanded ? "Collapse" : "Expand"} details.`}
        style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          // "thickness" — a colored bottom edge simulates a shelf viewed from a slight angle
          boxShadow: isHovered
            ? `0 6px 0 ${colors.depth}, 0 10px 18px rgba(0,0,0,0.28)`
            : `0 3px 0 ${colors.depth}, 0 5px 10px rgba(0,0,0,0.16)`,
          borderRadius: "8px",
          padding: "0 14px",
          minHeight: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          cursor: "pointer",
          userSelect: "none",
          // lift on hover
          transform: isHovered ? "translateY(-4px)" : "translateY(0px)",
          transition:
            "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
        }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        {/* Left: floor name + hint */}
        <div style={{ minWidth: 0 }}>
          <p
            className="truncate text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {loc.name}
          </p>
          {isHovered && !isExpanded && (
            <p className="text-[10px] mt-0.5" style={{ color: colors.accent }}>
              tap for details
            </p>
          )}
        </div>

        {/* Right: percentage + chevron */}
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: colors.accent }}
          >
            {pctLabel}
          </span>
          <ChevronDown rotated={isExpanded} />
        </div>
      </div>

      {/* Accordion detail panel */}
      <div
        style={{
          maxHeight: isExpanded ? "160px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className="px-4 pb-3 pt-2.5"
          style={{
            background: "var(--bg-surface)",
            border: `1px solid ${colors.border}`,
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              {loc.name}
            </span>
            <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
              {loc.people} / {loc.capacity} people
            </span>
          </div>
          <GlowBar pct={loc.percentage} />
          <p className="mt-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
            {loc.isOpen
              ? <span style={{ color: "var(--green)" }}>● Open</span>
              : <span style={{ color: "var(--red)" }}>● Closed</span>
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────
export default function LibraryCard({
  name,
  percentage,
  people,
  capacity,
  isOpen,
  hourSummary,
  subLocs,
  compareSummary,
  hasFloorStack,
}: LibraryCardProps) {
  const [showFloorStack, setShowFloorStack] = useState(false);
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null);
  const [hoveredFloor, setHoveredFloor] = useState<string | null>(null);

  // Floors are reversed so the "highest" (last in array) appears at the top of the stack
  const stackedFloors = [...subLocs].reverse();

  function closeStack() {
    setShowFloorStack(false);
    setExpandedFloor(null);
    setHoveredFloor(null);
  }

  return (
    <div className="card-base w-full p-5 sm:p-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2
          className="text-base font-semibold leading-tight sm:text-lg"
          style={{ color: "var(--text-primary)" }}
        >
          {name}
        </h2>
        <Badge pct={percentage} />
      </div>

      {/* ── Status ── */}
      <p className="mt-2 text-xs font-medium">
        {isOpen
          ? <span style={{ color: "var(--green)" }}>● Open · {hourSummary}</span>
          : <span style={{ color: "var(--red)" }}>● Closed · {hourSummary}</span>
        }
      </p>

      {compareSummary && (
        <p className="mt-0.5 text-xs italic" style={{ color: "var(--text-muted)" }}>
          {compareSummary}
        </p>
      )}

      {/* ── Overall bar ── */}
      <div className="mt-3">
        <GlowBar pct={percentage} />
      </div>
      <p className="mt-1.5 text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
        {people} / {capacity} people
      </p>

      {/* ── By-floor rows ── */}
      {subLocs.length > 0 && (
        <div
          className="mt-4 space-y-2.5 pt-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            By floor
          </p>
          {subLocs.map((loc) => (
            <SubLocRow key={loc.name} loc={loc} />
          ))}
        </div>
      )}

      {/* ── View Floor Plan button ── */}
      {hasFloorStack && subLocs.length > 0 && (
        <button
          onClick={() => {
            setShowFloorStack((v) => !v);
            setExpandedFloor(null);
          }}
          className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            borderColor: "var(--accent)",
            color: "var(--accent)",
            backgroundColor: showFloorStack ? "var(--accent-dim)" : "transparent",
          }}
        >
          {showFloorStack ? "Hide Floor View" : "View Floor Plan →"}
        </button>
      )}

      {/* ── Interactive floor stack ── */}
      <div
        style={{
          maxHeight: showFloorStack ? "1200px" : "0px",
          opacity: showFloorStack ? 1 : 0,
          overflow: "hidden",
          transition:
            "max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
        }}
      >
        <div
          className="mt-4 rounded-xl p-4"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Stack header */}
          <div className="mb-3 flex items-center justify-between">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Floor Overview — {name}
            </p>
            <button
              onClick={closeStack}
              aria-label="Close floor view"
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors duration-150"
              style={{
                color: "var(--text-muted)",
                backgroundColor: "var(--bg-overlay)",
                border: "1px solid var(--border)",
              }}
            >
              ✕
            </button>
          </div>

          {/* Floor panels */}
          <div className="space-y-2">
            {stackedFloors.map((loc) => (
              <FloorPanel
                key={loc.name}
                loc={loc}
                isHovered={hoveredFloor === loc.name}
                isExpanded={expandedFloor === loc.name}
                onHover={() => setHoveredFloor(loc.name)}
                onLeave={() => setHoveredFloor(null)}
                onToggle={() =>
                  setExpandedFloor((prev) =>
                    prev === loc.name ? null : loc.name
                  )
                }
              />
            ))}
          </div>

          {/* Legend */}
          <div
            className="mt-4 flex flex-wrap gap-3 pt-3 text-[11px]"
            style={{
              borderTop: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded-sm" style={{ background: "rgba(16,185,129,0.5)", boxShadow: "0 2px 0 rgba(6,78,59,0.7)" }} />
              Low (&lt;50%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded-sm" style={{ background: "rgba(245,158,11,0.5)", boxShadow: "0 2px 0 rgba(146,64,14,0.7)" }} />
              Moderate (50–79%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded-sm" style={{ background: "rgba(239,68,68,0.5)", boxShadow: "0 2px 0 rgba(153,27,27,0.7)" }} />
              Busy (≥80%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
