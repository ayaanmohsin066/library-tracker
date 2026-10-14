/**
 * Re-mounts on every navigation (unlike layout.tsx), so each route gets a
 * short 250 ms fade-up. Pure CSS: no delay before content is interactive,
 * and back/forward or direct links behave exactly as before.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
