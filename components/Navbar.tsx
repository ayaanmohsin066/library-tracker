"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const CAMPUS_LINKS = [
  { href: "/waterloo", label: "Waterloo" },
  { href: "/regina",   label: "Regina" },
  { href: "/uoft",     label: "Toronto" },
];
const TOOL_LINKS = [
  { href: "/map",         label: "Map" },
  { href: "/study-rooms", label: "Study rooms" },
  { href: "/labs",        label: "Labs" },
];
const ALL_LINKS = [...CAMPUS_LINKS, ...TOOL_LINKS];

export function Wordmark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 24, lineHeight: 1, letterSpacing: "-0.01em" }}>
        LibraryCheck
      </span>
      {/* the lamp: the one brass mark in the brand */}
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: "var(--brass)", transform: "translateY(-14px)" }} />
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the menu on navigation and on Escape
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className="nav-bar"
        data-over-hero={overHero ? "true" : "false"}
      >
        <div className="container-lc" style={{ height: "100%", display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/" aria-label="LibraryCheck home" className="nav-logo">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden md:flex" style={{ alignItems: "center", gap: 4, marginLeft: "auto" }}>
            {CAMPUS_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link" aria-current={isActive(l.href) ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
            <span aria-hidden="true" style={{ width: 1, height: 16, background: "var(--line-strong)", margin: "0 8px" }} />
            {TOOL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link" aria-current={isActive(l.href) ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }} className="md:ml-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="md:hidden nav-icon-btn"
            >
              <span className="burger" data-open={open ? "true" : "false"} aria-hidden="true">
                <span /><span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — full-width sheet; links stagger in */}
      <div id="mobile-menu" className="mobile-menu md:hidden" data-open={open ? "true" : "false"} hidden={!open}>
        <nav aria-label="Mobile" className="container-lc" style={{ paddingTop: 16, paddingBottom: 32 }}>
          <p className="eyebrow" style={{ margin: "8px 0 4px" }}>Campuses</p>
          {CAMPUS_LINKS.map((l, i) => (
            <Link key={l.href} href={l.href} className="mobile-link" style={{ ["--i" as string]: i }} aria-current={isActive(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
          <p className="eyebrow" style={{ margin: "24px 0 4px" }}>Tools</p>
          {TOOL_LINKS.map((l, i) => (
            <Link key={l.href} href={l.href} className="mobile-link" style={{ ["--i" as string]: i + CAMPUS_LINKS.length }} aria-current={isActive(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      {open && <div className="md:hidden" onClick={() => setOpen(false)} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 40 }} />}
    </>
  );
}

export { ALL_LINKS };
