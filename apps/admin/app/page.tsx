const modules = [
  ["Issues", "Generate, schedule and publish city issues."],
  ["Cover builder", "Art-direct the cover with layers, free positioning, typography, imagery and background stacks."],
  ["Page builder", "Edit individual magazine pages with reusable design elements."],
  ["Editorial queue", "Review business submissions and assign them to issues."],
  ["Advertising", "Define inventory, bookings, creative and placement."],
  ["Users & businesses", "Manage accounts, status, moderation and support."],
  ["Comments", "Moderation queue and policy actions."],
  ["Analytics", "Issue readership, saves, shares, conversions and ad reporting."]
];
export default function AdminHome() {
  return (
    <main style={{ width: "min(1180px, 92vw)", margin: "0 auto", padding: "4rem 0" }}>
      <p style={{ textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12, fontWeight: 700 }}>XpoMag Admin</p>
      <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-.06em", lineHeight: .95, maxWidth: 850, marginTop: 16 }}>Editorial control without turning the magazine into a CMS-shaped website.</h1>
      <section style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>{modules.map(([title, body]) => <article key={title} style={{ background: "white", border: "1px solid var(--xp-line)", borderRadius: 16, padding: 24 }}><b>{title}</b><p style={{ marginTop: 8, opacity: .68 }}>{body}</p>{title === "Cover builder" ? <a href="/composer/cover" style={{ display: "inline-flex", marginTop: 18, padding: "9px 12px", borderRadius: 999, background: "#111", color: "white", fontSize: 12, fontWeight: 700 }}>Open composer →</a> : null}</article>)}</section>
    </main>
  );
}
