"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { CampusSwitcher } from "@/components/CampusBoard";
import { LEVEL_COLOR, level } from "@/lib/occupancy";
import { Tag } from "@/components/ui";
import {
  DAYS, POPULAR_TIMES, UOFT_LIBRARIES, todayKey, currentHourIndex, hourLabel, type DayKey,
} from "@/lib/uoftData";

function BusynessChart({ dayKey, isToday }: { dayKey: DayKey; isToday: boolean }) {
  const curIdx = isToday ? currentHourIndex() : null;
  const values = POPULAR_TIMES[dayKey];

  return (
    <ol className="flex h-44 items-stretch gap-1 sm:gap-2" aria-label="Typical busyness by hour, out of 10 (estimate)">
      {values.map((value, i) => {
        const dim = curIdx !== null && i !== curIdx;
        return (
          <li key={i} className="flex min-w-0 flex-1 flex-col items-center" aria-label={`${hourLabel(i)}: ${value} out of 10`}>
            <div className="flex w-full flex-1 flex-col items-center justify-end gap-1" aria-hidden="true">
              <span className={`num text-[11px] ${dim ? "text-[var(--muted)]" : "text-[var(--fg)]"}`}>{value}</span>
              <span
                className="w-full rounded-[4px]"
                style={{
                  height: `${Math.max(value * 8.5, 2)}%`,
                  background: LEVEL_COLOR[level(value * 10)],
                  opacity: dim ? 0.35 : 1,
                }}
              />
            </div>
            <span className={`num mt-2 h-4 text-[11px] text-[var(--muted)] ${i % 2 ? "invisible sm:visible" : ""}`} aria-hidden="true">
              {hourLabel(i)}
            </span>
          </li>
        );
      })}
    </ol>
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
          <p className="mt-3 text-[15px] text-[var(--fg-2)]">No live sensors here. Everything on this page is a typical pattern, not a live count.</p>
        </div>
        <CampusSwitcher value="uoft" onChange={(c) => router.push(c === "uoft" ? "/uoft" : `/${c}`)} />
      </header>

      <section className="card p-5 sm:p-7" aria-labelledby="pt-h">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 id="pt-h" className="eyebrow">Typical busyness</h2>
            <Tag>Estimate</Tag>
          </div>
          <div className="grid w-full grid-cols-7 gap-1 sm:flex sm:w-auto" role="tablist" aria-label="Day">
            {DAYS.map(({ key, label }) => {
              const sel = day === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={sel}
                  onClick={() => setDay(key)}
                  className={`h-8 rounded-lg text-[13px] transition-colors sm:px-3 ${
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
        <BusynessChart dayKey={day} isToday={day === today} />
        {day === today && currentHourIndex() !== null && (
          <p className="mt-3 text-[13px] text-[var(--muted)]">The full-strength bar is the current hour. Scale is 0 to 10.</p>
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
