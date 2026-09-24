import type { ComposerDocument } from "@xpomag/magazine";

const API_ORIGIN = process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:4000";

export async function getComposerDocument(issueSlug: string, pageSlug: string, mode: "draft" | "published" = "published") {
  try {
    const response = await fetch(`${API_ORIGIN}/v1/composer/${encodeURIComponent(issueSlug)}/${encodeURIComponent(pageSlug)}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = await response.json() as { state?: { draft?: ComposerDocument | null; published?: ComposerDocument | null } | null };
    return mode === "draft" ? payload.state?.draft ?? null : payload.state?.published ?? null;
  } catch {
    return null;
  }
}
