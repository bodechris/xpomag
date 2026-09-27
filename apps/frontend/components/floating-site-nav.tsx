"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function FloatingSiteNav({
  cityLabel,
  issueLabel,
}: {
  cityLabel?: string;
  issueLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.documentElement.classList.add("xp-nav-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.classList.remove("xp-nav-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className="xp-floating-site-nav">
        <button
          type="button"
          className="xp-floating-site-nav__trigger"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-label="Open XpoMag navigation"
        >
          <Menu size={15} />
          <strong>XpoMag</strong>
          {cityLabel ? <span>{cityLabel}</span> : null}
          {issueLabel ? <span>/ {issueLabel}</span> : null}
        </button>
      </div>

      {open ? (
        <div
          className="xp-floating-site-nav__overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <nav className="xp-floating-site-nav__drawer" aria-label="XpoMag navigation">
            <div className="xp-floating-site-nav__drawer-top">
              <div>
                <strong>XpoMag</strong>
                {cityLabel ? <span>{cityLabel}</span> : null}
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation">
                <X size={18} />
              </button>
            </div>

            <div className="xp-floating-site-nav__links">
              <a href="/" onClick={() => setOpen(false)}>
                <small>01</small><span>Discover</span>
              </a>
              <a href="/about" onClick={() => setOpen(false)}>
                <small>02</small><span>About XpoMag</span>
              </a>
              <a href="/auth" onClick={() => setOpen(false)}>
                <small>03</small><span>Sign in</span>
              </a>
            </div>

            <p className="xp-floating-site-nav__note">
              Curated city magazines, stories, people, places and businesses.
            </p>
          </nav>
        </div>
      ) : null}
    </>
  );
}
