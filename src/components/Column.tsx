'use client';

import type { Column as ColumnType, CardRow } from '@/types';
import CardItem from './CardItem';
import AddCard from './AddCard';

interface Props {
  column: ColumnType;
  cards: CardRow[];
  sessionId: string;
  userId: string;
  cardsHidden: boolean;
  votingOpen: boolean;
  sortByVotes: boolean;
  onRefresh: () => void;
}

export default function Column({
  column,
  cards,
  sessionId,
  userId,
  cardsHidden,
  votingOpen,
  sortByVotes,
  onRefresh,
}: Props) {
  const sorted = [...cards].sort((a, b) =>
    sortByVotes ? b.voteCount - a.voteCount : a.createdAt - b.createdAt,
  );

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col rounded-xl border ${column.border} ${column.bg}`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between border-b border-inherit px-4 py-3">
        <h2 className={`font-semibold ${column.accent}`}>
          {column.emoji} {column.label}
        </h2>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${column.badge}`}
        >
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-3">
        <AddCard
          sessionId={sessionId}
          columnId={column.id}
          userId={userId}
          onRefresh={onRefresh}
        />

        {sorted.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            sessionId={sessionId}
            userId={userId}
            isHidden={cardsHidden}
            votingOpen={votingOpen}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}
