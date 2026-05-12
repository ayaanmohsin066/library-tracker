"use client";

import { useState, useEffect } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { buildings, type Building, type StudySpace } from "@/lib/buildingData";

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasKeycard(b: Building) {
  return b.studySpaces.some((s) => s.keycardRequired);
}

// ── Noise badge ───────────────────────────────────────────────────────────────

const NOISE_MAP = {
  silent:        { icon: "🔇", label: "Silent",        color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  quiet:         { icon: "🤫", label: "Quiet",         color: "#34D399", bg: "rgba(52,211,153,0.12)"  },
  collaborative: { icon: "💬", label: "Collaborative", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

function NoiseBadge({ level }: { level: StudySpace["noiseLevel"] }) {
  const n = NOISE_MAP[level];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
      backgroundColor: n.bg, color: n.color, border: `1px solid ${n.color}44`,
      whiteSpace: "nowrap",
    }}>
      {n.icon} {n.label}
    </span>
  );
}

// ── Type badge ────────────────────────────────────────────────────────────────

const TYPE_MAP: Record<StudySpace["type"], { icon: string; label: string }> = {
  individual: { icon: "🪑", label: "Individual" },
  group:      { icon: "👥", label: "Group"      },
  lounge:     { icon: "☕", label: "Lounge"     },
  classroom:  { icon: "🏫", label: "Classroom"  },
};

function TypeBadge({ type }: { type: StudySpace["type"] }) {
  const t = TYPE_MAP[type];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
      backgroundColor: "rgba(99,102,241,0.08)", color: "#b9cacb",
      border: "1px solid rgba(99,102,241,0.18)",
      whiteSpace: "nowrap",
    }}>
      {t.icon} {t.label}
    </span>
  );
}

// ── Info chip ─────────────────────────────────────────────────────────────────

function Chip({ label, red }: { label: string; red?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 6,
      backgroundColor: red ? "rgba(255,180,171,0.1)"  : "rgba(99,102,241,0.1)",
      color:           red ? "#ffb4ab"                 : "#818CF8",
      border:          `1px solid ${red ? "rgba(255,180,171,0.3)" : "rgba(99,102,241,0.25)"}`,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ── Study space row ───────────────────────────────────────────────────────────

function SpaceRow({ space }: { space: StudySpace }) {
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(30,58,95,0.4)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#e2e2e8", lineHeight: 1.3 }}>
            {space.name}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#6B7FA3" }}>{space.floor}</p>
        </div>
        <NoiseBadge level={space.noiseLevel} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
        <TypeBadge type={space.type} />
        {space.outlets       && <Chip label="🔌 Outlets" />}
        {space.printer       && <Chip label="🖨️ Printer" />}
        {space.keycardRequired && <Chip label="🔒 Keycard" red />}
      </div>

      {space.notes && (
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6B7FA3", lineHeight: 1.5 }}>
          {space.notes}
        </p>
      )}

      {space.bookingUrl && (
        <a
          href={space.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 700,
            color: "#818CF8", textDecoration: "none",
            padding: "4px 10px", borderRadius: 7,
            backgroundColor: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.3)",
            transition: "background-color 150ms ease",
          }}
        >
          Book now →
        </a>
      )}
    </div>
  );
}

// ── Side panel / bottom sheet ─────────────────────────────────────────────────

function Panel({ building, onClose, isMobile }: {
  building: Building;
  onClose: () => void;
  isMobile: boolean;
}) {
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed", left: 0, right: 0, bottom: 0,
        maxHeight: "65vh", zIndex: 1000,
        background: "rgba(10, 15, 28, 0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(99, 102, 241, 0.2)",
        borderRadius: "20px 20px 0 0",
        overflowY: "auto",
        boxShadow: "0 -8px 48px rgba(0,0,0,0.6), inset 0 0 24px rgba(99,102,241,0.04)",
        animation: "lc-slideUp 240ms cubic-bezier(0.4,0,0.2,1) forwards",
      }
    : {
        position: "fixed", top: 64, right: 0, bottom: 0,
        width: 360, zIndex: 1000,
        background: "rgba(10, 15, 28, 0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderLeft: "1px solid rgba(99, 102, 241, 0.2)",
        overflowY: "auto",
        boxShadow: "-8px 0 48px rgba(0,0,0,0.5), inset 0 0 24px rgba(99,102,241,0.04)",
        animation: "lc-slideRight 240ms cubic-bezier(0.4,0,0.2,1) forwards",
      };

  return (
    <>
      <style>{`
        @keyframes lc-slideRight { from { transform:translateX(100%); } to { transform:translateX(0); } }
        @keyframes lc-slideUp    { from { transform:translateY(100%); } to { transform:translateY(0); } }
      `}</style>

      {isMobile && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}

      <div style={panelStyle}>
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(30,58,95,0.7)" }} />
          </div>
        )}

        <div style={{ padding: isMobile ? "12px 20px 0" : "24px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
              {/* Indigo dot accent */}
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 6,
                background: "#6366F1",
                boxShadow: "0 0 8px rgba(99,102,241,0.8)",
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 800, lineHeight: 1.25,
                color: "#e2e2e8", letterSpacing: "-0.02em",
                fontFamily: "Sora, sans-serif",
              }}>
                {building.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 8,
                backgroundColor: "rgba(30,58,95,0.5)", border: "1px solid rgba(30,58,95,0.7)",
                color: "#6B7FA3", cursor: "pointer", marginTop: 1,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          </div>

          <p style={{ margin: "0 0 10px 18px", fontSize: 13, color: "#6B7FA3", lineHeight: 1.45 }}>
            {building.description}
          </p>

          <div style={{ margin: "0 0 14px 18px", display: "flex", flexWrap: "wrap", gap: 6 }}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${building.coords[0]},${building.coords[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 600,
                color: "#b9cacb", textDecoration: "none",
                padding: "5px 11px", borderRadius: 8,
                backgroundColor: "transparent",
                border: "1px solid rgba(30,58,95,0.6)",
                transition: "border-color 150ms ease",
              }}
            >
              📍 Get directions
            </a>
            {hasKeycard(building) && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 12, fontWeight: 600, color: "#ffb4ab",
                padding: "5px 11px", borderRadius: 8,
                backgroundColor: "rgba(255,180,171,0.08)",
                border: "1px solid rgba(255,180,171,0.2)",
              }}>
                🔒 Some areas require keycard
              </span>
            )}
          </div>

          <p style={{
            margin: "0 0 2px 0", fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.14em", color: "#6B7FA3",
          }}>
            Study Spaces
          </p>
        </div>

        <div style={{ padding: "0 20px 32px" }}>
          {building.studySpaces.map((space, i) => (
            <SpaceRow key={i} space={space} />
          ))}
        </div>
      </div>
    </>
  );
}

// ── Map Legend ────────────────────────────────────────────────────────────────

function MapLegend() {
  return (
    <div style={{
      position: "absolute", bottom: 28, left: 16, zIndex: 500,
      background: "rgba(10,15,28,0.9)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(30,58,95,0.5)",
      borderRadius: 12, padding: "12px 16px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.45), inset 0 0 16px rgba(99,102,241,0.03)",
      fontFamily: "Sora, sans-serif",
    }}>
      <p style={{
        margin: "0 0 10px", fontSize: 10, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.14em", color: "#6B7FA3",
      }}>
        Study Space Status
      </p>
      {[
        { color: "#34D399", glow: "rgba(52,211,153,0.6)",  label: "Open & quiet"  },
        { color: "#f59e0b", glow: "rgba(245,158,11,0.6)",  label: "Moderate"      },
        { color: "#ffb4ab", glow: "rgba(255,180,171,0.6)", label: "Busy / Closed" },
      ].map(({ color, glow, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: color, display: "inline-block", flexShrink: 0,
            boxShadow: `0 0 6px ${glow}`,
          }} />
          <span style={{ fontSize: 12, color: "#b9cacb" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Marker component ──────────────────────────────────────────────────────────

function BuildingMarker({
  building,
  isSelected,
  onSelect,
}: {
  building: Building;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [hov, setHov] = useState(false);
  const size = hov || isSelected ? 16 : 12;

  return (
    <div style={{ position: "relative" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        style={{
          width: size, height: size,
          borderRadius: "50%",
          background: isSelected ? "#818CF8" : "#6366F1",
          border: `2px solid rgba(255,255,255,${isSelected ? 0.45 : 0.25})`,
          cursor: "pointer",
          animation: "lc-marker-pulse 2.5s ease-in-out infinite",
          boxShadow: isSelected
            ? "0 0 20px rgba(129,140,248,0.9), 0 0 0 4px rgba(129,140,248,0.2)"
            : hov
            ? "0 0 18px rgba(99,102,241,0.85)"
            : "0 0 12px rgba(99,102,241,0.7)",
          transition: "width 150ms ease, height 150ms ease, box-shadow 150ms ease, background 150ms ease",
        }}
      />
      {/* Hover tooltip */}
      {hov && !isSelected && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 10px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10,15,28,0.95)",
          border: "1px solid rgba(99,102,241,0.35)",
          borderRadius: 8, padding: "5px 10px",
          fontSize: 11, fontWeight: 600,
          color: "#e2e2e8",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          zIndex: 10,
          fontFamily: "Sora, sans-serif",
        }}>
          <span style={{ color: "#818CF8", marginRight: 5 }}>{building.shortName}</span>
          {building.name.split(" ").slice(0, 3).join(" ")}
          {/* Arrow */}
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid rgba(99,102,241,0.35)",
          }} />
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CampusMap() {
  const [selected, setSelected] = useState<Building | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <style>{`
        @keyframes lc-marker-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(99,102,241,0.65), 0 0 0 0 rgba(99,102,241,0.3); }
          50%       { box-shadow: 0 0 16px rgba(99,102,241,0.85), 0 0 0 6px rgba(99,102,241,0); }
        }
      `}</style>

      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -80.5449,
          latitude:  43.4723,
          zoom:      15.5,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onClick={() => setSelected(null)}
      >
        {buildings.map((b) => (
          <Marker
            key={b.id}
            longitude={b.coords[1]}
            latitude={b.coords[0]}
            anchor="center"
          >
            <BuildingMarker
              building={b}
              isSelected={selected?.id === b.id}
              onSelect={() => setSelected((prev) => (prev?.id === b.id ? null : b))}
            />
          </Marker>
        ))}
      </Map>

      {/* Hint */}
      {!selected && (
        <div style={{
          position: "absolute", bottom: 28, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 500, pointerEvents: "none",
          background: "rgba(10,15,28,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(30,58,95,0.4)",
          boxShadow: "inset 0 0 16px rgba(99,102,241,0.04)",
          borderRadius: 12, padding: "8px 18px",
          fontSize: 13, fontWeight: 500, color: "#b9cacb",
          whiteSpace: "nowrap",
          fontFamily: "Sora, sans-serif",
        }}>
          Click any marker to explore study spaces
        </div>
      )}

      {/* Legend */}
      <MapLegend />

      {/* Side panel */}
      {selected && (
        <Panel
          building={selected}
          onClose={() => setSelected(null)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
