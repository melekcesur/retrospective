'use client';

import { useState } from 'react';
import type { SessionRow } from '@/types';

interface Props {
  session: SessionRow;
  hostId: string;
  sessionId: string;
  onRefresh: () => void;
}

const TIMER_PRESETS = [
  { label: '1 dk', value: 60 },
  { label: '3 dk', value: 180 },
  { label: '5 dk', value: 300 },
  { label: '10 dk', value: 600 },
];

export default function HostControls({
  session,
  hostId,
  sessionId,
  onRefresh,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function patch(updates: Record<string, unknown>) {
    setLoading(true);
    try {
      await fetch(`/api/sessions/${sessionId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId, ...updates }),
      });
      onRefresh();
    } finally {
      setLoading(false);
    }
  }

  async function startTimer(duration: number) {
    await patch({
      timerDuration: duration,
      timerStartedAt: Date.now(),
      timerRunning: true,
    });
  }

  async function stopTimer() {
    await patch({ timerRunning: false, timerStartedAt: null });
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-violet-500">
        <span>👑</span> Host Kontrolleri
      </p>

      <div className="flex flex-wrap gap-2">
        {/* Hide cards */}
        <button
          disabled={loading}
          onClick={() => patch({ cardsHidden: !session.cardsHidden })}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            session.cardsHidden
              ? 'bg-violet-600 text-white'
              : 'bg-white text-violet-700 ring-1 ring-violet-300 hover:bg-violet-50'
          }`}
        >
          {session.cardsHidden ? '🙈 Kartlar Gizli' : '👁 Kartları Gizle'}
        </button>

        {/* Voting */}
        <button
          disabled={loading}
          onClick={() => patch({ votingOpen: !session.votingOpen })}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            session.votingOpen
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-indigo-700 ring-1 ring-indigo-300 hover:bg-indigo-50'
          }`}
        >
          {session.votingOpen ? '🔒 Oylamayı Kapat' : '🗳 Oylamayı Aç'}
        </button>

        {/* Timer */}
        {session.timerRunning ? (
          <button
            disabled={loading}
            onClick={stopTimer}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-red-300 hover:bg-red-200 transition"
          >
            ⏹ Durdur
          </button>
        ) : (
          <>
            {TIMER_PRESETS.map((p) => (
              <button
                key={p.value}
                disabled={loading}
                onClick={() => startTimer(p.value)}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50 transition"
              >
                ▶ {p.label}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
