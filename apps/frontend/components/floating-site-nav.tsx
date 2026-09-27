"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

export function FloatingSiteNav({
  cityLabel,
  issueLabel,
}: {
  cityLabel?: string;
  issueLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="xp-floating-site-nav">
      <button
        type="button"
        className="xp-floating-site-nav__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Open XpoMag navigation"
      >
        <Menu size={15} />
        <strong>XpoMag</strong>
        {cityLabel ? <span>{cityLabel}</span> : null}
        {issueLabel ? <span>/ {issueLabel}</span> : null}
      </button>

      {open ? (
        <nav className="xp-floating-site-nav__menu" aria-label="XpoMag navigation">
          <div className="xp-floating-site-nav__menu-top">
            <strong>XpoMag</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation">
              <X size={16} />
            </button>
          </div>
          <a href="/">Discover</a>
          <a href="/about">About XpoMag</a>
          <a href="/auth">Sign in</a>
        </nav>
      ) : null}
    </div>
  );
}
