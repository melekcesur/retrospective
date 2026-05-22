'use client';

import { useState } from 'react';
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

export default function Column({
  column, cards, sessionId, userId, isHost,
  cardsHidden, votingOpen, scoresHidden, sortByVotes, onRefresh,
}: Props) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sorted = [...cards].sort((a, b) =>
    sortByVotes ? b.voteCount - a.voteCount : a.createdAt - b.createdAt,
  );

  async function patchCard(cardId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/sessions/${sessionId}/cards/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('[Column] card PATCH failed', res.status, data);
    }
  }

  async function handleMerge(draggedCardId: string, targetCardId: string) {
    setDragOverId(null);
    const draggedCard = cards.find((c) => c.id === draggedCardId);
    const targetCard = cards.find((c) => c.id === targetCardId);
    if (!draggedCard || !targetCard) return;

    // Use existing group or create a new one
    const groupName = targetCard.groupName ?? `G${Date.now().toString(36).slice(-5).toUpperCase()}`;

    if (!targetCard.groupName) {
      await patchCard(targetCardId, { hostId: userId, groupName });
    }
    await patchCard(draggedCardId, { hostId: userId, groupName });
    onRefresh();
  }

  async function handleUnmerge(cardId: string) {
    await patchCard(cardId, { hostId: userId, groupName: null });
    onRefresh();
  }

  // Build group map preserving sort order
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

  const groups = Array.from(groupMap.entries()).map(([name, groupCards]) => ({
    name,
    cards: groupCards,
    totalVotes: groupCards.reduce((s, c) => s + c.voteCount, 0),
  }));

  if (sortByVotes) groups.sort((a, b) => b.totalVotes - a.totalVotes);

  const cardProps = (card: CardRow) => ({
    card,
    sessionId,
    userId,
    isHost,
    isHidden: cardsHidden,
    votingOpen,
    scoresHidden,
    isDragOver: dragOverId === card.id,
    onDragStart: () => {},
    onDragOver: () => setDragOverId(card.id),
    onDragLeave: () => setDragOverId(null),
    onDrop: (draggedId: string) => handleMerge(draggedId, card.id),
    onUnmerge: () => handleUnmerge(card.id),
    onRefresh,
  });

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col rounded-xl border ${column.border} ${column.bg}`}
      onDragEnd={() => setDragOverId(null)}
    >
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

        {isHost && groups.length === 0 && ungrouped.length > 1 && (
          <p className="text-center text-xs text-slate-400">
            Kartları birleştirmek için sürükle &amp; bırak
          </p>
        )}

        {/* Grouped cards */}
        {groups.map((group) => (
          <div key={group.name} className="rounded-lg border border-slate-200 bg-white/60 p-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">🔗 Grup</span>
              {!scoresHidden && group.totalVotes > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  {group.totalVotes} oy
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {group.cards.map((card) => (
                <CardItem key={card.id} {...cardProps(card)} />
              ))}
            </div>
          </div>
        ))}

        {/* Ungrouped cards */}
        {ungrouped.map((card) => (
          <CardItem key={card.id} {...cardProps(card)} />
        ))}
      </div>
    </div>
  );
}
