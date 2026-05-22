import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateSessionId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
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
  } catch (err) {
    console.error('POST /api/sessions error:', err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 },
    );
  }
}
