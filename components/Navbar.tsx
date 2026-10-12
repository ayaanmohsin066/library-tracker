"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/",            label: "Libraries",   match: ["/", "/waterloo", "/regina", "/uoft"] },
  { href: "/map",         label: "Map",         match: ["/map"] },
  { href: "/study-rooms", label: "Study rooms", match: ["/study-rooms"] },
  { href: "/labs",        label: "Labs",        match: ["/labs"] },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[var(--fg)] no-underline">
      <span className="relative flex h-5 w-5 items-center justify-center rounded-md bg-[var(--fg)]">
        <span className="h-2 w-2 rounded-full bg-[var(--ok)]" />
      </span>
      LibraryCheck
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (match: string[]) => match.includes(pathname);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto flex h-full max-w-5xl items-center gap-6 px-4 sm:px-6">
          <Logo />

          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label, match }) => {
              const active = isActive(match);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-sm no-underline transition-colors ${
                    active
                      ? "bg-[var(--surface-2)] text-[var(--fg)]"
                      : "text-[var(--muted)] hover:text-[var(--fg)]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <ThemeToggle />
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--fg-2)] hover:bg-[var(--surface-2)] md:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
                {open ? <path d="M3 3l10 10M13 3L3 13" /> : <path d="M2 5h12M2 11h12" />}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <>
          <div className="fixed inset-0 top-14 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
          <nav className="animate-rise fixed inset-x-0 top-14 z-40 flex flex-col gap-1 border-b border-[var(--line)] bg-[var(--bg)] p-3 md:hidden">
            {NAV_LINKS.map(({ href, label, match }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 text-[15px] no-underline ${
                  isActive(match) ? "bg-[var(--surface-2)] text-[var(--fg)]" : "text-[var(--fg-2)]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </>
  );
}
