import { createDb } from "@xpomag/db";
import { loadApiEnv } from "../../lib/load-env";

loadApiEnv();

type Reaction = "like" | "love" | "insightful" | "celebrate";

export type EngagementTarget = { issueSlug: string; pageSlug: string; sectionId: string };
export type EngagementSummary = {
  reactions: Record<Reaction, number>;
  totalReactions: number;
  comments: number;
  shares: number;
  saves: number;
  viewerReaction: Reaction | null;
  viewerSaved: boolean;
};
export type EngagementComment = { id: string; userId: string; userName: string | null; body: string; parentId: string | null; createdAt: string };
export type SaveCollection = { id: string; name: string; itemCount: number; createdAt: string };

const connectionString = process.env.DATABASE_URL ?? "postgres://xpomag:xpomag@localhost:5434/xpomag";
const { pool } = createDb(connectionString);
let readyPromise: Promise<void> | null = null;

function ensureSchema() {
  if (!readyPromise) {
    readyPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS section_engagement_reactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), issue_slug text NOT NULL, page_slug text NOT NULL,
        section_id text NOT NULL, user_id text NOT NULL,
        reaction text NOT NULL CHECK (reaction IN ('like','love','insightful','celebrate')),
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(issue_slug, page_slug, section_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS section_engagement_comments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), issue_slug text NOT NULL, page_slug text NOT NULL,
        section_id text NOT NULL, user_id text NOT NULL,
        parent_id uuid REFERENCES section_engagement_comments(id) ON DELETE CASCADE,
        body text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS section_engagement_shares (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), issue_slug text NOT NULL, page_slug text NOT NULL,
        section_id text NOT NULL, user_id text NOT NULL, channel text NOT NULL DEFAULT 'copy',
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS engagement_collections (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id text NOT NULL,
        name text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(user_id, name)
      );
      CREATE TABLE IF NOT EXISTS section_engagement_saves (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), issue_slug text NOT NULL, page_slug text NOT NULL,
        section_id text NOT NULL, user_id text NOT NULL, collection_name text NOT NULL DEFAULT 'Saved',
        collection_id uuid REFERENCES engagement_collections(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE section_engagement_saves ADD COLUMN IF NOT EXISTS collection_id uuid REFERENCES engagement_collections(id) ON DELETE CASCADE;
      INSERT INTO engagement_collections (user_id,name)
        SELECT DISTINCT user_id,'Saved' FROM section_engagement_saves
        ON CONFLICT (user_id,name) DO NOTHING;
      UPDATE section_engagement_saves s
        SET collection_id=c.id, collection_name=c.name
        FROM engagement_collections c
        WHERE s.collection_id IS NULL AND c.user_id=s.user_id AND c.name='Saved';
      ALTER TABLE section_engagement_saves DROP CONSTRAINT IF EXISTS section_engagement_saves_issue_slug_page_slug_section_id_user_id_key;
      CREATE UNIQUE INDEX IF NOT EXISTS section_engagement_saves_target_user_collection_uidx
        ON section_engagement_saves(issue_slug,page_slug,section_id,user_id,collection_id)
        WHERE collection_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS section_engagement_reactions_target_idx ON section_engagement_reactions(issue_slug,page_slug,section_id);
      CREATE INDEX IF NOT EXISTS section_engagement_comments_target_idx ON section_engagement_comments(issue_slug,page_slug,section_id,created_at DESC);
      CREATE INDEX IF NOT EXISTS section_engagement_shares_target_idx ON section_engagement_shares(issue_slug,page_slug,section_id);
      CREATE INDEX IF NOT EXISTS section_engagement_saves_target_idx ON section_engagement_saves(issue_slug,page_slug,section_id);
      CREATE INDEX IF NOT EXISTS engagement_collections_user_idx ON engagement_collections(user_id,created_at DESC);
    `).then(() => undefined);
  }
  return readyPromise;
}

const values = (target: EngagementTarget) => [target.issueSlug, target.pageSlug, target.sectionId];

async function ensureDefaultCollection(userId: string) {
  await ensureSchema();
  const result = await pool.query(
    `INSERT INTO engagement_collections (user_id,name) VALUES ($1,'Saved') ON CONFLICT (user_id,name) DO UPDATE SET updated_at=engagement_collections.updated_at RETURNING id,name,created_at`,
    [userId],
  );
  return result.rows[0];
}

export async function getEngagementSummary(target: EngagementTarget, userId?: string | null): Promise<EngagementSummary> {
  await ensureSchema();
  const [reactionRows, commentRows, shareRows, saveRows, viewerReactionRows, viewerSaveRows] = await Promise.all([
    pool.query(`SELECT reaction,count(*)::int AS count FROM section_engagement_reactions WHERE issue_slug=$1 AND page_slug=$2 AND section_id=$3 GROUP BY reaction`, values(target)),
    pool.query(`SELECT count(*)::int AS count FROM section_engagement_comments WHERE issue_slug=$1 AND page_slug=$2 AND section_id=$3`, values(target)),
    pool.query(`SELECT count(DISTINCT user_id)::int AS count FROM section_engagement_shares WHERE issue_slug=$1 AND page_slug=$2 AND section_id=$3`, values(target)),
    pool.query(`SELECT count(DISTINCT user_id)::int AS count FROM section_engagement_saves WHERE issue_slug=$1 AND page_slug=$2 AND section_id=$3`, values(target)),
    userId ? pool.query(`SELECT reaction FROM section_engagement_reactions WHERE issue_slug=$1 AND page_slug=$2 AND section_id=$3 AND user_id=$4 LIMIT 1`, [...values(target), userId]) : Promise.resolve({ rows: [] } as any),
    userId ? pool.query(`SELECT 1 FROM section_engagement_saves WHERE issue_slug=$1 AND page_slug=$2 AND section_id=$3 AND user_id=$4 LIMIT 1`, [...values(target), userId]) : Promise.resolve({ rows: [] } as any),
  ]);
  const reactions: Record<Reaction, number> = { like: 0, love: 0, insightful: 0, celebrate: 0 };
  for (const row of reactionRows.rows) reactions[row.reaction as Reaction] = Number(row.count ?? 0);
  return {
    reactions,
    totalReactions: Object.values(reactions).reduce((sum, value) => sum + value, 0),
    comments: Number(commentRows.rows[0]?.count ?? 0), shares: Number(shareRows.rows[0]?.count ?? 0), saves: Number(saveRows.rows[0]?.count ?? 0),
    viewerReaction: (viewerReactionRows.rows[0]?.reaction as Reaction | undefined) ?? null,
    viewerSaved: Boolean(viewerSaveRows.rows[0]),
  };
}

export async function setReaction(target: EngagementTarget, userId: string, reaction: Reaction | null) {
  await ensureSchema();
  if (!reaction) await pool.query(`DELETE FROM section_engagement_reactions WHERE issue_slug=$1 AND page_slug=$2 AND section_id=$3 AND user_id=$4`, [...values(target), userId]);
  else await pool.query(`INSERT INTO section_engagement_reactions (issue_slug,page_slug,section_id,user_id,reaction) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (issue_slug,page_slug,section_id,user_id) DO UPDATE SET reaction=EXCLUDED.reaction,updated_at=now()`, [...values(target), userId, reaction]);
  return getEngagementSummary(target, userId);
}

export async function listComments(target: EngagementTarget, limit = 40): Promise<EngagementComment[]> {
  await ensureSchema();
  const result = await pool.query(`
    SELECT c.id,c.user_id,u.name AS user_name,c.body,c.parent_id,c.created_at
    FROM section_engagement_comments c
    LEFT JOIN "user" u ON u.id = c.user_id
    WHERE c.issue_slug=$1 AND c.page_slug=$2 AND c.section_id=$3
    ORDER BY c.created_at ASC LIMIT $4
  `, [...values(target), Math.max(1, Math.min(limit, 100))]);
  return result.rows.map((row: any) => ({ id: row.id, userId: row.user_id, userName: row.user_name ?? null, body: row.body, parentId: row.parent_id ?? null, createdAt: new Date(row.created_at).toISOString() }));
}

export async function addComment(target: EngagementTarget, userId: string, body: string, parentId?: string | null): Promise<EngagementComment> {
  await ensureSchema();
  const result = await pool.query(`INSERT INTO section_engagement_comments (issue_slug,page_slug,section_id,user_id,parent_id,body) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,user_id,body,parent_id,created_at`, [...values(target), userId, parentId ?? null, body]);
  const row = result.rows[0];
  const user = await pool.query(`SELECT name FROM "user" WHERE id=$1 LIMIT 1`, [userId]);
  return { id: row.id, userId: row.user_id, userName: user.rows[0]?.name ?? null, body: row.body, parentId: row.parent_id ?? null, createdAt: new Date(row.created_at).toISOString() };
}

export async function deleteComment(target: EngagementTarget, userId: string, commentId: string) {
  await ensureSchema();
  const deleted = await pool.query(
    `DELETE FROM section_engagement_comments WHERE id=$1 AND issue_slug=$2 AND page_slug=$3 AND section_id=$4 AND user_id=$5 RETURNING id`,
    [commentId, target.issueSlug, target.pageSlug, target.sectionId, userId],
  );
  if (!deleted.rowCount) {
    const error = new Error("Comment not found or you do not own it") as Error & { status?: number };
    error.status = 404;
    throw error;
  }
  return getEngagementSummary(target, userId);
}

export async function recordShare(target: EngagementTarget, userId: string, channel: string) {
  await ensureSchema();
  await pool.query(`INSERT INTO section_engagement_shares (issue_slug,page_slug,section_id,user_id,channel) VALUES ($1,$2,$3,$4,$5)`, [...values(target), userId, channel]);
  return getEngagementSummary(target, userId);
}

export async function listCollections(userId: string): Promise<SaveCollection[]> {
  await ensureSchema();
  await ensureDefaultCollection(userId);
  const result = await pool.query(`
    SELECT c.id,c.name,c.created_at,count(s.id)::int AS item_count
    FROM engagement_collections c
    LEFT JOIN section_engagement_saves s ON s.collection_id=c.id
    WHERE c.user_id=$1
    GROUP BY c.id,c.name,c.created_at
    ORDER BY CASE WHEN c.name='Saved' THEN 0 ELSE 1 END,c.created_at DESC
  `, [userId]);
  return result.rows.map((row: any) => ({ id: row.id, name: row.name, itemCount: Number(row.item_count ?? 0), createdAt: new Date(row.created_at).toISOString() }));
}

export async function createCollection(userId: string, name: string): Promise<SaveCollection> {
  await ensureSchema();
  const result = await pool.query(`
    INSERT INTO engagement_collections (user_id,name) VALUES ($1,$2)
    ON CONFLICT (user_id,name) DO UPDATE SET updated_at=now()
    RETURNING id,name,created_at
  `, [userId, name]);
  const row = result.rows[0];
  return { id: row.id, name: row.name, itemCount: 0, createdAt: new Date(row.created_at).toISOString() };
}

export async function getSaveCollectionsForTarget(target: EngagementTarget, userId: string) {
  const collections = await listCollections(userId);
  const selected = await pool.query(`
    SELECT collection_id FROM section_engagement_saves
    WHERE issue_slug=$1 AND page_slug=$2 AND section_id=$3 AND user_id=$4 AND collection_id IS NOT NULL
  `, [...values(target), userId]);
  return { collections, savedCollectionIds: selected.rows.map((row: any) => row.collection_id as string) };
}

export async function setSavedCollections(target: EngagementTarget, userId: string, collectionIds: string[]) {
  await ensureSchema();
  const uniqueIds = [...new Set(collectionIds)];
  if (uniqueIds.length) {
    const valid = await pool.query(`SELECT id,name FROM engagement_collections WHERE user_id=$1 AND id = ANY($2::uuid[])`, [userId, uniqueIds]);
    if (valid.rows.length !== uniqueIds.length) {
      const error = new Error("One or more collections do not belong to this user") as Error & { status?: number };
      error.status = 400;
      throw error;
    }
    await pool.query(`DELETE FROM section_engagement_saves WHERE issue_slug=$1 AND page_slug=$2 AND section_id=$3 AND user_id=$4`, [...values(target), userId]);
    for (const row of valid.rows) {
      await pool.query(`INSERT INTO section_engagement_saves (issue_slug,page_slug,section_id,user_id,collection_name,collection_id) VALUES ($1,$2,$3,$4,$5,$6)`, [...values(target), userId, row.name, row.id]);
    }
  } else {
    await pool.query(`DELETE FROM section_engagement_saves WHERE issue_slug=$1 AND page_slug=$2 AND section_id=$3 AND user_id=$4`, [...values(target), userId]);
  }
  return { summary: await getEngagementSummary(target, userId), ...(await getSaveCollectionsForTarget(target, userId)) };
}

// Backward-compatible helper for older clients. New clients use collection IDs.
export async function setSaved(target: EngagementTarget, userId: string, saved: boolean, collectionName = "Saved") {
  if (!saved) return (await setSavedCollections(target, userId, [])).summary;
  const collection = await createCollection(userId, collectionName || "Saved");
  return (await setSavedCollections(target, userId, [collection.id])).summary;
}

export async function listSavedItems(userId: string) {
  await ensureSchema();
  await ensureDefaultCollection(userId);
  const result = await pool.query(`
    SELECT s.issue_slug,s.page_slug,s.section_id,s.created_at,c.id AS collection_id,c.name AS collection_name
    FROM section_engagement_saves s
    JOIN engagement_collections c ON c.id=s.collection_id
    WHERE s.user_id=$1
    ORDER BY s.created_at DESC
  `, [userId]);
  return result.rows.map((row: any) => ({
    issueSlug: row.issue_slug,
    pageSlug: row.page_slug,
    sectionId: row.section_id,
    collectionId: row.collection_id,
    collectionName: row.collection_name,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}
