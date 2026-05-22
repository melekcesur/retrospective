import { createClient } from '@libsql/client';

let _client: ReturnType<typeof createClient> | null = null;
let _migrationPromise: Promise<void> | null = null;

export function getDb() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL ?? 'file:local.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    _migrationPromise = runMigration(_client);
  }
  return _client;
}

export async function getDbReady() {
  const db = getDb();
  await _migrationPromise;
  return db;
}

async function runMigration(db: ReturnType<typeof createClient>) {
  for (const sql of [
    'ALTER TABLE sessions ADD COLUMN scores_hidden INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE cards ADD COLUMN group_name TEXT',
  ]) {
    try { await db.execute(sql); } catch { /* column already exists */ }
  }
}
