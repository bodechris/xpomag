import { readdir } from "node:fs/promises";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".png", ".webp", ".avif", ".jpg", ".jpeg"]);

async function readImageDirectory(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((a, b) => {
        const score = (name: string) => /cover|portrait|person|founder|subject/i.test(name) ? 0 : 1;
        return score(a) - score(b) || a.localeCompare(b);
      });
  } catch {
    return [];
  }
}

export async function getAlphaCoverAssets(): Promise<string[]> {
  const candidates = [
    path.join(process.cwd(), "public", "resources", "images-with-alpha"),
    path.join(process.cwd(), "apps", "frontend", "public", "resources", "images-with-alpha"),
  ];

  for (const directory of candidates) {
    const files = await readImageDirectory(directory);
    if (files.length) {
      return files.map((fileName) => `/resources/images-with-alpha/${encodeURIComponent(fileName)}`);
    }
  }

  return [];
}
