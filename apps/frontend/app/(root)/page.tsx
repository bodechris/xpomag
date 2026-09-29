import { headers } from "next/headers";
import { auth, ensureAuthInfrastructure } from "../../lib/auth-server";
import { PublicationFollowButton, type PublicPublication } from "../../components/publication-follow-button";
import { HomeHero } from "../../components/home-hero";

export const dynamic = "force-dynamic";

function apiOrigin() {
  return process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:4000";
}

export default async function Home() {
  await ensureAuthInfrastructure();
  const session = await auth.api.getSession({ headers: await headers() });
  const h = new Headers({ accept: "application/json" });
  if (session?.user?.id) {
    h.set("x-xpomag-user-id", session.user.id);
    if (process.env.ENGAGEMENT_INTERNAL_SECRET) h.set("x-xpomag-internal-key", process.env.ENGAGEMENT_INTERNAL_SECRET);
  }

  let publications: PublicPublication[] = [];
  try {
    const r = await fetch(new URL("/v1/publications", apiOrigin()), { headers: h, cache: "no-store" });
    if (r.ok) publications = (await r.json()).publications ?? [];
  } catch {}

  const active = publications.filter((p) => p.status === "ACTIVE");
  const following = active.filter((p) => p.viewerFollowing);

  return (
    <main className="xp-discover xp-home">
      <HomeHero />

      {following.length ? (
        <section className="xp-discover__section">
          <div className="xp-discover__heading"><p>YOUR CITIES</p><h2>Pick up where you left off.</h2></div>
          <div className="xp-discover__cities">{following.map((p) => <CityCard key={p.id} p={p} authenticated={Boolean(session?.user)} />)}</div>
        </section>
      ) : null}

      <section className="xp-discover__section xp-discover__section--issues">
        <div className="xp-discover__heading"><p>NOW PUBLISHING</p><h2>Open a city.</h2></div>
        <div className="xp-discover__cities">{active.map((p) => <CityCard key={p.id} p={p} authenticated={Boolean(session?.user)} />)}</div>
        <a className="xp-discover__more" href="/explore">Explore all cities →</a>
      </section>

      <section className="xp-discover__manifesto">
        <p>XPOMAG</p>
        <h2>A living magazine<br />for the city around you.</h2>
        <p>Follow cities. Open monthly issues. Save what matters. Join the conversation. Come back when the city changes.</p>
      </section>
    </main>
  );
}

function CityCard({ p, authenticated }: { p: PublicPublication; authenticated: boolean }) {
  const city = p.city ?? p.name.replace("XpoMag ", "");
  return (
    <article className="xp-discover-card">
      <a href={`/city/${p.slug}`}><span>{p.country} · NOVEMBER 2026</span><h3>{city}</h3><p>{p.description}</p></a>
      <div><PublicationFollowButton publication={p} authenticated={authenticated} className="xp-discover-card__follow" /><a href={`/city/${p.slug}`}>View city →</a></div>
    </article>
  );
}
