import type { Metadata } from "next"
import Link from "next/link"
import "./about.css"

export const metadata: Metadata = {
  title: "How XpoMag works",
  description: "How to discover cities, read interactive XpoMag issues, follow what matters and submit stories.",
}

export default function AboutPage() {
  return (
    <main className="aboutPage">
      <section className="aboutHero">
        <div className="aboutKicker">HOW XPOMAG WORKS</div>
        <h1>Open a city.<br />Flip through the issue.</h1>
        <p className="aboutLead">
          XpoMag turns a city into a curated, interactive magazine. You discover
          an issue, read it like a publication, and interact with the stories,
          people, places and brands inside it.
        </p>
      </section>

      <section className="aboutStatement">
        <div className="aboutStatementLabel">THE IDEA</div>
        <div className="aboutStatementBody">
          <p>
            Not an endless feed. Not a static PDF.
          </p>
          <p>
            Each XpoMag issue is a finite editorial experience with page turns,
            stories, video, discovery and social interaction built into the magazine itself.
          </p>
        </div>
      </section>

      <section className="aboutGrid">
        <article>
          <span>01</span>
          <h2>Explore a city</h2>
          <p>Choose a city you care about and see its current XpoMag issue, stories and discoveries.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Open the issue</h2>
          <p>Flip through a curated edition designed as a magazine rather than scrolling through an endless stream.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Interact as you read</h2>
          <p>React, comment, save and share. Stories can also include video, polls, quizzes, games and other interactive experiences.</p>
        </article>
        <article>
          <span>04</span>
          <h2>Follow what matters</h2>
          <p>Follow cities and save stories or places so XpoMag becomes a useful library you can return to.</p>
        </article>
      </section>

      <section className="aboutIssue">
        <div className="aboutIssueMeta">
          <div>FOR THE COMMUNITY</div>
          <div>STORIES · PEOPLE · PLACES</div>
          <div>BUSINESSES · BRANDS</div>
        </div>
        <div className="aboutIssueCopy">
          <h2>Anyone can contribute.<br />XpoMag curates.</h2>
          <p>
            Readers, creators, businesses and organisations can submit stories,
            launches, places, events or people worth knowing. XpoMag selects what
            belongs in each issue. Brands can also work with XpoMag on clearly
            presented sponsored stories and interactive placements.
          </p>
        </div>
      </section>

      <section className="aboutCta">
        <p className="aboutKicker">START HERE</p>
        <h2>Find a city.<br />Open the magazine.</h2>
        <div className="aboutActions">
          <Link href="/explore" className="aboutPrimary">Explore XpoMag</Link>
          <Link href="/contribute" className="aboutSecondary">Submit a story</Link>
        </div>
      </section>

      <footer className="aboutFooter">
        <div>XPOMAG</div>
        <div>THE SOCIAL MAGAZINE FOR EVERY CITY</div>
        <div>© 2026</div>
      </footer>
    </main>
  )
}
