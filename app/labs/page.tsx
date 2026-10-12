"use client";

import { useState } from "react";
import { labs, type Lab } from "@/lib/labData";
import { PageShell, PageHeader, FilterChips, Tag } from "@/components/ui";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "mc", label: "MC" },
  { key: "dc", label: "DC" },
  { key: "247", label: "24/7" },
  { key: "laptop", label: "Laptop-friendly" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const is247 = (l: Lab) => l.hours.toLowerCase().includes("24/7");
const MATCH: Record<FilterKey, (l: Lab) => boolean> = {
  all: () => true,
  mc: (l) => l.building === "MC",
  dc: (l) => l.building === "DC",
  "247": is247,
  laptop: (l) => l.laptopFriendly,
};

function os(l: Lab) {
  const t = `${l.notes ?? ""} ${l.type}`.toLowerCase();
  const out: string[] = [];
  if (t.includes("windows")) out.push("Windows");
  if (t.includes("linux")) out.push("Linux");
  if (t.includes("mac")) out.push("Mac");
  return out;
}

export default function LabsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const list = labs.filter(MATCH[filter]).sort((a, b) => b.seats - a.seats);
  const counts = Object.fromEntries(FILTERS.map((f) => [f.key, labs.filter(MATCH[f.key]).length])) as Record<FilterKey, number>;
  const totalSeats = labs.reduce((s, l) => s + l.seats, 0);

  return (
    <PageShell>
      <PageHeader
        title="Computer labs"
        sub={<>UWaterloo MC &amp; DC labs · <span className="num">{labs.length}</span> labs, <span className="num">{totalSeats}</span> seats.</>}
      />

      <FilterChips options={[...FILTERS]} value={filter} onChange={setFilter} counts={counts} />

      <ul className="card mt-5">
        {list.map((l) => (
          <li key={l.room} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-t border-[var(--line)] p-4 first:border-t-0 sm:grid-cols-[96px_1fr_auto] sm:px-5">
            <p className="num text-[15px] font-medium sm:pt-0.5">{l.room}</p>
            <p className="num text-right text-[13px] text-[var(--fg-2)] sm:order-last sm:pt-1">
              {l.seats} <span className="text-[var(--muted)]">seats</span>
            </p>
            <div className="col-span-2 min-w-0 sm:col-span-1">
              <p className="text-[15px]">{l.name}</p>
              <p className="mt-0.5 text-[13px] text-[var(--muted)]">{l.hours} · {l.access}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {is247(l) && <Tag tone="ok">24/7</Tag>}
                {l.laptopFriendly && <Tag tone="ok">Laptop-friendly</Tag>}
                {l.type.toLowerCase().includes("instructional") && <Tag tone="warn">Closed during classes</Tag>}
                {os(l).map((o) => <Tag key={o}>{o}</Tag>)}
                {(l.notes ?? "").toLowerCase().includes("print") && <Tag>Printing</Tag>}
              </div>
              {l.notes && <p className="mt-2 text-[13px] text-[var(--muted)]">{l.notes}</p>}
            </div>
          </li>
        ))}
      </ul>

      <footer className="mt-16 border-t border-[var(--line)] pt-5 text-[13px] text-[var(--muted)]">
        Lab info from CSCF. Not real-time; hours can change.{" "}
        <a href="https://cs.uwaterloo.ca/about/resources/computing-facilities" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--fg)]">
          Official CSCF page
        </a>
      </footer>
    </PageShell>
  );
}
