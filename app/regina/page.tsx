"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import BestSpotCard from "@/components/BestSpotCard";
import LibraryCard from "@/components/LibraryCard";
import { SkeletonCard, ErrorBanner, StaleBanner } from "@/components/tabs/shared";
import useLibraryData from "@/hooks/useLibraryData";

const BuildingModel = dynamic(
  () => import("@/components/BuildingModel"),
  {
    ssr: false,
    loading: () => (
      <div
        className="animate-shimmer"
        style={{ width: "100%", height: "280px", borderRadius: "12px", backgroundColor: "var(--bg-elevated)" }}
      />
    ),
  }
);

export default function ReginaPage() {
  const { data, isLoading, isError, isStale, dataUpdatedAt, refetch } =
    useLibraryData("regina");

  const raw       = Array.isArray(data?.live) ? data.live : [];
  const libraries = raw.map((loc) => ({
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

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 16px 80px" }}>

        {/* ── Page header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            University of Regina
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "6px" }}>
            Live library occupancy
          </p>
          {dataUpdatedAt && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
              {dataUpdatedAt} · auto-refreshes every 5 min
            </p>
          )}
        </div>

        {/* ── Stale banner ────────────────────────────────────────── */}
        {isStale && (
          <div style={{ marginBottom: "20px" }}>
            <StaleBanner onRetry={refetch} />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────── */}
        {isError && !data && <ErrorBanner onRetry={refetch} />}

        {/* ── Loading ─────────────────────────────────────────────── */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "28px",
                }}
              >
                <div className="flex flex-col-reverse gap-6 md:flex-row">
                  <div className="md:w-1/2">
                    <SkeletonCard />
                  </div>
                  <div
                    className="animate-shimmer md:w-1/2"
                    style={{ height: "280px", borderRadius: "12px", backgroundColor: "var(--bg-elevated)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Best spot ───────────────────────────────────────────── */}
        {!isLoading && libraries.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <BestSpotCard libraries={libraries} />
          </div>
        )}

        {/* ── Library rows ────────────────────────────────────────── */}
        {!isLoading && libraries.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {libraries.map((lib) => (
              <div
                key={lib.name}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "28px",
                  overflow: "hidden",
                }}
              >
                <div className="flex flex-col-reverse gap-6 md:flex-row">
                  <div className="md:w-1/2">
                    <LibraryCard {...lib} />
                  </div>
                  <div className="md:w-1/2">
                    <BuildingModel
                      buildingType="generic"
                      occupancyPercent={Math.round(lib.percentage * 100)}
                      isOpen={lib.isOpen}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
