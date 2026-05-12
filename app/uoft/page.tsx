"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { useFavorites } from "@/hooks/useFavorites";

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
  return value <= 4 ? "#34D399" : value <= 7 ? "#f59e0b" : "#ffb4ab";
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
          tick={{ fontSize: 11, fill: "#6B7FA3" }}
          tickLine={false}
          axisLine={false}
          interval={1}
        />
        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.05)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const { hour, value } = payload[0].payload as ChartEntry;
            return (
              <div style={{
                background: "rgba(13,20,36,0.96)",
                border: "1px solid rgba(30,58,95,0.6)",
                color: "#e2e2e8",
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12,
                fontFamily: "Sora, sans-serif",
              }}>
                <span style={{ fontWeight: 600 }}>{hour}</span>
                <span style={{ marginLeft: 8, color: "#6B7FA3" }}>busyness {value}/10</span>
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
  const { favorites, toggleFavorite, removeFavorite } = useFavorites();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <div style={{ padding: "0 24px 48px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Page Header ────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          padding: "28px 0 20px",
          borderBottom: "1px solid rgba(30,58,95,0.4)",
          marginBottom: 24,
        }}>
          <h1 style={{
            margin: 0,
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#e2e2e8",
            fontFamily: "Sora, sans-serif",
            lineHeight: 1.1,
          }}>
            University of Toronto
          </h1>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 700,
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.28)",
            color: "#f59e0b",
            fontFamily: "Sora, sans-serif",
          }}>
            Historical Data
          </span>
        </div>

        {/* ── Notice banner ────────────────────────────────────────── */}
        <div style={{
          borderRadius: 12, padding: "12px 16px", marginBottom: 28, fontSize: 13,
          background: "rgba(245,158,11,0.07)",
          border: "1px solid rgba(245,158,11,0.2)",
          color: "#f59e0b",
          fontFamily: "Sora, sans-serif",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>info</span>
          Live occupancy unavailable for UofT — showing typical busy patterns based on historical data.
        </div>

        {/* ── My Libraries ─────────────────────────────────────────── */}
        {LIBRARIES.some((l) => favorites.includes(l.name)) && (
          <div id="my-libraries" style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16, color: "#6366F1", fontVariationSettings: "'FILL' 1" }}
              >
                bookmark
              </span>
              <h2 style={{
                margin: 0, fontSize: "0.9rem", fontWeight: 700,
                color: "#e2e2e8", fontFamily: "Sora, sans-serif",
              }}>
                Your saved libraries
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LIBRARIES.filter((l) => favorites.includes(l.name)).map((lib) => (
                <div
                  key={lib.name}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 12,
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.22)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 14, color: "#6366F1", fontVariationSettings: "'FILL' 1", flexShrink: 0 }}
                  >
                    bookmark
                  </span>
                  <span style={{
                    flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: "#e2e2e8",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontFamily: "Sora, sans-serif",
                  }}>
                    {lib.name}
                  </span>
                  <button
                    onClick={() => removeFavorite(lib.name)}
                    aria-label={`Remove ${lib.name} from saved`}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#6B7FA3", fontSize: 18, lineHeight: 1,
                      padding: "0 2px", flexShrink: 0,
                      display: "flex", alignItems: "center",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: "rgba(30,58,95,0.4)", marginTop: 24 }} />
          </div>
        )}

        {/* ── Popular times chart ──────────────────────────────────── */}
        <div className="glass-panel rounded-2xl" style={{ padding: "24px 28px", marginBottom: 28 }}>
          <h2 style={{
            margin: "0 0 20px", fontSize: "1rem", fontWeight: 700,
            color: "#e2e2e8", fontFamily: "Sora, sans-serif",
          }}>
            Popular Times
          </h2>

          {/* Day selector */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {DAYS.map(({ key, label }) => {
              const isSel   = selectedDay === key;
              const isToday = key === today;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  style={{
                    padding: "7px 18px", borderRadius: 9999, fontSize: 13, fontWeight: 600,
                    minHeight: 36, cursor: "pointer",
                    background:  isSel   ? "#6366F1"                           : "rgba(13,20,36,0.8)",
                    color:       isSel   ? "#0A0F1C"                           : "#b9cacb",
                    border:      isSel   ? "1px solid transparent"
                               : isToday ? "1px solid rgba(99,102,241,0.4)"
                               :           "1px solid rgba(30,58,95,0.5)",
                    boxShadow:   isSel ? "0 0 18px rgba(99,102,241,0.35)" : "none",
                    fontFamily: "Sora, sans-serif",
                    transition: "background 150ms ease, box-shadow 150ms ease",
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
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            gap: 16, marginTop: 16, fontSize: 12, color: "#6B7FA3",
          }}>
            {[["#34D399", "Not busy"], ["#f59e0b", "Moderate"], ["#ffb4ab", "Busy"]].map(([c, l]) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
                {l}
              </span>
            ))}
            {selectedDay === today && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1eb300", display: "inline-block" }} />
                Current hour
              </span>
            )}
          </div>
        </div>

        {/* ── Library cards ──────────────────────────────────────────── */}
        <h2 style={{
          margin: "0 0 16px", fontSize: "1rem", fontWeight: 700,
          color: "#e2e2e8", fontFamily: "Sora, sans-serif",
        }}>
          All Libraries
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 28 }}>
          {LIBRARIES.map((lib) => (
            <div
              key={lib.name}
              className="glass-panel glass-highlight rounded-2xl"
              style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <h3 style={{
                  margin: 0, fontSize: "0.875rem", fontWeight: 700, lineHeight: 1.3,
                  color: "#e2e2e8", fontFamily: "Sora, sans-serif",
                }}>
                  {lib.name}
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#6B7FA3" }}>
                    local_library
                  </span>
                  <button
                    onClick={() => toggleFavorite(lib.name)}
                    aria-label={favorites.includes(lib.name) ? "Remove from saved" : "Save library"}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: 2, display: "flex", alignItems: "center",
                      color: favorites.includes(lib.name) ? "#6366F1" : "#6B7FA3",
                      transition: "color 150ms ease",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 16,
                        fontVariationSettings: favorites.includes(lib.name) ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      {favorites.includes(lib.name) ? "bookmark" : "bookmark_add"}
                    </span>
                  </button>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: 12, color: "#b9cacb", lineHeight: 1.55, flex: 1 }}>
                {lib.description}
              </p>

              <p style={{
                margin: 0, fontSize: 11, color: "#6B7FA3",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                {lib.hours}
              </p>

              <a
                href={lib.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  alignSelf: "flex-start",
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.28)",
                  color: "#818CF8",
                  textDecoration: "none",
                  fontFamily: "Sora, sans-serif",
                  transition: "background 150ms ease",
                }}
              >
                Book a Room
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>open_in_new</span>
              </a>
            </div>
          ))}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div style={{ paddingTop: 20, borderTop: "1px solid rgba(30,58,95,0.35)" }}>
          <p style={{ fontSize: 12, color: "#6B7FA3" }}>
            Historical data only · Not affiliated with the University of Toronto ·{" "}
            <a
              href="https://library.utoronto.ca"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#818CF8", textDecoration: "none" }}
            >
              Official library site →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
