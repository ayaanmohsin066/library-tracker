"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { useFavorites } from "@/hooks/useFavorites";
import Reveal from "@/components/ui/Reveal";
import {
  type DayKey, DAYS, POPULAR_TIMES, UOFT_LIBRARIES as LIBRARIES,
  todayKey, currentHourIndex, hourLabel,
} from "@/lib/uoftData";

/* ── Data ──────────────────────────────────────────────────────────────── */

function barColor(value: number): string {
  return value <= 4 ? "#6fd3a8" : value <= 7 ? "#f2a93b" : "#f2735a";
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
          tick={{ fontSize: 11, fill: "var(--paper-2)" }}
          tickLine={false}
          axisLine={false}
          interval={1}
        />
        <Tooltip
          cursor={{ fill: "rgba(214,166,92,0.05)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const { hour, value } = payload[0].payload as ChartEntry;
            return (
              <div style={{
                background: "var(--ink-1)",
                border: "1px solid var(--line-strong)",
                color: "var(--paper-0)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
              }}>
                <span style={{ fontWeight: 600 }}>{hour}</span>
                <span style={{ marginLeft: 8, color: "var(--paper-2)" }}>busyness {value}/10</span>
              </div>
            );
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.index} fill={barColor(entry.value)} fillOpacity={curIdx === null || entry.index === curIdx ? 1 : 0.45} />
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
    <div className="container-lc" style={{ paddingBottom: "var(--s-16)" }}>
      <header className="campus-head">
        <div style={{ minWidth: 0 }}>
          <p className="eyebrow animate-fade-up">Typical busyness · estimate</p>
          <h1 className="display text-balance animate-fade-up" style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)", margin: "16px 0 0", animationDelay: "60ms" }}>
            University of Toronto
          </h1>
          <p className="animate-fade-up" style={{ margin: "16px 0 0", color: "var(--paper-1)", maxWidth: "56ch", animationDelay: "120ms" }}>
            UofT doesn&apos;t publish live occupancy, so these are typical patterns by hour,
            not live counts. Use them to pick a time, then book a room.
          </p>
        </div>
      </header>

      {/* ── Saved ─────────────────────────────────────────────────── */}
      {LIBRARIES.some((l) => favorites.includes(l.name)) && (
        <section id="my-libraries" aria-labelledby="saved-title" style={{ marginBottom: 32, scrollMarginTop: 96 }}>
          <h2 id="saved-title" className="eyebrow" style={{ margin: "0 0 12px" }}>Your saved libraries</h2>
          <ul className="fav-list">
            {LIBRARIES.filter((l) => favorites.includes(l.name)).map((lib) => (
              <li key={lib.name} className="fav-row">
                <span className="fav-name">{lib.name}</span>
                <button type="button" className="icon-btn" onClick={() => removeFavorite(lib.name)} aria-label={`Remove ${lib.name} from saved`}>
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" /></svg>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Typical busyness chart ───────────────────────────────── */}
      <section className="panel" style={{ padding: "24px", marginBottom: 48 }} aria-labelledby="times-title">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <h2 id="times-title" className="display" style={{ margin: 0, fontSize: 32 }}>Typical busyness</h2>
          <div role="group" aria-label="Day of week" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {DAYS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className="chip"
                aria-pressed={selectedDay === key}
                onClick={() => setSelectedDay(key)}
                style={{ minHeight: 34, padding: "0 12px", fontSize: 13 }}
              >
                {label}{key === today && <span aria-hidden="true" style={{ width: 4, height: 4, borderRadius: 999, background: "var(--brass)", marginLeft: 2 }} />}
                {key === today && <span className="sr-only-lc">(today)</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 480 }}>
            <BusynessChart dayKey={selectedDay} isToday={selectedDay === today} />
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginTop: 16, fontSize: 12, color: "var(--paper-2)" }}>
          {[["#6fd3a8", "Not busy"], ["#f2a93b", "Moderate"], ["#f2735a", "Busy"]].map(([c, l]) => (
            <span key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
              {l}
            </span>
          ))}
          {selectedDay === today && <span>Brighter bar = current hour</span>}
          <span style={{ marginLeft: "auto" }}>Estimate · 9am–9pm</span>
        </div>
      </section>

      {/* ── Libraries ───────────────────────────────────────────────── */}
      <h2 className="eyebrow" style={{ margin: "0 0 16px" }}>All libraries · {LIBRARIES.length}</h2>
      <div className="lib-grid">
        {LIBRARIES.map((lib, i) => {
          const saved = favorites.includes(lib.name);
          return (
            <Reveal key={lib.name} as="article" delay={Math.min(i, 8) * 60} className="lib-card" style={{ gap: 12 }}>
              <header className="lib-card-head" style={{ marginBottom: 0 }}>
                <h3 className="lib-card-name">{lib.name}</h3>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => toggleFavorite(lib.name)}
                  aria-pressed={saved}
                  aria-label={saved ? `Remove ${lib.name} from saved` : `Save ${lib.name}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill={saved ? "var(--brass)" : "none"} stroke={saved ? "var(--brass)" : "currentColor"} strokeWidth="1.8" strokeLinejoin="round">
                    <path d="M6 3h12v18l-6-4-6 4z" />
                  </svg>
                </button>
              </header>
              <p style={{ margin: 0, fontSize: 14, color: "var(--paper-1)", lineHeight: 1.55, flex: 1 }}>{lib.description}</p>
              <p className="lib-card-hours" style={{ marginTop: 0 }}>{lib.hours}</p>
              <a href={lib.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", marginTop: 4 }}>
                Book a room <span className="btn-arrow" aria-hidden="true">↗</span>
              </a>
            </Reveal>
          );
        })}
      </div>

      <div className="page-note">
        <p style={{ margin: 0 }}>
          Typical patterns, not live data · Not affiliated with the University of Toronto ·{" "}
          <a href="https://library.utoronto.ca" target="_blank" rel="noopener noreferrer" className="link-u" style={{ color: "var(--paper-1)" }}>
            Official library site →
          </a>
        </p>
      </div>
    </div>
  );
}
