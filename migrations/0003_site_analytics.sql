-- Cloudflare D1 migration: run once in deepakkarn-blog > Console.
-- Stores anonymous first-party browser identifiers (hashed), counts and timestamps.
-- No IP addresses, emails or personal names are stored.

CREATE TABLE IF NOT EXISTS site_page_views (
  page_path TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (page_path, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_site_page_views_visitor
ON site_page_views(visitor_id);
