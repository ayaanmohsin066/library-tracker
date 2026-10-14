import Link from "next/link";
import { Wordmark } from "@/components/Navbar";

const COLS = [
  {
    title: "Campuses",
    links: [
      { href: "/waterloo", label: "University of Waterloo" },
      { href: "/regina", label: "University of Regina" },
      { href: "/uoft", label: "University of Toronto" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/map", label: "Campus map" },
      { href: "/study-rooms", label: "Study rooms" },
      { href: "/labs", label: "Computer labs" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "var(--ink-0)" }}>
      <div
        className="container-lc"
        style={{ display: "grid", gap: 40, padding: "56px var(--gutter) 40px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <div style={{ maxWidth: 320 }}>
          <Link href="/" aria-label="LibraryCheck home" style={{ color: "var(--paper-0)", textDecoration: "none" }}>
            <Wordmark />
          </Link>
          <p style={{ marginTop: 12, fontSize: "var(--text-sm)", color: "var(--paper-2)", lineHeight: 1.6 }}>
            See how full the library is before you pack your bag.
          </p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>{c.title}</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-u" style={{ fontSize: "var(--text-sm)", color: "var(--paper-1)" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container-lc" style={{ paddingBottom: 32 }}>
        <p style={{ margin: 0, paddingTop: 20, borderTop: "1px solid var(--line)", fontSize: "var(--text-xs)", color: "var(--paper-2)", lineHeight: 1.6 }}>
          Live occupancy for Waterloo and Regina comes from Waitz sensors. University of Toronto
          figures are typical-busyness estimates, not live counts. Not affiliated with any university.
        </p>
      </div>
    </footer>
  );
}
