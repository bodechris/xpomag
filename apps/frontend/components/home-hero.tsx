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
    images: ["/home/hero-1.webp"],
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
    images: ["/home/hero-2.webp"],
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
    images: ["/home/hero-3.webp"],
    position: "center center",
  },
];

function HeroVisual({ slide, inert = false }: { slide: HeroSlide; inert?: boolean }) {
  return (
    <>
      <img className="xp-home-hero__image" src={slide.images[0]} alt="" aria-hidden="true" style={{ objectPosition: slide.position }} />
      <div className="xp-home-hero__wash" />
      <div className="xp-home-hero__content" aria-hidden={inert || undefined}>
        <p className="xp-home-hero__eyebrow">{slide.eyebrow}</p>
        <h1>{slide.title}<br /><span>{slide.accent}</span></h1>
        <p className="xp-home-hero__body">{slide.body}</p>
        <p className="xp-home-hero__note">{slide.note}</p>
        <div className="xp-home-hero__actions">
          <a tabIndex={inert ? -1 : undefined} className="xp-home-hero__cta xp-home-hero__cta--primary" href={slide.primary.href}>{slide.primary.label}<span aria-hidden="true">→</span></a>
          <a tabIndex={inert ? -1 : undefined} className="xp-home-hero__cta xp-home-hero__cta--secondary" href={slide.secondary.href}>{slide.secondary.label}</a>
        </div>
      </div>
    </>
  );
}

export function HomeHero() {
  const [active, setActive] = useState(0);
  const [target, setTarget] = useState<number | null>(null);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const lockRef = useRef(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const fallbackRef = useRef<number | null>(null);

  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.decoding = "async";
      img.src = slide.images[0];
    });
  }, []);

  const goTo = useCallback((next: number) => {
    if (lockRef.current || next === active || next < 0 || next >= slides.length) return false;
    lockRef.current = true;
    setDirection(next > active ? "next" : "previous");
    setOutgoing(active);
    setTarget(next);
    if (fallbackRef.current) window.clearTimeout(fallbackRef.current);
    fallbackRef.current = window.setTimeout(() => {
      setActive(next);
      requestAnimationFrame(() => {
        setTarget(null);
        setOutgoing(null);
        lockRef.current = false;
        fallbackRef.current = null;
      });
    }, 760);
    return true;
  }, [active]);

  useEffect(() => {
    return () => {
      if (fallbackRef.current) window.clearTimeout(fallbackRef.current);
    };
  }, []);

  const finishFlip = useCallback(() => {
    if (target === null) return;
    if (fallbackRef.current) window.clearTimeout(fallbackRef.current);
    fallbackRef.current = null;
    setActive(target);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTarget(null);
        setOutgoing(null);
        lockRef.current = false;
      });
    });
  }, [target]);

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

  const outgoingSlide = outgoing === null ? null : slides[outgoing];
  const visualIndex = target ?? active;
  const activeSlide = slides[visualIndex];

  return (
    <section
      ref={heroRef}
      className={`xp-home-hero ${outgoing !== null ? "is-flipping" : ""}`}
      data-direction={direction}
      aria-roledescription="carousel"
      aria-label="XpoMag introduction"
    >
      <div className="xp-home-hero__slides">
        <article className="xp-home-hero__slide is-active">
          <HeroVisual slide={activeSlide} />
        </article>

        {outgoingSlide ? (
          <div className="xp-home-hero__flip-overlay" aria-hidden="true">
            <div className="xp-home-hero__leaf xp-home-hero__leaf--left">
              <div className="xp-home-hero__leaf-canvas xp-home-hero__leaf-canvas--left">
                <HeroVisual slide={outgoingSlide} inert />
              </div>
              <div className="xp-home-hero__leaf-shade xp-home-hero__leaf-shade--left" />
            </div>

            <div
              className="xp-home-hero__leaf xp-home-hero__leaf--right"
              onAnimationEnd={(event) => {
                if (event.currentTarget === event.target) finishFlip();
              }}
            >
              <div className="xp-home-hero__leaf-canvas xp-home-hero__leaf-canvas--right">
                <HeroVisual slide={outgoingSlide} inert />
              </div>
              <div className="xp-home-hero__leaf-shade xp-home-hero__leaf-shade--right" />
            </div>

            <div className="xp-home-hero__center-shadow" />
          </div>
        ) : null}
      </div>

      <div className="xp-home-hero__rail-wrap">
        <div className="xp-home-hero__rail" aria-label="Hero slide navigation">
          {slides.map((slide, index) => (
            <button
              key={slide.eyebrow}
              type="button"
              className={index === visualIndex ? "is-active" : ""}
              onClick={() => goTo(index)}
              aria-label={`Go to hero slide ${index + 1}`}
              aria-current={index === visualIndex ? "true" : undefined}
            />
          ))}
        </div>
      </div>

      <div className="xp-home-hero__count" aria-hidden="true"><strong>0{visualIndex + 1}</strong><span>/ 0{slides.length}</span></div>
    </section>
  );
}
