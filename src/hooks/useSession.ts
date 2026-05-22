'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SessionData } from '@/types';

export function useSession(sessionId: string, userId: string) {
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef(0);

  const fetch_ = useCallback(async () => {
    if (!sessionId || !userId) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}?userId=${userId}`);
      if (res.status === 404) {
        setError('Oturum bulunamadı');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Sunucu hatası');
      const json: SessionData = await res.json();
      setData(json);
      setError(null);
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
    lastFetchRef.current = Date.now();
  }, [sessionId, userId]);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, 3000);
    return () => clearInterval(id);
  }, [fetch_]);

  return { data, loading, error, refresh: fetch_ };
}
