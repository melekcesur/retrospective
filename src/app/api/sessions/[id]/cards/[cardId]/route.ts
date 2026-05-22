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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; cardId: string } },
) {
  try {
    const { hostId, groupName } = await req.json();

    const db = getDb();

    const sessionResult = await db.execute({
      sql: 'SELECT host_id FROM sessions WHERE id = ?',
      args: [params.id],
    });

    if (!sessionResult.rows[0] || sessionResult.rows[0].host_id !== hostId) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    await db.execute({
      sql: 'UPDATE cards SET group_name = ? WHERE id = ? AND session_id = ?',
      args: [groupName || null, params.cardId, params.id],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
