import { getDb } from './db';

async function main() {
  const db = getDb();

  for (const sql of [
    'ALTER TABLE sessions ADD COLUMN scores_hidden INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE cards ADD COLUMN group_name TEXT',
  ]) {
    try {
      await db.execute(sql);
      console.log('✅', sql);
    } catch {
      console.log('⏭ already exists:', sql.split(' ').slice(4, 7).join(' '));
    }
  }

  console.log('Migration tamamlandı.');
}

main().catch(console.error);
