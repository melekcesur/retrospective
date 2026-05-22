import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { columnId, text, authorId } = await req.json();
  if (!columnId || !text?.trim() || !authorId) {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const db = getDb();
  const id = generateId();
  const now = Date.now();

  await db.execute({
    sql: `INSERT INTO cards (id, session_id, column_id, text, author_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, params.id, columnId, text.trim(), authorId, now],
  });

  return NextResponse.json({ id }, { status: 201 });
}
