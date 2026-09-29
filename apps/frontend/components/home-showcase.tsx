"use client";

import { useState } from "react";
import { FaRegHeart, FaRegCommentDots, FaRegBookmark, FaShareNodes, FaPenRuler, FaCirclePlay, FaUsers, FaPuzzlePiece, FaMobileScreenButton, FaCloudArrowUp } from "react-icons/fa6";

function ResilientImage({ sources, alt, className = "" }: { sources: string[]; alt: string; className?: string }) {
  const [index, setIndex] = useState(0);
  return (
    <img
      className={className}
      src={sources[Math.min(index, sources.length - 1)]}
      alt={alt}
      onError={() => setIndex((value) => Math.min(value + 1, sources.length - 1))}
    />
  );
}

const joburg = ["/home/joburg-mag-cover-01.webp","/home/joburg-mag-cover-02.webp","/home/hero-1.webp"];
const lagos = ["/home/xpomag-lagos-01.webp","/home/hero-2.webp"];
const steyn = ["/home/steyn-city-cover-01.webp","/resources/studio/steyn/steyn-city-img-01.webp"];

export function HomeShowcase() {
  return (
    <>
      <section className="xp-home-section xp-home-curating">
        <div className="xp-home-section__head">
          <div>
            <p className="xp-home-kicker">CURATING NOW · NOVEMBER 2026</p>
            <h2>Lagos and Joburg are being built with the city.</h2>
            <p>We are gathering the stories, people, businesses, places and ideas that will shape the first city issues.</p>
          </div>
          <a className="xp-home-text-link" href="/contribute">Submit something worth knowing →</a>
        </div>

        <div className="xp-home-city-grid">
          <article className="xp-home-city-card">
            <ResilientImage sources={joburg} alt="XpoMag Joburg preview" />
            <div className="xp-home-city-card__copy">
              <div><span>JOBURG</span><small>NOVEMBER 2026</small></div>
              <h3>Inside Joburg’s new business gravity.</h3>
              <p>Rosebank rises. Sandton reinvents. We are curating the people and stories behind the shift.</p>
              <div className="xp-home-city-card__actions">
                <a href="/contribute">Submit a Joburg story →</a>
                <span>ISSUE IN CURATION</span>
              </div>
            </div>
          </article>

          <article className="xp-home-city-card">
            <ResilientImage sources={lagos} alt="XpoMag Lagos preview" />
            <div className="xp-home-city-card__copy">
              <div><span>LAGOS</span><small>NOVEMBER 2026</small></div>
              <h3>The people shaping Africa’s most restless city.</h3>
              <p>Founders, culture, food, neighbourhoods, ambition and the personalities moving Lagos forward.</p>
              <div className="xp-home-city-card__actions">
                <a href="/contribute">Submit a Lagos story →</a>
                <span>ISSUE IN CURATION</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="xp-home-interact">
        <div className="xp-home-interact__copy">
          <p className="xp-home-kicker">A MAGAZINE YOU CAN USE</p>
          <h2>Not just something you read.<br /><span>Something you interact with.</span></h2>
          <p>Read stories, watch video, react, comment, save, share, answer polls and discover what is happening around the city.</p>
          <div className="xp-home-interact__actions">
            <a href="/magazine/demo-johannesburg-001/cover">Open the original demo →</a>
            <a href="/magazine/steyn-city-2026/cover">Open the Steyn City demo →</a>
          </div>
        </div>
        <div className="xp-home-interact__visual">
          <ResilientImage sources={["/home/xpomag-img-02.webp","/home/joburg-mag-cover-02.webp"]} alt="Interactive XpoMag experience" />
          <div className="xp-home-interact__chips"><span><FaRegHeart /> Like</span><span><FaRegCommentDots /> Comment</span><span><FaRegBookmark /> Save</span><span><FaShareNodes /> Share</span></div>
        </div>
      </section>

      <section className="xp-home-studio">
        <div className="xp-home-studio__copy">
          <p className="xp-home-kicker">XPOMAG STUDIO · OPEN FOR COMMISSIONS</p>
          <h2>Your world deserves its own <span>magazine.</span></h2>
          <p>We design and build interactive digital magazines for properties, communities, organisations and brands — using the same social-magazine technology behind XpoMag.</p>
          <div className="xp-home-studio__actions">
            <a className="xp-home-studio__primary" href="/studio">Commission XpoMag Studio →</a>
            <a href="/magazine/steyn-city-2026/cover">View the Steyn City demo ↗</a>
          </div>
          <div className="xp-home-studio__features">
            <span><FaPenRuler />Editorial design</span><span><FaCirclePlay />Embedded video</span><span><FaUsers />Social engagement</span><span><FaPuzzlePiece />Games & polls</span><span><FaMobileScreenButton />Responsive</span><span><FaCloudArrowUp />Hosted online</span>
          </div>
        </div>
        <a className="xp-home-studio__visual" href="/magazine/steyn-city-2026/cover" aria-label="Open Steyn City demo">
          <ResilientImage sources={steyn} alt="Steyn City interactive magazine demo" />
          <span>VIEW LIVE DEMO ↗</span>
        </a>
      </section>

      <section className="xp-home-submit">
        <div><p className="xp-home-kicker">CONTRIBUTE</p><h2>Your city has a story too.</h2></div>
        <div><p>Founder? Artist? Restaurant? Brand? Community? Photographer?</p><strong>Submit it for an upcoming XpoMag issue.</strong><a href="/contribute">Submit a story →</a></div>
      </section>

      <section className="xp-home-final">
        <p>THE SOCIAL MAGAZINE FOR EVERY CITY</p>
        <h2>Discover <span>your city.</span></h2>
        <div><a href="/explore">Explore XpoMag →</a><a href="/studio">For brands & communities →</a></div>
      </section>
    </>
  );
}
