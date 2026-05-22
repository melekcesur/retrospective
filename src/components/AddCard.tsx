'use client';

import { useState } from 'react';
import type { ColumnId } from '@/types';

interface Props {
  sessionId: string;
  columnId: ColumnId;
  userId: string;
  onRefresh: () => void;
}

export default function AddCard({ sessionId, columnId, userId, onRefresh }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !userId) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/sessions/${sessionId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId, text: text.trim(), authorId: userId }),
      });
      if (!res.ok) {
        setError('Kart eklenemedi.');
        return;
      }
      setText('');
      setOpen(false);
      onRefresh();
    } catch {
      setError('Bağlantı hatası.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        disabled={!userId}
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-400 transition hover:border-slate-400 hover:text-slate-600 disabled:opacity-40"
      >
        <span className="text-base leading-none">+</span> Kart ekle
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ne düşünüyorsun?"
        rows={3}
        className="w-full resize-none rounded-lg border border-slate-300 p-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
          }
          if (e.key === 'Escape') { setOpen(false); setText(''); }
        }}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <div className="mt-1.5 flex gap-1.5">
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {saving ? '...' : 'Ekle'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setText(''); setError(''); }}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 transition"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
