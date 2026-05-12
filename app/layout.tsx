import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import Providers from "./providers";
import { Sidebar, MobileBottomNav } from "@/components/Sidebar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LibraryCheck — Find a study spot before you walk over",
  description:
    "Real-time library occupancy for University of Waterloo, University of Regina, and University of Toronto.",
};

const TOP_NAV = [
  { href: "/waterloo", label: "Dashboard" },
  { href: "/map",      label: "3D Map"    },
  { href: "/labs",     label: "Lab Hub"   },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@100..800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
        {/* Prevent flash of wrong theme on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('lc-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#111318", color: "#e2e2e8" }}
      >
        <Providers>
          {/* ── Fixed Top Header ──────────────────────────────────── */}
          <header
            className="fixed top-0 left-0 right-0 h-20 z-50 glass-panel flex items-center px-6 md:px-8 justify-between"
          >
            <Link href="/" style={{ textDecoration: "none" }}>
              <span
                className="text-xl font-bold tracking-tighter"
                style={{ color: "#00dbe9", fontFamily: "Sora, sans-serif" }}
              >
                LibraryCheck
              </span>
            </Link>

            {/* Desktop inline nav */}
            <nav className="hidden md:flex items-center gap-1">
              {TOP_NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    color: "#b9cacb",
                    textDecoration: "none",
                    fontFamily: "Sora, sans-serif",
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </header>

          {/* ── Fixed Left Sidebar (client — handles active state) ── */}
          <Sidebar />

          {/* ── Main Content ──────────────────────────────────────── */}
          <main className="mt-20 md:ml-72 pb-16 md:pb-0 min-h-[calc(100vh-80px)]">
            {children}
          </main>

          {/* ── Mobile Bottom Nav (client — handles active state) ── */}
          <MobileBottomNav />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
