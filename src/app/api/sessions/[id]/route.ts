import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { SessionRow, CardRow, ColumnId } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const userId = req.nextUrl.searchParams.get('userId') ?? '';
  const db = getDb();

  const sessionResult = await db.execute({
    sql: 'SELECT * FROM sessions WHERE id = ?',
    args: [params.id],
  });

  if (sessionResult.rows.length === 0) {
    return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 404 });
  }

  const r = sessionResult.rows[0];
  const session: SessionRow = {
    id: r.id as string,
    title: r.title as string,
    hostId: r.host_id as string,
    cardsHidden: Boolean(r.cards_hidden),
    votingOpen: Boolean(r.voting_open),
    scoresHidden: Boolean(r.scores_hidden),
    timerDuration: r.timer_duration as number,
    timerStartedAt: r.timer_started_at as number | null,
    timerRunning: Boolean(r.timer_running),
    createdAt: r.created_at as number,
  };

  const cardsResult = await db.execute({
    sql: `SELECT c.*,
                 COUNT(v.user_id) as vote_count,
                 SUM(CASE WHEN v.user_id = ? THEN 1 ELSE 0 END) as has_voted
          FROM cards c
          LEFT JOIN votes v ON v.card_id = c.id
          WHERE c.session_id = ?
          GROUP BY c.id
          ORDER BY c.created_at ASC`,
    args: [userId, params.id],
  });

  const cards: CardRow[] = cardsResult.rows.map((c) => ({
    id: c.id as string,
    columnId: c.column_id as ColumnId,
    text: c.text as string,
    authorId: c.author_id as string,
    groupName: (c.group_name as string | null) ?? null,
    voteCount: Number(c.vote_count),
    hasVoted: Boolean(c.has_voted),
    createdAt: c.created_at as number,
  }));

  return NextResponse.json({ session, cards });
}
