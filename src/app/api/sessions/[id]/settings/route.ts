import { NextRequest, NextResponse } from 'next/server';
import type { InValue } from '@libsql/client';
import { getDb } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { hostId, ...updates } = body as Record<string, unknown>;

    const db = getDb();

    const sessionResult = await db.execute({
      sql: 'SELECT host_id FROM sessions WHERE id = ?',
      args: [params.id],
    });

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 404 });
    }

    if (sessionResult.rows[0].host_id !== hostId) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const allowed = [
      'cards_hidden',
      'voting_open',
      'scores_hidden',
      'timer_duration',
      'timer_started_at',
      'timer_running',
    ];
    const setClauses: string[] = [];
    const args: InValue[] = [];

    for (const [key, val] of Object.entries(updates)) {
      const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowed.includes(col)) {
        setClauses.push(`${col} = ?`);
        args.push(val === true ? 1 : val === false ? 0 : (val as InValue));
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ ok: true });
    }

    args.push(params.id);
    await db.execute({
      sql: `UPDATE sessions SET ${setClauses.join(', ')} WHERE id = ?`,
      args,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
