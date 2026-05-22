import { NextRequest, NextResponse } from 'next/server';
import { getDbReady } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; cardId: string } },
) {
  const authorId = req.nextUrl.searchParams.get('authorId');
  if (!authorId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  const db = await getDbReady();
  const result = await db.execute({
    sql: 'SELECT author_id FROM cards WHERE id = ? AND session_id = ?',
    args: [params.cardId, params.id],
  });

  if (result.rows.length === 0) return NextResponse.json({ error: 'Kart bulunamadı' }, { status: 404 });
  if (result.rows[0].author_id !== authorId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  await db.execute({ sql: 'DELETE FROM cards WHERE id = ?', args: [params.cardId] });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; cardId: string } },
) {
  try {
    const body = await req.json() as {
      hostId?: string;
      authorId?: string;
      groupName?: string | null;
      text?: string;
    };
    const db = await getDbReady();

    // Text update — only the card's author
    if (body.text !== undefined) {
      if (!body.authorId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

      const cardResult = await db.execute({
        sql: 'SELECT author_id FROM cards WHERE id = ? AND session_id = ?',
        args: [params.cardId, params.id],
      });
      if (!cardResult.rows[0] || cardResult.rows[0].author_id !== body.authorId) {
        return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
      }

      await db.execute({
        sql: 'UPDATE cards SET text = ? WHERE id = ?',
        args: [body.text.trim(), params.cardId],
      });
      return NextResponse.json({ ok: true });
    }

    // Group assignment — only the host
    if ('groupName' in body) {
      const sessionResult = await db.execute({
        sql: 'SELECT host_id FROM sessions WHERE id = ?',
        args: [params.id],
      });
      if (!sessionResult.rows[0] || sessionResult.rows[0].host_id !== body.hostId) {
        console.error('[cards PATCH] auth mismatch — db:', sessionResult.rows[0]?.host_id, 'sent:', body.hostId);
        return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
      }

      await db.execute({
        sql: 'UPDATE cards SET group_name = ? WHERE id = ? AND session_id = ?',
        args: [body.groupName ?? null, params.cardId, params.id],
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  } catch (err) {
    console.error('[cards PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
