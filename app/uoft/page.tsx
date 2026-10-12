"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useFavorites } from "@/hooks/useFavorites";
import { CampusSwitcher } from "@/components/CampusBoard";
import { LEVEL_COLOR, level } from "@/lib/occupancy";
import {
  DAYS, POPULAR_TIMES, UOFT_LIBRARIES, todayKey, currentHourIndex, hourLabel, type DayKey,
} from "@/lib/uoftData";

interface ChartEntry { hour: string; value: number; index: number }

function BusynessChart({ dayKey, isToday }: { dayKey: DayKey; isToday: boolean }) {
  const curIdx = isToday ? currentHourIndex() : null;
  const data: ChartEntry[] = POPULAR_TIMES[dayKey].map((value, index) => ({ hour: hourLabel(index), value, index }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barCategoryGap="18%" margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 11, fill: "var(--muted)", fontFamily: "var(--font-geist-mono)" }}
          tickLine={false}
          axisLine={false}
          interval={1}
        />
        <Tooltip
          cursor={{ fill: "var(--surface-2)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const { hour, value } = payload[0].payload as ChartEntry;
            return (
              <div className="rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs shadow-lg">
                <span className="font-medium">{hour}</span>
                <span className="num ml-2 text-[var(--muted)]">{value}/10 busy</span>
              </div>
            );
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
          {data.map((e) => (
            <Cell
              key={e.index}
              fill={LEVEL_COLOR[level(e.value * 10)]}
              fillOpacity={curIdx === null || e.index === curIdx ? 1 : 0.35}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function UoftPage() {
  const router = useRouter();
  const today = todayKey();
  const [day, setDay] = useState<DayKey>(today);
  const { favorites, toggleFavorite } = useFavorites();

  const libs = [...UOFT_LIBRARIES].sort(
    (a, b) => Number(favorites.includes(b.name)) - Number(favorites.includes(a.name)),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <header className="flex flex-col gap-6 pb-8 pt-10 sm:pt-16 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">UofT libraries</h1>
          <p className="mt-3 text-[15px] text-[var(--fg-2)]">No live sensors here, so these are typical patterns. Book ahead when it&apos;s busy.</p>
        </div>
        <CampusSwitcher value="uoft" onChange={(c) => router.push(c === "uoft" ? "/uoft" : `/${c}`)} />
      </header>

      <section className="card p-5 sm:p-7" aria-labelledby="pt-h">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="pt-h" className="eyebrow">Typical busyness</h2>
          <div className="flex gap-1 overflow-x-auto no-scrollbar" role="tablist" aria-label="Day">
            {DAYS.map(({ key, label }) => {
              const sel = day === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={sel}
                  onClick={() => setDay(key)}
                  className={`h-8 shrink-0 rounded-lg px-3 text-[13px] transition-colors ${
                    sel ? "bg-[var(--fg)] font-medium text-[var(--bg)]" : "text-[var(--fg-2)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {label}
                  {key === today && !sel && <span className="ml-1 text-[var(--muted)]">·</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="-mx-1 overflow-x-auto">
          <div className="min-w-[480px]">
            <BusynessChart dayKey={day} isToday={day === today} />
          </div>
        </div>
        {day === today && currentHourIndex() !== null && (
          <p className="mt-3 text-[13px] text-[var(--muted)]">Highlighted bar is the current hour.</p>
        )}
      </section>

      <section className="mt-8" aria-labelledby="libs-h">
        <h2 id="libs-h" className="eyebrow mb-3">{UOFT_LIBRARIES.length} libraries</h2>
        <ul className="card">
          {libs.map((lib) => {
            const saved = favorites.includes(lib.name);
            return (
              <li key={lib.name} className="flex flex-col gap-3 border-t border-[var(--line)] p-4 first:border-t-0 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium">{lib.name}</p>
                  <p className="mt-0.5 text-[13px] text-[var(--muted)]">{lib.description}</p>
                  <p className="num mt-1.5 text-[12px] text-[var(--fg-2)]">{lib.hours}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(lib.name)}
                    aria-pressed={saved}
                    aria-label={saved ? `Unsave ${lib.name}` : `Save ${lib.name}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-md hover:bg-[var(--surface-2)] ${saved ? "text-[var(--fg)]" : "text-[var(--muted)]"}`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
                    </svg>
                  </button>
                  <a href={lib.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !h-9 !px-3 !text-[13px]">
                    Book a room
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9" /></svg>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="mt-16 border-t border-[var(--line)] pt-5 text-[13px] text-[var(--muted)]">
        Historical estimates only. Not affiliated with the University of Toronto.{" "}
        <a href="https://library.utoronto.ca" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--fg)]">
          Official library site
        </a>
      </footer>
    </div>
  );
}
