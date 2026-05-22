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
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (draggedId: string) => void;
  onUnmerge: () => void;
  onRefresh: () => void;
}

export default function CardItem({
  card, sessionId, userId, isHost, isHidden,
  votingOpen, scoresHidden, isDragOver,
  onDragStart, onDragOver, onDragLeave, onDrop, onUnmerge, onRefresh,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [textInput, setTextInput] = useState(card.text);

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
    } finally { setBusy(false); }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await fetch(`/api/sessions/${sessionId}/cards/${card.id}?authorId=${userId}`, { method: 'DELETE' });
      onRefresh();
    } finally { setBusy(false); }
  }

  async function handleTextSave() {
    const trimmed = textInput.trim();
    setEditing(false);
    if (!trimmed || trimmed === card.text) { setTextInput(card.text); return; }
    setBusy(true);
    try {
      await fetch(`/api/sessions/${sessionId}/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: userId, text: trimmed }),
      });
      onRefresh();
    } finally { setBusy(false); }
  }

  return (
    <div
      draggable={isHost}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', card.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        onDragOver();
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onDragLeave();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== card.id) onDrop(draggedId);
      }}
      className={`group relative rounded-lg bg-white p-3 shadow-sm ring-1 transition-all
        ${isDragOver && isHost ? 'ring-2 ring-indigo-400 scale-[1.02] bg-indigo-50' : 'ring-slate-200'}
        ${isHost ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
    >
      {/* Card text */}
      {editing ? (
        <div className="mb-2">
          <textarea
            autoFocus
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={3}
            className="w-full resize-none rounded border border-indigo-300 p-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleTextSave();
              if (e.key === 'Escape') { setEditing(false); setTextInput(card.text); }
            }}
            onBlur={handleTextSave}
          />
        </div>
      ) : (
        <p
          onClick={isMine && !masked ? () => { setTextInput(card.text); setEditing(true); } : undefined}
          title={isMine && !masked ? 'Düzenlemek için tıkla' : undefined}
          className={`mb-2 min-h-[2.5rem] text-sm text-slate-800 leading-relaxed
            ${masked ? 'select-none blur-sm' : ''}
            ${isMine && !masked ? 'cursor-text rounded hover:bg-slate-50 -mx-1 px-1 transition' : ''}
          `}
        >
          {masked ? 'Bu kartı görmek için host kartları açmalı.' : card.text}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {isMine && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">benim</span>
          )}
          {card.groupName && isHost && (
            <button onClick={onUnmerge} title="Gruptan çıkar"
              className="rounded-full px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-red-50 hover:text-red-400 transition">
              ✕ grup
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {showVotes && (
            <span className="text-xs font-medium text-slate-500">{card.voteCount}</span>
          )}

          {votingOpen && !masked && (
            <button disabled={busy} onClick={handleVote}
              title={card.hasVoted ? 'Oyunu geri al' : 'Oy ver'}
              className={`flex items-center gap-0.5 rounded-md px-2 py-0.5 text-sm transition ${
                card.hasVoted ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}>
              👍
            </button>
          )}

          {isMine && (
            <button disabled={busy} onClick={handleDelete} title="Kartı sil"
              className="hidden rounded-md p-0.5 text-slate-300 hover:bg-red-50 hover:text-red-400 group-hover:flex transition">
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
