import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; cardId: string } },
) {
  const authorId = req.nextUrl.searchParams.get('authorId');
  if (!authorId) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const db = getDb();

  const result = await db.execute({
    sql: 'SELECT author_id FROM cards WHERE id = ? AND session_id = ?',
    args: [params.cardId, params.id],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Kart bulunamadı' }, { status: 404 });
  }

  if (result.rows[0].author_id !== authorId) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  await db.execute({
    sql: 'DELETE FROM cards WHERE id = ?',
    args: [params.cardId],
  });

  return NextResponse.json({ ok: true });
}
