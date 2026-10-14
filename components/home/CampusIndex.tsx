"use client";

import Link from "next/link";
import useLibraryData from "@/hooks/useLibraryData";
import Reveal from "@/components/ui/Reveal";
import { colorFor, levelFor, LEVEL_LABEL, toPct } from "@/lib/occupancy";
import { typicalNow, UOFT_LIBRARIES } from "@/lib/uoftData";

type Lib = { name: string; pct: number; open: boolean };

function Meter({ libs }: { libs: Lib[] }) {
  // one thin column per library: height = occupancy, colour = level
  return (
    <div className="meter" aria-hidden="true">
      {libs.map((l) => (
        <span key={l.name} className="meter-col" title={`${l.name}: ${l.open ? `${l.pct}%` : "closed"}`}>
          <span
            className="meter-fill"
            style={{
              height: l.open ? `${Math.max(6, l.pct)}%` : "6%",
              background: colorFor(l.pct, l.open),
              opacity: l.open ? 1 : 0.5,
            }}
          />
        </span>
      ))}
    </div>
  );
}

function CampusRow({
  index, name, city, href, libs, summary, loading,
}: {
  index: number; name: string; city: string; href: string;
  libs: Lib[]; summary: React.ReactNode; loading: boolean;
}) {
  return (
    <Reveal delay={index * 80}>
      <Link href={href} className="campus-row">
        <span className="campus-num tabular">0{index + 1}</span>
        <span className="campus-name">
          <span className="display">{name}</span>
          <span className="campus-city">{city}</span>
        </span>
        <span className="campus-meter">
          {loading ? <span className="animate-shimmer" style={{ display: "block", height: 40, width: 120, borderRadius: 2 }} /> : <Meter libs={libs} />}
        </span>
        <span className="campus-summary">{summary}</span>
        <span className="campus-arrow" aria-hidden="true">→</span>
      </Link>
    </Reveal>
  );
}

function liveSummary(libs: Lib[], total: number, failed: boolean) {
  if (failed) return <span style={{ color: "var(--paper-2)" }}>Live feed unavailable</span>;
  const open = libs.filter((l) => l.open).sort((a, b) => a.pct - b.pct);
  if (!open.length) return <><strong>{total === 1 ? "Closed" : `All ${total} closed`}</strong><span>right now</span></>;
  const q = open[0];
  return (
    <>
      <strong>{open.length} of {total} open</strong>
      <span>
        Quietest: {q.name.replace(/ Library$/i, "")}{" "}
        <b style={{ color: colorFor(q.pct), fontWeight: 600 }} className="tabular">{q.pct}%</b>
      </span>
    </>
  );
}

export default function CampusIndex() {
  const w = useLibraryData("waterloo");
  const r = useLibraryData("regina");

  const toLibs = (list?: { name: string; percentage: number; isOpen: boolean }[]): Lib[] =>
    (list ?? []).map((l) => ({ name: l.name, pct: toPct(l.percentage), open: l.isOpen }));

  const wl = toLibs(w.data?.live);
  const rl = toLibs(r.data?.live);

  const t = typicalNow();
  const tLibs: Lib[] = UOFT_LIBRARIES.map((l) => ({ name: l.name, pct: t === null ? 0 : t * 10, open: t !== null }));

  return (
    <section id="campuses" className="container-lc" style={{ paddingBlock: "var(--s-24) var(--s-20)", scrollMarginTop: 80 }}>
      <Reveal>
        <p className="eyebrow">01 — Campuses</p>
      </Reveal>
      <Reveal delay={60}>
        <h2 className="display text-balance" style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", margin: "12px 0 8px", maxWidth: "14ch" }}>
          Three campuses, <em style={{ color: "var(--paper-1)" }}>one glance.</em>
        </h2>
      </Reveal>
      <Reveal delay={120}>
        <p style={{ color: "var(--paper-1)", maxWidth: "52ch", margin: "0 0 var(--s-10)" }}>
          Each bar is one library, as full as it is right now. Waterloo and Regina update from
          live sensors; Toronto shows how busy it usually is at this hour.
        </p>
      </Reveal>

      <div className="campus-list">
        <CampusRow
          index={0} name="Waterloo" city="Waterloo, Ontario" href="/waterloo"
          libs={wl} loading={w.isLoading}
          summary={liveSummary(wl, wl.length || 3, w.isError && !w.data)}
        />
        <CampusRow
          index={1} name="Regina" city="Regina, Saskatchewan" href="/regina"
          libs={rl} loading={r.isLoading}
          summary={liveSummary(rl, rl.length || 1, r.isError && !r.data)}
        />
        <CampusRow
          index={2} name="Toronto" city="Toronto, Ontario" href="/uoft"
          libs={tLibs} loading={false}
          summary={
            t === null
              ? <><strong>Outside typical hours</strong><span>Estimates cover 9am–9pm</span></>
              : <><strong>Usually {LEVEL_LABEL[levelFor(t * 10)].toLowerCase()} now</strong><span>{UOFT_LIBRARIES.length} libraries · estimate, not live</span></>
          }
        />
      </div>
    </section>
  );
}
