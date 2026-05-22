export type ColumnId = 'mad' | 'sad' | 'glad';

export interface Column {
  id: ColumnId;
  label: string;
  emoji: string;
  accent: string;
  bg: string;
  border: string;
  badge: string;
}

export const COLUMNS: Column[] = [
  {
    id: 'mad',
    label: 'Mad',
    emoji: '😠',
    accent: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    accent: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'glad',
    label: 'Glad',
    emoji: '😊',
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
];

export interface SessionRow {
  id: string;
  title: string;
  hostId: string;
  cardsHidden: boolean;
  votingOpen: boolean;
  scoresHidden: boolean;
  timerDuration: number;
  timerStartedAt: number | null;
  timerRunning: boolean;
  createdAt: number;
}

export interface CardRow {
  id: string;
  columnId: ColumnId;
  text: string;
  authorId: string;
  groupName: string | null;
  voteCount: number;
  hasVoted: boolean;
  createdAt: number;
}

export interface SessionData {
  session: SessionRow;
  cards: CardRow[];
}
