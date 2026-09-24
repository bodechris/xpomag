CREATE TABLE IF NOT EXISTS section_engagement_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_slug text NOT NULL,
  page_slug text NOT NULL,
  section_id text NOT NULL,
  user_id text NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('like','love','insightful','celebrate')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(issue_slug, page_slug, section_id, user_id)
);

CREATE TABLE IF NOT EXISTS section_engagement_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_slug text NOT NULL,
  page_slug text NOT NULL,
  section_id text NOT NULL,
  user_id text NOT NULL,
  parent_id uuid REFERENCES section_engagement_comments(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS section_engagement_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_slug text NOT NULL,
  page_slug text NOT NULL,
  section_id text NOT NULL,
  user_id text NOT NULL,
  channel text NOT NULL DEFAULT 'copy',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS section_engagement_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_slug text NOT NULL,
  page_slug text NOT NULL,
  section_id text NOT NULL,
  user_id text NOT NULL,
  collection_name text NOT NULL DEFAULT 'Saved',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(issue_slug, page_slug, section_id, user_id)
);

CREATE INDEX IF NOT EXISTS section_engagement_reactions_target_idx ON section_engagement_reactions(issue_slug,page_slug,section_id);
CREATE INDEX IF NOT EXISTS section_engagement_comments_target_idx ON section_engagement_comments(issue_slug,page_slug,section_id,created_at DESC);
CREATE INDEX IF NOT EXISTS section_engagement_shares_target_idx ON section_engagement_shares(issue_slug,page_slug,section_id);
CREATE INDEX IF NOT EXISTS section_engagement_saves_target_idx ON section_engagement_saves(issue_slug,page_slug,section_id);
