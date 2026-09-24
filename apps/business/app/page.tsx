const submissionTypes = [
  "Founder story", "Business story", "Product or service launch", "Event", "Milestone / achievement",
  "Guide / how-to", "Local insight", "Community impact", "Customer story", "Team / culture"
];
export default function BusinessHome() {
  return (
    <main style={{ width: "min(1180px, 92vw)", margin: "0 auto", padding: "4rem 0" }}>
      <p style={{ textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12, fontWeight: 700 }}>XpoMag Business</p>
      <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-.06em", lineHeight: .95, maxWidth: 900, marginTop: 16 }}>Turn what is happening inside your business into publishable local stories.</h1>
      <section style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        <article style={{ background: "white", border: "1px solid var(--xp-line)", borderRadius: 16, padding: 24 }}><b>Profile completeness</b><p style={{ marginTop: 8, opacity: .7 }}>Build the evergreen source of truth: business details, team, history, locations, media and links.</p></article>
        <article style={{ background: "white", border: "1px solid var(--xp-line)", borderRadius: 16, padding: 24 }}><b>Editorial submissions</b><p style={{ marginTop: 8, opacity: .7 }}>Submit stories for editorial review. Paid plans improve tools and eligible exposure; editorial features remain clearly distinguished from sponsored placements.</p></article>
        <article style={{ background: "white", border: "1px solid var(--xp-line)", borderRadius: 16, padding: 24 }}><b>Promotions & advertising</b><p style={{ marginTop: 8, opacity: .7 }}>Buy simple, clearly labelled placements tied to a city issue and available inventory.</p></article>
      </section>
      <section style={{ marginTop: 48 }}><h2>Submission types</h2><p style={{ margin: "8px 0 16px", opacity: .65 }}>Goals should live inside a story, not as a top-level type. Business history belongs mainly in the evergreen profile.</p><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{submissionTypes.map((type) => <span key={type} style={{ background: "white", border: "1px solid var(--xp-line)", borderRadius: 999, padding: "8px 12px" }}>{type}</span>)}</div></section>
    </main>
  );
}
