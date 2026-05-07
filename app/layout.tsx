import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import Providers from "./providers";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <Providers>{children}</Providers>
        <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-xs text-gray-400">
          <p>
            Data for Waterloo and Regina via Waitz.io · UofT data is historical
            only
          </p>
          <p className="mt-1">© 2025 LibraryCheck</p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
