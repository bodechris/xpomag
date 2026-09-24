"use client";

import type { MagazineResourceBundle } from "@xpomag/magazine";

export function MagazineResourcePreloader({ resources }: { resources?: MagazineResourceBundle }) {
  if (!resources) return null;
  return (
    <>
      {resources.fonts?.filter((font) => font.preload && font.src).map((font) => (
        <link key={`font-${font.id}`} rel="preload" href={font.src} as="font" crossOrigin="anonymous" />
      ))}
      {resources.images?.filter((image) => image.preload).map((image) => (
        <link key={`image-${image.id}`} rel="preload" href={image.src} as="image" fetchPriority={image.fetchPriority ?? "auto"} />
      ))}
      {resources.styles?.map((style) => style.href
        ? <link key={`style-${style.id}`} rel="stylesheet" href={style.href} />
        : style.cssText ? <style key={`style-${style.id}`}>{style.cssText}</style> : null)}
    </>
  );
}
