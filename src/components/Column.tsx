'use client';

import type { Column as ColumnType, CardRow } from '@/types';
import CardItem from './CardItem';
import AddCard from './AddCard';

interface Props {
  column: ColumnType;
  cards: CardRow[];
  sessionId: string;
  userId: string;
  isHost: boolean;
  cardsHidden: boolean;
  votingOpen: boolean;
  scoresHidden: boolean;
  sortByVotes: boolean;
  onRefresh: () => void;
}

interface Group {
  name: string | null;
  cards: CardRow[];
  totalVotes: number;
}

export default function Column({
  column, cards, sessionId, userId, isHost,
  cardsHidden, votingOpen, scoresHidden, sortByVotes, onRefresh,
}: Props) {
  const sorted = [...cards].sort((a, b) =>
    sortByVotes ? b.voteCount - a.voteCount : a.createdAt - b.createdAt,
  );

  // Separate grouped and ungrouped
  const groupMap = new Map<string, CardRow[]>();
  const ungrouped: CardRow[] = [];

  for (const card of sorted) {
    if (card.groupName) {
      const existing = groupMap.get(card.groupName) ?? [];
      groupMap.set(card.groupName, [...existing, card]);
    } else {
      ungrouped.push(card);
    }
  }

  const groups: Group[] = Array.from(groupMap.entries()).map(([name, groupCards]) => ({
    name,
    cards: groupCards,
    totalVotes: groupCards.reduce((s, c) => s + c.voteCount, 0),
  }));

  if (sortByVotes) {
    groups.sort((a, b) => b.totalVotes - a.totalVotes);
  }

  const cardProps = { sessionId, userId, isHost, isHidden: cardsHidden, votingOpen, scoresHidden, onRefresh };

  return (
    <div className={`flex min-w-0 flex-1 flex-col rounded-xl border ${column.border} ${column.bg}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-inherit px-4 py-3">
        <h2 className={`font-semibold ${column.accent}`}>
          {column.emoji} {column.label}
        </h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${column.badge}`}>
          {cards.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <AddCard sessionId={sessionId} columnId={column.id} userId={userId} onRefresh={onRefresh} />

        {/* Grouped cards */}
        {groups.map((group) => (
          <div key={group.name} className="rounded-lg border border-slate-200 bg-white/60 p-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">🔗 {group.name}</span>
              {!scoresHidden && group.totalVotes > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  {group.totalVotes} oy
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {group.cards.map((card) => (
                <CardItem key={card.id} card={card} {...cardProps} />
              ))}
            </div>
          </div>
        ))}

        {/* Ungrouped cards */}
        {ungrouped.map((card) => (
          <CardItem key={card.id} card={card} {...cardProps} />
        ))}
      </div>
    </div>
  );
}
