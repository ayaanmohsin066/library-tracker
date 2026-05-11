"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { buildings, type Building, type StudySpace } from "@/lib/buildingData";

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasKeycard(b: Building) {
  return b.studySpaces.some((s) => s.keycardRequired);
}

// ── Custom circular marker ────────────────────────────────────────────────────

function markerIcon(b: Building, selected: boolean): L.DivIcon {
  const bg   = selected ? "#06b6d4" : "rgba(6,182,212,0.88)";
  const glow = selected
    ? "0 0 18px rgba(6,182,212,0.85),0 2px 8px rgba(0,0,0,0.5)"
    : "0 0 8px rgba(6,182,212,0.4),0 2px 6px rgba(0,0,0,0.35)";
  const ring = selected ? "2px solid rgba(255,255,255,0.55)" : "2px solid rgba(6,182,212,0.35)";
  const scale = selected ? "1.12" : "1";
  const lock = hasKeycard(b)
    ? `<span style="position:absolute;top:-4px;right:-4px;font-size:9px;line-height:1;background:#0a0a0f;border-radius:50%;padding:1px;">🔒</span>`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:36px;height:36px;">
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:${bg};
        display:flex;align-items:center;justify-content:center;
        font-size:11px;font-weight:800;color:#fff;
        font-family:system-ui,-apple-system,sans-serif;
        letter-spacing:-0.01em;
        box-shadow:${glow};
        border:${ring};
        transform:scale(${scale});
        transition:transform 150ms ease,box-shadow 150ms ease;
      ">${b.shortName}</div>
      ${lock}
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// ── Noise level badge ─────────────────────────────────────────────────────────

const NOISE_MAP = {
  silent:        { icon: "🔇", label: "Silent",        color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  quiet:         { icon: "🤫", label: "Quiet",         color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
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
      backgroundColor: "rgba(148,163,184,0.1)", color: "var(--text-secondary)",
      border: "1px solid rgba(148,163,184,0.2)",
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
      backgroundColor: red ? "rgba(239,68,68,0.1)" : "rgba(6,182,212,0.1)",
      color: red ? "#ef4444" : "#06b6d4",
      border: `1px solid ${red ? "rgba(239,68,68,0.3)" : "rgba(6,182,212,0.25)"}`,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ── Study space row ───────────────────────────────────────────────────────────

function SpaceRow({ space }: { space: StudySpace }) {
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      {/* Name + floor */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {space.name}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>{space.floor}</p>
        </div>
        <NoiseBadge level={space.noiseLevel} />
      </div>

      {/* Chips row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
        <TypeBadge type={space.type} />
        {space.outlets && <Chip label="🔌 Outlets" />}
        {space.printer && <Chip label="🖨️ Printer" />}
        {space.keycardRequired && <Chip label="🔒 Keycard" red />}
      </div>

      {/* Notes */}
      {space.notes && (
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
          {space.notes}
        </p>
      )}

      {/* Book now button */}
      {space.bookingUrl && (
        <a
          href={space.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 700,
            color: "#06b6d4", textDecoration: "none",
            padding: "4px 10px", borderRadius: 7,
            backgroundColor: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.3)",
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

function Panel({
  building, onClose, isMobile,
}: {
  building: Building;
  onClose: () => void;
  isMobile: boolean;
}) {
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed", left: 0, right: 0, bottom: 0,
        maxHeight: "65vh", zIndex: 1000,
        backgroundColor: "var(--bg-elevated)",
        borderTop: "1px solid var(--border)",
        borderRadius: "20px 20px 0 0",
        overflowY: "auto",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.45)",
        animation: "lc-slideUp 240ms cubic-bezier(0.4,0,0.2,1) forwards",
      }
    : {
        position: "fixed", top: 60, right: 0, bottom: 0,
        width: 360, zIndex: 1000,
        backgroundColor: "var(--bg-elevated)",
        borderLeft: "1px solid var(--border)",
        overflowY: "auto",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.35)",
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
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}

      <div style={panelStyle}>
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "var(--border)" }} />
          </div>
        )}

        <div style={{ padding: isMobile ? "12px 20px 0" : "24px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, lineHeight: 1.25, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {building.name}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close panel"
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 8,
                backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)",
                color: "var(--text-muted)", cursor: "pointer", marginTop: 1,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          </div>
          <p style={{ margin: "5px 0 10px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.45 }}>
            {building.description}
          </p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${building.coords[0]},${building.coords[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, fontWeight: 600,
              color: "var(--text-secondary)", textDecoration: "none",
              padding: "5px 11px", borderRadius: 8, marginBottom: 14,
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              transition: "border-color 150ms ease, color 150ms ease",
            }}
          >
            📍 Get directions
          </a>
          <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)" }}>
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
      <MapContainer
        center={[43.4723, -80.5449]}
        zoom={16}
        style={{ width: "100%", height: "100%" }}
        zoomControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {buildings.map((b) => (
          <Marker
            key={b.id}
            position={b.coords}
            icon={markerIcon(b, selected?.id === b.id)}
            eventHandlers={{
              click: () => setSelected((prev) => (prev?.id === b.id ? null : b)),
            }}
          />
        ))}
      </MapContainer>

      {!selected && (
        <div style={{
          position: "absolute", bottom: 28, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 500, pointerEvents: "none",
          backgroundColor: "rgba(10,10,15,0.82)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: "8px 18px",
          fontSize: 13, fontWeight: 500, color: "var(--text-secondary)",
          whiteSpace: "nowrap",
        }}>
          Click any building to see available study spaces
        </div>
      )}

      {selected && (
        <Panel building={selected} onClose={() => setSelected(null)} isMobile={isMobile} />
      )}
    </div>
  );
}
