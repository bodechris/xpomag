"use client";

import { DesignElement } from "@xpomag/magazine/renderer";
import type { DesignElementNode } from "@xpomag/magazine";
import { Bookmark, ChevronDown, Home, LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { authClient } from "../lib/auth-client";

const headerLogo: DesignElementNode = {
  id: "xpomag-header-brand-mark",
  type: "brandMark",
  props: { label: "XpoMag" },
  style: { color: "#050505", fontSize: "2rem" },
};

export function SiteHeader({ city }: { city: string }) {
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
      <header className="xp-site-header">
        <div className="xp-container xp-site-header__inner">
          <div className="xp-site-header__brand">
            {user ? <button className="xp-member-menu-trigger" type="button" onClick={() => setMenuOpen(true)} aria-label="Open member menu"><Menu size={18} /></button> : null}
            <a href="/" className="xp-site-header__logo" aria-label="XpoMag home"><DesignElement node={headerLogo} /></a>
            <span className="xp-site-header__divider" aria-hidden="true" />
            <span className="xp-label xp-site-header__city">{city}</span>
          </div>

          <nav aria-label="Primary" className="xp-site-header__nav">
            {!isPending && !user ? (
              <>
                <a className="xp-button xp-button--ghost" href="#about">About</a>
                <a className="xp-button" href="/login">Sign in</a>
              </>
            ) : null}
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
          </nav>
        </div>
      </header>

      {user ? (
        <>
          <button className="xp-member-rail-trigger" type="button" onClick={() => setMenuOpen(true)} aria-label="Open member menu"><Menu size={18} /></button>
          <div className={`xp-member-drawer-backdrop ${menuOpen ? "is-open" : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }} aria-hidden={!menuOpen}>
            <aside className={`xp-member-drawer ${menuOpen ? "is-open" : ""}`} aria-label="Member navigation">
              <div className="xp-member-drawer__top"><a href="/" className="xp-member-drawer__brand">XpoMag</a><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close member menu"><X size={18} /></button></div>
              <div className="xp-member-drawer__identity"><span className="xp-profile__avatar xp-profile__avatar--large">{initials}</span><div><strong>{user.name || "XpoMag member"}</strong><span>{user.email}</span></div></div>
              <nav className="xp-member-drawer__nav">
                <a href="/"><Home size={18} /><span>Discover</span></a>
                <a href="/saved"><Bookmark size={18} /><span>Saved collections</span></a>
                <span className="xp-member-drawer__soon"><UserRound size={18} /><span>Profile</span><small>Soon</small></span>
              </nav>
              <button className="xp-member-drawer__signout" type="button" onClick={signOut}><LogOut size={18} /><span>Sign out</span></button>
            </aside>
          </div>
        </>
      ) : null}
    </>
  );
}
