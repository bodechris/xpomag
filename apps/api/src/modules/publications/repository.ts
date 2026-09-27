import { createDb } from "@xpomag/db";
import { loadApiEnv } from "../../lib/load-env.js";

loadApiEnv();

export type PublicationStatus = "DRAFT" | "COMING_SOON" | "ACTIVE" | "ARCHIVED";
export type PublicationType = "CITY" | "INTEREST" | "COMMUNITY";

export type Publication = {
  id: string;
  name: string;
  slug: string;
  type: PublicationType;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  description: string | null;
  tagline: string | null;
  coverImage: string | null;
  logo: string | null;
  status: PublicationStatus;
  launchDate: string | null;
  featured: boolean;
  followerCount: number;
  viewerFollowing: boolean;
  createdAt: string;
  updatedAt: string;
};

const connectionString = process.env.DATABASE_URL ?? "postgres://xpomag:xpomag@localhost:5434/xpomag";
const { pool } = createDb(connectionString);
let readyPromise: Promise<void> | null = null;

function ensureSchema() {
  if (!readyPromise) {
    readyPromise = pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE IF NOT EXISTS publications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        type text NOT NULL DEFAULT 'CITY' CHECK (type IN ('CITY','INTEREST','COMMUNITY')),
        city text,
        country text,
        country_code text,
        description text,
        tagline text,
        cover_image text,
        logo text,
        status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','COMING_SOON','ACTIVE','ARCHIVED')),
        launch_date date,
        featured boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS publication_followers (
        publication_id uuid NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
        user_id text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (publication_id,user_id)
      );
      CREATE INDEX IF NOT EXISTS publication_followers_user_idx ON publication_followers(user_id,created_at DESC);
      CREATE INDEX IF NOT EXISTS publications_status_idx ON publications(status,featured,name);
      INSERT INTO publications (name,slug,type,city,country,country_code,description,tagline,status,featured)
      VALUES
        ('XpoMag Lagos','lagos','CITY','Lagos','Nigeria','NG','The people, places, businesses and ideas shaping Lagos.','Every city has a story. This is Lagos.','ACTIVE',true),
        ('XpoMag Joburg','joburg','CITY','Johannesburg','South Africa','ZA','The people, places, businesses and ideas shaping Johannesburg.','Every city has a story. This is Joburg.','ACTIVE',true)
      ON CONFLICT (slug) DO NOTHING;
    `).then(() => undefined);
  }
  return readyPromise;
}

function mapPublication(row: any): Publication {
  return {
    id: row.id, name: row.name, slug: row.slug, type: row.type,
    city: row.city ?? null, country: row.country ?? null, countryCode: row.country_code ?? null,
    description: row.description ?? null, tagline: row.tagline ?? null,
    coverImage: row.cover_image ?? null, logo: row.logo ?? null, status: row.status,
    launchDate: row.launch_date ? new Date(row.launch_date).toISOString().slice(0,10) : null,
    featured: Boolean(row.featured), followerCount: Number(row.follower_count ?? 0),
    viewerFollowing: Boolean(row.viewer_following),
    createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function listPublications(userId?: string | null, includeHidden = false) {
  await ensureSchema();
  const result = await pool.query(`
    SELECT p.*,
      count(DISTINCT f.user_id)::int AS follower_count,
      coalesce(bool_or(f.user_id=$1),false) AS viewer_following
    FROM publications p
    LEFT JOIN publication_followers f ON f.publication_id=p.id
    WHERE ($2::boolean = true OR p.status IN ('ACTIVE','COMING_SOON'))
    GROUP BY p.id
    ORDER BY p.featured DESC,
      CASE p.status WHEN 'ACTIVE' THEN 0 WHEN 'COMING_SOON' THEN 1 WHEN 'DRAFT' THEN 2 ELSE 3 END,
      p.name ASC
  `, [userId ?? "", includeHidden]);
  return result.rows.map(mapPublication);
}

export async function getPublication(slug: string, userId?: string | null) {
  await ensureSchema();
  const result = await pool.query(`
    SELECT p.*,count(DISTINCT f.user_id)::int AS follower_count,
      coalesce(bool_or(f.user_id=$2),false) AS viewer_following
    FROM publications p LEFT JOIN publication_followers f ON f.publication_id=p.id
    WHERE p.slug=$1 GROUP BY p.id LIMIT 1
  `, [slug,userId ?? ""]);
  return result.rows[0] ? mapPublication(result.rows[0]) : null;
}

export async function setPublicationFollow(slug: string, userId: string, following: boolean) {
  await ensureSchema();
  const publication = await pool.query(`SELECT id FROM publications WHERE slug=$1 AND status <> 'ARCHIVED' LIMIT 1`, [slug]);
  if (!publication.rows[0]) {
    const error = new Error("Publication not found") as Error & { status?: number };
    error.status = 404; throw error;
  }
  const publicationId = publication.rows[0].id;
  if (following) {
    await pool.query(`INSERT INTO publication_followers (publication_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [publicationId,userId]);
  } else {
    await pool.query(`DELETE FROM publication_followers WHERE publication_id=$1 AND user_id=$2`, [publicationId,userId]);
  }
  return getPublication(slug,userId);
}

export type PublicationInput = {
  name: string; slug: string; type: PublicationType; city?: string | null; country?: string | null;
  countryCode?: string | null; description?: string | null; tagline?: string | null; coverImage?: string | null;
  logo?: string | null; status: PublicationStatus; launchDate?: string | null; featured?: boolean;
};

export async function upsertPublication(input: PublicationInput) {
  await ensureSchema();
  const result = await pool.query(`
    INSERT INTO publications (name,slug,type,city,country,country_code,description,tagline,cover_image,logo,status,launch_date,featured)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name,type=EXCLUDED.type,city=EXCLUDED.city,country=EXCLUDED.country,
      country_code=EXCLUDED.country_code,description=EXCLUDED.description,tagline=EXCLUDED.tagline,
      cover_image=EXCLUDED.cover_image,logo=EXCLUDED.logo,status=EXCLUDED.status,launch_date=EXCLUDED.launch_date,
      featured=EXCLUDED.featured,updated_at=now()
    RETURNING slug
  `, [input.name,input.slug,input.type,input.city ?? null,input.country ?? null,input.countryCode ?? null,
      input.description ?? null,input.tagline ?? null,input.coverImage ?? null,input.logo ?? null,input.status,
      input.launchDate || null,Boolean(input.featured)]);
  return getPublication(result.rows[0].slug);
}
