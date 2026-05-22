import { getDb } from './db';

async function main() {
  const db = getDb();

  await db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    host_id TEXT NOT NULL,
    cards_hidden INTEGER NOT NULL DEFAULT 0,
    voting_open INTEGER NOT NULL DEFAULT 0,
    scores_hidden INTEGER NOT NULL DEFAULT 0,
    timer_duration INTEGER NOT NULL DEFAULT 300,
    timer_started_at INTEGER,
    timer_running INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    column_id TEXT NOT NULL,
    text TEXT NOT NULL,
    author_id TEXT NOT NULL,
    group_name TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS votes (
    card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    PRIMARY KEY (card_id, user_id)
  );
`);

  console.log('✅ Veritabanı hazır.');
}

main().catch(console.error);
