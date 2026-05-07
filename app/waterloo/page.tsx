"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import BestSpotCard from "@/components/BestSpotCard";
import { SkeletonCard, ErrorBanner, StaleBanner } from "@/components/tabs/shared";
import useLibraryData from "@/hooks/useLibraryData";
import type { BuildingType } from "@/components/BuildingModel";

const BuildingModel = dynamic(() => import("@/components/BuildingModel"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "100%" }} />,
});

const WireframeCube = dynamic(() => import("@/components/WireframeCube"), {
  ssr: false,
  loading: () => <div className="animate-shimmer" style={{ width: "100%", height: "100%", borderRadius: "12px" }} />,
});

const BUILDING_MAP: Record<string, BuildingType> = {
  "Dana Porter Library":            "dana-porter",
  "Davis Library":                  "davis",
  "Musagetes Architecture Library": "musagetes",
};
function getBuildingType(name: string): BuildingType {
  return BUILDING_MAP[name] ?? "generic";
}

function occColor(pct: number): string {
  if (pct >= 80) return "#ef4444";
  if (pct >= 50) return "#f59e0b";
  return "#10b981";
}
function occBarClass(pct: number): string {
  if (pct >= 80) return "bar-fill-red";
  if (pct >= 50) return "bar-fill-amber";
  return "bar-fill-green";
}

// ── Loading row ───────────────────────────────────────────────────────────────
function LoadingRow() {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <div className="flex flex-col md:flex-row" style={{ minHeight: "500px" }}>
        {/* 3D panel — first in DOM = top on mobile */}
        <div
          className="md:order-2 h-[280px] md:h-auto"
          style={{ flex: "0 0 55%", backgroundColor: "var(--bg-elevated)", position: "relative" }}
        >
          <WireframeCube />
        </div>
        {/* Info skeleton */}
        <div
          className="md:order-1"
          style={{
            flex: "0 0 45%",
            padding: "36px 40px",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

// ── Library row ───────────────────────────────────────────────────────────────
interface LibRow {
  name: string;
  percentage: number;
  people: number;
  capacity: number;
  isOpen: boolean;
  hourSummary: string;
  subLocs: { name: string; percentage: number; people: number; capacity: number; isOpen: boolean }[];
}

function LibraryRow({ lib }: { lib: LibRow }) {
  const pct  = Math.round(lib.percentage * 100);
  const col  = occColor(pct);
  const barC = occBarClass(pct);

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <div className="flex flex-col md:flex-row" style={{ minHeight: "500px" }}>

        {/* ── Right: 3D model (first in DOM = top on mobile) ── */}
        <div
          className="md:order-2 h-[280px] md:h-auto"
          style={{
            flex: "0 0 55%",
            position: "relative",
            backgroundColor: "var(--bg-elevated)",
            boxShadow: "inset 0 0 40px rgba(6,182,212,0.04)",
          }}
        >
          <BuildingModel
            buildingType={getBuildingType(lib.name)}
            occupancyPercent={pct}
            isOpen={lib.isOpen}
            label={lib.name}
          />
        </div>

        {/* ── Vertical separator (desktop only) ── */}
        <div
          className="md:order-15 hidden md:block"
          style={{
            width: "1px",
            flexShrink: 0,
            background: "linear-gradient(to bottom, transparent, var(--border) 20%, var(--border) 80%, transparent)",
          }}
        />

        {/* ── Left: info panel ── */}
        <div
          className="md:order-1"
          style={{
            flex: "0 0 45%",
            padding: "36px 40px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* Name */}
          <h2 style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.55rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {lib.name}
          </h2>

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <span
              className={lib.isOpen ? "animate-pulse" : ""}
              style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: lib.isOpen ? "#10b981" : "#ef4444", flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, color: lib.isOpen ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
              {lib.isOpen ? "Open" : "Closed"}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>· {lib.hourSummary}</span>
          </div>

          {/* Big % number */}
          <div style={{ marginTop: 28, marginBottom: 4 }}>
            <span style={{ fontSize: "clamp(3rem, 6vw, 4.5rem)", fontWeight: 900, lineHeight: 1, color: col, textShadow: `0 0 30px ${col}55`, fontVariantNumeric: "tabular-nums" }}>
              {pct}%
            </span>
            <span style={{ fontSize: 14, color: "var(--text-muted)", marginLeft: 8 }}>full</span>
          </div>

          {/* GlowBar */}
          <div className="bar-track" style={{ marginBottom: 8 }}>
            <div className={barC} style={{ width: `${Math.min(100, lib.percentage * 100)}%` }} />
          </div>

          {/* People / capacity */}
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
            {lib.people} / {lib.capacity} people
          </p>

          {/* Floor breakdown */}
          {lib.subLocs.length > 0 && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 2 }}>
                By floor
              </p>
              {lib.subLocs.map((loc) => {
                const lPct = Math.round(loc.percentage * 100);
                return (
                  <div key={loc.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 120, flexShrink: 0, fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {loc.name}
                    </span>
                    <div className="bar-track" style={{ flex: 1 }}>
                      <div className={occBarClass(lPct)} style={{ width: `${Math.min(100, loc.percentage * 100)}%` }} />
                    </div>
                    <span
                      style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", width: 36, textAlign: "right", color: occColor(lPct) }}
                    >
                      {lPct}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Booking button — Dana Porter only */}
          {lib.name === "Dana Porter Library" && (
            <a
              href="https://libcal.uwaterloo.ca/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 28,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                alignSelf: "flex-start",
                backgroundColor: "var(--accent)",
                color: "#fff",
                borderRadius: 12,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 0 20px var(--accent-glow)",
                transition: "opacity 150ms ease",
              }}
            >
              Book a Study Room
              <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function WaterlooPage() {
  const { data, isLoading, isError, isStale, dataUpdatedAt, refetch } =
    useLibraryData("waterloo");

  const raw = Array.isArray(data?.live) ? data.live : [];
  const libraries: LibRow[] = raw.map((loc) => ({
    name:        loc.name,
    percentage:  loc.percentage,
    people:      loc.people,
    capacity:    loc.capacity,
    isOpen:      loc.isOpen,
    hourSummary: loc.hourSummary,
    subLocs:     Array.isArray(loc.subLocs) ? loc.subLocs : [],
  }));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "88px 24px 48px" }}>
        {/* Radial glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(6,182,212,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
            University of Waterloo
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span
                className="animate-pulse"
                style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", flexShrink: 0 }}
              />
              <span style={{ color: "#10b981", fontWeight: 600 }}>Live</span>
            </span>
            library occupancy — updated every 5 minutes
          </p>
          {dataUpdatedAt && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{dataUpdatedAt}</p>
          )}
        </div>
      </section>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px 80px" }}>

        {/* ── Stale / Error ────────────────────────────────────────── */}
        {isStale && <div style={{ marginBottom: 16 }}><StaleBanner onRetry={refetch} /></div>}
        {isError && !data && <ErrorBanner onRetry={refetch} />}

        {/* ── Best spot ────────────────────────────────────────────── */}
        {!isLoading && libraries.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <BestSpotCard libraries={libraries} />
          </div>
        )}

        {/* ── Loading ──────────────────────────────────────────────── */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[0, 1, 2].map((i) => <LoadingRow key={i} />)}
          </div>
        )}

        {/* ── Library rows ─────────────────────────────────────────── */}
        {!isLoading && libraries.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {libraries.map((lib, idx) => (
              <div key={lib.name}>
                {idx > 0 && (
                  <div style={{
                    height: 1,
                    margin: "12px 0",
                    background: "linear-gradient(to right, transparent, rgba(6,182,212,0.22), transparent)",
                  }} />
                )}
                <LibraryRow lib={lib} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
