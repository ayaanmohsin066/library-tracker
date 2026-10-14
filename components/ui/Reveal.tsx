"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Fades/rises/un-blurs its children the first time they scroll into view.
 * Each instance disconnects its observer as soon as it has revealed, so
 * there is no ongoing cost. Reduced motion is handled in CSS (.reveal is
 * shown immediately), and without IntersectionObserver content just shows.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  style,
}: {
  children: ReactNode;
  /** ms; use multiples of ~60–80 to stagger siblings */
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (!("IntersectionObserver" in window)) { setShown(true); return; }

    // already on screen at mount (e.g. above the fold, or restored scroll)
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) { setShown(true); return; }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-shown={shown ? "true" : "false"}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
