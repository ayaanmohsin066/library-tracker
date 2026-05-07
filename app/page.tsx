"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const WaterlooTab = dynamic(() => import("@/components/tabs/WaterlooTab"));
const ReginaTab   = dynamic(() => import("@/components/tabs/ReginaTab"));
const UoftTab     = dynamic(() => import("@/components/tabs/UoftTab"));

type TabId = "waterloo" | "regina" | "uoft";

const TABS: { id: TabId; label: string; indicator: string }[] = [
  { id: "waterloo", label: "Waterloo", indicator: "🟢" },
  { id: "regina",   label: "Regina",   indicator: "🟢" },
  { id: "uoft",     label: "UofT",     indicator: "📊" },
];

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"     x2="12" y2="3" />
      <line x1="12" y1="21"    x2="12" y2="23" />
      <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("waterloo");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("lc-theme");
    if (stored === "light") setIsDark(false);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("lc-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("lc-theme", "light");
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-extrabold tracking-tight sm:text-4xl"
              style={{
                background: "linear-gradient(135deg, #06b6d4 0%, #818cf8 55%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              LibraryCheck
            </h1>
            <p
              className="mt-1 hidden text-sm min-[380px]:block"
              style={{ color: "var(--text-muted)" }}
            >
              Find a seat before you walk over.
            </p>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-strong)",
              color: "var(--text-secondary)",
            }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        {/* ── Tab bar ── */}
        <div className="mb-8 -mx-4 sm:mx-0">
          <div className="flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:px-0">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200"
                  style={
                    active
                      ? {
                          backgroundColor: "var(--accent)",
                          color: "#fff",
                          boxShadow: "0 0 18px var(--accent-glow)",
                        }
                      : {
                          backgroundColor: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                        }
                  }
                >
                  <span>{tab.indicator}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ── */}
        <main className="animate-fade-up">
          {activeTab === "waterloo" && <WaterlooTab />}
          {activeTab === "regina"   && <ReginaTab />}
          {activeTab === "uoft"     && <UoftTab />}
        </main>
      </div>
    </div>
  );
}
