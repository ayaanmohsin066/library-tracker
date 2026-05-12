"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { labs, type Lab } from "@/lib/labData";

/* ── Helpers (data logic — preserved) ─────────────────────────────────────── */

function getLabStatus(lab: Lab): "open" | "in-use" | "closed" {
  if (lab.hours.toLowerCase().includes("24/7")) return "in-use";

  const now      = new Date();
  const day      = now.getDay();
  const hour     = now.getHours();
  const isWeekday = day >= 1 && day <= 5;
  const isSat     = day === 6;
  const isSun     = day === 0;
  const h         = lab.hours.toLowerCase();

  if (isWeekday && h.includes("mon")) {
    const m = h.match(/(\d+)am[–\-](\d+)(am|pm)/);
    if (m) {
      const start = parseInt(m[1]);
      let   endH  = parseInt(m[2]);
      if (m[3] === "pm" && endH !== 12) endH += 12;
      if (hour >= start && hour < endH) return "open";
    }
  }
  if (isSat && h.includes("sat") && hour >= 10 && hour < 18) return "open";
  if (isSun && h.includes("sun") && hour >= 10 && hour < 18) return "open";

  return "closed";
}

/* ── Display helpers ───────────────────────────────────────────────────────── */

function formatHours(hours: string): string {
  if (hours.toLowerCase().includes("24/7")) return "24/7";
  const first = hours.split(",")[0].trim();
  // Shorten "Mon–Fri 8am–10pm" to "Mon–Fri 8–10pm"
  return first.replace(/(\d+)am(–)(\d+)/g, "$1$2$3");
}

function typicalFill(lab: Lab): number {
  const status = getLabStatus(lab);
  if (status === "closed") return 0;
  if (lab.hours.toLowerCase().includes("24/7")) return 32;
  if (lab.type.toLowerCase().includes("graduate")) return 22;
  if (lab.type.toLowerCase().includes("general")) return 48;
  return 35;
}

function barColor(fill: number): string {
  return fill > 80 ? "#ffb4ab" : fill > 50 ? "#f59e0b" : "#34D399";
}

function detectOs(lab: Lab): { icon: string; label: string } | null {
  const text = ((lab.notes ?? "") + " " + lab.type).toLowerCase();
  if (text.includes("mac"))   return { icon: "devices_other", label: "Mac"   };
  if (text.includes("linux")) return { icon: "terminal",      label: "Linux" };
  return null;
}

function detectPrinter(lab: Lab): boolean {
  return (lab.notes ?? "").toLowerCase().includes("print");
}

/* ── Filter type ───────────────────────────────────────────────────────────── */

type Filter = "all" | "mc" | "dc" | "24-7" | "laptop";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",    label: "All"              },
  { key: "mc",     label: "MC Building"      },
  { key: "dc",     label: "DC Building"      },
  { key: "24-7",   label: "24/7 Only"        },
  { key: "laptop", label: "Laptop-Friendly"  },
];

/* ── Building badge ────────────────────────────────────────────────────────── */

function BuildingBadge({ building }: { building: "MC" | "DC" }) {
  const style = building === "MC"
    ? { color: "#818CF8", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.3)"  }
    : { color: "#34D399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)"  };
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, letterSpacing: "0.13em",
      textTransform: "uppercase",
      padding: "2px 8px", borderRadius: 6,
      background: style.bg, border: `1px solid ${style.border}`, color: style.color,
      fontFamily: "Sora, sans-serif",
    }}>
      {building}
    </span>
  );
}

/* ── Hours badge ───────────────────────────────────────────────────────────── */

function HoursBadge({ hours }: { hours: string }) {
  const is247 = hours.toLowerCase().includes("24/7");
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600,
      padding: "3px 9px", borderRadius: 9999,
      background: is247 ? "rgba(99,102,241,0.1)"  : "rgba(30,58,95,0.4)",
      border:     is247 ? "1px solid rgba(99,102,241,0.28)" : "1px solid rgba(30,58,95,0.6)",
      color:      is247 ? "#818CF8" : "#b9cacb",
      fontFamily: "Sora, sans-serif",
      whiteSpace: "nowrap",
    }}>
      {is247 && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1", boxShadow: "0 0 6px rgba(99,102,241,0.8)", display: "inline-block" }} />}
      {formatHours(hours)}
    </span>
  );
}

/* ── Amenity chip ──────────────────────────────────────────────────────────── */

function AmenityChip({ icon, label, accent }: { icon: string; label: string; accent?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500,
      background: accent ? "rgba(52,211,153,0.08)"  : "rgba(17,24,39,0.6)",
      border:     accent ? "1px solid rgba(52,211,153,0.22)" : "1px solid rgba(30,58,95,0.45)",
      color:      accent ? "#34D399" : "#b9cacb",
      fontFamily: "Sora, sans-serif",
      whiteSpace: "nowrap",
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 13, lineHeight: 1 }}>{icon}</span>
      {label}
    </span>
  );
}

/* ── Lab Card ──────────────────────────────────────────────────────────────── */

function LabCard({ lab, mounted }: { lab: Lab; mounted: boolean }) {
  const fill  = typicalFill(lab);
  const color = barColor(fill);
  const os    = detectOs(lab);

  return (
    <div className="glass-panel glass-highlight rounded-2xl" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Header row ─── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <BuildingBadge building={lab.building} />
          <h3 style={{
            margin: "4px 0 0", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.025em",
            color: "#e2e2e8", fontFamily: "Sora, sans-serif", lineHeight: 1.2,
          }}>
            {lab.room}
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "#6B7FA3", lineHeight: 1.3 }}>
            {lab.name}
          </p>
        </div>
        <HoursBadge hours={lab.hours} />
      </div>

      {/* ── Animated seat bar ─── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#6B7FA3", fontFamily: "Sora, sans-serif" }}>
            Typical occupancy
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: "#b9cacb",
            fontFamily: "var(--font-geist-mono), monospace",
          }}>
            {lab.seats} seats
          </span>
        </div>
        <div style={{
          height: 7, borderRadius: 9999, overflow: "hidden",
          background: "rgba(30,58,95,0.45)",
        }}>
          <div style={{
            height: "100%", borderRadius: 9999,
            width: `${mounted ? fill : 0}%`,
            background: `linear-gradient(90deg, ${color}bb, ${color})`,
            boxShadow: mounted && fill > 0 ? `0 0 10px ${color}60` : "none",
            transition: "width 0.8s ease-out, box-shadow 0.8s ease-out",
          }} />
        </div>
      </div>

      {/* ── Amenity icon strip ─── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {lab.laptopFriendly && (
          <AmenityChip icon="laptop_mac"  label="Laptop-friendly" accent />
        )}
        {detectPrinter(lab) && (
          <AmenityChip icon="print"       label="Printer" />
        )}
        <AmenityChip icon="power"         label="Outlets" />
        {os && (
          <AmenityChip icon={os.icon}     label={os.label} />
        )}
      </div>

      {/* ── Access row ─── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#6B7FA3", flexShrink: 0 }}>
          lock
        </span>
        <span style={{ fontSize: 12, color: "#6B7FA3", fontFamily: "Sora, sans-serif" }}>
          {lab.access}
        </span>
      </div>

      {/* ── Notes ─── */}
      {lab.notes && (
        <p style={{
          margin: 0, fontSize: 12, color: "#6B7FA3", fontStyle: "italic",
          lineHeight: 1.5, fontFamily: "Sora, sans-serif",
        }}>
          {lab.notes}
        </p>
      )}
    </div>
  );
}

/* ── Sidebar ───────────────────────────────────────────────────────────────── */

function LabsSidebar() {
  const totalSeats   = labs.reduce((s, l) => s + l.seats, 0);
  const always247    = labs.filter((l) => l.hours.toLowerCase().includes("24/7")).length;

  const stats = [
    { icon: "grid_view",   label: "Total labs",     value: String(labs.length) },
    { icon: "chair",       label: "Total seats",     value: String(totalSeats)  },
    { icon: "schedule",    label: "24/7 available",  value: `${always247} lab${always247 !== 1 ? "s" : ""}` },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Quick Stats */}
      <div className="glass-panel rounded-2xl" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#6366F1",
            boxShadow: "0 0 8px rgba(99,102,241,0.8)",
          }} />
          <span style={{
            fontSize: 10, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.16em", color: "#6B7FA3",
            fontFamily: "Sora, sans-serif",
          }}>
            Quick Stats
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {stats.map(({ icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#6B7FA3" }}>
                  {icon}
                </span>
                <span style={{ fontSize: 13, color: "#b9cacb", fontFamily: "Sora, sans-serif" }}>
                  {label}
                </span>
              </div>
              <span style={{
                fontSize: 15, fontWeight: 800, color: "#818CF8",
                fontFamily: "var(--font-geist-mono), monospace",
                letterSpacing: "-0.02em",
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 18, paddingTop: 16,
          borderTop: "1px solid rgba(30,58,95,0.4)",
          fontSize: 12, color: "#6B7FA3", lineHeight: 1.55,
          fontFamily: "Sora, sans-serif",
          fontStyle: "italic",
        }}>
          <span style={{ color: "#34D399", fontWeight: 600, fontStyle: "normal" }}>Tip:</span>{" "}
          Laptop-friendly labs have outlets at every seat. 24/7 labs require keycard after 6 pm.
        </div>
      </div>

      {/* Campus Map link card */}
      <Link href="/map" style={{ textDecoration: "none" }}>
        <div
          className="glass-panel rounded-2xl"
          style={{
            padding: 22, cursor: "pointer",
            border: "1px solid rgba(99,102,241,0.2)",
            transition: "border-color 200ms ease, box-shadow 200ms ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.45)";
            (e.currentTarget as HTMLDivElement).style.boxShadow  = "0 0 32px rgba(99,102,241,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.2)";
            (e.currentTarget as HTMLDivElement).style.boxShadow  = "none";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: "#818CF8",
              fontFamily: "Sora, sans-serif",
            }}>
              Campus Map
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#818CF8" }}>
              arrow_forward
            </span>
          </div>

          {/* Map preview area */}
          <div style={{
            height: 96, borderRadius: 12, marginBottom: 12,
            background: "linear-gradient(135deg, rgba(10,15,28,0.9) 0%, rgba(13,20,36,0.85) 100%)",
            border: "1px solid rgba(30,58,95,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
          }}>
            {/* Dot grid decoration */}
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.3 }}>
              {Array.from({ length: 6 }, (_, row) =>
                Array.from({ length: 12 }, (_, col) => (
                  <circle key={`${row}-${col}`} cx={col * 22 + 8} cy={row * 18 + 8} r={1.5} fill="#6366F1" />
                ))
              )}
            </svg>
            {/* MC and DC pins */}
            {[
              { x: "38%", y: "45%", label: "MC" },
              { x: "62%", y: "35%", label: "DC" },
            ].map(({ x, y, label }) => (
              <div key={label} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)" }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: "#6366F1",
                  boxShadow: "0 0 10px rgba(99,102,241,0.9)",
                }} />
                <span style={{
                  position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                  marginTop: 3, fontSize: 9, fontWeight: 700, color: "#818CF8",
                  fontFamily: "Sora, sans-serif", whiteSpace: "nowrap",
                }}>{label}</span>
              </div>
            ))}
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: "rgba(30,58,95,0.8)", position: "relative", zIndex: 1 }}>
              map
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 12, color: "#6B7FA3", fontFamily: "Sora, sans-serif", lineHeight: 1.5 }}>
            View all buildings and study spaces in the interactive campus map →
          </p>
        </div>
      </Link>
    </div>
  );
}

/* ── Filter chip ───────────────────────────────────────────────────────────── */

function FilterChip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "7px 16px", borderRadius: 9999, fontSize: 13, fontWeight: 600,
        background: active ? "#6366F1"                        : "rgba(13,20,36,0.75)",
        color:      active ? "#0A0F1C"                        : "#b9cacb",
        border:     active ? "1px solid transparent"          : "1px solid rgba(30,58,95,0.5)",
        boxShadow:  active ? "0 0 18px rgba(99,102,241,0.35)" : "none",
        cursor: "pointer",
        fontFamily: "Sora, sans-serif",
        transition: "background 160ms ease, color 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
      }}
    >
      {label}
    </button>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function LabsPage() {
  const [filter,  setFilter]  = useState<Filter>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const filteredLabs = labs.filter((lab) => {
    if (filter === "mc")     return lab.building === "MC";
    if (filter === "dc")     return lab.building === "DC";
    if (filter === "24-7")   return lab.hours.toLowerCase().includes("24/7");
    if (filter === "laptop") return lab.laptopFriendly;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <div style={{ padding: "0 24px 48px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Page header ────────────────────────────────────────────── */}
        <div style={{
          padding: "28px 0 24px",
          borderBottom: "1px solid rgba(30,58,95,0.4)",
          marginBottom: 24,
        }}>
          <h1 style={{
            margin: "0 0 4px",
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#e2e2e8",
            fontFamily: "Sora, sans-serif",
            lineHeight: 1.1,
          }}>
            Computer Labs
          </h1>
          <p style={{
            margin: "0 0 20px",
            fontSize: 14, color: "#6B7FA3",
            fontFamily: "Sora, sans-serif",
          }}>
            University of Waterloo · CSCF-managed labs
          </p>

          {/* Filter chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {FILTERS.map(({ key, label }) => (
              <FilterChip
                key={key}
                label={label}
                active={filter === key}
                onClick={() => setFilter(key)}
              />
            ))}
          </div>
        </div>

        {/* ── Bento layout: col-span-8 grid / col-span-4 sidebar ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Lab cards (8 cols) ────────────────────────────────── */}
          <div className="lg:col-span-8">
            {filteredLabs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredLabs.map((lab) => (
                  <LabCard key={lab.room} lab={lab} mounted={mounted} />
                ))}
              </div>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: 200,
                background: "rgba(13,20,36,0.5)",
                border: "1px solid rgba(30,58,95,0.4)",
                borderRadius: 16,
              }}>
                <p style={{ fontSize: 14, color: "#6B7FA3", fontFamily: "Sora, sans-serif" }}>
                  No labs match this filter.
                </p>
              </div>
            )}
          </div>

          {/* ── Sidebar (4 cols, hidden on mobile) ───────────────── */}
          <div className="hidden lg:block lg:col-span-4">
            <LabsSidebar />
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid rgba(30,58,95,0.35)" }}>
          <p style={{ fontSize: 12, color: "#6B7FA3", fontFamily: "Sora, sans-serif" }}>
            Lab data via CSCF · Not real-time · Hours subject to change ·{" "}
            <a
              href="https://cs.uwaterloo.ca/about/resources/computing-facilities"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#818CF8", textDecoration: "none" }}
            >
              Official CSCF page →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
