"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { colorFor, LEVEL_LABEL, levelFor, toPct } from "@/lib/occupancy";

type Uni  = "waterloo" | "regina" | "uoft";
type Need = "quiet" | "group" | "computer";

interface LiveLoc {
  name: string;
  percentage: number;
  people: number;
  capacity: number;
  isOpen: boolean;
  hourSummary: string;
  subLocs?: { name: string; percentage: number; isOpen: boolean }[];
}

const UNI_CONFIG: Record<Uni, { label: string; href: string; city: string }> = {
  waterloo: { label: "Waterloo", href: "/waterloo", city: "Waterloo, Ontario" },
  regina:   { label: "Regina",   href: "/regina",   city: "Regina, Saskatchewan" },
  uoft:     { label: "Toronto",  href: "/uoft",     city: "Toronto, Ontario" },
};

const NEEDS: { key: Need; label: string; hint: string }[] = [
  { key: "quiet",    label: "Quiet solo study", hint: "Lowest occupancy overall" },
  { key: "group",    label: "Group space",      hint: "Libraries with group-study floors" },
  { key: "computer", label: "A computer",       hint: "Sends you to the lab finder" },
];

type Outcome =
  | { kind: "result"; loc: LiveLoc }
  | { kind: "computer" | "uoft" | "none_open" | "failed" };

function mapsQuery(name: string, city: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`;
}

function Ring({ pct }: { pct: number }) {
  const R = 30;
  const C = 2 * Math.PI * R;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="38" cy="38" r={R} fill="none" stroke="var(--ink-3)" strokeWidth="4" />
      <circle
        cx="38" cy="38" r={R} fill="none" stroke={colorFor(pct)} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)}
        className="progress-ring-circle"
      />
      <text x="38" y="43" textAnchor="middle" fill="var(--paper-0)" style={{ font: "600 15px var(--font-mono)" }}>
        {pct}%
      </text>
    </svg>
  );
}

function Message({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="fms-result animate-fade-up">
      <h3 className="display" style={{ fontSize: 32, margin: "0 0 8px" }}>{title}</h3>
      <p style={{ margin: "0 0 24px", color: "var(--paper-1)", fontSize: "var(--text-sm)", lineHeight: 1.6 }}>{body}</p>
      <Link href={href} className="btn btn-ghost">{cta} <span className="btn-arrow" aria-hidden="true">→</span></Link>
    </div>
  );
}

export default function FindMeSeat() {
  const [uni, setUni] = useState<Uni | null>(null);
  const [need, setNeed] = useState<Need | null>(null);
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  async function handleFind() {
    if (!uni || !need) return;
    setOutcome(null);

    if (need === "computer") return setOutcome({ kind: "computer" });
    if (uni === "uoft") return setOutcome({ kind: "uoft" });

    setLoading(true);
    try {
      const res = await fetch(`/api/live?uni=${uni}`);
      if (!res.ok) throw new Error(String(res.status)); // a 5xx is "unavailable", not "all closed"
      const json = (await res.json()) as { live?: unknown };
      const locs: LiveLoc[] = Array.isArray(json.live) ? (json.live as LiveLoc[]) : [];
      const open = locs.filter((l) => l.isOpen);
      if (!open.length) return setOutcome({ kind: "none_open" });

      let sorted = [...open].sort((a, b) => a.percentage - b.percentage);
      if (need === "group") {
        const withGroup = sorted.filter(
          (l) => Array.isArray(l.subLocs) && l.subLocs.some((s) => s.name.toLowerCase().includes("group")),
        );
        if (withGroup.length) sorted = withGroup;
      }
      setOutcome({ kind: "result", loc: sorted[0] });
    } catch {
      setOutcome({ kind: "failed" });
    } finally {
      setLoading(false);
    }
  }

  const meta = uni ? UNI_CONFIG[uni] : null;

  return (
    <section id="finder" className="fms" aria-labelledby="fms-title">
      <div className="container-lc fms-grid">
        <div>
          <Reveal><p className="eyebrow">02 — Find me a seat</p></Reveal>
          <Reveal delay={60}>
            <h2 id="fms-title" className="display text-balance" style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", margin: "12px 0 12px", maxWidth: "12ch" }}>
              Two questions, <em style={{ color: "var(--paper-1)" }}>one answer.</em>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p style={{ color: "var(--paper-1)", maxWidth: "44ch", margin: "0 0 var(--s-10)" }}>
              We check the live feed and point you at the emptiest open library that fits.
            </p>
          </Reveal>

          <fieldset className="fms-step">
            <legend className="eyebrow">Where are you?</legend>
            <div className="fms-options">
              {(Object.keys(UNI_CONFIG) as Uni[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  className="chip"
                  aria-pressed={uni === u}
                  onClick={() => { setUni(u); setOutcome(null); }}
                >
                  {UNI_CONFIG[u].label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="fms-step" disabled={!uni} data-disabled={!uni ? "true" : "false"}>
            <legend className="eyebrow">What do you need?</legend>
            <div className="fms-options">
              {NEEDS.map((n) => (
                <button
                  key={n.key}
                  type="button"
                  className="chip"
                  aria-pressed={need === n.key}
                  title={n.hint}
                  onClick={() => { setNeed(n.key); setOutcome(null); }}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleFind}
            disabled={!uni || !need || loading}
            aria-busy={loading}
            style={{ marginTop: 8, minWidth: 180 }}
          >
            {loading ? <><span className="spinner" aria-hidden="true" /> Checking live data…</> : <>Find the best spot <span className="btn-arrow" aria-hidden="true">→</span></>}
          </button>
        </div>

        {/* Result — announced to screen readers when it changes */}
        <div className="fms-panel" aria-live="polite">
          {!outcome && !loading && (
            <div className="fms-empty">
              <p className="eyebrow" style={{ marginBottom: 12 }}>Your result</p>
              <p style={{ margin: 0, color: "var(--paper-2)", fontSize: "var(--text-sm)", lineHeight: 1.6, maxWidth: "30ch" }}>
                {!uni ? "Pick a campus to start." : !need ? "Now pick what you need." : "Press “Find the best spot”."}
              </p>
            </div>
          )}
          {loading && (
            <div className="fms-result">
              <span className="animate-shimmer" style={{ display: "block", height: 14, width: 120, borderRadius: 2, marginBottom: 20 }} />
              <span className="animate-shimmer" style={{ display: "block", height: 36, width: "70%", borderRadius: 2, marginBottom: 12 }} />
              <span className="animate-shimmer" style={{ display: "block", height: 12, width: "50%", borderRadius: 2 }} />
            </div>
          )}

          {outcome?.kind === "result" && meta && (() => {
            const pct = toPct(outcome.loc.percentage);
            return (
              <div className="fms-result animate-fade-up">
                <p className="eyebrow" style={{ marginBottom: 16, color: "var(--quiet)" }}>Best spot right now</p>
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
                  <Ring pct={pct} />
                  <div style={{ minWidth: 0 }}>
                    <h3 className="display" style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", margin: "0 0 4px", lineHeight: 1.05 }}>
                      {outcome.loc.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--paper-1)" }}>
                      {LEVEL_LABEL[levelFor(pct)]} · {outcome.loc.people.toLocaleString()} of {outcome.loc.capacity.toLocaleString()} seats taken
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--paper-2)" }}>{outcome.loc.hourSummary}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <a href={mapsQuery(outcome.loc.name, meta.city)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    Directions <span className="btn-arrow" aria-hidden="true">↗</span>
                  </a>
                  <Link href={meta.href} className="btn btn-ghost">All {meta.label} libraries</Link>
                </div>
              </div>
            );
          })()}

          {outcome?.kind === "computer" && (
            <Message title="Try the computer labs" body="Filter labs by building, hours and software to find an open machine." href="/labs" cta="Browse labs" />
          )}
          {outcome?.kind === "uoft" && (
            <Message title="No live feed for Toronto" body="UofT doesn't publish live occupancy. We show how busy each library usually is by hour instead." href="/uoft" cta="See typical busyness" />
          )}
          {outcome?.kind === "none_open" && meta && (
            <Message title="Everything's closed" body={`No ${meta.label} libraries are open right now. Opening hours are on each library card.`} href={meta.href} cta={`See ${meta.label} hours`} />
          )}
          {outcome?.kind === "failed" && (
            <div className="fms-result animate-fade-up">
              <h3 className="display" style={{ fontSize: 32, margin: "0 0 8px" }}>Couldn&apos;t reach the live feed</h3>
              <p style={{ margin: "0 0 24px", color: "var(--paper-1)", fontSize: "var(--text-sm)" }}>The occupancy service didn&apos;t respond. This is usually temporary.</p>
              <button type="button" className="btn btn-ghost" onClick={handleFind}>Try again</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
