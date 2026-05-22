'use client';

import { useState } from 'react';
import type { CardRow } from '@/types';

interface Props {
  card: CardRow;
  sessionId: string;
  userId: string;
  isHost: boolean;
  isHidden: boolean;
  votingOpen: boolean;
  scoresHidden: boolean;
  onRefresh: () => void;
}

export default function CardItem({
  card,
  sessionId,
  userId,
  isHost,
  isHidden,
  votingOpen,
  scoresHidden,
  onRefresh,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [editingGroup, setEditingGroup] = useState(false);
  const [groupInput, setGroupInput] = useState(card.groupName ?? '');

  const isMine = card.authorId === userId;
  const masked = isHidden && !isMine;
  const showVotes = !scoresHidden && card.voteCount > 0;

  async function handleVote() {
    setBusy(true);
    try {
      await fetch(`/api/sessions/${sessionId}/cards/${card.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!isMine) return;
    setBusy(true);
    try {
      await fetch(`/api/sessions/${sessionId}/cards/${card.id}?authorId=${userId}`, {
        method: 'DELETE',
      });
      onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleGroupSave() {
    setBusy(true);
    try {
      await fetch(`/api/sessions/${sessionId}/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: userId, groupName: groupInput.trim() || null }),
      });
      setEditingGroup(false);
      onRefresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="group relative rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200 animate-slide-up">
      {/* Group badge */}
      {card.groupName && !editingGroup && (
        <span className="mb-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          🔗 {card.groupName}
        </span>
      )}

      {/* Group edit input */}
      {editingGroup && (
        <div className="mb-2 flex gap-1">
          <input
            autoFocus
            value={groupInput}
            onChange={(e) => setGroupInput(e.target.value)}
            placeholder="Grup adı (boş = grubunu kaldır)"
            className="min-w-0 flex-1 rounded border border-slate-300 px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGroupSave();
              if (e.key === 'Escape') setEditingGroup(false);
            }}
          />
          <button
            onClick={handleGroupSave}
            disabled={busy}
            className="rounded bg-indigo-600 px-2 py-0.5 text-xs text-white"
          >
            ✓
          </button>
          <button
            onClick={() => setEditingGroup(false)}
            className="rounded px-1 py-0.5 text-xs text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Card text */}
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
          {/* Vote count */}
          {showVotes && (
            <span className="text-xs font-medium text-slate-500">{card.voteCount}</span>
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

          {/* Group edit (host only) */}
          {isHost && !editingGroup && (
            <button
              onClick={() => { setGroupInput(card.groupName ?? ''); setEditingGroup(true); }}
              title="Grupla"
              className="hidden rounded-md p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500 group-hover:flex transition"
            >
              🔗
            </button>
          )}

          {/* Delete (own cards) */}
          {isMine && (
            <button
              disabled={busy}
              onClick={handleDelete}
              title="Kartı sil"
              className="hidden rounded-md p-0.5 text-slate-300 hover:bg-red-50 hover:text-red-400 group-hover:flex transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
