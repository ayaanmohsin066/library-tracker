"use client";

/**
 * Split-flap text, adapted from 21st.dev "Split Flap Display" (@componentry).
 *
 * Changes from the original, for production use:
 * - Each cell flips through a few random glyphs (6–9) and lands, instead of
 *   walking the whole 50-character set, which ran up to ~150 state updates per
 *   cell. One setTimeout chain per cell instead of interval + nested timeouts.
 * - Colours come from design tokens, so it works in light and dark themes.
 * - Accessible: the real string is in a visually hidden span and the glyph
 *   cells are aria-hidden (the original read out letter by letter).
 * - prefers-reduced-motion: the text is set instantly, with no flipping.
 * - Keyframes live in globals.css instead of being injected at runtime.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%";

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? " ";
}

let reducedMotionCache: boolean | null = null;
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  if (reducedMotionCache === null) {
    reducedMotionCache = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return reducedMotionCache;
}

function FlapCell({ target, delay, speed }: { target: string; delay: number; speed: number }) {
  const [shown, setShown] = useState(" ");
  const [prev, setPrev] = useState(" ");
  const [tick, setTick] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownRef = useRef(" ");

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (shownRef.current === target) return;

    if (prefersReducedMotion()) {
      shownRef.current = target;
      setPrev(target);
      setShown(target);
      return;
    }

    // Spaces just clear; other characters spin a few times then land.
    let steps = target === " " ? 1 : 6 + Math.floor(Math.random() * 4);
    const step = () => {
      steps -= 1;
      const next = steps <= 0 ? target : randomGlyph();
      setPrev(shownRef.current);
      shownRef.current = next;
      setShown(next);
      setTick((t) => t + 1);
      if (steps > 0) timer.current = setTimeout(step, speed);
    };
    timer.current = setTimeout(step, delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [target, delay, speed]);

  const anim = `${Math.round(speed * 0.9)}ms`;

  return (
    <span className="flap-cell" aria-hidden="true">
      <span className="flap-half flap-top"><span>{shown}</span></span>
      <span className="flap-half flap-bottom"><span>{shown}</span></span>
      {tick > 0 && (
        <>
          {/* previous glyph's top half falls away… */}
          <span key={`t${tick}`} className="flap-half flap-top flap-fold-top" style={{ animationDuration: anim }}>
            <span>{prev}</span>
          </span>
          {/* …revealing the new glyph's bottom half */}
          <span key={`b${tick}`} className="flap-half flap-bottom flap-fold-bottom" style={{ animationDuration: anim, animationDelay: `${Math.round(speed * 0.45)}ms` }}>
            <span>{shown}</span>
          </span>
        </>
      )}
    </span>
  );
}

export default function FlapText({
  text,
  length,
  delay = 0,
  stagger = 35,
  speed = 70,
  color,
  size = "md",
  className = "",
  style,
}: {
  text: string;
  /** Pad/truncate to this many cells so columns stay aligned */
  length?: number;
  delay?: number;
  stagger?: number;
  /** ms per flip step */
  speed?: number;
  /** glyph colour (used for status words) */
  color?: string;
  size?: "sm" | "md";
  className?: string;
  style?: CSSProperties;
}) {
  const upper = text.toUpperCase();
  const padded = length ? upper.padEnd(length, " ").slice(0, length) : upper;
  return (
    <span
      // literal class names so Tailwind's content scan keeps them
      className={`${size === "sm" ? "flap flap-sm" : "flap flap-md"} ${className}`}
      style={{ ...style, ...(color ? { ["--flap-ink" as string]: color } : null) }}
    >
      <span className="sr-only-lc">{text}</span>
      {padded.split("").map((ch, i) => (
        <FlapCell key={i} target={ch} delay={delay + i * stagger} speed={speed} />
      ))}
    </span>
  );
}
