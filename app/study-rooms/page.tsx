"use client";

import { useState } from "react";
import { buildings } from "@/lib/buildingData";
import type { Building, StudySpace } from "@/lib/buildingData";

// ── Data ────────────────────────────────────────────────────────────────────

type RoomEntry = StudySpace & { building: Building };

const ALL_ROOMS: RoomEntry[] = buildings.flatMap((b) =>
  b.studySpaces
    .filter((s) => s.type === "group")
    .map((s) => ({ ...s, building: b }))
);

function isBookable(r: RoomEntry) {
  return Boolean(r.bookingUrl);
}
function is247(r: RoomEntry) {
  return r.notes.includes("24/7") || r.building.description.includes("24/7");
}
function isFirstCome(r: RoomEntry) {
  return !isBookable(r) && !is247(r);
}

const FILTERS = [
  { key: "all",       label: "All"            },
  { key: "bookable",  label: "Bookable Online" },
  { key: "firstcome", label: "First-come"      },
  { key: "247",       label: "24 / 7"          },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function matchesFilter(r: RoomEntry, f: FilterKey): boolean {
  if (f === "all")       return true;
  if (f === "bookable")  return isBookable(r);
  if (f === "firstcome") return isFirstCome(r);
  if (f === "247")       return is247(r);
  return true;
}

// ── Noise badge ──────────────────────────────────────────────────────────────

const NOISE_META = {
  silent:        { label: "Silent",        color: "#818cf8", bg: "rgba(129,140,248,0.12)" },
  quiet:         { label: "Quiet",         color: "#34D399", bg: "rgba(52,211,153,0.12)"  },
  collaborative: { label: "Collaborative", color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

function NoiseBadge({ level }: { level: StudySpace["noiseLevel"] }) {
  const n = NOISE_META[level];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
      backgroundColor: n.bg, color: n.color, border: `1px solid ${n.color}44`,
      whiteSpace: "nowrap",
    }}>
      {n.label}
    </span>
  );
}

// ── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ room }: { room: RoomEntry }) {
  const bookable = isBookable(room);
  const available247 = is247(room);
  const label = bookable
    ? "Bookable online"
    : available247
    ? "24 / 7 access"
    : "First-come, first-served";
  const color = bookable ? "#818CF8" : available247 ? "#34D399" : "#f59e0b";
  const bg    = bookable
    ? "rgba(129,140,248,0.1)"
    : available247
    ? "rgba(52,211,153,0.1)"
    : "rgba(245,158,11,0.1)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
      backgroundColor: bg, color, border: `1px solid ${color}44`,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ── Room Card ────────────────────────────────────────────────────────────────

function RoomCard({ room }: { room: RoomEntry }) {
  const [hov, setHov] = useState(false);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${room.building.coords[0]},${room.building.coords[1]}`;
  const hours = is247(room) ? "24 / 7" : "Check building hours";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "22px 24px",
        borderRadius: 18,
        background: hov ? "rgba(99,102,241,0.05)" : "rgba(13,20,36,0.72)",
        border: `1px solid ${hov ? "rgba(99,102,241,0.35)" : "rgba(30,58,95,0.45)"}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        transition: "border-color 180ms ease, background 180ms ease, box-shadow 180ms ease",
        boxShadow: hov ? "0 8px 32px rgba(99,102,241,0.1)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Building + room name */}
      <div>
        <p style={{
          margin: "0 0 3px",
          fontSize: 11, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.12em",
          color: "#6B7FA3",
          fontFamily: "Sora, sans-serif",
        }}>
          {room.building.name}
        </p>
        <h3 style={{
          margin: 0,
          fontSize: "1rem", fontWeight: 700, lineHeight: 1.3,
          color: "#e2e2e8", fontFamily: "Sora, sans-serif",
          letterSpacing: "-0.01em",
        }}>
          {room.name}
        </h3>
        {room.floor && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7FA3" }}>
            {room.floor}
          </p>
        )}
      </div>

      {/* Badges row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <TypeBadge room={room} />
        <NoiseBadge level={room.noiseLevel} />
        {room.keycardRequired && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
            backgroundColor: "rgba(255,180,171,0.1)", color: "#ffb4ab",
            border: "1px solid rgba(255,180,171,0.3)",
          }}>
            🔒 Keycard
          </span>
        )}
        {room.outlets && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
            backgroundColor: "rgba(99,102,241,0.08)", color: "#b9cacb",
            border: "1px solid rgba(99,102,241,0.18)",
          }}>
            🔌 Outlets
          </span>
        )}
      </div>

      {/* Hours */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#6B7FA3" }}>schedule</span>
        <span style={{ fontSize: 13, color: "#b9cacb" }}>{hours}</span>
      </div>

      {/* Notes */}
      {room.notes && (
        <p style={{
          margin: 0, fontSize: 12, color: "#6B7FA3", lineHeight: 1.6,
          fontFamily: "Sora, sans-serif",
        }}>
          {room.notes}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2 }}>
        {room.bookingUrl && (
          <a
            href={room.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700,
              background: "#6366F1", color: "#fff",
              textDecoration: "none",
              transition: "opacity 150ms ease",
              fontFamily: "Sora, sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Book now →
          </a>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: "rgba(30,58,95,0.5)",
            border: "1px solid rgba(30,58,95,0.7)",
            color: "#b9cacb",
            textDecoration: "none",
            transition: "border-color 150ms ease, color 150ms ease",
            fontFamily: "Sora, sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
            e.currentTarget.style.color = "#e2e2e8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(30,58,95,0.7)";
            e.currentTarget.style.color = "#b9cacb";
          }}
        >
          📍 Get directions
        </a>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function StudyRoomsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const rooms = ALL_ROOMS.filter((r) => matchesFilter(r, filter));

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-base)",
        padding: "48px 24px 96px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: 36 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.22em", color: "var(--accent)",
          marginBottom: 12, fontFamily: "Sora, sans-serif",
        }}>
          ✦ UWaterloo Campus
        </p>
        <h1 style={{
          margin: "0 0 10px",
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          fontWeight: 900, letterSpacing: "-0.03em",
          color: "var(--text-primary)",
          fontFamily: "Sora, sans-serif",
        }}>
          Group Study Rooms
        </h1>
        <p style={{
          margin: 0, fontSize: 15, color: "var(--text-secondary)",
          lineHeight: 1.6, maxWidth: 560,
        }}>
          Bookable study rooms across UWaterloo campus. Filter by availability,
          booking type, or 24/7 access.
        </p>
      </div>

      {/* ── Filter chips ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "8px 18px",
                borderRadius: 9999,
                fontSize: 13, fontWeight: 600,
                border: `1px solid ${active ? "rgba(99,102,241,0.6)" : "rgba(30,58,95,0.5)"}`,
                background: active ? "rgba(99,102,241,0.15)" : "transparent",
                color: active ? "#818CF8" : "#6B7FA3",
                cursor: "pointer",
                transition: "all 150ms ease",
                fontFamily: "Sora, sans-serif",
              }}
            >
              {label}
              {key !== "all" && (
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                  ({ALL_ROOMS.filter((r) => matchesFilter(r, key)).length})
                </span>
              )}
            </button>
          );
        })}
        <span style={{
          marginLeft: "auto", alignSelf: "center",
          fontSize: 12, color: "#6B7FA3",
          fontFamily: "Sora, sans-serif",
        }}>
          {rooms.length} room{rooms.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Cards grid ── */}
      {rooms.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "64px 24px",
          color: "#6B7FA3", fontFamily: "Sora, sans-serif",
        }}>
          <p style={{ fontSize: 15 }}>No rooms match this filter.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 18,
        }}>
          {rooms.map((room, i) => (
            <RoomCard key={`${room.building.id}-${i}`} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
