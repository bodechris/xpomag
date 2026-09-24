import Link from "next/link"
import "./about.css"

export default function AboutPage() {
  return (
    <main className="aboutPage">
      <header className="aboutHeader">
        <Link href="/" className="aboutBrand">XpoMag</Link>
        <nav className="aboutNav" aria-label="Primary">
          <Link href="/about" aria-current="page">About</Link>
          <Link href="/auth" className="aboutSignIn">Sign in</Link>
        </nav>
      </header>

      <section className="aboutHero">
        <div className="aboutKicker">A CITY MAGAZINE FOR THE INTERNET</div>
        <h1>The city,<br />edited with taste.</h1>
        <p className="aboutLead">
          XPOMAG is a digital magazine built around real cities, local people,
          businesses, places and ideas — designed to feel more like a beautifully
          edited publication than a feed.
        </p>
      </section>

      <section className="aboutStatement">
        <div className="aboutStatementLabel">WHY XPOMAG</div>
        <div className="aboutStatementBody">
          <p>
            Cities are full of useful stories, businesses worth discovering,
            people doing interesting work and places changing quietly.
          </p>
          <p>
            Most of that information is scattered across social feeds, search,
            directories, newsletters and word of mouth. XPOMAG brings the best of
            it together into one curated city issue.
          </p>
        </div>
      </section>

      <section className="aboutGrid">
        <article>
          <span>01</span>
          <h2>City first</h2>
          <p>Every city gets its own editorial identity, stories, guides, businesses, advertising and recurring issues.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Editorial, not endless</h2>
          <p>XPOMAG is intentionally finite and curated. Each issue should feel worth finishing, saving and returning to.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Useful discovery</h2>
          <p>Readers discover businesses, people, places and ideas with context — not as isolated listings.</p>
        </article>
        <article>
          <span>04</span>
          <h2>Built to become personal</h2>
          <p>Cities and category interests will eventually shape custom editions around what each reader actually cares about.</p>
        </article>
      </section>

      <section className="aboutIssue">
        <div className="aboutIssueMeta">
          <div>LAUNCH ISSUE</div>
          <div>ROSEBANK + SANDTON</div>
          <div>JOHANNESBURG</div>
        </div>
        <div className="aboutIssueCopy">
          <h2>Starting local.<br />Built to travel.</h2>
          <p>
            XPOMAG begins with Rosebank and Sandton, then expands city by city.
            The long-term idea is simple: a premium digital magazine for every
            place with enough culture, business and momentum to deserve one.
          </p>
        </div>
      </section>

      <section className="aboutCta">
        <p className="aboutKicker">ENTER THE FIRST ISSUE</p>
        <h2>See the city differently.</h2>
        <div className="aboutActions">
          <Link href="/" className="aboutPrimary">Read XPOMAG</Link>
          <Link href="/auth?mode=signup" className="aboutSecondary">Create account</Link>
        </div>
      </section>

      <footer className="aboutFooter">
        <div>XPOMAG</div>
        <div>ROSEBANK + SANDTON</div>
        <div>© 2026</div>
      </footer>
    </main>
  )
}
