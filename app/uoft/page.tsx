"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  BarChart,
  Bar,
  XAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";
import type { BuildingType } from "@/components/BuildingModel";

const BuildingModel = dynamic(
  () => import("@/components/BuildingModel"),
  {
    ssr: false,
    loading: () => (
      <div
        className="animate-shimmer"
        style={{ width: "100%", height: "280px", borderRadius: "12px", backgroundColor: "var(--bg-elevated)" }}
      />
    ),
  }
);

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

const LIBRARIES: { name: string; description: string; bookingUrl: string }[] = [
  { name: "Robarts Library",            description: "Main research library with 14 floors of collections.",          bookingUrl: "https://libcal.library.utoronto.ca/r/search/robarts" },
  { name: "Gerstein Library",           description: "Health sciences library open 24/7 during the semester.",        bookingUrl: "https://libcal.library.utoronto.ca/reserve/gerstein" },
  { name: "OISE Library",               description: "Specializes in education and social work resources.",            bookingUrl: "https://libcal.library.utoronto.ca/r/search/OISE" },
  { name: "Engineering & CS Library",   description: "Technical resources for engineering and computer science.",     bookingUrl: "https://libcal.library.utoronto.ca/reserve/engineering" },
  { name: "University College Library", description: "Intimate reading rooms in a historic building.",                bookingUrl: "https://libcal.library.utoronto.ca/r/search/uclibrary" },
  { name: "Chemistry Library",          description: "Specialized chemistry and materials science collection.",        bookingUrl: "https://libcal.library.utoronto.ca/reserve/chemistry" },
  { name: "John W. Graham Library",     description: "Trinity College library with rare book holdings.",              bookingUrl: "https://libcal.library.utoronto.ca/r/search/graham" },
  { name: "John M. Kelly Library",      description: "St. Michael's College library with theology collections.",      bookingUrl: "https://libcal.library.utoronto.ca/r/search/kelly" },
  { name: "UTSC Library",               description: "Full-service library at the Scarborough campus.",               bookingUrl: "https://libcal.library.utoronto.ca/reserve/spaces/utsclibrary" },
];

const BUILDING_MAP: Record<string, BuildingType> = {
  "Robarts Library":  "generic",
  "Gerstein Library": "generic",
};

function getBuildingType(name: string): BuildingType {
  return BUILDING_MAP[name] ?? "generic";
}

const JS_DAY_TO_KEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function todayKey(): DayKey { return JS_DAY_TO_KEY[new Date().getDay()]; }
function currentHourIndex(): number | null {
  const h = new Date().getHours();
  if (h < 9 || h > 21) return null;
  return h - 9;
}

function barColor(value: number, isCurrentHour: boolean): string {
  if (isCurrentHour) {
    return value <= 4 ? "#059669" : value <= 7 ? "#d97706" : "#dc2626";
  }
  return value <= 4 ? "#10b981" : value <= 7 ? "#f59e0b" : "#ef4444";
}

function hourLabel(index: number): string {
  const h = 9 + index;
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

interface ChartEntry { hour: string; value: number; index: number; }

function BusynessChart({ dayKey, isToday }: { dayKey: DayKey; isToday: boolean }) {
  const values = POPULAR_TIMES[dayKey];
  const currentIdx = isToday ? currentHourIndex() : null;

  const chartData: ChartEntry[] = values.map((value, index) => ({
    hour: hourLabel(index),
    value,
    index,
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} barCategoryGap="22%">
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
          interval={1}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const { hour, value } = payload[0].payload as ChartEntry;
            return (
              <div
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              >
                <span style={{ fontWeight: 600 }}>{hour}</span>
                <span style={{ marginLeft: "8px", color: "var(--text-muted)" }}>
                  busyness {value}/10
                </span>
              </div>
            );
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell
              key={entry.index}
              fill={barColor(entry.value, entry.index === currentIdx)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function UoftPage() {
  const today = todayKey();
  const [selectedDay, setSelectedDay] = useState<DayKey>(today);

  const hourIdx = currentHourIndex();
  const currentBusyness = POPULAR_TIMES[today][hourIdx ?? 6];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <Navbar />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 16px 80px" }}>

        {/* ── Page header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            University of Toronto
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "6px" }}>
            Historical occupancy data
          </p>
        </div>

        {/* ── Notice banner ───────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            color: "#f59e0b",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "13px",
            marginBottom: "24px",
          }}
        >
          Live occupancy data is not available for UofT. The 3D models and chart reflect
          typical busy patterns based on historical data.
        </div>

        {/* ── Popular times ───────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
            Popular Times
          </h2>

          {/* Day selector */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {DAYS.map(({ key, label }) => {
              const isSelected = selectedDay === key;
              const isToday    = key === today;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  style={
                    isSelected
                      ? {
                          backgroundColor: "var(--accent)",
                          color: "#fff",
                          boxShadow: "0 0 12px var(--accent-glow)",
                          border: "1px solid transparent",
                          borderRadius: "999px",
                          padding: "6px 14px",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          minHeight: "36px",
                        }
                      : {
                          backgroundColor: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                          outline: isToday ? "2px solid var(--border-strong)" : undefined,
                          outlineOffset: isToday ? "2px" : undefined,
                          borderRadius: "999px",
                          padding: "6px 14px",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          minHeight: "36px",
                        }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Chart */}
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: "480px" }}>
              <BusynessChart dayKey={selectedDay} isToday={selectedDay === today} />
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981" }} />
              Not busy
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
              Moderate
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#ef4444" }} />
              Busy
            </span>
            {selectedDay === today && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--accent)" }} />
                Current hour
              </span>
            )}
          </div>
        </div>

        {/* ── Library rows ────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {LIBRARIES.map((lib) => (
            <div
              key={lib.name}
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "28px",
                overflow: "hidden",
              }}
            >
              <div className="flex flex-col-reverse gap-6 md:flex-row">
                {/* Left half: static library info */}
                <div className="md:w-1/2" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                      {lib.name}
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {lib.description}
                    </p>
                  </div>
                  <div style={{ marginTop: "20px" }}>
                    <a
                      href={lib.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        backgroundColor: "var(--accent)",
                        color: "#fff",
                        borderRadius: "12px",
                        padding: "8px 16px",
                        fontSize: "13px",
                        fontWeight: 600,
                        textDecoration: "none",
                        minHeight: "40px",
                        transition: "opacity 150ms ease",
                      }}
                    >
                      Book a Room
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
                {/* Right half: 3D building */}
                <div className="md:w-1/2">
                  <BuildingModel
                    buildingType={getBuildingType(lib.name)}
                    occupancyPercent={currentBusyness * 10}
                    isOpen={hourIdx !== null}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
