"use client";

import { useState, useEffect } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { buildings, type Building, type StudySpace } from "@/lib/buildingData";

// ── Category system ───────────────────────────────────────────────────────────

type Category = "library" | "college-library" | "lab" | "study" | "cafe";
type FilterKey = "all" | "libraries" | "labs" | "study" | "cafes";

const BUILDING_CATEGORY: Record<string, Category> = {
  "dana-porter":      "library",
  "davis-centre":     "library",
  "musagetes":        "library",
  "conrad-grebel":    "college-library",
  "renison":          "college-library",
  "st-jeromes":       "college-library",
  "pharmacy":         "study",
  "needles-hall":     "study",
  "slc":              "study",
  "tatham-centre":    "study",
  "hagey-hall":       "study",
  "stc":              "study",
  "qnc":              "study",
  "e2":               "lab",
  "cph":              "lab",
  "physics":          "lab",
  "e5":               "lab",
  "mc":               "lab",
  "modern-languages": "cafe",
  "ev1":              "cafe",
  "ev3":              "cafe",
};

const CATEGORY_META: Record<Category, {
  color: string; glowRgb: string; filterKey: FilterKey; badge: string;
}> = {
  "library":         { color: "#6366F1", glowRgb: "99,102,241",  filterKey: "libraries", badge: "Library"         },
  "college-library": { color: "#A855F7", glowRgb: "168,85,247",  filterKey: "libraries", badge: "College Library" },
  "lab":             { color: "#F59E0B", glowRgb: "245,158,11",  filterKey: "labs",      badge: "Lab"             },
  "study":           { color: "#34D399", glowRgb: "52,211,153",  filterKey: "study",     badge: "Study Space"     },
  "cafe":            { color: "#34D399", glowRgb: "52,211,153",  filterKey: "cafes",     badge: "Café"            },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",       label: "All"          },
  { key: "libraries", label: "Libraries"    },
  { key: "labs",      label: "Labs"         },
  { key: "study",     label: "Study Spaces" },
  { key: "cafes",     label: "Cafés"        },
];

function getCategory(b: Building): Category {
  return BUILDING_CATEGORY[b.id] ?? "study";
}

function matchesFilter(b: Building, f: FilterKey): boolean {
  if (f === "all") return true;
  return CATEGORY_META[getCategory(b)].filterKey === f;
}

// ── Noise / type meta ─────────────────────────────────────────────────────────

const NOISE_META: Record<StudySpace["noiseLevel"], { icon: string; label: string; color: string; rgb: string }> = {
  silent:        { icon: "🔇", label: "Silent",        color: "#818CF8", rgb: "129,140,248" },
  quiet:         { icon: "🤫", label: "Quiet",         color: "#34D399", rgb: "52,211,153"  },
  collaborative: { icon: "💬", label: "Collaborative", color: "#F59E0B", rgb: "245,158,11"  },
};

const TYPE_META: Record<StudySpace["type"], { icon: string; label: string }> = {
  individual: { icon: "🪑", label: "Individual" },
  group:      { icon: "👥", label: "Group"      },
  lounge:     { icon: "☕", label: "Lounge"     },
  classroom:  { icon: "🏫", label: "Classroom"  },
};

function hasKeycard(b: Building) {
  return b.studySpaces.some((s) => s.keycardRequired);
}

// ── Space Card ────────────────────────────────────────────────────────────────

function SpaceCard({ space }: { space: StudySpace }) {
  const noise = NOISE_META[space.noiseLevel];
  const type  = TYPE_META[space.type];
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 14, marginBottom: 10,
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(30,58,95,0.5)",
    }}>
      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#e2e2e8", lineHeight: 1.3 }}>
        {space.name}
      </p>
      <p style={{ margin: "0 0 10px", fontSize: 11, color: "#6B7FA3" }}>{space.floor}</p>

      {/* Type + noise badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
          backgroundColor: "rgba(99,102,241,0.1)", color: "#b9cacb",
          border: "1px solid rgba(99,102,241,0.2)",
        }}>
          {type.icon} {type.label}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
          backgroundColor: `rgba(${noise.rgb},0.1)`,
          color: noise.color, border: `1px solid ${noise.color}44`,
        }}>
          {noise.icon} {noise.label}
        </span>
      </div>

      {/* Info chips */}
      {(space.keycardRequired || space.outlets || space.printer) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {space.keycardRequired && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, backgroundColor: "rgba(255,180,171,0.1)", color: "#ffb4ab", border: "1px solid rgba(255,180,171,0.3)" }}>
              🔒 Keycard
            </span>
          )}
          {space.outlets && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, backgroundColor: "rgba(99,102,241,0.08)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
              🔌 Outlets
            </span>
          )}
          {space.printer && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, backgroundColor: "rgba(99,102,241,0.08)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
              🖨️ Printer
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {space.notes && (
        <p style={{ margin: "0 0 10px", fontSize: 11, color: "#6B7FA3", lineHeight: 1.55, fontStyle: "italic" }}>
          {space.notes}
        </p>
      )}

      {/* Book now */}
      {space.bookingUrl && (
        <a
          href={space.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 700, color: "#818CF8",
            textDecoration: "none", padding: "5px 12px", borderRadius: 8,
            backgroundColor: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          Book now →
        </a>
      )}
    </div>
  );
}

// ── Side Panel ────────────────────────────────────────────────────────────────

function Panel({ building, onClose, isMobile }: {
  building: Building; onClose: () => void; isMobile: boolean;
}) {
  const cat     = getCategory(building);
  const meta    = CATEGORY_META[cat];
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${building.coords[0]},${building.coords[1]}`;

  const base: React.CSSProperties = {
    background: "rgba(10,15,28,0.97)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    overflowY: "auto",
  };

  const panelStyle: React.CSSProperties = isMobile
    ? {
        ...base,
        position: "fixed", left: 0, right: 0, bottom: 0,
        height: "60vh", zIndex: 1000,
        borderTop: `1px solid ${meta.color}44`,
        borderRadius: "20px 20px 0 0",
        boxShadow: `0 -8px 48px rgba(0,0,0,0.7), inset 0 0 32px ${meta.color}06`,
        animation: "lc-slideUp 240ms cubic-bezier(0.4,0,0.2,1) forwards",
      }
    : {
        ...base,
        position: "fixed", top: 64, right: 0, bottom: 0,
        width: 380, zIndex: 1000,
        borderLeft: `1px solid ${meta.color}44`,
        boxShadow: `-8px 0 48px rgba(0,0,0,0.6), inset 0 0 32px ${meta.color}05`,
        animation: "lc-slideRight 240ms cubic-bezier(0.4,0,0.2,1) forwards",
      };

  return (
    <>
      <style>{`
        @keyframes lc-slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes lc-slideUp    { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      {isMobile && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}

      <div style={panelStyle}>
        {/* Drag handle (mobile) */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(30,58,95,0.8)" }} />
          </div>
        )}

        {/* ── Header ── */}
        <div style={{ padding: isMobile ? "10px 20px 0" : "24px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              {/* Category badge */}
              <span style={{
                display: "inline-block", marginBottom: 8,
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em",
                color: meta.color, backgroundColor: `${meta.color}18`,
                border: `1px solid ${meta.color}44`,
                padding: "2px 9px", borderRadius: 5,
              }}>
                {meta.badge}
              </span>
              <h2 style={{
                margin: 0, fontSize: 17, fontWeight: 800, lineHeight: 1.2,
                color: "#e2e2e8", letterSpacing: "-0.02em", fontFamily: "Sora, sans-serif",
              }}>
                {building.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 9,
                backgroundColor: "rgba(30,58,95,0.5)", border: "1px solid rgba(30,58,95,0.7)",
                color: "#6B7FA3", cursor: "pointer",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#6B7FA3", lineHeight: 1.55 }}>
            {building.description}
          </p>

          {/* Action chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 700, color: "#e2e2e8",
                textDecoration: "none", padding: "7px 14px", borderRadius: 9,
                backgroundColor: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              📍 Get directions
            </a>
            <span style={{
              display: "inline-flex", alignItems: "center",
              fontSize: 12, fontWeight: 600, color: "#6B7FA3",
              padding: "7px 14px", borderRadius: 9,
              backgroundColor: "rgba(30,58,95,0.35)", border: "1px solid rgba(30,58,95,0.55)",
            }}>
              🎓 On campus
            </span>
            {hasKeycard(building) && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 12, fontWeight: 600, color: "#ffb4ab",
                padding: "7px 14px", borderRadius: 9,
                backgroundColor: "rgba(255,180,171,0.08)", border: "1px solid rgba(255,180,171,0.22)",
              }}>
                🔒 Keycard areas
              </span>
            )}
          </div>

          <p style={{
            margin: "0 0 12px", fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.16em", color: "#6B7FA3",
          }}>
            Study Spaces · {building.studySpaces.length}
          </p>
        </div>

        {/* ── Space cards ── */}
        <div style={{ padding: "0 20px 16px" }}>
          {building.studySpaces.map((space, i) => (
            <SpaceCard key={i} space={space} />
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: "14px 20px 28px", borderTop: "1px solid rgba(30,58,95,0.4)" }}>
          <a
            href="https://uwaterloo.ca/map/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, fontWeight: 600, color: "#6B7FA3", textDecoration: "none",
              transition: "color 150ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#818CF8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#6B7FA3")}
          >
            View on Campus Map ↗
          </a>
        </div>
      </div>
    </>
  );
}

// ── Building Marker ───────────────────────────────────────────────────────────

function BuildingMarker({
  building, isSelected, isDimmed, visible, onSelect,
}: {
  building: Building;
  isSelected: boolean;
  isDimmed: boolean;
  visible: boolean;
  onSelect: () => void;
}) {
  const [hov, setHov] = useState(false);
  const cat  = getCategory(building);
  const { color, glowRgb } = CATEGORY_META[cat];
  const dotSize = isSelected ? 16 : hov ? 14 : 12;

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        cursor: "pointer",
        opacity: !visible ? 0 : isDimmed ? 0.18 : 1,
        transform: visible ? "scale(1)" : "scale(0.4)",
        transition: "opacity 350ms ease, transform 350ms ease",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {/* Dot + ring + tooltip */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Tooltip */}
        {(hov || isSelected) && (
          <div style={{
            position: "absolute",
            bottom: `calc(100% + ${dotSize / 2 + 8}px)`,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(10,15,28,0.97)",
            border: `1px solid ${color}55`,
            borderRadius: 9, padding: "5px 11px",
            fontSize: 11, fontWeight: 600, color: "#e2e2e8",
            whiteSpace: "nowrap", pointerEvents: "none",
            boxShadow: `0 4px 20px rgba(0,0,0,0.7), 0 0 12px ${color}22`,
            zIndex: 20, fontFamily: "Sora, sans-serif",
          }}>
            <span style={{ color, marginRight: 5, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {building.shortName}
            </span>
            {building.name}
            <div style={{
              position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `5px solid ${color}55`,
            }} />
          </div>
        )}

        {/* Pulse ring when selected */}
        {isSelected && (
          <div style={{
            position: "absolute",
            width: dotSize + 12, height: dotSize + 12,
            borderRadius: "50%",
            border: `1.5px solid ${color}`,
            animation: "lc-sel-ring 1.8s ease-out infinite",
            pointerEvents: "none",
          }} />
        )}

        {/* Dot */}
        <div style={{
          width: dotSize, height: dotSize,
          borderRadius: "50%",
          background: color,
          border: `2px solid rgba(255,255,255,${isSelected ? 0.55 : 0.22})`,
          boxShadow: isSelected
            ? `0 0 0 4px ${color}30, 0 0 28px rgba(${glowRgb},0.9)`
            : `0 0 14px rgba(${glowRgb},0.8)`,
          transition: "width 150ms ease, height 150ms ease, box-shadow 150ms ease",
          animation: `lc-glow-${cat} 3s ease-in-out infinite`,
        }} />
      </div>

      {/* Short name label */}
      <span style={{
        fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
        color: hov || isSelected ? color : "rgba(225,225,232,0.65)",
        fontFamily: "Sora, sans-serif",
        transition: "color 150ms ease",
        userSelect: "none",
        textShadow: "0 1px 6px rgba(0,0,0,1), 0 1px 12px rgba(0,0,0,0.8)",
      }}>
        {building.shortName}
      </span>
    </div>
  );
}

// ── Category Filter Pill ──────────────────────────────────────────────────────

function CategoryFilter({ active, onChange }: { active: FilterKey; onChange: (k: FilterKey) => void }) {
  return (
    <div style={{
      position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
      zIndex: 500,
      display: "inline-flex", alignItems: "center",
      background: "rgba(10,15,28,0.92)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(30,58,95,0.6)",
      borderRadius: 9999, padding: "4px 5px", gap: 2,
      boxShadow: "0 4px 28px rgba(0,0,0,0.6)",
    }}>
      {FILTERS.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              padding: "6px 14px", borderRadius: 9999,
              fontSize: 12, fontWeight: 600,
              border: "none",
              background: isActive ? "rgba(99,102,241,0.22)" : "transparent",
              color: isActive ? "#818CF8" : "#6B7FA3",
              cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease",
              fontFamily: "Sora, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Map Legend ────────────────────────────────────────────────────────────────

function MapLegend() {
  return (
    <div style={{
      position: "absolute", bottom: 28, left: 16, zIndex: 500,
      background: "rgba(10,15,28,0.92)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(30,58,95,0.5)",
      borderRadius: 12, padding: "12px 16px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      fontFamily: "Sora, sans-serif",
    }}>
      <p style={{ margin: "0 0 9px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#6B7FA3" }}>
        Building Types
      </p>
      {[
        { color: "#6366F1", glow: "rgba(99,102,241,0.65)",  label: "Libraries"         },
        { color: "#A855F7", glow: "rgba(168,85,247,0.65)",  label: "College libraries"  },
        { color: "#34D399", glow: "rgba(52,211,153,0.65)",  label: "Study spaces"       },
        { color: "#F59E0B", glow: "rgba(245,158,11,0.65)",  label: "Labs"              },
      ].map(({ color, glow, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", flexShrink: 0, display: "inline-block",
            background: color, boxShadow: `0 0 6px ${glow}`,
          }} />
          <span style={{ fontSize: 12, color: "#b9cacb" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Space Counter ─────────────────────────────────────────────────────────────

function SpaceCounter({ count }: { count: number }) {
  return (
    <div style={{
      position: "absolute", top: 16, right: 16, zIndex: 500,
      background: "rgba(10,15,28,0.92)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(30,58,95,0.5)",
      borderRadius: 10, padding: "7px 14px",
      fontSize: 12, fontWeight: 600, color: "#b9cacb",
      fontFamily: "Sora, sans-serif",
      boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
      whiteSpace: "nowrap",
    }}>
      📍 <span style={{ color: "#818CF8", fontWeight: 700 }}>{count}</span> study spaces on campus
    </div>
  );
}

// ── Token guard ───────────────────────────────────────────────────────────────

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const TOKEN_MISSING = !TOKEN || TOKEN === "pk.eyJ1IjoiZXhhbXBsZSJ9.example";
if (TOKEN_MISSING) {
  console.warn("Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local — get a free token at mapbox.com");
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CampusMap() {
  const [selected,       setSelected]       = useState<Building | null>(null);
  const [isMobile,       setIsMobile]       = useState(false);
  const [activeFilter,   setActiveFilter]   = useState<FilterKey>("all");
  const [visibleMarkers, setVisibleMarkers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Staggered marker fade-in on mount
  useEffect(() => {
    const timers = buildings.map((b, i) =>
      window.setTimeout(() => {
        setVisibleMarkers((prev) => { const next = new Set(prev); next.add(b.id); return next; });
      }, i * 50)
    );
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const filteredSpaceCount = buildings
    .filter((b) => matchesFilter(b, activeFilter))
    .reduce((sum, b) => sum + b.studySpaces.length, 0);

  if (TOKEN_MISSING) {
    return (
      <div style={{
        width: "100%", height: "100%", background: "#0A0F1C",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 12, textAlign: "center", padding: 32,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#6366F1" }}>map</span>
        <h2 style={{ margin: 0, color: "#e2e2e8", fontFamily: "Sora, sans-serif", fontSize: "1.1rem", fontWeight: 700 }}>
          Interactive map unavailable
        </h2>
        <p style={{ margin: 0, color: "#6B7FA3", fontSize: 14, maxWidth: 360, lineHeight: 1.6 }}>
          Add your Mapbox token in <code style={{ color: "#818CF8" }}>.env.local</code> to enable the interactive map.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <style>{`
        @keyframes lc-sel-ring {
          0%   { transform: scale(1);   opacity: 0.85; }
          100% { transform: scale(2.6); opacity: 0;    }
        }
        @keyframes lc-glow-library {
          0%, 100% { box-shadow: 0 0 8px rgba(99,102,241,0.7);  }
          50%       { box-shadow: 0 0 20px rgba(99,102,241,1);   }
        }
        @keyframes lc-glow-college-library {
          0%, 100% { box-shadow: 0 0 8px rgba(168,85,247,0.7);  }
          50%       { box-shadow: 0 0 20px rgba(168,85,247,1);   }
        }
        @keyframes lc-glow-lab {
          0%, 100% { box-shadow: 0 0 8px rgba(245,158,11,0.7);  }
          50%       { box-shadow: 0 0 20px rgba(245,158,11,1);   }
        }
        @keyframes lc-glow-study {
          0%, 100% { box-shadow: 0 0 8px rgba(52,211,153,0.7);  }
          50%       { box-shadow: 0 0 20px rgba(52,211,153,1);   }
        }
        @keyframes lc-glow-cafe {
          0%, 100% { box-shadow: 0 0 8px rgba(52,211,153,0.7);  }
          50%       { box-shadow: 0 0 20px rgba(52,211,153,1);   }
        }
      `}</style>

      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={{ longitude: -80.5435, latitude: 43.4710, zoom: 15.8 }}
        minZoom={14}
        maxZoom={19}
        scrollZoom={!isMobile}
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
              isDimmed={activeFilter !== "all" && !matchesFilter(b, activeFilter)}
              visible={visibleMarkers.has(b.id)}
              onSelect={() => setSelected((prev) => (prev?.id === b.id ? null : b))}
            />
          </Marker>
        ))}
      </Map>

      {/* Category filter — top center */}
      <CategoryFilter
        active={activeFilter}
        onChange={(k) => { setActiveFilter(k); setSelected(null); }}
      />

      {/* Space counter — top right */}
      <SpaceCounter count={filteredSpaceCount} />

      {/* Legend — bottom left */}
      <MapLegend />

      {/* Hint — bottom center when nothing selected */}
      {!selected && (
        <div style={{
          position: "absolute", bottom: 28, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 500, pointerEvents: "none",
          background: "rgba(10,15,28,0.9)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(30,58,95,0.4)",
          borderRadius: 12, padding: "8px 18px",
          fontSize: 13, fontWeight: 500, color: "#b9cacb",
          whiteSpace: "nowrap", fontFamily: "Sora, sans-serif",
        }}>
          Click a marker to explore study spaces
        </div>
      )}

      {/* Side panel / bottom sheet */}
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
