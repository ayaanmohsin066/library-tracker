"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ThemeToggle from "@/components/ThemeToggle";

const ThreeBackground = dynamic(
  () => import("@/components/ThreeBackground"),
  { ssr: false }
);

const UNIS = [
  {
    id: "waterloo",
    href: "/waterloo",
    name: "University of Waterloo",
    detail: "Dana Porter · Davis · Musagetes",
    color: "#06b6d4",
    border: "rgba(6,182,212,0.22)",
    borderHov: "rgba(6,182,212,0.55)",
    bg: "rgba(6,182,212,0.06)",
    bgHov: "rgba(6,182,212,0.13)",
    glow: "rgba(6,182,212,0.22)",
  },
  {
    id: "regina",
    href: "/regina",
    name: "University of Regina",
    detail: "Live occupancy via Waitz",
    color: "#818cf8",
    border: "rgba(129,140,248,0.22)",
    borderHov: "rgba(129,140,248,0.55)",
    bg: "rgba(129,140,248,0.06)",
    bgHov: "rgba(129,140,248,0.13)",
    glow: "rgba(129,140,248,0.22)",
  },
  {
    id: "uoft",
    href: "/uoft",
    name: "University of Toronto",
    detail: "9 libraries · Historical data",
    color: "#10b981",
    border: "rgba(16,185,129,0.22)",
    borderHov: "rgba(16,185,129,0.55)",
    bg: "rgba(16,185,129,0.06)",
    bgHov: "rgba(16,185,129,0.13)",
    glow: "rgba(16,185,129,0.22)",
  },
] as const;

export default function LandingPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)", position: "relative" }}>
      <ThreeBackground />

      {/* Theme toggle — fixed top-right */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 10 }}>
        <ThemeToggle />
      </div>

      {/* Hero */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 120px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "var(--accent)",
            marginBottom: "20px",
          }}
        >
          ✦ Real-time library occupancy
        </p>

        <h1
          style={{
            fontSize: "clamp(2.8rem, 9vw, 5.5rem)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: "20px",
            background:
              "linear-gradient(135deg, #06b6d4 0%, #818cf8 55%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          LibraryCheck
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "var(--text-secondary)",
            maxWidth: "400px",
            marginBottom: "64px",
            lineHeight: 1.6,
          }}
        >
          Find a quiet seat before you walk over.
        </p>

        {/* University cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            width: "100%",
            maxWidth: "860px",
          }}
        >
          {UNIS.map((uni) => {
            const isHov = hovered === uni.id;
            return (
              <Link key={uni.id} href={uni.href} style={{ textDecoration: "none" }}>
                <div
                  onMouseEnter={() => setHovered(uni.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    padding: "24px 22px",
                    borderRadius: "18px",
                    border: `1px solid ${isHov ? uni.borderHov : uni.border}`,
                    backgroundColor: isHov ? uni.bgHov : uni.bg,
                    textAlign: "left",
                    cursor: "pointer",
                    transform: isHov ? "translateY(-5px)" : "translateY(0)",
                    boxShadow: isHov ? `0 16px 48px ${uni.glow}` : "none",
                    transition:
                      "transform 200ms ease, box-shadow 200ms ease, border-color 150ms ease, background-color 150ms ease",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: uni.color,
                      marginBottom: "10px",
                    }}
                  >
                    {uni.detail}
                  </p>
                  <h2
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: "14px",
                      lineHeight: 1.3,
                    }}
                  >
                    {uni.name}
                  </h2>
                  <span
                    style={{
                      fontSize: "13px",
                      color: uni.color,
                      fontWeight: 600,
                    }}
                  >
                    View live data →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
