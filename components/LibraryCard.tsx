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

// Slab backgrounds: normal (18%) and hover/selected (35%)
const FLOOR_BG: Record<Level, string> = {
  low:    "rgba(16,185,129,0.18)",
  medium: "rgba(245,158,11,0.18)",
  high:   "rgba(239,68,68,0.18)",
};

const FLOOR_BG_ACTIVE: Record<Level, string> = {
  low:    "rgba(16,185,129,0.35)",
  medium: "rgba(245,158,11,0.35)",
  high:   "rgba(239,68,68,0.35)",
};

// Bottom edge "thickness" — darker shade of same color
const FLOOR_DEPTH: Record<Level, string> = {
  low:    "rgba(16,185,129,0.55)",
  medium: "rgba(245,158,11,0.55)",
  high:   "rgba(239,68,68,0.55)",
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
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [hoveredFloor, setHoveredFloor] = useState<string | null>(null);

  const safeSubLocs = Array.isArray(subLocs) ? subLocs : [];
  // Reverse so index 0 = top of building (highest floor), last = ground floor
  const stackedFloors = [...safeSubLocs].reverse();
  const totalFloors = stackedFloors.length;
  const showFloorBtn = hasFloorStack === true && safeSubLocs.length > 0;

  const selectedFloorData = selectedFloor
    ? stackedFloors.find((f) => f.name === selectedFloor) ?? null
    : null;

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
            setSelectedFloor(null);
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
          }}
        >
          {showStack ? "Hide Floor View" : "View Floor Plan →"}
        </button>
      )}

      {/* 3D Building Visualization */}
      {showFloorBtn && (
        <div
          style={{
            overflow: "hidden",
            maxHeight: showStack ? "900px" : "0px",
            opacity: showStack ? 1 : 0,
            transition: "max-height 400ms ease, opacity 300ms ease",
          }}
        >
          <div
            style={{
              marginTop: "12px",
              padding: "14px",
              borderRadius: "12px",
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Container header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                }}
              >
                {name} — Floor Overview
              </span>
              <button
                onClick={() => {
                  setShowStack(false);
                  setSelectedFloor(null);
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

            {/* Building slabs — top of container = highest floor */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {stackedFloors.map((floor, i) => {
                const lv = level(floor.percentage);
                const isHov = hoveredFloor === floor.name;
                const isSel = selectedFloor === floor.name;
                // Perspective taper: top floor (i=0) is narrowest, ground floor is widest
                const widthPct =
                  totalFloors > 1 ? 94 + (i / (totalFloors - 1)) * 6 : 100;

                return (
                  <div
                    key={floor.name}
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSel}
                      onClick={() =>
                        setSelectedFloor(isSel ? null : floor.name)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedFloor(isSel ? null : floor.name);
                        }
                      }}
                      onMouseEnter={() => setHoveredFloor(floor.name)}
                      onMouseLeave={() => setHoveredFloor(null)}
                      style={{
                        width: `${widthPct}%`,
                        height: "44px",
                        borderRadius: "4px",
                        backgroundColor:
                          isHov || isSel
                            ? FLOOR_BG_ACTIVE[lv]
                            : FLOOR_BG[lv],
                        // Bottom edge simulates slab thickness
                        borderBottom: `4px solid ${FLOOR_DEPTH[lv]}`,
                        outline: isSel
                          ? `1px solid ${FLOOR_DEPTH[lv]}`
                          : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingLeft: "12px",
                        paddingRight: "12px",
                        cursor: "pointer",
                        transform: isHov ? "translateY(-5px)" : "translateY(0)",
                        boxShadow: isHov
                          ? `0 8px 20px ${FLOOR_DEPTH[lv]}`
                          : "none",
                        transition:
                          "transform 180ms ease, background-color 150ms ease, box-shadow 180ms ease",
                        userSelect: "none",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "65%",
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
                          flexShrink: 0,
                        }}
                      >
                        {Math.round(floor.percentage * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected floor info — appears below the building, not inline */}
            {selectedFloorData && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-surface)",
                  border: `1px solid ${FLOOR_DEPTH[level(selectedFloorData.percentage)]}`,
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  {selectedFloorData.name}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontVariantNumeric: "tabular-nums",
                    marginBottom: "4px",
                  }}
                >
                  {selectedFloorData.people} / {selectedFloorData.capacity} people
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: selectedFloorData.isOpen
                      ? "var(--green)"
                      : "var(--red)",
                  }}
                >
                  {selectedFloorData.isOpen ? "● Open" : "● Closed"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
