"use client";

import { useState } from "react";
import { buildings } from "@/lib/buildingData";
import type { Building, StudySpace } from "@/lib/buildingData";
import { PageShell, PageHeader, FilterChips, Tag, ExternalIcon } from "@/components/ui";

type Room = StudySpace & { building: Building };

const ROOMS: Room[] = buildings.flatMap((b) =>
  b.studySpaces.filter((s) => s.type === "group").map((s) => ({ ...s, building: b })),
);

const is247 = (r: Room) => r.notes.includes("24/7") || r.building.description.includes("24/7");
const isBookable = (r: Room) => Boolean(r.bookingUrl);
const isWalkIn = (r: Room) => !isBookable(r) && !is247(r);

const FILTERS = [
  { key: "all", label: "All" },
  { key: "bookable", label: "Book online" },
  { key: "walkin", label: "Walk in" },
  { key: "247", label: "24/7" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const MATCH: Record<FilterKey, (r: Room) => boolean> = {
  all: () => true,
  bookable: isBookable,
  walkin: isWalkIn,
  "247": is247,
};

const NOISE: Record<StudySpace["noiseLevel"], string> = {
  silent: "Silent",
  quiet: "Quiet",
  collaborative: "Talking OK",
};

export default function StudyRoomsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const rooms = ROOMS.filter(MATCH[filter]);
  const counts = Object.fromEntries(FILTERS.map((f) => [f.key, ROOMS.filter(MATCH[f.key]).length])) as Record<FilterKey, number>;

  return (
    <PageShell>
      <PageHeader title="Group study rooms" sub="Every group space at UWaterloo, and how to get one." />

      <FilterChips options={[...FILTERS]} value={filter} onChange={setFilter} counts={counts} />

      <ul className="card mt-5">
        {rooms.map((r) => {
          const directions = `https://www.google.com/maps/dir/?api=1&destination=${r.building.coords[0]},${r.building.coords[1]}`;
          const notes = r.notes && r.notes !== "Bookable online" ? r.notes : null;
          return (
            <li
              key={`${r.building.name}-${r.name}`}
              className="flex flex-col gap-3 border-t border-[var(--line)] p-4 first:border-t-0 sm:flex-row sm:items-center sm:gap-6 sm:px-5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium">{r.name}</p>
                <p className="mt-0.5 text-[13px] text-[var(--muted)]">
                  {r.building.name}
                  {r.floor ? ` · ${r.floor}` : ""}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {isBookable(r) ? <Tag tone="ok">Bookable</Tag> : is247(r) ? <Tag tone="ok">24/7</Tag> : <Tag>Walk in</Tag>}
                  <Tag>{NOISE[r.noiseLevel]}</Tag>
                  {r.outlets && <Tag>Outlets</Tag>}
                  {r.keycardRequired && <Tag tone="warn">Keycard</Tag>}
                </div>
                {notes && <p className="mt-2 text-[13px] text-[var(--muted)]">{notes}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                {r.bookingUrl && (
                  <a href={r.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary !h-9 !px-3 !text-[13px]">
                    Book <ExternalIcon />
                  </a>
                )}
                <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !h-9 !px-3 !text-[13px]">
                  Directions
                </a>
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="mt-16 border-t border-[var(--line)] pt-5 text-[13px] text-[var(--muted)]">
        Room details are collected by hand and may change. Check the booking page before you go.
      </footer>
    </PageShell>
  );
}
