import Link from "next/link";
import UoftTab from "@/components/tabs/UoftTab";
import ThemeToggle from "@/components/ThemeToggle";

export default function UoftPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 16px 80px" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              minWidth: 0,
            }}
          >
            <Link
              href="/"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--accent)",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              ← Back
            </Link>
            <h1
              style={{
                fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              University of Toronto
            </h1>
          </div>
          <ThemeToggle />
        </header>

        <UoftTab />
      </div>
    </div>
  );
}
