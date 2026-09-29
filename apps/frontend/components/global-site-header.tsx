"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";

export function GlobalSiteHeader() {
  const pathname = usePathname();

  // The magazine reader already has its own purpose-built reader chrome:
  // issue identity, menu, fullscreen and navigation controls. Rendering the
  // marketing/site header on top of it creates two competing headers and
  // obscures the reader controls, so magazine routes intentionally opt out.
  if (pathname.startsWith("/magazine/")) return null;

  return <SiteHeader variant={pathname === "/" ? "hero" : "default"} />;
}
