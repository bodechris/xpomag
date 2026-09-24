import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"]);

async function walk(root: string, current = root): Promise<string[]> {
  let entries;
  try { entries = await readdir(current, { withFileTypes: true }); } catch { return []; }
  const out: string[] = [];
  for (const entry of entries) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) out.push(...await walk(root, full));
    else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name).toLowerCase())) out.push(path.relative(root, full).split(path.sep).join("/"));
  }
  return out;
}

export async function GET(request: Request) {
  const publicResources = path.join(process.cwd(), "public", "resources");
  const files = (await walk(publicResources)).sort((a, b) => a.localeCompare(b));
  const origin = new URL(request.url).origin;
  const images = files.map((relativePath) => ({
    name: path.basename(relativePath),
    path: `/resources/${relativePath.split("/").map(encodeURIComponent).join("/")}`,
    url: `${origin}/resources/${relativePath.split("/").map(encodeURIComponent).join("/")}`,
    folder: path.dirname(relativePath) === "." ? "resources" : path.dirname(relativePath),
  }));
  return NextResponse.json({ images }, { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } });
}
