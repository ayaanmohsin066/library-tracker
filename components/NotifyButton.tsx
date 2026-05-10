"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// ── localStorage helpers ───────────────────────────────────────────────────────

const LS_KEY = "lc-notify";

interface StoredAlert { threshold: number }

function readAlerts(): Record<string, StoredAlert> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}"); }
  catch { return {}; }
}
function saveAlert(library: string, threshold: number) {
  try {
    const d = readAlerts();
    d[library] = { threshold };
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  } catch {}
}
function clearAlert(library: string) {
  try {
    const d = readAlerts();
    delete d[library];
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  } catch {}
}

// ── Bell SVG ──────────────────────────────────────────────────────────────────

function BellIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24"
      fill={active ? "var(--accent)" : "none"}
      stroke={active ? "var(--accent)" : "currentColor"}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface NotifyButtonProps {
  libraryName: string;
  currentPct: number;
  uni: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotifyButton({ libraryName, currentPct, uni }: NotifyButtonProps) {
  const btnRef  = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [mounted,  setMounted]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const [formPos,  setFormPos]  = useState({ top: 0, right: 0 });

  // Form fields
  const [email,     setEmail]     = useState("");
  const [threshold, setThreshold] = useState(50);
  const [status,    setStatus]    = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errMsg,    setErrMsg]    = useState("");

  // Stored alert state (synced to localStorage)
  const [storedThreshold, setStoredThreshold] = useState<number | null>(null);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    setStoredThreshold(readAlerts()[libraryName]?.threshold ?? null);
  }, [libraryName]);

  // ── Browser notification permission ───────────────────────────────────────
  useEffect(() => {
    if (!mounted || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      // Don't auto-prompt — wait until user opens the form
    }
  }, [mounted]);

  // ── Check threshold on every occupancy update (piggybacks on RQ refetch) ──
  const checkBrowserNotif = useCallback(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const stored = readAlerts()[libraryName];
    if (!stored) return;
    if (currentPct <= stored.threshold) {
      new Notification(`📚 ${libraryName} below ${stored.threshold}%`, {
        body: `Currently at ${currentPct}% — now's a good time to head over!`,
        icon: "/favicon.ico",
      });
      clearAlert(libraryName);
      setStoredThreshold(null);
    }
  }, [libraryName, currentPct]);

  useEffect(() => {
    if (!mounted) return;
    checkBrowserNotif();
  }, [mounted, checkBrowserNotif]);

  // ── 5-minute client-side interval (backup) ────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(checkBrowserNotif, 5 * 60_000);
    return () => clearInterval(id);
  }, [mounted, checkBrowserNotif]);

  // ── Portal positioning ────────────────────────────────────────────────────
  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setFormPos({
      top:   r.bottom + window.scrollY + 8,
      right: window.innerWidth - r.right,
    });
  }, []);

  const toggle = () => {
    if (!open) {
      updatePos();
      setThreshold(currentPct || 50);
      setStatus("idle");
      setErrMsg("");
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, updatePos]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !formRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Form submit ───────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrMsg("");

    // Request browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    const res = await fetch("/api/notify", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ library_name: libraryName, uni, threshold, email }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrMsg(body.error ?? "Something went wrong — please try again.");
      setStatus("error");
      return;
    }

    saveAlert(libraryName, threshold);
    setStoredThreshold(threshold);
    setStatus("done");
  }

  // ── Styles (shared) ───────────────────────────────────────────────────────
  const panelStyle: React.CSSProperties = {
    position:        "absolute",
    top:             formPos.top,
    right:           formPos.right,
    zIndex:          1000,
    width:           300,
    backgroundColor: "var(--bg-elevated)",
    border:          "1px solid var(--border-strong)",
    borderRadius:    16,
    padding:         20,
    boxShadow:       "0 16px 48px rgba(0,0,0,0.55)",
  };

  const inputStyle: React.CSSProperties = {
    width:           "100%",
    backgroundColor: "var(--bg-surface)",
    border:          "1px solid var(--border)",
    borderRadius:    8,
    padding:         "8px 10px",
    fontSize:        13,
    color:           "var(--text-primary)",
    outline:         "none",
    boxSizing:       "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 4,
    display: "block",
  };

  // ── Mailto fallback ───────────────────────────────────────────────────────
  const mailtoHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(`Library reminder: ${libraryName}`)}&body=${encodeURIComponent(`Check live occupancy at https://librarycheck.ca/${uni}`)}`
    : "#";

  // ── Portal form ───────────────────────────────────────────────────────────
  const portal = mounted && open ? createPortal(
    <div ref={formRef} style={panelStyle}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Occupancy alert
        </p>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2, lineHeight: 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg>
        </button>
      </div>

      {status === "done" ? (
        /* ── Confirmation ── */
        <div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 12 }}>
            <span style={{ color: "#10b981", marginRight: 6 }}>✓</span>
            We&apos;ll email you when{" "}
            <strong style={{ color: "var(--text-primary)" }}>{libraryName}</strong>{" "}
            drops below{" "}
            <strong style={{ color: "var(--accent)" }}>{threshold}%</strong>.
          </p>
          {email && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Can&apos;t wait? You can also{" "}
              <a
                href={mailtoHref}
                style={{ color: "var(--accent)", textDecoration: "underline" }}
              >
                send yourself a reminder now
              </a>
              {" "}via your email app.
            </p>
          )}
        </div>
      ) : (
        /* ── Form ── */
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Threshold */}
          <div>
            <label style={labelStyle}>Alert me when below</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="range"
                min={0} max={100} step={5}
                value={threshold}
                onChange={(e) => setThreshold(+e.target.value)}
                style={{ flex: 1, accentColor: "var(--accent)" }}
              />
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", minWidth: 38, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {threshold}%
              </span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          {errMsg && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{errMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 700,
              cursor: status === "submitting" ? "wait" : "pointer",
              opacity: status === "submitting" ? 0.7 : 1,
              transition: "opacity 150ms ease",
            }}
          >
            {status === "submitting" ? "Setting alert…" : "Set alert"}
          </button>

          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
            We&apos;ll also show a browser notification if you keep this tab open.
          </p>
        </form>
      )}
    </div>,
    document.body
  ) : null;

  // ── Bell button ───────────────────────────────────────────────────────────
  const isActive = storedThreshold !== null;
  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label={isActive ? `Alert set: below ${storedThreshold}% — click to update` : "Set occupancy alert"}
        title={isActive ? `Alert set: below ${storedThreshold}%` : "Set occupancy alert"}
        style={{
          flexShrink:      0,
          display:         "inline-flex",
          alignItems:      "center",
          justifyContent:  "center",
          width:           28,
          height:          28,
          borderRadius:    8,
          backgroundColor: open || isActive ? "var(--accent-dim)" : "var(--bg-elevated)",
          border:          `1px solid ${open || isActive ? "var(--accent)" : "var(--border)"}`,
          color:           open || isActive ? "var(--accent)" : "var(--text-muted)",
          cursor:          "pointer",
          transition:      "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
          marginTop:       2,
        }}
      >
        <BellIcon active={isActive} />
      </button>
      {portal}
    </>
  );
}
