'use client';

import { useState } from 'react';
import type { CardRow } from '@/types';

interface Props {
  card: CardRow;
  sessionId: string;
  userId: string;
  isHidden: boolean;
  votingOpen: boolean;
  onRefresh: () => void;
}

export default function CardItem({
  card,
  sessionId,
  userId,
  isHidden,
  votingOpen,
  onRefresh,
}: Props) {
  const [busy, setBusy] = useState(false);
  const isMine = card.authorId === userId;
  const masked = isHidden && !isMine;

  async function handleVote() {
    setBusy(true);
    try {
      await fetch(
        `/api/sessions/${sessionId}/cards/${card.id}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        },
      );
      onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!isMine) return;
    setBusy(true);
    try {
      await fetch(
        `/api/sessions/${sessionId}/cards/${card.id}?authorId=${userId}`,
        { method: 'DELETE' },
      );
      onRefresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="group relative rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200 animate-slide-up">
      {/* Text */}
      <p
        className={`mb-2 min-h-[2.5rem] text-sm text-slate-800 leading-relaxed transition-all ${
          masked ? 'select-none blur-sm' : ''
        }`}
      >
        {masked ? 'Bu kartı görmek için host kartları açmalı.' : card.text}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {isMine && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">
              benim
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Vote count (always show if >0) */}
          {card.voteCount > 0 && (
            <span className="text-xs text-slate-500">{card.voteCount}</span>
          )}

          {/* Vote button */}
          {votingOpen && !masked && (
            <button
              disabled={busy}
              onClick={handleVote}
              title={card.hasVoted ? 'Oyunu geri al' : 'Oy ver'}
              className={`flex items-center gap-0.5 rounded-md px-2 py-0.5 text-sm transition ${
                card.hasVoted
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
            >
              👍
            </button>
          )}

          {/* Delete (own cards only) */}
          {isMine && (
            <button
              disabled={busy}
              onClick={handleDelete}
              title="Kartı sil"
              className="hidden rounded-md p-0.5 text-slate-300 hover:bg-red-50 hover:text-red-400 group-hover:flex transition"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
