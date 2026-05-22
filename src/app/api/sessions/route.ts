import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateSessionId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const { title, hostId } = await req.json();
  if (!title?.trim() || !hostId) {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const db = getDb();
  const id = generateSessionId();
  const now = Date.now();

  await db.execute({
    sql: `INSERT INTO sessions (id, title, host_id, created_at)
          VALUES (?, ?, ?, ?)`,
    args: [id, title.trim(), hostId, now],
  });

  return NextResponse.json({ id }, { status: 201 });
}
