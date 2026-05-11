"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/waterloo", label: "Waterloo" },
  { href: "/regina",   label: "Regina"   },
  { href: "/uoft",     label: "UofT"     },
  { href: "/labs",     label: "Labs"     },
  { href: "/map",      label: "Map"      },
];

const LOGO_STYLE: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 800,
  letterSpacing: "-0.02em",
  textDecoration: "none",
  background: "linear-gradient(135deg, #06b6d4 0%, #818cf8 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);

  return (
    <>
      {/* ── Bar ─────────────────────────────────────────────────── */}
      <nav
        className="fixed inset-x-0 top-0 z-50 flex h-[60px] items-center justify-between px-5 sm:px-8"
        style={{
          backgroundColor: "rgba(10,10,15,0.72)",
          backdropFilter: "blur(18px) saturate(180%)",
          WebkitBackdropFilter: "blur(18px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <Link href="/" style={LOGO_STYLE}>
          LibraryCheck
        </Link>

        {/* Desktop: nav links + theme toggle */}
        <div className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: active ? "#fff" : "var(--text-secondary)",
                  backgroundColor: active ? "var(--accent)" : "transparent",
                  boxShadow: active ? "0 0 14px var(--accent-glow)" : "none",
                  transition: "color 150ms ease, background-color 150ms ease",
                }}
              >
                {label}
              </Link>
            );
          })}
          <div style={{ marginLeft: "8px" }}>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-3 sm:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "8px",
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <line x1="2" y1="4.5" x2="16" y2="4.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
              <line x1="2" y1="9"   x2="16" y2="9"   stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
              <line x1="2" y1="13.5" x2="16" y2="13.5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      {/* Scrim */}
      <div
        onClick={close}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 250ms ease",
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(280px, 80vw)",
          zIndex: 70,
          backgroundColor: "var(--bg-elevated)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "-24px 0 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "36px",
          }}
        >
          <Link href="/" onClick={close} style={LOGO_STYLE}>
            LibraryCheck
          </Link>
          <button
            onClick={close}
            aria-label="Close menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "8px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
              <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Drawer links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: active ? "#fff" : "var(--text-primary)",
                  backgroundColor: active ? "var(--accent)" : "transparent",
                  boxShadow: active ? "0 0 14px var(--accent-glow)" : "none",
                  transition: "background-color 150ms ease",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
