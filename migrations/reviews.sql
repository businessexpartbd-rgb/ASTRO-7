CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  picture TEXT,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT 'Creavix Service',
  visitor_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_visitor_created ON reviews(visitor_hash, created_at DESC);
