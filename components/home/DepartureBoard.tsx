"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useLibraryData from "@/hooks/useLibraryData";
import FlapText from "@/components/ui/FlapText";
import { LEVEL_COLOR, LEVEL_LABEL, levelFor, toPct, type Level } from "@/lib/occupancy";
import { typicalNow } from "@/lib/uoftData";

type Row = {
  key: string;
  name: string;
  campus: "UW" | "UR" | "UT";
  href: string;
  pctText: string;   // what the flap shows in the % column
  level: Level;
  statusText?: string; // overrides LEVEL_LABEL (e.g. no estimate off-hours)
  estimate?: boolean;
  open: boolean;
  pct: number;
};

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function DepartureBoard() {
  const wloo = useLibraryData("waterloo");
  const regina = useLibraryData("regina");
  const now = useClock();

  const loading = wloo.isLoading || regina.isLoading;
  const failed = wloo.isError && regina.isError && !wloo.data && !regina.data;

  const rows = useMemo<Row[]>(() => {
    const live: Row[] = [];
    const push = (campus: Row["campus"], href: string, list: { name: string; percentage: number; isOpen: boolean }[] | undefined) => {
      for (const l of list ?? []) {
        const pct = toPct(l.percentage);
        live.push({
          key: `${campus}-${l.name}`,
          name: l.name.replace(/ Library$/i, ""),
          campus, href,
          pct, open: l.isOpen,
          level: levelFor(pct, l.isOpen),
          pctText: l.isOpen ? `${pct}%`.padStart(4, " ") : "  --",
        });
      }
    };
    push("UW", "/waterloo", wloo.data?.live);
    push("UR", "/regina", regina.data?.live);
    // open libraries first, quietest at the top — the board answers "where should I go?"
    live.sort((a, b) => (a.open === b.open ? a.pct - b.pct : a.open ? -1 : 1));

    const typical = typicalNow();
    const uoft: Row = {
      key: "UT-typical",
      name: "UofT",
      campus: "UT",
      href: "/uoft",
      pct: 0,
      open: typical !== null,
      estimate: true,
      pctText: " EST",
      level: typical === null ? "closed" : typical >= 8 ? "full" : typical >= 5 ? "busy" : "quiet",
      // outside 9am–9pm there is no estimate — don't claim "closed" (Gerstein is 24/7)
      statusText: typical === null ? "--" : undefined,
    };
    return [...live, uoft];
  }, [wloo.data, regina.data]);

  const time = now
    ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <section aria-labelledby="board-title" className="board">
      <header className="board-head">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="live-dot" aria-hidden="true" />
          <h2 id="board-title" className="eyebrow" style={{ margin: 0, color: "#c9c2b6" }}>Live board</h2>
        </div>
        <span className="eyebrow tabular" style={{ color: "#c9c2b6" }} suppressHydrationWarning>
          {time}
        </span>
      </header>

      <div role="table" aria-label="Library occupancy, quietest first" aria-busy={loading}>
        <div role="row" className="board-row board-cols">
          <span role="columnheader" className="eyebrow">Library</span>
          <span role="columnheader" className="eyebrow board-campus">Campus</span>
          <span role="columnheader" className="eyebrow" style={{ textAlign: "right" }}>Full</span>
          <span role="columnheader" className="eyebrow">Status</span>
        </div>

        {failed ? (
          <div role="row" className="board-row" style={{ gridTemplateColumns: "1fr" }}>
            <span role="cell" style={{ color: "#c9c2b6", fontSize: 14 }}>
              Live feed unavailable right now.{" "}
              <button type="button" onClick={() => { wloo.refetch(); regina.refetch(); }} className="link-u" style={{ background: "none", border: 0, cursor: "pointer", font: "inherit", color: "#f2ede4" }}>
                Try again
              </button>
            </span>
          </div>
        ) : loading ? (
          [0, 1, 2, 3].map((i) => (
            <div role="row" key={i} className="board-row">
              <span role="cell"><span className="animate-shimmer" style={{ display: "block", height: 12, width: `${60 - i * 8}%`, borderRadius: 2 }} /></span>
              <span role="cell" className="board-campus"><FlapText text="--" length={2} size="sm" /></span>
              <span role="cell" style={{ textAlign: "right" }}><FlapText text="----" length={4} /></span>
              <span role="cell"><FlapText text="------" length={6} /></span>
            </div>
          ))
        ) : (
          rows.map((r, i) => (
            <Link role="row" key={r.key} href={r.href} className="board-row board-link" aria-label={`${r.name}, ${r.campus}: ${r.estimate ? (r.statusText ? "no estimate at this hour" : `typically ${LEVEL_LABEL[r.level].toLowerCase()} at this hour (estimate)`) : r.open ? `${r.pct}% full, ${LEVEL_LABEL[r.level].toLowerCase()}` : "closed"}`}>
              <span role="cell" className="board-name">
                {r.name}
                {r.estimate && <span className="board-est">typical</span>}
              </span>
              <span role="cell" className="board-campus"><FlapText text={r.campus} length={2} size="sm" delay={i * 90} /></span>
              <span role="cell" style={{ textAlign: "right" }}>
                <FlapText text={r.pctText} length={4} delay={120 + i * 90} />
              </span>
              <span role="cell">
                <FlapText text={r.statusText ?? LEVEL_LABEL[r.level]} length={6} delay={240 + i * 90} color={r.statusText ? "#8f897f" : LEVEL_COLOR[r.level]} />
              </span>
            </Link>
          ))
        )}
      </div>

      <footer className="board-foot">
        <span>{wloo.dataUpdatedAt ?? regina.dataUpdatedAt ?? "Connecting…"}</span>
        <span>Sensors via Waitz · UofT is an estimate</span>
      </footer>
    </section>
  );
}
