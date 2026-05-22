import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { SessionRow, CardRow, ColumnId } from '@/types';

const CARDS_SQL_WITH_GROUP = `
  SELECT c.id, c.column_id, c.text, c.author_id, c.created_at, c.group_name,
         COUNT(v.user_id) as vote_count,
         SUM(CASE WHEN v.user_id = ? THEN 1 ELSE 0 END) as has_voted
  FROM cards c
  LEFT JOIN votes v ON v.card_id = c.id
  WHERE c.session_id = ?
  GROUP BY c.id
  ORDER BY c.created_at ASC`;

const CARDS_SQL_NO_GROUP = `
  SELECT c.id, c.column_id, c.text, c.author_id, c.created_at,
         COUNT(v.user_id) as vote_count,
         SUM(CASE WHEN v.user_id = ? THEN 1 ELSE 0 END) as has_voted
  FROM cards c
  LEFT JOIN votes v ON v.card_id = c.id
  WHERE c.session_id = ?
  GROUP BY c.id
  ORDER BY c.created_at ASC`;

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

  // Try with group_name; fall back if column doesn't exist yet
  let cardsResult;
  let hasGroupName = true;
  try {
    cardsResult = await db.execute({
      sql: CARDS_SQL_WITH_GROUP,
      args: [userId, params.id],
    });
  } catch {
    hasGroupName = false;
    cardsResult = await db.execute({
      sql: CARDS_SQL_NO_GROUP,
      args: [userId, params.id],
    });
  }

  const cards: CardRow[] = cardsResult.rows.map((c) => ({
    id: c.id as string,
    columnId: c.column_id as ColumnId,
    text: c.text as string,
    authorId: c.author_id as string,
    groupName: hasGroupName ? ((c.group_name as string | null) ?? null) : null,
    voteCount: Number(c.vote_count),
    hasVoted: Boolean(c.has_voted),
    createdAt: c.created_at as number,
  }));

  return NextResponse.json({ session, cards });
}
