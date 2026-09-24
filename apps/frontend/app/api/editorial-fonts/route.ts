import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const CURATED = [
  { family: "XP Instrument Serif", match: /^InstrumentSerif-Regular\.(woff2?|ttf|otf)$/i, weight: "400", style: "normal" },
  { family: "XP Instrument Serif", match: /^InstrumentSerif-Italic\.(woff2?|ttf|otf)$/i, weight: "400", style: "italic" },
  { family: "XP Newsreader", match: /^Newsreader(?:\[.*\]|-Regular)?\.(woff2?|ttf|otf)$/i, weight: "200 800", style: "normal" },
  { family: "XP Newsreader", match: /^Newsreader-Italic(?:\[.*\])?\.(woff2?|ttf|otf)$/i, weight: "200 800", style: "italic" },
  { family: "XP Bricolage", match: /^BricolageGrotesque(?:\[.*\]|-Regular)?\.(woff2?|ttf|otf)$/i, weight: "200 800", style: "normal" },
  { family: "XP Big Shoulders", match: /^BigShouldersDisplay(?:\[.*\]|-Regular)?\.(woff2?|ttf|otf)$/i, weight: "100 900", style: "normal" },
  { family: "XP IBM Plex Sans", match: /^IBMPlexSans-Regular\.(woff2?|ttf|otf)$/i, weight: "400", style: "normal" },
  { family: "XP IBM Plex Sans", match: /^IBMPlexSans-(?:SemiBold|Bold)\.(woff2?|ttf|otf)$/i, weight: "600 700", style: "normal" },
];

function fontFormat(file: string) {
  const ext = file.split(".").pop()?.toLowerCase();
  if (ext === "woff2") return "woff2";
  if (ext === "woff") return "woff";
  if (ext === "otf") return "opentype";
  return "truetype";
}

export async function GET() {
  const dir = path.join(process.cwd(), "public", "resources", "fonts", "assets");
  let files: string[] = [];
  try { files = await readdir(dir); } catch { /* The system falls back cleanly when the optional local font library is absent. */ }

  const css = CURATED.flatMap((entry) => {
    const file = files.find((name) => entry.match.test(name));
    if (!file) return [];
    const url = `/resources/fonts/assets/${encodeURIComponent(file)}`;
    return [`@font-face{font-family:"${entry.family}";src:url("${url}") format("${fontFormat(file)}");font-style:${entry.style};font-weight:${entry.weight};font-display:swap;}`];
  }).join("\n");

  return new NextResponse(css, {
    headers: {
      "content-type": "text/css; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
