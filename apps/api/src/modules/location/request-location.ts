import type { Request } from "express";
import type { LocationSignal } from "./resolver";

function header(req: Request, name: string) {
  const value = req.header(name);
  return value ? decodeURIComponent(value) : null;
}

export function edgeLocationSignal(req: Request): LocationSignal {
  const city = header(req, "x-vercel-ip-city") ?? header(req, "cf-ipcity");
  const countryCode = header(req, "x-vercel-ip-country") ?? header(req, "cf-ipcountry");
  return { city, countryCode, source: city ? "edge" : "fallback" };
}
