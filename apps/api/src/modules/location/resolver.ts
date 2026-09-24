export type LocationSignal = {
  city?: string | null;
  countryCode?: string | null;
  source: "explicit" | "profile" | "cookie" | "edge" | "fallback";
};

export type MagazineCandidate = {
  issueId: string;
  city: string;
  countryCode: string;
  distanceKm?: number;
  isPublished: boolean;
};

const SOURCE_SCORE: Record<LocationSignal["source"], number> = {
  explicit: 100,
  profile: 90,
  cookie: 80,
  edge: 70,
  fallback: 10
};

export function resolveMagazine(
  signals: LocationSignal[],
  candidates: MagazineCandidate[]
): MagazineCandidate | null {
  const published = candidates.filter((candidate) => candidate.isPublished);
  if (!published.length) return null;

  const scored = published.map((candidate) => {
    let score = 0;
    for (const signal of signals) {
      const sameCountry = signal.countryCode?.toLowerCase() === candidate.countryCode.toLowerCase();
      const sameCity = signal.city?.trim().toLowerCase() === candidate.city.trim().toLowerCase();
      if (sameCity) score = Math.max(score, SOURCE_SCORE[signal.source]);
      else if (sameCountry) score = Math.max(score, SOURCE_SCORE[signal.source] * 0.25);
    }
    if (typeof candidate.distanceKm === "number") {
      score += Math.max(0, 20 - Math.min(candidate.distanceKm, 200) / 10);
    }
    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.candidate ?? published[0] ?? null;
}
