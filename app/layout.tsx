import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const DESCRIPTION =
  "Live library occupancy for the University of Waterloo and the University of Regina, plus typical busyness for the University of Toronto. Check before you walk over.";

export const metadata: Metadata = {
  metadataBase: new URL("https://library-tracker-phi.vercel.app"),
  title: {
    default: "LibraryCheck — Find your seat before you leave",
    template: "%s · LibraryCheck",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "LibraryCheck — Find your seat before you leave",
    description: DESCRIPTION,
    images: [{ url: "/og-reading-room.jpg", width: 1200, height: 630, alt: "A quiet reading room at night, lit by brass desk lamps" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LibraryCheck — Find your seat before you leave",
    description: DESCRIPTION,
    images: ["/og-reading-room.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230b0c0f'/><path d='M10 23V9h3v11h7v3z' fill='%23f2ede4'/><circle cx='23' cy='11' r='2.5' fill='%23d6a65c'/></svg>"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Display face. UI text uses the self-hosted Geist above. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* Icon font used by the Labs, Study Rooms, Map and UofT pages */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Prevent flash of wrong theme on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('lc-theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}}())`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <a href="#main" className="skip-link">Skip to content</a>
        <Providers>
          <Navbar />
          {/* pt = nav height; the homepage hero pulls itself up underneath the nav */}
          <main id="main" style={{ paddingTop: "var(--nav-h)", minHeight: "100vh" }}>
            {children}
          </main>
          <SiteFooter />
        </Providers>
        <Analytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
