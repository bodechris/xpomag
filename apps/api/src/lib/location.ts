import type { Request } from "express"

export type DetectedLocation = {
  city: string | null
  region: string | null
  countryCode: string | null
  source: string | null
}

function first(req: Request, names: string[]) {
  for (const name of names) {
    const value = req.header(name)
    if (value?.trim()) {
      try {
        return decodeURIComponent(value.trim())
      } catch {
        return value.trim()
      }
    }
  }
  return null
}

export function detectLocation(req: Request): DetectedLocation {
  // Vercel first; Cloudflare and generic proxy headers are harmless fallbacks.
  const city = first(req, [
    "x-vercel-ip-city",
    "cf-ipcity",
    "x-geo-city",
  ])

  const region = first(req, [
    "x-vercel-ip-country-region",
    "cf-region",
    "x-geo-region",
  ])

  const countryCode = first(req, [
    "x-vercel-ip-country",
    "cf-ipcountry",
    "x-geo-country",
  ])

  const source =
    req.header("x-vercel-ip-country") != null
      ? "vercel"
      : req.header("cf-ipcountry") != null
        ? "cloudflare"
        : city || region || countryCode
          ? "proxy"
          : null

  return {
    city: city || null,
    region: region || null,
    countryCode: countryCode?.toUpperCase() || null,
    source,
  }
}
