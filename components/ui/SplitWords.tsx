import type { CSSProperties } from "react";

/**
 * Word-by-word entrance for a headline. Screen readers get the plain
 * sentence from a visually-hidden copy; the animated spans are hidden.
 * Server-renderable (pure CSS animation), so the words are in the HTML
 * immediately and there is no hydration flash.
 */
export default function SplitWords({
  text,
  startDelay = 0,
  step = 70,
  className,
  style,
}: {
  text: string;
  startDelay?: number;
  /** ms between words */
  step?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const words = text.split(" ");
  return (
    <span className={className} style={style}>
      <span className="sr-only-lc">{text}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true">
          <span className="split-word" style={{ ["--word-delay" as string]: `${startDelay + i * step}ms` }}>
            {w}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
