"use client";

import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function FloatingSiteNav({
  cityLabel,
  issueLabel,
}: {
  cityLabel?: string;
  issueLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="xp-floating-site-nav" ref={rootRef}>
      <button
        type="button"
        className="xp-floating-site-nav__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Open XpoMag navigation"
      >
        <Menu size={14} />
        <strong>XpoMag</strong>
        {cityLabel ? <span>{cityLabel}</span> : null}
        {issueLabel ? <span>/ {issueLabel}</span> : null}
      </button>

      {open ? (
        <nav className="xp-floating-site-nav__menu xp-floating-site-nav__menu--compact" aria-label="XpoMag navigation">
          <a href="/" onClick={() => setOpen(false)}>Home</a>
          <a href="/explore" onClick={() => setOpen(false)}>Explore</a>
          <a href="/contribute" onClick={() => setOpen(false)}>Contribute</a>
          <a href="/studio" onClick={() => setOpen(false)}>Studio</a>
          <a href="/about" onClick={() => setOpen(false)}>About XpoMag</a>
          <a href="/auth" onClick={() => setOpen(false)}>Sign in</a>
        </nav>
      ) : null}
    </div>
  );
}
