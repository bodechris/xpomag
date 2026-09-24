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
