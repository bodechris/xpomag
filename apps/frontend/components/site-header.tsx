"use client";

import { Bookmark, ChevronDown, Home, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { authClient } from "../lib/auth-client";

export function SiteHeader({ city, variant = "default" }: { city?: string; variant?: "default" | "hero" }) {
  const { data: session, isPending } = authClient.useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const user = session?.user;
  const initials = (user?.name || user?.email || "M").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const signOut = async () => {
    await authClient.signOut();
    setProfileOpen(false);
    setMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <>
      <header className={`xp-site-header xp-site-header--${variant}`}>
        <div className="xp-site-header__inner">
          <div className="xp-site-header__brand">
            {user ? <button className="xp-member-menu-trigger" type="button" onClick={() => setMenuOpen(true)} aria-label="Open member menu"><Menu size={19} /></button> : null}
            <a href="/" className="xp-site-header__logo" aria-label="XpoMag home">
              <img className="xp-site-header__logo-img" src="/horizontal-logo-black.svg" alt="XpoMag" />
            </a>
            {city ? <><span className="xp-site-header__divider" aria-hidden="true" /><span className="xp-label xp-site-header__city">{city}</span></> : null}
          </div>

          <nav aria-label="Primary" className="xp-site-header__links">
            <a href="/explore">Explore</a>
            <a href="/studio">For Brands</a>
            <a href="/about">How it works</a>
          </nav>

          <div className="xp-site-header__actions">
            <a className="xp-site-header__search" href="/explore" aria-label="Search XpoMag"><Search size={21} /></a>
            {!isPending && !user ? <a className="xp-site-header__signin" href="/auth">Sign in</a> : null}
            {user ? (
              <div className="xp-profile" ref={profileRef}>
                <button type="button" className="xp-profile__trigger" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen} aria-label="Open profile menu">
                  <span className="xp-profile__avatar">{initials}</span><ChevronDown size={14} />
                </button>
                {profileOpen ? (
                  <div className="xp-profile__popover" role="menu">
                    <div className="xp-profile__identity"><span className="xp-profile__avatar xp-profile__avatar--large">{initials}</span><div><strong>{user.name || "XpoMag member"}</strong><span>{user.email}</span></div></div>
                    <div className="xp-profile__rule" />
                    <a href="/saved" role="menuitem"><Bookmark size={16} /><span>Saved collections</span></a>
                    <a href="/" role="menuitem"><Home size={16} /><span>Discover</span></a>
                    <div className="xp-profile__rule" />
                    <button type="button" role="menuitem" onClick={signOut}><LogOut size={16} /><span>Sign out</span></button>
                  </div>
                ) : null}
              </div>
            ) : null}
            <a className="xp-site-header__submit" href="/contribute">Submit a story</a>
          </div>

          <button className="xp-site-header__mobile-menu" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
        </div>
      </header>

      <div className={`xp-member-drawer-backdrop ${menuOpen ? "is-open" : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }} aria-hidden={!menuOpen}>
        <aside className={`xp-member-drawer ${menuOpen ? "is-open" : ""}`} aria-label="Navigation">
          <div className="xp-member-drawer__top">
            <a href="/" className="xp-member-drawer__brand" aria-label="XpoMag home"><img src="/horizontal-logo-black.svg" alt="XpoMag" /></a>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20} /></button>
          </div>
          {user ? <div className="xp-member-drawer__identity"><span className="xp-profile__avatar xp-profile__avatar--large">{initials}</span><div><strong>{user.name || "XpoMag member"}</strong><span>{user.email}</span></div></div> : null}
          <nav className="xp-member-drawer__nav">
            <a href="/explore"><Search size={18} /><span>Explore</span></a>
            <a href="/studio"><UserRound size={18} /><span>For Brands</span></a>
            <a href="/about"><UserRound size={18} /><span>How it works</span></a>
            <a href="/contribute"><UserRound size={18} /><span>Submit a story</span></a>
            {user ? <a href="/saved"><Bookmark size={18} /><span>Saved collections</span></a> : <a href="/auth"><UserRound size={18} /><span>Sign in</span></a>}
          </nav>
          {user ? <button className="xp-member-drawer__signout" type="button" onClick={signOut}><LogOut size={18} /><span>Sign out</span></button> : null}
        </aside>
      </div>
    </>
  );
}
