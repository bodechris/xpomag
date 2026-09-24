import type { ComposerDocument } from "@xpomag/magazine";
import { createDb } from "@xpomag/db";
import { loadApiEnv } from "../../lib/load-env.js";

loadApiEnv();

export type CompositionState = {
  issueSlug: string;
  pageSlug: string;
  draft: ComposerDocument | null;
  published: ComposerDocument | null;
  draftUpdatedAt: string | null;
  publishedAt: string | null;
};

export type CompositionRevision = {
  id: string;
  issueSlug: string;
  pageSlug: string;
  state: "draft" | "published";
  label: string;
  createdAt: string;
  document: ComposerDocument;
};

const connectionString = process.env.DATABASE_URL ?? "postgres://xpomag:xpomag@localhost:5434/xpomag";
const { pool } = createDb(connectionString);
let readyPromise: Promise<void> | null = null;

function ensureSchema() {
  if (!readyPromise) {
    readyPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS page_compositions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        issue_slug text NOT NULL,
        page_slug text NOT NULL,
        draft_document jsonb,
        published_document jsonb,
        draft_updated_at timestamptz,
        published_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(issue_slug, page_slug)
      );

      CREATE TABLE IF NOT EXISTS page_composition_revisions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        issue_slug text NOT NULL,
        page_slug text NOT NULL,
        state text NOT NULL CHECK (state IN ('draft', 'published')),
        label text NOT NULL,
        document jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS page_composition_revisions_lookup
      ON page_composition_revisions(issue_slug, page_slug, created_at DESC);
    `).then(() => undefined);
  }
  return readyPromise;
}

function mapRow(row: any): CompositionState {
  return {
    issueSlug: row.issue_slug,
    pageSlug: row.page_slug,
    draft: row.draft_document ?? null,
    published: row.published_document ?? null,
    draftUpdatedAt: row.draft_updated_at ? new Date(row.draft_updated_at).toISOString() : null,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
  };
}

function mapRevision(row: any): CompositionRevision {
  return {
    id: row.id,
    issueSlug: row.issue_slug,
    pageSlug: row.page_slug,
    state: row.state,
    label: row.label,
    createdAt: new Date(row.created_at).toISOString(),
    document: row.document,
  };
}

export async function getComposition(issueSlug: string, pageSlug: string): Promise<CompositionState | null> {
  await ensureSchema();
  const result = await pool.query(
    `SELECT * FROM page_compositions WHERE issue_slug = $1 AND page_slug = $2 LIMIT 1`,
    [issueSlug, pageSlug],
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function getRevisions(issueSlug: string, pageSlug: string, limit = 30): Promise<CompositionRevision[]> {
  await ensureSchema();
  const result = await pool.query(
    `SELECT * FROM page_composition_revisions
     WHERE issue_slug = $1 AND page_slug = $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [issueSlug, pageSlug, Math.max(1, Math.min(limit, 100))],
  );
  return result.rows.map(mapRevision);
}

export async function saveDraft(issueSlug: string, pageSlug: string, document: ComposerDocument, createRevision = true): Promise<CompositionState> {
  await ensureSchema();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO page_compositions (issue_slug, page_slug, draft_document, draft_updated_at, updated_at)
       VALUES ($1, $2, $3::jsonb, now(), now())
       ON CONFLICT (issue_slug, page_slug)
       DO UPDATE SET draft_document = EXCLUDED.draft_document, draft_updated_at = now(), updated_at = now()
       RETURNING *`,
      [issueSlug, pageSlug, JSON.stringify(document)],
    );
    if (createRevision) {
      await client.query(
        `INSERT INTO page_composition_revisions (issue_slug, page_slug, state, label, document)
         VALUES ($1, $2, 'draft', $3, $4::jsonb)`,
        [issueSlug, pageSlug, `Draft saved ${new Date().toISOString()}`, JSON.stringify(document)],
      );
    }
    await client.query("COMMIT");
    return mapRow(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function publishDraft(issueSlug: string, pageSlug: string, document?: ComposerDocument): Promise<CompositionState> {
  await ensureSchema();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (document) {
      await client.query(
        `INSERT INTO page_compositions (issue_slug, page_slug, draft_document, draft_updated_at, updated_at)
         VALUES ($1, $2, $3::jsonb, now(), now())
         ON CONFLICT (issue_slug, page_slug)
         DO UPDATE SET draft_document = EXCLUDED.draft_document, draft_updated_at = now(), updated_at = now()`,
        [issueSlug, pageSlug, JSON.stringify(document)],
      );
    }
    const result = await client.query(
      `UPDATE page_compositions
       SET published_document = draft_document, published_at = now(), updated_at = now()
       WHERE issue_slug = $1 AND page_slug = $2 AND draft_document IS NOT NULL
       RETURNING *`,
      [issueSlug, pageSlug],
    );
    if (!result.rows[0]) throw new Error("No saved draft exists for this page.");
    await client.query(
      `INSERT INTO page_composition_revisions (issue_slug, page_slug, state, label, document)
       VALUES ($1, $2, 'published', $3, $4::jsonb)`,
      [issueSlug, pageSlug, `Published ${new Date().toISOString()}`, JSON.stringify(result.rows[0].published_document)],
    );
    await client.query("COMMIT");
    return mapRow(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
