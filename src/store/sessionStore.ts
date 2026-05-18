import { create } from 'zustand';
import type { ScoreLevel, VocabWord } from '../types';
import type { StudyFilter } from '../lib/sessionQueue';
import { isCardDueNow } from '../lib/sm2';

export type Grade = Exclude<ScoreLevel, 'new'>;

interface SessionStats {
  reviewed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
}

export interface UndoSnapshot {
  wordId: string;
  word: VocabWord;
  queue: string[];
  scheduledIds: string[];
  stats: SessionStats;
}

interface SessionStore {
  active: boolean;
  folderId: string | 'all';
  filter: StudyFilter;
  queue: string[];
  scheduledIds: string[];
  currentWordId: string | null;
  initialCount: number;
  stats: SessionStats;
  undo: UndoSnapshot | null;
  startedAt: number;
  startSession: (wordIds: string[], folderId: string | 'all', filter: StudyFilter) => void;
  submitGrade: (grade: Grade) => void;
  undoLast: () => boolean;
  pollScheduled: (getWord: (id: string) => VocabWord | undefined) => void;
  endSession: () => void;
  getCurrentWordId: () => string | null;
  isComplete: () => boolean;
  isQueueExhausted: () => boolean;
  resumeScheduledDue: (getWord: (id: string) => VocabWord | undefined) => boolean;
  getProgress: () => {
    reviewed: number;
    initial: number;
    remaining: number;
    scheduled: number;
  };
  getStats: () => SessionStats;
  getSessionCounts: (getWord: (id: string) => VocabWord | undefined) => {
    new: number;
    learning: number;
    review: number;
  };
  captureUndo: () => UndoSnapshot | null;
  setUndoSnapshot: (snap: UndoSnapshot) => void;
  applyUndoSnapshot: (snap: UndoSnapshot) => void;
  addScheduled: (id: string) => void;
}

const emptyStats = (): SessionStats => ({
  reviewed: 0,
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
});

function pullNext(queue: string[], scheduled: string[]): {
  id: string | null;
  queue: string[];
  scheduled: string[];
} {
  if (queue.length > 0) {
    const [id, ...rest] = queue;
    return { id, queue: rest, scheduled };
  }
  return { id: null, queue, scheduled };
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  active: false,
  folderId: 'all',
  filter: 'due',
  queue: [],
  scheduledIds: [],
  currentWordId: null,
  initialCount: 0,
  stats: emptyStats(),
  undo: null,
  startedAt: 0,

  startSession: (wordIds, folderId, filter) => {
    const first = pullNext(wordIds, []);
    set({
      active: true,
      folderId,
      filter,
      queue: first.queue,
      scheduledIds: [],
      currentWordId: first.id,
      initialCount: wordIds.length,
      stats: emptyStats(),
      undo: null,
      startedAt: Date.now(),
    });
  },

  submitGrade: (grade) => {
    const state = get();
    const id = state.currentWordId;
    if (!id) return;

    const stats = { ...state.stats, reviewed: state.stats.reviewed + 1 };
    if (grade === 'again') stats.again++;
    else if (grade === 'hard') stats.hard++;
    else if (grade === 'good') stats.good++;
    else if (grade === 'easy') stats.easy++;

    set({ undo: null });
    const next = pullNext(state.queue, state.scheduledIds);
    set({
      stats,
      queue: next.queue,
      currentWordId: next.id,
    });
  },

  undoLast: () => {
    const snap = get().undo;
    if (!snap) return false;
    set({
      queue: snap.queue,
      scheduledIds: snap.scheduledIds,
      currentWordId: snap.wordId,
      stats: snap.stats,
      undo: null,
    });
    return true;
  },

  pollScheduled: (getWord) => {
    const state = get();
    if (!state.active) return;

    const now = Date.now();
    const dueNow: string[] = [];
    const stillWaiting: string[] = [];

    for (const id of state.scheduledIds) {
      const w = getWord(id);
      if (w && isCardDueNow(w, now)) {
        dueNow.push(id);
      } else if (w) {
        stillWaiting.push(id);
      }
    }

    if (dueNow.length === 0) return;

    const nextCurrent = state.currentWordId ?? dueNow[0] ?? null;
    set({
      scheduledIds: stillWaiting,
      queue: [...dueNow, ...state.queue],
      currentWordId: nextCurrent,
    });
  },

  endSession: () => {
    set({
      active: false,
      folderId: 'all',
      filter: 'due',
      queue: [],
      scheduledIds: [],
      currentWordId: null,
      initialCount: 0,
      stats: emptyStats(),
      undo: null,
      startedAt: 0,
    });
  },

  getCurrentWordId: () => get().currentWordId,

  isComplete: () => {
    const s = get();
    return (
      s.active &&
      !s.currentWordId &&
      s.queue.length === 0 &&
      s.scheduledIds.length === 0
    );
  },

  isQueueExhausted: () => {
    const s = get();
    return s.active && !s.currentWordId && s.queue.length === 0;
  },

  resumeScheduledDue: (getWord) => {
    const state = get();
    if (!state.active) return false;

    const now = Date.now();
    const dueNow: string[] = [];
    const stillWaiting: string[] = [];

    for (const id of state.scheduledIds) {
      const w = getWord(id);
      if (w && isCardDueNow(w, now)) {
        dueNow.push(id);
      } else if (w) {
        stillWaiting.push(id);
      }
    }

    if (dueNow.length === 0) return false;

    set({
      scheduledIds: stillWaiting,
      queue: [...dueNow, ...state.queue],
      currentWordId: state.currentWordId ?? dueNow[0],
    });
    return true;
  },

  getProgress: () => {
    const s = get();
    return {
      reviewed: s.stats.reviewed,
      initial: s.initialCount,
      remaining: s.queue.length + (s.currentWordId ? 1 : 0),
      scheduled: s.scheduledIds.length,
    };
  },

  getStats: () => get().stats,

  captureUndo: () => {
    const s = get();
    if (!s.currentWordId) return null;
    return {
      wordId: s.currentWordId,
      word: {} as VocabWord,
      queue: [...s.queue],
      scheduledIds: [...s.scheduledIds],
      stats: { ...s.stats },
    };
  },

  setUndoSnapshot: (snap) => set({ undo: snap }),

  applyUndoSnapshot: (snap) => {
    set({
      queue: snap.queue,
      scheduledIds: snap.scheduledIds,
      currentWordId: snap.wordId,
      stats: snap.stats,
      undo: null,
    });
  },

  addScheduled: (id) => {
    set((s) => ({
      scheduledIds: s.scheduledIds.includes(id) ? s.scheduledIds : [...s.scheduledIds, id],
    }));
  },

  getSessionCounts: (getWord) => {
    let newCount = 0;
    let learning = 0;
    let review = 0;
    const all = [
      ...get().queue,
      ...get().scheduledIds,
      ...(get().currentWordId ? [get().currentWordId] : []),
    ];
    for (const id of all) {
      if (!id) continue;
      const w = getWord(id);
      if (!w) continue;
      if (w.state === 'new') newCount++;
      else if (w.state === 'learning' || w.state === 'relearning') learning++;
      else if (w.state === 'review') review++;
    }
    return { new: newCount, learning, review };
  },
}));

/** After grading, decide if card waits for a learning timer */
export function shouldScheduleLater(word: VocabWord): boolean {
  if (word.state !== 'learning' && word.state !== 'relearning') return false;
  return new Date(word.dueDate).getTime() > Date.now();
}
