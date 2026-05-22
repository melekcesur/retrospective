'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserId } from '@/hooks/useUserId';

export default function Home() {
  const router = useRouter();
  const userId = useUserId();

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !userId) return;
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), hostId: userId }),
      });
      if (!res.ok) {
        const body = await res.text();
        setCreateError(`Hata (${res.status}): ${body}`);
        return;
      }
      const data = await res.json();
      localStorage.setItem(`retro_host_${data.id}`, userId);
      router.push(`/session/${data.id}`);
    } catch (err) {
      setCreateError(`Bağlantı hatası: ${String(err)}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setJoining(true);
    setJoinError('');
    try {
      const res = await fetch(`/api/sessions/${trimmed}?userId=${userId}`);
      if (res.status === 404) {
        setJoinError('Oturum bulunamadı. Kodu kontrol et.');
        return;
      }
      router.push(`/session/${trimmed}`);
    } finally {
      setJoining(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">
          🔄 RetroApp
        </h1>
        <p className="mt-2 text-slate-500">Anonim sprint retrospektif aracı</p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        {/* Create */}
        <form
          onSubmit={handleCreate}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-700">
            Yeni Retro Başlat
          </h2>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Sprint 12 Retrosu"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          {createError && (
            <p className="mt-1.5 text-xs text-red-500 break-all">{createError}</p>
          )}
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="mt-3 w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {creating ? 'Oluşturuluyor...' : 'Retroyu Başlat →'}
          </button>
        </form>

        {/* Join */}
        <form
          onSubmit={handleJoin}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-700">
            Retroya Katıl
          </h2>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="6 haneli kod (örn: ABC123)"
            maxLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase tracking-widest placeholder-slate-400 placeholder-normal focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          {joinError && (
            <p className="mt-1.5 text-xs text-red-500">{joinError}</p>
          )}
          <button
            type="submit"
            disabled={joining || !code.trim()}
            className="mt-3 w-full rounded-lg bg-slate-700 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {joining ? 'Kontrol ediliyor...' : 'Katıl →'}
          </button>
        </form>
      </div>
    </main>
  );
}
