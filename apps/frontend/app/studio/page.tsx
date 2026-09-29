import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XpoMag Studio",
  description: "Commission an interactive digital magazine for your brand, property, organisation or community.",
};

export default function StudioPage() {
  return (
    <main className="xp-studio-page">
      <section className="xp-studio-hero">
        <p className="xp-home-kicker">XPOMAG STUDIO · OPEN FOR COMMISSIONS</p>
        <h1>Your world.<br />Your magazine.</h1>
        <p className="xp-studio-hero__lead">We turn existing publications, communities and brand stories into premium interactive magazines built for the web — not static flipbooks.</p>
        <div className="xp-studio-hero__actions">
          <a href="#commission">Start a project →</a>
          <a href="/magazine/steyn-city-2026/cover">View Steyn City demo ↗</a>
        </div>
      </section>

      <section className="xp-studio-case">
        <div className="xp-studio-case__copy">
          <p className="xp-home-kicker">LIVE DEMO · STEYN CITY</p>
          <h2>A property magazine rebuilt as an interactive experience.</h2>
          <p>For the Steyn City demo, XpoMag combines editorial layouts with embedded video, responsive page reflow and social engagement while preserving the publication’s own visual identity.</p>
          <a href="/magazine/steyn-city-2026/cover">Open the Steyn City experience →</a>
        </div>
        <a className="xp-studio-case__visual" href="/magazine/steyn-city-2026/cover">
          <img src="/home/steyn-city-cover-01.webp" alt="Steyn City XpoMag demo" />
        </a>
      </section>

      <section className="xp-studio-capabilities">
        <div className="xp-studio-capabilities__head"><p className="xp-home-kicker">WHAT WE BUILD</p><h2>Designed, produced and hosted for you.</h2></div>
        <div className="xp-studio-capabilities__grid">
          <article><span>01</span><h3>Editorial design</h3><p>Custom layouts that preserve your brand rather than forcing every publication into one template.</p></article>
          <article><span>02</span><h3>Interactive media</h3><p>Video, animation, galleries, forms, polls, quizzes and lightweight branded games inside the reading experience.</p></article>
          <article><span>03</span><h3>Social engagement</h3><p>Readers can like, comment, save and share at story or section level.</p></article>
          <article><span>04</span><h3>Responsive reading</h3><p>Layouts reflow for mobile so readers are not forced to pinch and zoom tiny PDF pages.</p></article>
          <article><span>05</span><h3>Publishing & hosting</h3><p>We prepare the issue, publish it online and keep the experience accessible after launch.</p></article>
          <article><span>06</span><h3>White-label capable</h3><p>The magazine can foreground your organisation and visual identity rather than XpoMag’s city branding.</p></article>
        </div>
      </section>

      <section className="xp-studio-process">
        <p className="xp-home-kicker">HOW A COMMISSION WORKS</p>
        <div><span>01</span><h3>Send the publication or brief.</h3><p>Existing PDF, content library or a new idea.</p></div>
        <div><span>02</span><h3>We design the experience.</h3><p>Layouts, interaction, media and responsive behaviour.</p></div>
        <div><span>03</span><h3>You review it.</h3><p>We refine the issue before it goes live.</p></div>
        <div><span>04</span><h3>We publish it.</h3><p>A shareable interactive magazine ready for your audience.</p></div>
      </section>

      <section className="xp-studio-commission" id="commission">
        <div><p className="xp-home-kicker">COMMISSION XPOMAG STUDIO</p><h2>Have a magazine, community or story world worth rebuilding?</h2></div>
        <div><p>Send us the publication, number of pages and what you want the interactive edition to achieve. We can scope the project from there.</p><a href="mailto:hello@bodilum.com?subject=XpoMag%20Studio%20commission">Send your brief →</a><small>Include a link or PDF if an existing publication already exists.</small></div>
      </section>
    </main>
  );
}
