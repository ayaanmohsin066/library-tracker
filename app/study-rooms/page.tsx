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
  silent:        { label: "Silent",        color: "var(--brass)", bg: "rgba(214,166,92,0.12)" },
  quiet:         { label: "Quiet",         color: "var(--quiet)", bg: "rgba(111,211,168,0.12)"  },
  collaborative: { label: "Collaborative", color: "var(--busy)", bg: "rgba(242,169,59,0.12)"  },
};

function NoiseBadge({ level }: { level: StudySpace["noiseLevel"] }) {
  const n = NOISE_META[level];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
      backgroundColor: n.bg, color: n.color, border: `1px solid color-mix(in srgb, ${n.color} 30%, transparent)`,
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
  const color = bookable ? "var(--brass)" : available247 ? "var(--quiet)" : "var(--busy)";
  const bg    = bookable
    ? "rgba(214,166,92,0.1)"
    : available247
    ? "rgba(111,211,168,0.1)"
    : "rgba(242,169,59,0.1)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
      backgroundColor: bg, color, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
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
        background: hov ? "rgba(214,166,92,0.05)" : "var(--ink-1)",
        border: `1px solid ${hov ? "rgba(214,166,92,0.35)" : "var(--line)"}`,
        transition: "border-color 180ms ease, background 180ms ease, box-shadow 180ms ease",
        boxShadow: hov ? "0 8px 32px rgba(214,166,92,0.1)" : "none",
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
          color: "var(--paper-2)",
          fontFamily: "var(--font-sans)",
        }}>
          {room.building.name}
        </p>
        <h3 style={{
          margin: 0,
          fontSize: "1rem", fontWeight: 700, lineHeight: 1.3,
          color: "var(--paper-0)", fontFamily: "var(--font-sans)",
          letterSpacing: "-0.01em",
        }}>
          {room.name}
        </h3>
        {room.floor && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--paper-2)" }}>
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
            backgroundColor: "rgba(242,115,90,0.1)", color: "var(--full)",
            border: "1px solid rgba(242,115,90,0.3)",
          }}>
            🔒 Keycard
          </span>
        )}
        {room.outlets && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
            backgroundColor: "rgba(214,166,92,0.08)", color: "var(--paper-1)",
            border: "1px solid rgba(214,166,92,0.18)",
          }}>
            Outlets
          </span>
        )}
      </div>

      {/* Hours */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15, color: "var(--paper-2)" }}>schedule</span>
        <span style={{ fontSize: 13, color: "var(--paper-1)" }}>{hours}</span>
      </div>

      {/* Notes */}
      {room.notes && (
        <p style={{
          margin: 0, fontSize: 12, color: "var(--paper-2)", lineHeight: 1.6,
          fontFamily: "var(--font-sans)",
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
              background: "var(--brass)", color: "var(--ink-0)",
              textDecoration: "none",
              transition: "opacity 150ms ease",
              fontFamily: "var(--font-sans)",
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
            background: "var(--line-strong)",
            border: "1px solid var(--line-strong)",
            color: "var(--paper-1)",
            textDecoration: "none",
            transition: "border-color 150ms ease, color 150ms ease",
            fontFamily: "var(--font-sans)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(214,166,92,0.4)";
            e.currentTarget.style.color = "var(--paper-0)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--line-strong)";
            e.currentTarget.style.color = "var(--paper-1)";
          }}
        >
          Get directions
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
    <div className="container-lc" style={{ paddingTop: 56, paddingBottom: "var(--s-16)" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 36 }}>
        <p className="eyebrow animate-fade-up">University of Waterloo</p>
        <h1 className="display animate-fade-up" style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)", margin: "16px 0 16px", animationDelay: "60ms" }}>
          Group study rooms
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
              type="button"
              className="chip"
              aria-pressed={active}
              onClick={() => setFilter(key)}
            >
              {label}
              {key !== "all" && (
                <span style={{ marginLeft: 6, fontSize: 11 }}>
                  ({ALL_ROOMS.filter((r) => matchesFilter(r, key)).length})
                </span>
              )}
            </button>
          );
        })}
        <span style={{
          marginLeft: "auto", alignSelf: "center",
          fontSize: 12, color: "var(--paper-2)",
          fontFamily: "var(--font-sans)",
        }}>
          {rooms.length} room{rooms.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Cards grid ── */}
      {rooms.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "64px 24px",
          color: "var(--paper-2)", fontFamily: "var(--font-sans)",
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
