"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

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

    // 70 % white/gray · 20 % cyan · 10 % purple
    const PALETTE = ["255,255,255", "6,182,212", "129,140,248"];
    const SPEEDS  = [0.28, 0.5, 0.82]; // slow / medium / fast tiers

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; rgb: string };
    const pts: Particle[] = Array.from({ length: COUNT }, (_, i) => {
      const rng  = Math.random();
      const rgb  = rng < 0.7 ? PALETTE[0] : rng < 0.9 ? PALETTE[1] : PALETTE[2];
      const spd  = SPEEDS[i % 3];
      const ang  = Math.random() * Math.PI * 2;
      return {
        x:  Math.random() * (canvas.width  || 1200),
        y:  Math.random() * (canvas.height || 800),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r:  1 + Math.random() * 2,   // 1–3 px radius
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
        // Mouse repulsion
        const dx   = p.x - mx;
        const dy   = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_R && dist > 0) {
          const f = (1 - dist / REPEL_R) * REPEL_FORCE;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }

        // Speed cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > MAX_SPEED) { p.vx = (p.vx / spd) * MAX_SPEED; p.vy = (p.vy / spd) * MAX_SPEED; }
        // Gentle speed floor so particles don't stop
        if (spd < 0.08) { const a = Math.random() * Math.PI * 2; p.vx += Math.cos(a) * 0.1; p.vy += Math.sin(a) * 0.1; }

        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) { p.vx *= -1; p.x = Math.max(0, Math.min(w, p.x)); }
        if (p.y < 0 || p.y > h) { p.vy *= -1; p.y = Math.max(0, Math.min(h, p.y)); }
      }

      // Connection lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx   = pts[i].x - pts[j].x;
          const dy   = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / CONNECT) * 0.16})`;
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }

      // Dots
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.rgb},0.62)`;
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

// ── Data ────────────────────────────────────────────────────────────
const UNIS = [
  {
    id: "waterloo",
    href: "/waterloo",
    name: "University of Waterloo",
    count: "3 libraries",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.32)",
    border: "rgba(6,182,212,0.18)",
    borderHov: "rgba(6,182,212,0.55)",
  },
  {
    id: "regina",
    href: "/regina",
    name: "University of Regina",
    count: "2 libraries",
    color: "#818cf8",
    glow: "rgba(129,140,248,0.32)",
    border: "rgba(129,140,248,0.18)",
    borderHov: "rgba(129,140,248,0.55)",
  },
  {
    id: "uoft",
    href: "/uoft",
    name: "University of Toronto",
    count: "9 libraries",
    color: "#10b981",
    glow: "rgba(16,185,129,0.32)",
    border: "rgba(16,185,129,0.18)",
    borderHov: "rgba(16,185,129,0.55)",
  },
] as const;

const STEPS = [
  {
    num: "1",
    title: "Pick your university",
    desc: "Choose from Waterloo, Regina, or Toronto — we track them all.",
    color: "#06b6d4",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    num: "2",
    title: "See live occupancy",
    desc: "Real-time data shows how busy each library and floor is right now.",
    color: "#818cf8",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="3" y1="20" x2="21" y2="20" />
      </svg>
    ),
  },
  {
    num: "3",
    title: "Find your seat",
    desc: "Head straight to the quietest spot. No wasted trips.",
    color: "#10b981",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
] as const;

// ── Page ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticleCanvas(canvasRef);

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [visibleSteps, setVisibleSteps] = useState([false, false, false]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSteps((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
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
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.55,
        }}
      />

      {/* Theme toggle */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 20 }}>
        <ThemeToggle />
      </div>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 100px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "var(--accent)",
            marginBottom: "20px",
          }}
        >
          ✦ Real-time library occupancy
        </p>

        <h1
          style={{
            fontSize: "clamp(3rem, 10vw, 6.5rem)",
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            marginBottom: "24px",
            background:
              "linear-gradient(135deg, #06b6d4 0%, #818cf8 55%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          LibraryCheck
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "var(--text-secondary)",
            maxWidth: "480px",
            lineHeight: 1.65,
            marginBottom: "64px",
          }}
        >
          Real-time library occupancy for Canadian universities.{" "}
          Find a seat before you walk over.
        </p>

        {/* University cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            width: "100%",
            maxWidth: "820px",
          }}
        >
          {UNIS.map((uni) => {
            const isHov = hoveredCard === uni.id;
            return (
              <Link key={uni.id} href={uni.href} style={{ textDecoration: "none" }}>
                <div
                  onMouseEnter={() => setHoveredCard(uni.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    padding: "28px 24px",
                    borderRadius: "20px",
                    border: `1px solid ${isHov ? uni.borderHov : uni.border}`,
                    background: isHov
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    textAlign: "left",
                    cursor: "pointer",
                    transform: isHov
                      ? "scale(1.04) translateY(-4px)"
                      : "scale(1) translateY(0)",
                    boxShadow: isHov ? `0 20px 60px ${uni.glow}` : "none",
                    transition:
                      "transform 220ms ease, box-shadow 220ms ease, border-color 150ms ease, background 150ms ease",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: uni.color,
                      marginBottom: "10px",
                    }}
                  >
                    {uni.count}
                  </p>
                  <h2
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      lineHeight: 1.3,
                      marginBottom: "18px",
                    }}
                  >
                    {uni.name}
                  </h2>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: uni.color,
                      opacity: isHov ? 1 : 0.5,
                      transform: isHov ? "translateX(4px)" : "translateX(0)",
                      transition: "opacity 200ms ease, transform 200ms ease",
                      textShadow: isHov ? `0 0 14px ${uni.color}` : "none",
                    }}
                  >
                    View live data
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{ flexShrink: 0 }}
                    >
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Scroll hint */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}
          >
            ↓ Scroll down to learn more
          </p>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
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
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--accent)",
            marginBottom: "16px",
          }}
        >
          ✦ Simple as 1 – 2 – 3
        </p>
        <h2
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            marginBottom: "64px",
          }}
        >
          How it works
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              style={{
                padding: "36px 28px",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-surface)",
                textAlign: "left",
                opacity: visibleSteps[i] ? 1 : 0,
                transform: visibleSteps[i]
                  ? "translateY(0)"
                  : "translateY(32px)",
                transition: `opacity 600ms ease ${i * 130}ms, transform 600ms ease ${i * 130}ms`,
              }}
            >
              {/* Icon badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  backgroundColor: `${step.color}18`,
                  border: `1px solid ${step.color}30`,
                  color: step.color,
                  marginBottom: "20px",
                }}
              >
                {step.icon}
              </div>

              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: step.color,
                  marginBottom: "8px",
                  opacity: 0.85,
                }}
              >
                Step {step.num}
              </p>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
