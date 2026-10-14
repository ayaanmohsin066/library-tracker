import Image from "next/image";
import FindMeSeat from "@/components/FindMeSeat";
import DepartureBoard from "@/components/home/DepartureBoard";
import CampusIndex from "@/components/home/CampusIndex";
import SavedSpotsHint from "@/components/home/SavedSpotsHint";
import Reveal from "@/components/ui/Reveal";
import SplitWords from "@/components/ui/SplitWords";
import heroImg from "@/assets/hero/reading-room-night.jpg";

const STEPS = [
  {
    n: "1",
    title: "Check the board",
    body: "Every library we track, sorted quietest first. Waterloo and Regina come from live Waitz occupancy data.",
  },
  {
    n: "2",
    title: "Go floor by floor",
    body: "Open a campus to see each floor's occupancy, so you know whether the silent floor has room before you pick a building.",
  },
  {
    n: "3",
    title: "Walk over once",
    body: "Head to the quietest open spot, or book a study room. No more lapping three buildings with a full backpack.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="hero hero-scope" aria-labelledby="hero-title">
        <div className="hero-media">
          <Image
            src={heroImg}
            alt=""
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="hero-img"
          />
        </div>
        {/* legibility: darken the left (text) and bottom (board) of the photo */}
        <div className="hero-shade" aria-hidden="true" />

        <div className="container-lc hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-fade" style={{ ["--d" as string]: "0ms", display: "flex", alignItems: "center", gap: 10, color: "var(--paper-1)" }}>
              <span className="live-dot" aria-hidden="true" />
              Live · Waterloo · Regina · Toronto
            </p>

            <h1 id="hero-title" className="display hero-title">
              <SplitWords text="Find your seat" startDelay={120} />
              <br />
              <em className="hero-title-em">
                <SplitWords text="before you leave." startDelay={330} />
              </em>
            </h1>

            <p className="hero-sub hero-fade" style={{ ["--d" as string]: "620ms" }}>
              Real-time library occupancy, floor by floor. Pick the quiet one and skip the walk.
            </p>

            <div className="hero-actions hero-fade" style={{ ["--d" as string]: "740ms" }}>
              <a href="#finder" className="btn btn-primary">
                Find me a seat <span className="btn-arrow" aria-hidden="true">↓</span>
              </a>
              <a href="#campuses" className="btn btn-ghost">Browse campuses</a>
            </div>
            <SavedSpotsHint />
          </div>

          <div className="hero-board hero-fade" style={{ ["--d" as string]: "520ms" }}>
            <DepartureBoard />
          </div>
        </div>

        <a href="#campuses" className="hero-cue" aria-label="Scroll to campuses">
          <span />
        </a>
      </section>

      <CampusIndex />

      {/* ── Find me a seat ────────────────────────────────────────────── */}
      <FindMeSeat />

      {/* ── How it works — quiet, editorial, no cards ─────────────────── */}
      <section className="container-lc" style={{ paddingBlock: "var(--s-24)" }} aria-labelledby="how-title">
        <Reveal><p className="eyebrow">03 — How it works</p></Reveal>
        <Reveal delay={60}>
          <h2 id="how-title" className="display text-balance" style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", margin: "12px 0 var(--s-12)", maxWidth: "16ch" }}>
            Less walking, <em style={{ color: "var(--paper-1)" }}>more studying.</em>
          </h2>
        </Reveal>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 90} className="step">
              <span className="step-n display" aria-hidden="true">{s.n}</span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body text-pretty">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}
