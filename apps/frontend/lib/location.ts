import { headers } from "next/headers";

export type RequestCity = {
  city: string | null;
  countryCode: string | null;
  source: "edge" | "unknown";
};

export async function getRequestCity(): Promise<RequestCity> {
  const requestHeaders = await headers();
  const rawCity = requestHeaders.get("x-vercel-ip-city") ?? requestHeaders.get("cf-ipcity");
  const city = rawCity ? decodeURIComponent(rawCity) : null;
  const countryCode = requestHeaders.get("x-vercel-ip-country") ?? requestHeaders.get("cf-ipcountry");
  return { city, countryCode, source: city ? "edge" : "unknown" };
}
