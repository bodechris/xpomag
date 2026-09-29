"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";

export function GlobalSiteHeader() {
  const pathname = usePathname();
  const overlay = pathname === "/" || pathname.startsWith("/magazine/");
  return <SiteHeader variant={overlay ? "hero" : "default"} />;
}
