'use client';

import { useEffect, useState } from 'react';
import type { SessionRow } from '@/types';
import { formatTime } from '@/lib/utils';

interface Props {
  session: SessionRow;
}

export default function Timer({ session }: Props) {
  const { timerRunning, timerStartedAt, timerDuration } = session;
  const [remaining, setRemaining] = useState(timerDuration);

  useEffect(() => {
    if (!timerRunning || !timerStartedAt) {
      setRemaining(timerDuration);
      return;
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
      setRemaining(Math.max(0, timerDuration - elapsed));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerStartedAt, timerDuration]);

  if (!timerRunning && !timerStartedAt) return null;

  const pct = timerDuration > 0 ? remaining / timerDuration : 1;
  const color =
    pct > 0.5
      ? 'text-emerald-600'
      : pct > 0.2
        ? 'text-amber-500'
        : 'text-red-500';

  return (
    <div className="flex items-center justify-center gap-2">
      <span className={`font-mono text-3xl font-bold tabular-nums ${color}`}>
        {formatTime(remaining)}
      </span>
      {remaining === 0 && (
        <span className="animate-bounce text-lg">⏰ Süre doldu!</span>
      )}
    </div>
  );
}
