const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateSessionId(): string {
  return Array.from(
    { length: 6 },
    () => CHARS[Math.floor(Math.random() * CHARS.length)],
  ).join('');
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
