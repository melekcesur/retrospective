import { NextRequest, NextResponse } from 'next/server';
import type { InValue } from '@libsql/client';
import { getDbReady } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const hostId = body.hostId as string | undefined;

    if (!hostId) {
      return NextResponse.json({ error: 'hostId eksik' }, { status: 400 });
    }

    const db = await getDbReady();

    const sessionResult = await db.execute({
      sql: 'SELECT host_id FROM sessions WHERE id = ?',
      args: [params.id],
    });

    if (!sessionResult.rows[0]) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 404 });
    }

    const dbHostId = sessionResult.rows[0].host_id as string;
    if (dbHostId !== hostId) {
      console.error('[settings PATCH] auth mismatch — db:', dbHostId, 'sent:', hostId);
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const updates: Array<{ col: string; val: InValue }> = [];

    if ('cardsHidden' in body)
      updates.push({ col: 'cards_hidden', val: body.cardsHidden ? 1 : 0 });
    if ('votingOpen' in body)
      updates.push({ col: 'voting_open', val: body.votingOpen ? 1 : 0 });
    if ('scoresHidden' in body)
      updates.push({ col: 'scores_hidden', val: body.scoresHidden ? 1 : 0 });
    if ('timerDuration' in body)
      updates.push({ col: 'timer_duration', val: body.timerDuration as InValue });
    if ('timerRunning' in body)
      updates.push({ col: 'timer_running', val: body.timerRunning ? 1 : 0 });
    if ('timerStartedAt' in body)
      updates.push({ col: 'timer_started_at', val: body.timerStartedAt as InValue ?? null });

    if (updates.length === 0) return NextResponse.json({ ok: true });

    await db.execute({
      sql: `UPDATE sessions SET ${updates.map((u) => `${u.col} = ?`).join(', ')} WHERE id = ?`,
      args: [...updates.map((u) => u.val), params.id],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[settings PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
