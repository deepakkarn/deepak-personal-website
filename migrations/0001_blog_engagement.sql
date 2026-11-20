-- Run this SQL once in Cloudflare > D1 > deepakkarn-blog > Console.
-- Safe to rerun: all CREATE statements are idempotent.
CREATE TABLE IF NOT EXISTS blog_likes (
  post_slug TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_slug, visitor_id)
);

CREATE TABLE IF NOT EXISTS blog_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_public
  ON blog_comments (post_slug, status, id DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_rate
  ON blog_comments (author_email, created_at);

-- Moderate from the D1 Console (example, replacing 123 with an actual comment id):
-- SELECT id, post_slug, author_name, author_email, message, created_at
-- FROM blog_comments WHERE status = 'pending' ORDER BY id DESC;
-- UPDATE blog_comments SET status = 'approved' WHERE id = 123 AND status = 'pending';
-- UPDATE blog_comments SET status = 'rejected' WHERE id = 123 AND status = 'pending';
