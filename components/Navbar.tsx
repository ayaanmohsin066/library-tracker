"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/waterloo",     label: "Dashboard"   },
  { href: "/map",          label: "Map"         },
  { href: "/study-rooms",  label: "Study Rooms" },
  { href: "/labs",         label: "Labs"        },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href === "/waterloo" && pathname === "/");

  return (
    <>
      {/* ── Fixed top bar ─────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 glass-panel flex items-center px-4 sm:px-6 lg:px-8"
        style={{ borderBottom: "1px solid rgba(59, 73, 75, 0.2)" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 no-underline"
          style={{ fontFamily: "Sora, sans-serif" }}
        >
          <span
            className="text-xl font-bold tracking-tighter"
            style={{ color: "#6366F1" }}
          >
            LibraryCheck
          </span>
        </Link>

        {/* Desktop center nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative px-4 py-2 text-sm font-medium no-underline transition-colors"
                style={{
                  color: active ? "#6366F1" : "#b9cacb",
                  fontFamily: "Sora, sans-serif",
                }}
              >
                {label}
                {/* Active accent underline */}
                {active && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      height: 2,
                      width: "60%",
                      background: "linear-gradient(90deg, transparent, #6366F1, transparent)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side: theme toggle + mobile hamburger */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <ThemeToggle />

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            style={{
              background: "rgba(59, 73, 75, 0.25)",
              border: "1px solid rgba(59, 73, 75, 0.4)",
              color: "#b9cacb",
              cursor: "pointer",
            }}
          >
            {open ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
                <line x1="14" y1="2" x2="2"  y2="14" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <line x1="2" y1="4"  x2="14" y2="4"  stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
                <line x1="2" y1="8"  x2="14" y2="8"  stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
                <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile slide-down drawer ───────────────────────────────── */}
      <div
        className="fixed left-0 right-0 z-40 md:hidden overflow-hidden"
        style={{
          top: 64,
          maxHeight: open ? 220 : 0,
          opacity: open ? 1 : 0,
          transition: "max-height 280ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
          pointerEvents: open ? "auto" : "none",
          background: "rgba(17, 19, 24, 0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: open ? "1px solid rgba(59, 73, 75, 0.3)" : "none",
        }}
      >
        <nav className="flex flex-col px-4 py-3 gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium no-underline transition-colors"
                style={{
                  color: active ? "#6366F1" : "#b9cacb",
                  background: active ? "rgba(99, 102, 241, 0.08)" : "transparent",
                  borderLeft: `3px solid ${active ? "#6366F1" : "transparent"}`,
                  fontFamily: "Sora, sans-serif",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Scrim — closes drawer on outside tap */}
      {open && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ top: 64 }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
