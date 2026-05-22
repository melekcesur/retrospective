'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUserId } from '@/hooks/useUserId';
import { useSession } from '@/hooks/useSession';
import { COLUMNS } from '@/types';
import Column from '@/components/Column';
import HostControls from '@/components/HostControls';
import Timer from '@/components/Timer';

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const userId = useUserId();
  const { data, loading, error, refresh } = useSession(id, userId);
  const [sortByVotes, setSortByVotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!userId || !id) return;
    const stored = localStorage.getItem(`retro_host_${id}`);
    setIsHost(stored === userId);
  }, [userId, id]);

  function copyCode() {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function exportToExcel() {
    if (!data) return;
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    for (const col of COLUMNS) {
      const colCards = data.cards
        .filter((c) => c.columnId === col.id)
        .sort((a, b) => b.voteCount - a.voteCount);

      const rows = colCards.map((c) => ({
        Grup: c.groupName ?? '',
        Metin: c.text,
        'Oy Sayısı': c.voteCount,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [{ wch: 20 }, { wch: 50 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws, `${col.emoji} ${col.label}`);
    }

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `retro-${id}-${date}.xlsx`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Yükleniyor...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        {error ?? 'Bir hata oluştu'}
      </div>
    );
  }

  const { session, cards } = data;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-slate-800 px-4 py-3 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <span className="hidden text-lg sm:block">🔄</span>
          <h1 className="truncate font-semibold text-white">{session.title}</h1>
          {isHost && (
            <span className="shrink-0 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
              👑 Host
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            title="Kodu kopyala"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-mono font-medium text-slate-200 hover:bg-slate-600 transition"
          >
            <span className="tracking-widest">{id}</span>
            <span className="text-xs text-slate-400">{copied ? '✓' : '⎘'}</span>
          </button>

          <button
            onClick={exportToExcel}
            title="Excel'e aktar"
            className="shrink-0 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600 transition"
          >
            ⬇ Excel
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-4 p-4">
        {/* Timer */}
        {(session.timerRunning || session.timerStartedAt !== null) && (
          <div className="rounded-xl bg-white py-4 text-center shadow-sm ring-1 ring-slate-200">
            <Timer session={session} />
          </div>
        )}

        {/* Host controls */}
        {isHost && (
          <HostControls
            session={session}
            hostId={userId}
            sessionId={id}
            onRefresh={refresh}
          />
        )}

        {/* Sort toggle */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-slate-500">Sırala:</span>
          <button
            onClick={() => setSortByVotes(false)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              !sortByVotes
                ? 'bg-slate-700 text-white'
                : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            Tarihe göre
          </button>
          <button
            onClick={() => setSortByVotes(true)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              sortByVotes
                ? 'bg-slate-700 text-white'
                : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            Oya göre
          </button>
        </div>

        {/* Board */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              column={col}
              cards={cards.filter((c) => c.columnId === col.id)}
              sessionId={id}
              userId={userId}
              isHost={isHost}
              cardsHidden={session.cardsHidden}
              votingOpen={session.votingOpen}
              scoresHidden={session.scoresHidden}
              sortByVotes={sortByVotes}
              onRefresh={refresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
