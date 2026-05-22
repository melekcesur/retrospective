import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; cardId: string } },
) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const db = getDb();

  const sessionResult = await db.execute({
    sql: 'SELECT voting_open FROM sessions WHERE id = ?',
    args: [params.id],
  });

  if (!sessionResult.rows[0] || !sessionResult.rows[0].voting_open) {
    return NextResponse.json({ error: 'Oylama kapalı' }, { status: 403 });
  }

  const existing = await db.execute({
    sql: 'SELECT 1 FROM votes WHERE card_id = ? AND user_id = ?',
    args: [params.cardId, userId],
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql: 'DELETE FROM votes WHERE card_id = ? AND user_id = ?',
      args: [params.cardId, userId],
    });
    return NextResponse.json({ voted: false });
  } else {
    await db.execute({
      sql: 'INSERT INTO votes (card_id, user_id) VALUES (?, ?)',
      args: [params.cardId, userId],
    });
    return NextResponse.json({ voted: true });
  }
}
