"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_LINKS = [
  { href: "/waterloo", label: "Dashboard", icon: "dashboard" },
  { href: "/map",      label: "3D Map",    icon: "map"       },
  { href: "/labs",     label: "Lab Hub",   icon: "computer"  },
];

const MOBILE_LINKS = [
  { href: "/waterloo", label: "Home",     icon: "home"     },
  { href: "/map",      label: "Map",      icon: "map"      },
  { href: "/labs",     label: "Labs",     icon: "computer" },
  { href: "/",         label: "Settings", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-20 bottom-0 w-72 hidden md:flex flex-col z-40 p-6"
      style={{
        background: "rgba(17, 19, 24, 0.95)",
        borderRight: "1px solid rgba(59, 73, 75, 0.35)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest mb-6"
        style={{ color: "#849495", fontFamily: "Sora, sans-serif", letterSpacing: "0.14em" }}
      >
        Command Center
      </p>

      <nav className="flex flex-col gap-1">
        {SIDEBAR_LINKS.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all no-underline"
              style={{
                color: active ? "#00dbe9" : "#b9cacb",
                background: active ? "rgba(0, 219, 233, 0.08)" : "transparent",
                borderRight: active ? "4px solid #7df4ff" : "4px solid transparent",
                fontFamily: "Sora, sans-serif",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden z-50 flex items-center justify-around"
      style={{
        height: 64,
        background: "rgba(17, 19, 24, 0.97)",
        borderTop: "1px solid rgba(59, 73, 75, 0.5)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {MOBILE_LINKS.map(({ href, label, icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 no-underline"
            style={{ color: active ? "#00dbe9" : "#849495" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
              {icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "Sora, sans-serif" }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
