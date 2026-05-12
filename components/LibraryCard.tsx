"use client";

import { useState, useRef } from "react";

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

const STATUS_COLOR: Record<Level, string> = {
  low:    "var(--green)",
  medium: "var(--amber)",
  high:   "var(--red)",
};

const NUM_GLOW: Record<Level, string> = {
  low:    "var(--num-glow-green)",
  medium: "var(--num-glow-amber)",
  high:   "var(--num-glow-red)",
};

const CARD_GLOW: Record<Level, string> = {
  low:    "var(--card-glow-green)",
  medium: "var(--card-glow-amber)",
  high:   "var(--card-glow-red)",
};

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
  low:    "rgba(16,185,129,0.14)",
  medium: "rgba(245,158,11,0.14)",
  high:   "rgba(239,68,68,0.14)",
};

const FLOOR_BG_ACTIVE: Record<Level, string> = {
  low:    "rgba(16,185,129,0.3)",
  medium: "rgba(245,158,11,0.3)",
  high:   "rgba(239,68,68,0.3)",
};

const FLOOR_DEPTH: Record<Level, string> = {
  low:    "rgba(16,185,129,0.5)",
  medium: "rgba(245,158,11,0.5)",
  high:   "rgba(239,68,68,0.5)",
};

const FLOOR_TEXT: Record<Level, string> = {
  low:    "var(--green)",
  medium: "var(--amber)",
  high:   "var(--red)",
};

function GlowBar({ pct }: { pct: number }) {
  const clamped = Math.min(1, Math.max(0, pct));
  return (
    <div className="bar-track">
      <div className={BAR_CLASS[level(pct)]} style={{ width: `${clamped * 100}%` }} />
    </div>
  );
}

function SubLocRow({ loc }: { loc: SubLocation }) {
  const lv = level(loc.percentage);
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
      <span
        className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums shrink-0"
        style={BADGE_STYLE[lv]}
      >
        {Math.round(loc.percentage * 100)}%
      </span>
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const safeSubLocs = Array.isArray(subLocs) ? subLocs : [];
  const stackedFloors = [...safeSubLocs].reverse();
  const totalFloors = stackedFloors.length;
  const showFloorBtn = hasFloorStack === true && safeSubLocs.length > 0;

  const selectedFloorData = selectedFloor
    ? stackedFloors.find((f) => f.name === selectedFloor) ?? null
    : null;

  const lv = level(percentage);
  const pct = Math.round(percentage * 100);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: cy * -7, y: cx * 7 });
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }

  const cardGlow = isOpen ? CARD_GLOW[lv] : "none";
  const cardTransform = `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${isHovered ? "-4px" : "0px"})`;

  return (
    <div
      ref={cardRef}
      className="glass-card w-full p-5 sm:p-6 cursor-default"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: cardTransform,
        transition: isHovered
          ? "transform 80ms ease, box-shadow 250ms ease, border-color 250ms ease"
          : "transform 320ms ease, box-shadow 250ms ease, border-color 250ms ease",
        boxShadow: isHovered && isOpen
          ? `${cardGlow}, 0 20px 60px rgba(0,0,0,0.55)`
          : isOpen
          ? `${cardGlow}, 0 4px 24px rgba(0,0,0,0.3)`
          : "0 4px 16px rgba(0,0,0,0.25)",
        borderColor: isHovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.065)",
        willChange: "transform",
      }}
    >
      {/* ── Header: name + large % ─────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <h2
          style={{
            fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
            flex: 1,
          }}
        >
          {name}
        </h2>

        {/* Large glowing percentage */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: isOpen ? STATUS_COLOR[lv] : "var(--text-muted)",
              textShadow: isOpen ? NUM_GLOW[lv] : "none",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pct}%
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            occupied
          </span>
        </div>
      </div>

      {/* ── Status line ────────────────────────────────────────── */}
      <p style={{ marginTop: 8, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
        {isOpen ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "var(--green)",
                boxShadow: "0 0 6px var(--green-glow)",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "var(--green)" }}>Open</span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span style={{ color: "var(--text-secondary)" }}>{hourSummary}</span>
          </>
        ) : (
          <>
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "var(--red)",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "var(--red)" }}>Closed</span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span style={{ color: "var(--text-secondary)" }}>{hourSummary}</span>
          </>
        )}
      </p>

      {compareSummary && (
        <p style={{ marginTop: 3, fontSize: 11, fontStyle: "italic", color: "var(--text-muted)" }}>
          {compareSummary}
        </p>
      )}

      {/* ── Progress bar ───────────────────────────────────────── */}
      <div style={{ marginTop: 14 }}>
        <GlowBar pct={percentage} />
      </div>
      <p
        style={{
          marginTop: 6,
          fontSize: 11.5,
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          color: "var(--text-muted)",
          letterSpacing: "-0.01em",
        }}
      >
        {people.toLocaleString()} / {capacity.toLocaleString()} people
      </p>

      {/* ── Sub-locations (floors) ─────────────────────────────── */}
      {safeSubLocs.length > 0 && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            By floor
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {safeSubLocs.map((loc) => (
              <SubLocRow key={loc.name} loc={loc} />
            ))}
          </div>
        </div>
      )}

      {/* ── Floor stack toggle ─────────────────────────────────── */}
      {showFloorBtn && (
        <button
          onClick={() => {
            setShowStack((v) => !v);
            setSelectedFloor(null);
          }}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "9px 0",
            borderRadius: "10px",
            border: "1px solid rgba(6,182,212,0.3)",
            backgroundColor: showStack ? "rgba(6,182,212,0.1)" : "transparent",
            color: "var(--accent)",
            fontSize: "12.5px",
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "-0.01em",
            transition: "background-color 150ms ease, border-color 150ms ease",
          }}
        >
          {showStack ? "Hide Floor View" : "View Floor Plan →"}
        </button>
      )}

      {/* ── 3D Floor stack visualization ──────────────────────── */}
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
              marginTop: 12,
              padding: 14,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                }}
              >
                {name} — Floor Overview
              </span>
              <button
                onClick={() => { setShowStack(false); setSelectedFloor(null); }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: 11.5,
                  padding: "2px 6px",
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Building slabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {stackedFloors.map((floor, i) => {
                const lv = level(floor.percentage);
                const isHov = hoveredFloor === floor.name;
                const isSel = selectedFloor === floor.name;
                const widthPct = totalFloors > 1 ? 94 + (i / (totalFloors - 1)) * 6 : 100;

                return (
                  <div key={floor.name} style={{ display: "flex", justifyContent: "center" }}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSel}
                      onClick={() => setSelectedFloor(isSel ? null : floor.name)}
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
                        borderRadius: "5px",
                        backgroundColor: isHov || isSel ? FLOOR_BG_ACTIVE[lv] : FLOOR_BG[lv],
                        borderBottom: `4px solid ${FLOOR_DEPTH[lv]}`,
                        outline: isSel ? `1px solid ${FLOOR_DEPTH[lv]}` : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingLeft: 12,
                        paddingRight: 12,
                        cursor: "pointer",
                        transform: isHov ? "translateY(-5px)" : "translateY(0)",
                        boxShadow: isHov ? `0 8px 20px ${FLOOR_DEPTH[lv]}` : "none",
                        transition: "transform 180ms ease, background-color 150ms ease, box-shadow 180ms ease",
                        userSelect: "none",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
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
                          fontSize: 13,
                          fontWeight: 700,
                          fontVariantNumeric: "tabular-nums",
                          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
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

            {/* Selected floor detail */}
            {selectedFloorData && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: `1px solid ${FLOOR_DEPTH[level(selectedFloorData.percentage)]}`,
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  {selectedFloorData.name}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                    fontVariantNumeric: "tabular-nums",
                    marginBottom: 4,
                  }}
                >
                  {selectedFloorData.people} / {selectedFloorData.capacity} people
                </p>
                <p style={{ fontSize: 12, color: selectedFloorData.isOpen ? "var(--green)" : "var(--red)" }}>
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
