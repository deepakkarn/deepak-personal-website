-- Run once in Cloudflare Dashboard > D1 > deepakkarn-blog > Console.
-- This is additive: existing likes and comments are preserved.
-- Newly submitted public comments are approved immediately by the Worker API.

CREATE TABLE IF NOT EXISTS blog_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL REFERENCES blog_comments(id) ON DELETE CASCADE,
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_blog_replies_parent ON blog_replies (comment_id, id);

CREATE TABLE IF NOT EXISTS portal_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_expiry ON portal_sessions (expires_at);

CREATE TABLE IF NOT EXISTS portal_login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_portal_login_attempts ON portal_login_attempts (ip_hash, created_at);

-- Optional: explicitly publish old comments still awaiting approval.
-- UPDATE blog_comments SET status = 'approved' WHERE status = 'pending';
