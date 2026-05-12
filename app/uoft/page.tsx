"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

/* ── Data ──────────────────────────────────────────────────────────────── */

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

/* ── Helpers ───────────────────────────────────────────────────────────── */

const JS_DAY_TO_KEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function todayKey(): DayKey { return JS_DAY_TO_KEY[new Date().getDay()]; }
function currentHourIndex(): number | null {
  const h = new Date().getHours();
  if (h < 9 || h > 21) return null;
  return h - 9;
}
function barColor(value: number, isCurrent: boolean): string {
  if (isCurrent) return value <= 4 ? "#1eb300" : value <= 7 ? "#d97706" : "#e0847c";
  return value <= 4 ? "#2ae500" : value <= 7 ? "#f59e0b" : "#ffb4ab";
}
function hourLabel(i: number): string {
  const h = 9 + i;
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

/* ── Chart ─────────────────────────────────────────────────────────────── */

interface ChartEntry { hour: string; value: number; index: number; }

function BusynessChart({ dayKey, isToday }: { dayKey: DayKey; isToday: boolean }) {
  const values  = POPULAR_TIMES[dayKey];
  const curIdx  = isToday ? currentHourIndex() : null;
  const chartData: ChartEntry[] = values.map((value, index) => ({ hour: hourLabel(index), value, index }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} barCategoryGap="22%">
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 11, fill: "#849495" }}
          tickLine={false}
          axisLine={false}
          interval={1}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,219,233,0.04)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const { hour, value } = payload[0].payload as ChartEntry;
            return (
              <div
                style={{
                  background: "rgba(30,32,36,0.95)",
                  border: "1px solid rgba(59,73,75,0.6)",
                  color: "#e2e2e8",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontFamily: "Sora, sans-serif",
                }}
              >
                <span style={{ fontWeight: 600 }}>{hour}</span>
                <span style={{ marginLeft: 8, color: "#849495" }}>busyness {value}/10</span>
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

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function UoftPage() {
  const today = todayKey();
  const [selectedDay, setSelectedDay] = useState<DayKey>(today);

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#111318" }}>

      {/* ── Page header ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight"
          style={{ color: "#e2e2e8", fontFamily: "Sora, sans-serif" }}
        >
          University of Toronto
        </h1>
        <span
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.25)",
            color: "#f59e0b",
          }}
        >
          Historical Data
        </span>
      </div>
      <p className="text-sm mb-6" style={{ color: "#849495", fontFamily: "Sora, sans-serif" }}>
        Typical busy patterns · Live occupancy unavailable
      </p>

      {/* ── Notice banner ─────────────────────────────────────── */}
      <div
        className="rounded-xl p-4 mb-8 text-sm"
        style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.2)",
          color: "#f59e0b",
          fontFamily: "Sora, sans-serif",
        }}
      >
        Live occupancy unavailable for UofT — showing typical busy patterns based on historical data.
      </div>

      {/* ── Popular times chart ───────────────────────────────── */}
      <div
        className="glass-panel rounded-2xl p-6 md:p-8 mb-8"
      >
        <h2
          className="text-base font-semibold mb-5"
          style={{ color: "#e2e2e8", fontFamily: "Sora, sans-serif" }}
        >
          Popular Times
        </h2>

        {/* Day selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {DAYS.map(({ key, label }) => {
            const isSel   = selectedDay === key;
            const isToday = key === today;
            return (
              <button
                key={key}
                onClick={() => setSelectedDay(key)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  minHeight: 36,
                  background:  isSel ? "#00dbe9"                        : "rgba(30,32,36,0.8)",
                  color:       isSel ? "#111318"                        : "#b9cacb",
                  border:      isSel ? "1px solid transparent"          : isToday ? "1px solid rgba(0,219,233,0.4)" : "1px solid rgba(59,73,75,0.5)",
                  boxShadow:   isSel ? "0 0 16px rgba(0,219,233,0.35)" : "none",
                  fontFamily:  "Sora, sans-serif",
                  cursor:      "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 480 }}>
            <BusynessChart dayKey={selectedDay} isToday={selectedDay === today} />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs" style={{ color: "#849495" }}>
          {[["#2ae500", "Not busy"], ["#f59e0b", "Moderate"], ["#ffb4ab", "Busy"]].map(([c, l]) => (
            <span key={l} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: c }} />
              {l}
            </span>
          ))}
          {selectedDay === today && (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: "#1eb300" }} />
              Current hour
            </span>
          )}
        </div>
      </div>

      {/* ── Library cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {LIBRARIES.map((lib) => (
          <div
            key={lib.name}
            className="glass-panel glass-highlight rounded-2xl p-6 flex flex-col gap-3"
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: "#e2e2e8", fontFamily: "Sora, sans-serif" }}
            >
              {lib.name}
            </h3>
            <p className="text-xs flex-1" style={{ color: "#b9cacb", lineHeight: 1.55 }}>
              {lib.description}
            </p>
            <p className="text-xs flex items-center gap-2" style={{ color: "#849495" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
              {lib.hours}
            </p>
            <a
              href={lib.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(0,219,233,0.1)",
                border: "1px solid rgba(0,219,233,0.3)",
                color: "#00dbe9",
                textDecoration: "none",
                fontFamily: "Sora, sans-serif",
                transition: "background 150ms ease",
              }}
            >
              Book a Room
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
            </a>
          </div>
        ))}
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="mt-4 pt-6" style={{ borderTop: "1px solid rgba(59,73,75,0.3)" }}>
        <p className="text-xs" style={{ color: "#849495" }}>
          Historical data only · Not affiliated with the University of Toronto ·{" "}
          <a
            href="https://library.utoronto.ca"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#00dbe9", textDecoration: "none" }}
          >
            Official library site →
          </a>
        </p>
      </div>
    </div>
  );
}
