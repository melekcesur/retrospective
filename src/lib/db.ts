import { createClient } from '@libsql/client';

let client: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL ?? 'file:local.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}
