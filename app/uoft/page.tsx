"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";

// ── Data ──────────────────────────────────────────────────────────────────────

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const POPULAR_TIMES: Record<DayKey, number[]> = {
  mon: [1, 2, 3, 5, 7, 8, 5, 5, 5, 4, 4, 3, 2],
  tue: [1, 2, 4, 6, 8, 9, 10, 8, 7, 6, 5, 3, 2],
  wed: [1, 2, 4, 6, 8, 9, 10, 8, 6, 5, 5, 4, 3],
  thu: [1, 3, 5, 7, 8, 9, 10, 8, 7, 4, 3, 2, 1],
  fri: [1, 2, 3, 4, 5, 5, 5, 5, 4, 3, 2, 1, 1],
  sat: [1, 1, 1, 2, 2, 3, 3, 3, 3, 3, 3, 2, 1],
  sun: [0, 1, 1, 2, 2, 3, 3, 3, 4, 3, 3, 3, 2],
};

const LIBRARIES = [
  { name: "Robarts Library",            description: "Main research library with 14 floors of collections.",         hours: "Mon–Thu 8am–10pm · Fri 8am–8pm · Sat–Sun 10am–8pm", bookingUrl: "https://libcal.library.utoronto.ca/r/search/robarts" },
  { name: "Gerstein Library",           description: "Health sciences library open 24/7 during the semester.",        hours: "Open 24/7 during term",                                 bookingUrl: "https://libcal.library.utoronto.ca/reserve/gerstein" },
  { name: "OISE Library",               description: "Specializes in education and social work resources.",           hours: "Mon–Fri 9am–8pm · Sat 10am–5pm",                        bookingUrl: "https://libcal.library.utoronto.ca/r/search/OISE" },
  { name: "Engineering & CS Library",   description: "Technical resources for engineering and computer science.",    hours: "Mon–Fri 8:30am–8pm · Sat 10am–5pm",                     bookingUrl: "https://libcal.library.utoronto.ca/reserve/engineering" },
  { name: "University College Library", description: "Intimate reading rooms in a historic building.",               hours: "Mon–Fri 9am–7pm",                                       bookingUrl: "https://libcal.library.utoronto.ca/r/search/uclibrary" },
  { name: "Chemistry Library",          description: "Specialized chemistry and materials science collection.",       hours: "Mon–Fri 9am–5pm",                                       bookingUrl: "https://libcal.library.utoronto.ca/reserve/chemistry" },
  { name: "John W. Graham Library",     description: "Trinity College library with rare book holdings.",             hours: "Mon–Fri 9am–6pm",                                       bookingUrl: "https://libcal.library.utoronto.ca/r/search/graham" },
  { name: "John M. Kelly Library",      description: "St. Michael's College library with theology collections.",     hours: "Mon–Fri 9am–7pm · Sat 12pm–5pm",                        bookingUrl: "https://libcal.library.utoronto.ca/r/search/kelly" },
  { name: "UTSC Library",               description: "Full-service library at the Scarborough campus.",              hours: "Mon–Thu 8am–10pm · Fri 8am–7pm · Sat–Sun 10am–6pm",    bookingUrl: "https://libcal.library.utoronto.ca/reserve/spaces/utsclibrary" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const JS_DAY_TO_KEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function todayKey(): DayKey { return JS_DAY_TO_KEY[new Date().getDay()]; }
function currentHourIndex(): number | null {
  const h = new Date().getHours();
  if (h < 9 || h > 21) return null;
  return h - 9;
}
function barColor(value: number, isCurrent: boolean): string {
  if (isCurrent) return value <= 4 ? "#059669" : value <= 7 ? "#d97706" : "#dc2626";
  return value <= 4 ? "#10b981" : value <= 7 ? "#f59e0b" : "#ef4444";
}
function hourLabel(i: number): string {
  const h = 9 + i;
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

// ── Chart ─────────────────────────────────────────────────────────────────────

interface ChartEntry { hour: string; value: number; index: number; }

function BusynessChart({ dayKey, isToday }: { dayKey: DayKey; isToday: boolean }) {
  const values   = POPULAR_TIMES[dayKey];
  const curIdx   = isToday ? currentHourIndex() : null;
  const chartData: ChartEntry[] = values.map((value, index) => ({ hour: hourLabel(index), value, index }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} barCategoryGap="22%">
        <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} interval={1} />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const { hour, value } = payload[0].payload as ChartEntry;
            return (
              <div style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-strong)", color: "var(--text-primary)", boxShadow: "0 4px 16px rgba(0,0,0,0.4)", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{hour}</span>
                <span style={{ marginLeft: 8, color: "var(--text-muted)" }}>busyness {value}/10</span>
              </div>
            );
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.index} fill={barColor(entry.value, entry.index === curIdx)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UoftPage() {
  const today = todayKey();
  const [selectedDay, setSelectedDay] = useState<DayKey>(today);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden", padding: "88px 24px 48px" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
            University of Toronto
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-muted)" }}>Historical occupancy data</p>
        </div>
      </section>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px 80px" }}>

        {/* Notice */}
        <div style={{ backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", borderRadius: 12, padding: "12px 16px", fontSize: 13, marginBottom: 24 }}>
          Live occupancy unavailable for UofT — showing typical busy patterns based on historical data.
        </div>

        {/* Popular times */}
        <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "28px", marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Popular Times</h2>

          {/* Day selector */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {DAYS.map(({ key, label }) => {
              const isSel   = selectedDay === key;
              const isToday = key === today;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  style={isSel
                    ? { backgroundColor: "var(--accent)", color: "#fff", boxShadow: "0 0 12px var(--accent-glow)", border: "1px solid transparent", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer", minHeight: 36 }
                    : { backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)", outline: isToday ? "2px solid var(--border-strong)" : undefined, outlineOffset: isToday ? "2px" : undefined, borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer", minHeight: 36 }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Chart */}
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 480 }}>
              <BusynessChart dayKey={selectedDay} isToday={selectedDay === today} />
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
            {[["#10b981", "Not busy"], ["#f59e0b", "Moderate"], ["#ef4444", "Busy"]].map(([c, l]) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: c }} />
                {l}
              </span>
            ))}
            {selectedDay === today && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--accent)" }} />
                Current hour
              </span>
            )}
          </div>
        </div>

        {/* Library grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LIBRARIES.map((lib) => (
            <div
              key={lib.name}
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{lib.name}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 8, flex: 1 }}>{lib.description}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                <span style={{ marginRight: 4 }}>🕐</span>{lib.hours}
              </p>
              <a
                href={lib.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 4, backgroundColor: "var(--accent)", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, textDecoration: "none", alignSelf: "flex-start", transition: "opacity 150ms ease" }}
              >
                Book a Room <span aria-hidden="true">→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
