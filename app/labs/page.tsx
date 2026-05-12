"use client";

import Link from "next/link";
import { labs, type Lab } from "@/lib/labData";

/* ── Helpers ───────────────────────────────────────────────────────────── */

function getLabStatus(lab: Lab): "open" | "in-use" | "closed" {
  if (lab.hours.toLowerCase().includes("24/7")) return "in-use";

  const now = new Date();
  const day  = now.getDay();   // 0=Sun, 6=Sat
  const hour = now.getHours();
  const isWeekday = day >= 1 && day <= 5;
  const isSat     = day === 6;
  const isSun     = day === 0;
  const h = lab.hours.toLowerCase();

  if (isWeekday && h.includes("mon")) {
    // Detect closing hour from patterns like "8am–10pm" or "9am–5pm"
    const m = h.match(/(\d+)am[–\-](\d+)(am|pm)/);
    if (m) {
      const start   = parseInt(m[1]);
      let   endH    = parseInt(m[2]);
      if (m[3] === "pm" && endH !== 12) endH += 12;
      if (hour >= start && hour < endH) return "open";
    }
  }
  if (isSat && h.includes("sat") && hour >= 10 && hour < 18) return "open";
  if (isSun && h.includes("sun") && hour >= 10 && hour < 18) return "open";

  return "closed";
}

function statusLabel(s: "open" | "in-use" | "closed") {
  if (s === "open")    return "Open";
  if (s === "in-use")  return "24/7";
  return "Closed";
}

/* ── Building badge ─────────────────────────────────────────────────────── */

function BuildingBadge({ building }: { building: "MC" | "DC" }) {
  const palette = {
    MC: { color: "#00dbe9", bg: "rgba(0,219,233,0.1)",   border: "rgba(0,219,233,0.3)"   },
    DC: { color: "#7df4ff", bg: "rgba(125,244,255,0.1)", border: "rgba(125,244,255,0.3)" },
  }[building];

  return (
    <span
      className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
      style={{
        color:           palette.color,
        background:      palette.bg,
        border:          `1px solid ${palette.border}`,
        letterSpacing:   "0.1em",
        fontFamily:      "Sora, sans-serif",
      }}
    >
      {building}
    </span>
  );
}

/* ── Status badge ───────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: "open" | "in-use" | "closed" }) {
  if (status === "closed") {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: "rgba(255,180,171,0.12)",
          border:     "1px solid rgba(255,180,171,0.3)",
          color:      "#ffb4ab",
          fontFamily: "Sora, sans-serif",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#ffb4ab" }} />
        Closed
      </span>
    );
  }

  const isAlways = status === "in-use";
  const dotClass = isAlways ? "breathing-blue" : "breathing-mint";
  const color    = isAlways ? "#00dbe9" : "#2ae500";
  const bg       = isAlways ? "rgba(0,219,233,0.1)"  : "rgba(42,229,0,0.1)";
  const border   = isAlways ? "rgba(0,219,233,0.3)"  : "rgba(42,229,0,0.3)";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${dotClass}`}
      style={{
        background: bg,
        border:     `1px solid ${border}`,
        color,
        fontFamily: "Sora, sans-serif",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {statusLabel(status)}
    </span>
  );
}

/* ── Access chip ────────────────────────────────────────────────────────── */

function Chip({ icon, label, accent }: { icon: string; label: string; accent?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        background: accent ? "rgba(42,229,0,0.08)"  : "rgba(59,73,75,0.3)",
        border:     accent ? "1px solid rgba(42,229,0,0.25)" : "1px solid rgba(59,73,75,0.5)",
        color:      accent ? "#2ae500" : "#b9cacb",
        fontFamily: "Sora, sans-serif",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{icon}</span>
      {label}
    </span>
  );
}

/* ── Lab card ───────────────────────────────────────────────────────────── */

function LabCard({ lab }: { lab: Lab }) {
  const status  = getLabStatus(lab);
  const totalSeats = lab.seats;
  /* Simulate an occupancy bar — static placeholder */
  const fakeFill = status === "closed" ? 0 : status === "in-use" ? 85 : 40;
  const barColor = fakeFill > 75 ? "#00dbe9" : "#2ae500";

  return (
    <div className="glass-panel glass-highlight rounded-xl p-6 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <BuildingBadge building={lab.building} />
          <h3
            className="text-lg font-bold mt-1"
            style={{ color: "#e2e2e8", fontFamily: "Sora, sans-serif", letterSpacing: "-0.02em" }}
          >
            {lab.room}
          </h3>
          <p className="text-xs" style={{ color: "#b9cacb" }}>{lab.name}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Linear progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "#849495" }}>
          <span>Typical occupancy</span>
          <span style={{ color: barColor, fontWeight: 600 }}>{fakeFill}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(59,73,75,0.4)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${fakeFill}%`,
              background: barColor,
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      {/* Detail row */}
      <div className="flex flex-col gap-2 text-xs" style={{ color: "#b9cacb" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#849495" }}>schedule</span>
          {lab.hours}
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#849495" }}>chair</span>
          {totalSeats} seats · {lab.type}
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#849495" }}>lock</span>
          {lab.access}
        </div>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {lab.laptopFriendly && (
          <Chip icon="laptop_mac" label="Laptop-friendly" accent />
        )}
        <Chip icon="key" label={lab.access.includes("grad") ? "Keycard" : "WatIAM"} />
      </div>

      {/* Notes */}
      {lab.notes && (
        <p className="text-xs leading-relaxed" style={{ color: "#849495" }}>
          {lab.notes}
        </p>
      )}
    </div>
  );
}

/* ── Labs sidebar ───────────────────────────────────────────────────────── */

function LabsSidebar() {
  const totalSeats = labs.reduce((sum, l) => sum + l.seats, 0);
  const laptopLabs = labs.filter((l) => l.laptopFriendly).length;
  const mcCount    = labs.filter((l) => l.building === "MC").length;
  const dcCount    = labs.filter((l) => l.building === "DC").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Map card */}
      <Link
        href="/map"
        className="glass-panel rounded-xl p-5 flex flex-col gap-3 no-underline group"
        style={{ borderColor: "rgba(0,219,233,0.2)" }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-semibold"
            style={{ color: "#00dbe9", fontFamily: "Sora, sans-serif" }}
          >
            Campus Map
          </span>
          <span
            className="material-symbols-outlined transition-transform group-hover:translate-x-1"
            style={{ color: "#00dbe9", fontSize: 18 }}
          >
            arrow_forward
          </span>
        </div>
        <div
          className="w-full rounded-lg flex items-center justify-center"
          style={{
            height: 100,
            background: "rgba(0,219,233,0.05)",
            border: "1px solid rgba(0,219,233,0.15)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#3b494b" }}>
            map
          </span>
        </div>
        <p className="text-xs" style={{ color: "#849495" }}>
          View all buildings and study spaces in the interactive 3D map
        </p>
      </Link>

      {/* Live metrics panel */}
      <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span
            className="pulse-dot w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#2ae500" }}
          />
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#849495", fontFamily: "Sora, sans-serif", letterSpacing: "0.14em" }}
          >
            Lab Metrics
          </span>
        </div>

        {[
          { icon: "grid_view",    label: "Total Labs",       value: String(labs.length) },
          { icon: "chair",        label: "Total Seats",      value: String(totalSeats)  },
          { icon: "laptop_mac",   label: "Laptop-friendly",  value: `${laptopLabs} labs` },
          { icon: "school",       label: "MC Building",      value: `${mcCount} labs`   },
          { icon: "computer",     label: "DC Building",      value: `${dcCount} labs`   },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#849495" }}>
                {icon}
              </span>
              <span className="text-xs" style={{ color: "#b9cacb", fontFamily: "Sora, sans-serif" }}>
                {label}
              </span>
            </div>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: "#00dbe9", fontFamily: "Sora, sans-serif" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Tip card */}
      <div
        className="rounded-xl p-4 text-xs"
        style={{
          background: "rgba(42,229,0,0.05)",
          border: "1px solid rgba(42,229,0,0.15)",
          color: "#849495",
          fontFamily: "Sora, sans-serif",
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: "#2ae500", fontWeight: 600 }}>Tip:</span> Laptop-friendly labs have power outlets at every seat. Labs marked 24/7 require keycard access after 6pm.
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function LabsPage() {
  const mcLabs = labs.filter((l) => l.building === "MC");
  const dcLabs = labs.filter((l) => l.building === "DC");

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#111318" }}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight"
          style={{ color: "#e2e2e8", fontFamily: "Sora, sans-serif" }}
        >
          Computer Labs
        </h1>
        <div
          className="pulse-dot w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: "#00dbe9" }}
          title="Lab Hub"
        />
      </div>
      <p className="text-sm mb-8" style={{ color: "#849495", fontFamily: "Sora, sans-serif" }}>
        Lab Availability Hub · University of Waterloo
      </p>

      {/* ── Bento grid: col-span-8 labs / col-span-4 sidebar ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Lab cards — col-span-8 */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* MC section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#849495", letterSpacing: "0.14em", fontFamily: "Sora, sans-serif" }}
              >
                Math &amp; Computing (MC)
              </h2>
              <div className="flex-1 h-px" style={{ background: "rgba(59,73,75,0.4)" }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mcLabs.map((lab) => <LabCard key={lab.room} lab={lab} />)}
            </div>
          </section>

          {/* DC section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#849495", letterSpacing: "0.14em", fontFamily: "Sora, sans-serif" }}
              >
                Davis Centre (DC)
              </h2>
              <div className="flex-1 h-px" style={{ background: "rgba(59,73,75,0.4)" }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dcLabs.map((lab) => <LabCard key={lab.room} lab={lab} />)}
            </div>
          </section>
        </div>

        {/* Sidebar — col-span-4 */}
        <div className="lg:col-span-4">
          <LabsSidebar />
        </div>
      </div>
    </div>
  );
}
