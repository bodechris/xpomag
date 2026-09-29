"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type HeroSlide = {
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  note: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  images: string[];
  position: string;
};

const slides: HeroSlide[] = [
  {
    eyebrow: "THE SOCIAL MAGAZINE FOR EVERY CITY",
    title: "Every city has a story.",
    accent: "Discover yours.",
    body: "XpoMag brings you the people, places, businesses and ideas shaping cities around the world.",
    note: "Stories worth opening. People worth following. Places worth discovering.",
    primary: { label: "Explore XpoMag", href: "/explore" },
    secondary: { label: "Submit your story", href: "/contribute" },
    images: [
      "/home/hero-1.webp", "/home/hero-1.png", "/home/hero-1.jpg",
      "/home/hero-slide-1.webp", "/home/hero-slide-1.png",
      "/home/slide-1.webp", "/home/slide-1.png",
      "/home/home-hero-1.webp", "/home/home-hero-1.png"
    ],
    position: "center center",
  },
  {
    eyebrow: "READ · REACT · SAVE · SHARE",
    title: "A magazine that",
    accent: "behaves like social.",
    body: "Premium stories meet reactions, comments, saves, sharing and community — without turning the reading experience into a feed.",
    note: "Curated like a magazine. Alive like the internet.",
    primary: { label: "See how it works", href: "/about" },
    secondary: { label: "Explore cities", href: "/explore" },
    images: [
      "/home/hero-2.webp", "/home/hero-2.png", "/home/hero-2.jpg",
      "/home/hero-slide-2.webp", "/home/hero-slide-2.png",
      "/home/slide-2.webp", "/home/slide-2.png",
      "/home/home-hero-2.webp", "/home/home-hero-2.png"
    ],
    position: "center center",
  },
  {
    eyebrow: "STORIES YOU CAN EXPERIENCE",
    title: "More than pages.",
    accent: "Made to interact.",
    body: "Video, polls, quizzes, games, forms, chats and branded experiences live inside the story — alongside editorial and advertising.",
    note: "For readers, creators, cities and brands.",
    primary: { label: "For brands", href: "/studio" },
    secondary: { label: "Submit a story", href: "/contribute" },
    images: [
      "/home/hero-3.webp", "/home/hero-3.png", "/home/hero-3.jpg",
      "/home/hero-slide-3.webp", "/home/hero-slide-3.png",
      "/home/slide-3.webp", "/home/slide-3.png",
      "/home/home-hero-3.webp", "/home/home-hero-3.png"
    ],
    position: "center center",
  },
];

function ResilientHeroImage({ slide }: { slide: HeroSlide }) {
  const [candidate, setCandidate] = useState(0);
  const src = slide.images[Math.min(candidate, slide.images.length - 1)];

  return (
    <img
      className="xp-home-hero__image"
      src={src}
      alt=""
      aria-hidden="true"
      style={{ objectPosition: slide.position }}
      onError={() => setCandidate((value) => Math.min(value + 1, slide.images.length - 1))}
    />
  );
}

export function HomeHero() {
  const [active, setActive] = useState(0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const lockRef = useRef(false);
  const heroRef = useRef<HTMLElement | null>(null);

  const goTo = useCallback((next: number) => {
    if (lockRef.current || next === active || next < 0 || next >= slides.length) return false;
    lockRef.current = true;
    setDirection(next > active ? "next" : "previous");
    setOutgoing(active);
    setActive(next);
    window.setTimeout(() => {
      setOutgoing(null);
      lockRef.current = false;
    }, 920);
    return true;
  }, [active]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 20 || lockRef.current) return;
      if (event.deltaY > 0 && active < slides.length - 1) {
        event.preventDefault();
        goTo(active + 1);
      } else if (event.deltaY < 0 && active > 0) {
        event.preventDefault();
        goTo(active - 1);
      }
    };

    hero.addEventListener("wheel", onWheel, { passive: false });
    return () => hero.removeEventListener("wheel", onWheel);
  }, [active, goTo]);

  return (
    <section ref={heroRef} className="xp-home-hero" aria-roledescription="carousel" aria-label="XpoMag introduction">
      <div className="xp-home-hero__slides">
        {slides.map((slide, index) => {
          const isActive = index === active;
          const isOutgoing = index === outgoing;
          return (
            <article
              key={slide.eyebrow}
              className={[
                "xp-home-hero__slide",
                isActive ? "is-active" : "",
                isOutgoing ? `is-outgoing is-${direction}` : "",
              ].filter(Boolean).join(" ")}
              aria-hidden={!isActive}
            >
              <ResilientHeroImage slide={slide} />
              <div className="xp-home-hero__wash" />
              <div className="xp-home-hero__content">
                <p className="xp-home-hero__eyebrow">{slide.eyebrow}</p>
                <h1>{slide.title}<br /><span>{slide.accent}</span></h1>
                <p className="xp-home-hero__body">{slide.body}</p>
                <p className="xp-home-hero__note">{slide.note}</p>
                <div className="xp-home-hero__actions">
                  <a className="xp-home-hero__cta xp-home-hero__cta--primary" href={slide.primary.href}>{slide.primary.label}<span aria-hidden="true">→</span></a>
                  <a className="xp-home-hero__cta xp-home-hero__cta--secondary" href={slide.secondary.href}>{slide.secondary.label}</a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="xp-home-hero__rail" aria-label="Hero slide navigation">
        <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous hero slide">
          <span aria-hidden="true">↑</span>
        </button>
        <button type="button" onClick={() => goTo(active + 1)} disabled={active === slides.length - 1} aria-label="Next hero slide">
          <span aria-hidden="true">↓</span>
        </button>
      </div>

      <div className="xp-home-hero__count" aria-hidden="true">
        <strong>0{active + 1}</strong><span>/ 0{slides.length}</span>
      </div>
    </section>
  );
}
