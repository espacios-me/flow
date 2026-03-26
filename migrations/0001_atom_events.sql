CREATE TABLE IF NOT EXISTS atom_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  source TEXT NOT NULL,
  source_event_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  ingested_at TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  participants_json TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  dedupe_key TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_atom_events_ingested_at ON atom_events (ingested_at DESC);
