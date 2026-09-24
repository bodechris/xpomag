import path from "node:path";
import fs from "node:fs";

/**
 * Load monorepo/root environment first, then allow apps/api/.env to override it.
 * Turbo runs the API task with apps/api as cwd, so the root .env is otherwise
 * not automatically visible to the API process.
 */
export function loadApiEnv() {
  const candidates = [
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(process.cwd(), ".env"),
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    try {
      process.loadEnvFile(file);
    } catch (error) {
      console.warn(`[xpomag-api] Failed to load env file: ${file}`, error);
    }
  }
}
