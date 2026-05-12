"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import FindMeSeat from "@/components/FindMeSeat";
import { useFavorites } from "@/hooks/useFavorites";

// ── Particle canvas hook ────────────────────────────────────────────
function useParticleCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT        = 200;
    const CONNECT      = 120;
    const REPEL_R      = 80;
    const REPEL_FORCE  = 0.28;
    const MAX_SPEED    = 2.2;

    // 60% white/gray · 25% indigo · 15% emerald
    const PALETTE = ["255,255,255", "99,102,241", "52,211,153"];
    const SPEEDS  = [0.28, 0.5, 0.82];

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; rgb: string };
    const pts: Particle[] = Array.from({ length: COUNT }, (_, i) => {
      const rng  = Math.random();
      const rgb  = rng < 0.6 ? PALETTE[0] : rng < 0.85 ? PALETTE[1] : PALETTE[2];
      const spd  = SPEEDS[i % 3];
      const ang  = Math.random() * Math.PI * 2;
      return {
        x:  Math.random() * (canvas.width  || 1200),
        y:  Math.random() * (canvas.height || 800),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r:  1 + Math.random() * 2,
        rgb,
      };
    });

    let raf = 0;

    const tick = () => {
      const w  = canvas.width;
      const h  = canvas.height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        const dx   = p.x - mx;
        const dy   = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_R && dist > 0) {
          const f = (1 - dist / REPEL_R) * REPEL_FORCE;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > MAX_SPEED) { p.vx = (p.vx / spd) * MAX_SPEED; p.vy = (p.vy / spd) * MAX_SPEED; }
        if (spd < 0.08) { const a = Math.random() * Math.PI * 2; p.vx += Math.cos(a) * 0.1; p.vy += Math.sin(a) * 0.1; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) { p.vx *= -1; p.x = Math.max(0, Math.min(w, p.x)); }
        if (p.y < 0 || p.y > h) { p.vy *= -1; p.y = Math.max(0, Math.min(h, p.y)); }
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx   = pts[i].x - pts[j].x;
          const dy   = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / CONNECT) * 0.12})`;
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.rgb},0.55)`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

// ── Types ───────────────────────────────────────────────────────────
type LibItem = {
  name: string;
  isOpen: boolean;
  percentage: number;
  people: number;
  capacity: number;
};

const UNI_IDS = ["waterloo", "regina", "uoft"] as const;
type UniId = (typeof UNI_IDS)[number];

const UNI_META: Record<UniId, { name: string; short: string; href: string; libCount: number }> = {
  waterloo: { name: "University of Waterloo", short: "UWaterloo", href: "/waterloo", libCount: 3 },
  regina:   { name: "University of Regina",   short: "Regina",    href: "/regina",   libCount: 2 },
  uoft:     { name: "University of Toronto",  short: "UofT",      href: "/uoft",     libCount: 9 },
};

function ringColor(pct: number) {
  return pct > 80 ? "#ffb4ab" : pct > 50 ? "#f59e0b" : "#34D399";
}

// ── Live Cycling Preview Card ───────────────────────────────────────
function LivePreviewCard() {
  const [allData, setAllData] = useState<Record<UniId, LibItem[] | null>>({
    waterloo: null, regina: null, uoft: null,
  });
  const [activeIdx, setActiveIdx] = useState(0);
  const [fadeIn, setFadeIn]       = useState(true);

  useEffect(() => {
    UNI_IDS.forEach(async (uni) => {
      try {
        const res  = await fetch(`/api/live?uni=${uni}`);
        const json = await res.json();
        setAllData((prev) => ({ ...prev, [uni]: json.data ?? [] }));
      } catch { /* keep null — skeleton shown */ }
    });
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setActiveIdx((i) => (i + 1) % UNI_IDS.length);
        setFadeIn(true);
      }, 280);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const uni      = UNI_IDS[activeIdx];
  const meta     = UNI_META[uni];
  const data     = allData[uni];
  const isLoading = data === null;
  const featured  = data?.find((l) => l.isOpen) ?? data?.[0];
  const pct       = featured ? Math.round(featured.percentage * 100) : 0;
  const isOpen    = featured?.isOpen ?? false;
  const R         = 14;
  const circ      = 2 * Math.PI * R;

  return (
    <div
      style={{
        opacity: fadeIn ? 1 : 0,
        transition: "opacity 280ms ease",
        background: "rgba(13, 20, 36, 0.88)",
        border: "1px solid rgba(99, 102, 241, 0.22)",
        borderRadius: 16,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        maxWidth: 420,
        width: "100%",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 8px 40px rgba(99, 102, 241, 0.08), inset 0 0 20px rgba(99, 102, 241, 0.03)",
      }}
    >
      {isLoading ? (
        /* Skeleton */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="animate-shimmer" style={{ height: 12, borderRadius: 6, width: "65%" }} />
          <div className="animate-shimmer" style={{ height: 10, borderRadius: 5, width: "42%" }} />
        </div>
      ) : (
        <>
          {/* Status dot */}
          <div style={{ position: "relative", flexShrink: 0, width: 12, height: 12 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: isOpen ? "#34D399" : "#ffb4ab",
              boxShadow: isOpen
                ? "0 0 10px rgba(52, 211, 153, 0.7)"
                : "0 0 10px rgba(255, 180, 171, 0.7)",
              margin: 1,
            }} />
            {isOpen && (
              <div className="animate-live-ring" style={{
                position: "absolute", inset: -2, borderRadius: "50%",
                border: "1.5px solid #34D399",
              }} />
            )}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 700, color: "#e2e2e8",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {featured?.name ?? meta.name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7FA3", fontFamily: "Sora, sans-serif" }}>
              {meta.short} · {pct}% full · {isOpen ? "Open" : "Closed"}
            </p>
          </div>

          {/* Mini occupancy ring */}
          <svg width="36" height="36" style={{ flexShrink: 0, transform: "rotate(-90deg)" }}>
            <circle cx="18" cy="18" r={R} fill="none" stroke="rgba(30,58,95,0.6)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r={R} fill="none"
              stroke={ringColor(pct)}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
            />
          </svg>
        </>
      )}
    </div>
  );
}

// ── University Selector Card ────────────────────────────────────────
function UniCard({ uni }: { uni: UniId }) {
  const [data, setData] = useState<LibItem[] | null>(null);
  const [hov,  setHov]  = useState(false);
  const meta = UNI_META[uni];

  useEffect(() => {
    fetch(`/api/live?uni=${uni}`)
      .then((r) => r.json())
      .then((j) => setData(j.data ?? []))
      .catch(() => setData([]));
  }, [uni]);

  const openLibs      = data?.filter((l) => l.isOpen).length ?? 0;
  const totalPeople   = data?.reduce((s, l) => s + l.people, 0) ?? 0;
  const totalCapacity = data?.reduce((s, l) => s + l.capacity, 0) || 1;
  const overallPct    = data ? Math.min(100, Math.round((totalPeople / totalCapacity) * 100)) : 0;
  const color         = data ? ringColor(overallPct) : "rgba(99,102,241,0.3)";

  const R    = 38;
  const circ = 2 * Math.PI * R;

  return (
    <Link href={meta.href} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          padding: "32px 24px 28px",
          borderRadius: 20,
          background: hov ? "rgba(99,102,241,0.07)" : "rgba(13,20,36,0.72)",
          border: `1px solid ${hov ? "rgba(99,102,241,0.38)" : "rgba(30,58,95,0.5)"}`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          cursor: "pointer",
          transform: hov ? "scale(1.03) translateY(-5px)" : "scale(1) translateY(0)",
          boxShadow: hov ? "0 24px 64px rgba(99,102,241,0.15)" : "none",
          transition: "transform 240ms ease, box-shadow 240ms ease, border-color 160ms ease, background 160ms ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 16,
        }}
      >
        {/* Ring with centered % */}
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(30,58,95,0.5)" strokeWidth="7" />
            <circle
              cx="50" cy="50" r={R} fill="none"
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={data ? circ * (1 - overallPct / 100) : circ}
              style={{ transition: "stroke-dashoffset 0.85s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease" }}
            />
          </svg>
          <div style={{ position: "absolute", textAlign: "center" }}>
            <p style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: data ? color : "#6B7FA3",
              lineHeight: 1,
              fontFamily: "Sora, sans-serif",
            }}>
              {data ? `${overallPct}%` : "—"}
            </p>
          </div>
        </div>

        {/* Info */}
        <div>
          <h3 style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: 700,
            color: "#e2e2e8",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}>
            {meta.name}
          </h3>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6B7FA3" }}>
            {data
              ? `${openLibs} of ${meta.libCount} librar${meta.libCount === 1 ? "y" : "ies"} open`
              : "Loading…"}
          </p>
        </div>

        {/* CTA */}
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 13,
          fontWeight: 600,
          color: hov ? "#818CF8" : "#6B7FA3",
          transition: "color 160ms ease, transform 160ms ease",
          transform: hov ? "translateX(3px)" : "translateX(0)",
        }}>
          View Live Data →
        </span>
      </div>
    </Link>
  );
}

// ── Steps data ──────────────────────────────────────────────────────
const STEPS = [
  {
    num: "1",
    title: "Pick your university",
    desc: "Choose from Waterloo, Regina, or Toronto — we track them all.",
    color: "#6366F1",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    num: "2",
    title: "See live occupancy",
    desc: "Real-time data shows how busy each library and floor is right now.",
    color: "#818CF8",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="3" y1="20" x2="21" y2="20" />
      </svg>
    ),
  },
  {
    num: "3",
    title: "Find your seat",
    desc: "Head straight to the quietest spot. No wasted trips.",
    color: "#34D399",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
] as const;

// ── Page ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const selectorRef = useRef<HTMLElement>(null);
  useParticleCanvas(canvasRef);

  const [visibleSteps, setVisibleSteps] = useState([false, false, false]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [ctaHov, setCtaHov] = useState(false);
  const { favorites } = useFavorites();

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSteps((prev) => { const next = [...prev]; next[i] = true; return next; });
            obs.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div style={{ backgroundColor: "var(--bg-base)", overflowX: "hidden" }}>

      {/* Particle canvas — fixed so it persists during scroll */}
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.5 }}
      />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 24px 100px",
          textAlign: "center",
        }}
      >
        {/* Label */}
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.28em",
          color: "var(--accent)",
          marginBottom: 28,
          fontFamily: "Sora, sans-serif",
        }}>
          Real-Time · Canadian Universities
        </p>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(2.8rem, 9vw, 6rem)",
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          marginBottom: 20,
          fontFamily: "Sora, sans-serif",
        }}>
          <span style={{ color: "#e2e2e8" }}>Find your seat</span>
          <br />
          <span style={{ color: "#818CF8" }}>before you leave.</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "clamp(0.95rem, 2.2vw, 1.15rem)",
          color: "var(--text-secondary)",
          maxWidth: 460,
          lineHeight: 1.65,
          marginBottom: 36,
          fontFamily: "Sora, sans-serif",
        }}>
          Live library occupancy for UWaterloo, Regina, and UofT.
        </p>

        {/* Live Preview Card */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
          <LivePreviewCard />
        </div>

        {/* CTA Button */}
        <button
          onMouseEnter={() => setCtaHov(true)}
          onMouseLeave={() => setCtaHov(false)}
          onClick={() => selectorRef.current?.scrollIntoView({ behavior: "smooth" })}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#6366F1",
            color: "#0A0F1C",
            fontWeight: 700,
            fontSize: "1rem",
            padding: "16px 36px",
            borderRadius: 9999,
            border: "none",
            cursor: "pointer",
            letterSpacing: "-0.01em",
            fontFamily: "Sora, sans-serif",
            transform: ctaHov ? "scale(1.05)" : "scale(1)",
            boxShadow: ctaHov
              ? "0 0 40px rgba(99,102,241,0.5), 0 8px 32px rgba(99,102,241,0.25)"
              : "0 4px 20px rgba(99,102,241,0.2)",
            transition: "transform 200ms ease, box-shadow 200ms ease",
          }}
        >
          Find Me a Seat →
        </button>

        {/* Saved spots hint — appears after localStorage hydration if any favorites exist */}
        {favorites.length > 0 && (
          <Link
            href="/waterloo#my-libraries"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 16, fontSize: 13,
              color: "#6B7FA3", textDecoration: "none",
              fontFamily: "Sora, sans-serif",
              transition: "color 150ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#818CF8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#6B7FA3")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
            >
              bookmark
            </span>
            Your saved spots
          </Link>
        )}

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)" }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
            ↓ Scroll to explore
          </p>
        </div>
      </section>

      {/* ── University Selector ───────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "rgba(10,15,28,0.96)",
          borderTop: "1px solid var(--border)",
          padding: "80px 24px 96px",
          textAlign: "center",
        }}
      >
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          color: "var(--accent)",
          marginBottom: 14,
          fontFamily: "Sora, sans-serif",
        }}>
          ✦ Live now
        </p>
        <h2 style={{
          fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
          marginBottom: 12,
          fontFamily: "Sora, sans-serif",
        }}>
          Pick your campus
        </h2>
        <p style={{
          fontSize: 15,
          color: "var(--text-secondary)",
          marginBottom: 48,
          maxWidth: 420,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}>
          Live occupancy data, updated every few minutes.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          maxWidth: 880,
          margin: "0 auto",
        }}>
          {UNI_IDS.map((uni) => <UniCard key={uni} uni={uni} />)}
        </div>
      </section>

      {/* ── Find Me a Seat ───────────────────────────────────────── */}
      <FindMeSeat sectionRef={selectorRef} />

      {/* ── How it works ─────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "var(--bg-base)",
          borderTop: "1px solid var(--border)",
          padding: "96px 24px 120px",
          textAlign: "center",
        }}
      >
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "var(--accent)",
          marginBottom: 16,
          fontFamily: "Sora, sans-serif",
        }}>
          ✦ Simple as 1 – 2 – 3
        </p>
        <h2 style={{
          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
          marginBottom: 64,
          fontFamily: "Sora, sans-serif",
        }}>
          How it works
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          maxWidth: 900,
          margin: "0 auto",
        }}>
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => { stepRefs.current[i] = el; }}
              style={{
                padding: "36px 28px",
                borderRadius: 20,
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-surface)",
                textAlign: "left",
                opacity: visibleSteps[i] ? 1 : 0,
                transform: visibleSteps[i] ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 600ms ease ${i * 130}ms, transform 600ms ease ${i * 130}ms`,
              }}
            >
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52, height: 52,
                borderRadius: 14,
                backgroundColor: `${step.color}18`,
                border: `1px solid ${step.color}30`,
                color: step.color,
                marginBottom: 20,
              }}>
                {step.icon}
              </div>
              <p style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.15em", color: step.color,
                marginBottom: 8, opacity: 0.85,
              }}>
                Step {step.num}
              </p>
              <h3 style={{
                fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)",
                marginBottom: 10, lineHeight: 1.3,
              }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
