"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

// Index 0 = 9am, index 12 = 9pm
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
  { name: "Robarts Library",           description: "Main research library with 14 floors of collections.",          bookingUrl: "https://libcal.library.utoronto.ca/r/search/robarts" },
  { name: "Gerstein Library",          description: "Health sciences library open 24/7 during the semester.",         bookingUrl: "https://libcal.library.utoronto.ca/reserve/gerstein" },
  { name: "OISE Library",              description: "Specializes in education and social work resources.",             bookingUrl: "https://libcal.library.utoronto.ca/r/search/OISE" },
  { name: "Engineering & CS Library",  description: "Technical resources for engineering and computer science.",      bookingUrl: "https://libcal.library.utoronto.ca/reserve/engineering" },
  { name: "University College Library",description: "Intimate reading rooms in a historic building.",                  bookingUrl: "https://libcal.library.utoronto.ca/r/search/uclibrary" },
  { name: "Chemistry Library",         description: "Specialized chemistry and materials science collection.",         bookingUrl: "https://libcal.library.utoronto.ca/reserve/chemistry" },
  { name: "John W. Graham Library",    description: "Trinity College library with rare book holdings.",               bookingUrl: "https://libcal.library.utoronto.ca/r/search/graham" },
  { name: "John M. Kelly Library",     description: "St. Michael's College library with theology collections.",       bookingUrl: "https://libcal.library.utoronto.ca/r/search/kelly" },
  { name: "UTSC Library",              description: "Full-service library at the Scarborough campus.",                bookingUrl: "https://libcal.library.utoronto.ca/reserve/spaces/utsclibrary" },
];

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
                className="rounded-lg px-3 py-1.5 text-xs"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-primary)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                }}
              >
                <span className="font-semibold">{hour}</span>
                <span className="ml-2" style={{ color: "var(--text-muted)" }}>
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

function LibraryStaticCard({
  name,
  description,
  bookingUrl,
}: {
  name: string;
  description: string;
  bookingUrl: string;
}) {
  return (
    <div className="card-base flex flex-col justify-between p-5 sm:p-6">
      <div>
        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
          {name}
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      </div>
      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-[44px] items-center gap-1 self-start rounded-xl px-3.5 py-1.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{ backgroundColor: "var(--accent)" }}
      >
        Book a Room
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

export default function UoftTab() {
  const today = todayKey();
  const [selectedDay, setSelectedDay] = useState<DayKey>(today);

  return (
    <div className="space-y-6">
      {/* Notice */}
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          backgroundColor: "var(--amber-dim)",
          border: "1px solid rgba(245,158,11,0.2)",
          color: "var(--amber)",
        }}
      >
        Live occupancy data is not available for UofT. Chart shows typical busy
        patterns based on historical data.
      </div>

      {/* Popular times card */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h2
          className="text-base font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Popular Times
        </h2>

        {/* Day selector */}
        <div className="mt-3 flex flex-wrap gap-2">
          {DAYS.map(({ key, label }) => {
            const isSelected = selectedDay === key;
            const isToday = key === today;
            return (
              <button
                key={key}
                onClick={() => setSelectedDay(key)}
                className="inline-flex min-h-[44px] items-center rounded-full px-3.5 py-1 text-sm font-medium transition-all duration-200"
                style={
                  isSelected
                    ? {
                        backgroundColor: "var(--accent)",
                        color: "#fff",
                        boxShadow: "0 0 12px var(--accent-glow)",
                      }
                    : {
                        backgroundColor: "var(--bg-elevated)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                        outline: isToday ? "2px solid var(--border-strong)" : undefined,
                        outlineOffset: isToday ? "2px" : undefined,
                      }
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[480px]">
            <BusynessChart dayKey={selectedDay} isToday={selectedDay === today} />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Not busy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            Busy
          </span>
          {selectedDay === today && (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
              />
              Current hour
            </span>
          )}
        </div>
      </div>

      {/* Library cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LIBRARIES.map((lib) => (
          <LibraryStaticCard key={lib.name} {...lib} />
        ))}
      </div>
    </div>
  );
}
