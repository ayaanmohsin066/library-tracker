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

const FLOOR_BG: Record<Level, string> = {
  low:    "rgba(16,185,129,0.12)",
  medium: "rgba(245,158,11,0.12)",
  high:   "rgba(239,68,68,0.12)",
};

const FLOOR_DEPTH: Record<Level, string> = {
  low:    "rgba(16,185,129,0.35)",
  medium: "rgba(245,158,11,0.35)",
  high:   "rgba(239,68,68,0.35)",
};

const FLOOR_TEXT: Record<Level, string> = {
  low:    "var(--green)",
  medium: "var(--amber)",
  high:   "var(--red)",
};

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

interface FloorPanelProps {
  floor: SubLocation;
  isExpanded: boolean;
  isHovered: boolean;
  onToggle: () => void;
  onHover: (hovered: boolean) => void;
}

function FloorPanel({ floor, isExpanded, isHovered, onToggle, onHover }: FloorPanelProps) {
  const lv = level(floor.percentage);
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderRadius: "10px",
          backgroundColor: FLOOR_BG[lv],
          boxShadow: `0 4px 0 ${FLOOR_DEPTH[lv]}, inset 0 1px 0 rgba(255,255,255,0.04)`,
          border: `1px solid ${FLOOR_DEPTH[lv]}`,
          cursor: "pointer",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          transition: "transform 200ms ease, box-shadow 200ms ease",
          outline: "none",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {floor.name}
        </span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: FLOOR_TEXT[lv],
            marginLeft: "12px",
            flexShrink: 0,
          }}
        >
          {Math.round(floor.percentage * 100)}%
        </span>
      </div>

      {/* Accordion detail */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: isExpanded ? "160px" : "0px",
          opacity: isExpanded ? 1 : 0,
          transition: "max-height 300ms ease, opacity 200ms ease",
        }}
      >
        <div
          style={{
            padding: "10px 14px 12px",
            borderRadius: "0 0 10px 10px",
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderTop: "none",
            marginTop: "-2px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "6px",
            }}
          >
            {floor.name}
          </p>
          <GlowBar pct={floor.percentage} />
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "4px",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {floor.people} / {floor.capacity} people
          </p>
        </div>
      </div>
    </div>
  );
}

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
  const [showStack, setShowStack] = useState(false);
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null);
  const [hoveredFloor, setHoveredFloor] = useState<string | null>(null);

  const safeSubLocs = Array.isArray(subLocs) ? subLocs : [];
  const stackedFloors = [...safeSubLocs].reverse();
  const showFloorBtn = hasFloorStack === true && safeSubLocs.length > 0;

  return (
    <div className="card-base w-full p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2
          className="text-base font-semibold leading-tight sm:text-lg"
          style={{ color: "var(--text-primary)" }}
        >
          {name}
        </h2>
        <Badge pct={percentage} />
      </div>

      {/* Status */}
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

      {/* Progress */}
      <div className="mt-3">
        <GlowBar pct={percentage} />
      </div>
      <p className="mt-1.5 text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
        {people} / {capacity} people
      </p>

      {/* Sub-locations */}
      {safeSubLocs.length > 0 && (
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
          {safeSubLocs.map((loc) => (
            <SubLocRow key={loc.name} loc={loc} />
          ))}
        </div>
      )}

      {/* Floor Stack Toggle Button */}
      {showFloorBtn && (
        <button
          onClick={() => {
            setShowStack((v) => !v);
            setExpandedFloor(null);
          }}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "9px 0",
            borderRadius: "10px",
            border: "1px solid var(--accent)",
            backgroundColor: "transparent",
            color: "var(--accent)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 150ms ease",
          }}
        >
          {showStack ? "Hide Floor View" : "View Floor Plan →"}
        </button>
      )}

      {/* Floor Stack Container */}
      {showFloorBtn && (
        <div
          style={{
            overflow: "hidden",
            maxHeight: showStack ? "800px" : "0px",
            opacity: showStack ? 1 : 0,
            transition: "max-height 400ms ease, opacity 300ms ease",
          }}
        >
          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Stack header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                }}
              >
                Floor Occupancy
              </span>
              <button
                onClick={() => {
                  setShowStack(false);
                  setExpandedFloor(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  padding: "2px 6px",
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Floor panels */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {stackedFloors.map((floor) => (
                <FloorPanel
                  key={floor.name}
                  floor={floor}
                  isExpanded={expandedFloor === floor.name}
                  isHovered={hoveredFloor === floor.name}
                  onToggle={() =>
                    setExpandedFloor((v) => (v === floor.name ? null : floor.name))
                  }
                  onHover={(hovered) =>
                    setHoveredFloor(hovered ? floor.name : null)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
