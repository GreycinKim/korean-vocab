import type { VocabWord } from '../types';
import { isCardDueNow, isDueToday } from '../lib/sm2';
import type { StudyFilter } from '../lib/sessionQueue';

export type { StudyFilter };

export interface ReviewStats {
  /** Cards you can study right now */
  due: number;
  /** Total never studied */
  new: number;
  /** New cards (same as new — all are available) */
  newDue: number;
  /** Total in learning + relearning (shown in red on dashboard) */
  learning: number;
  /** Learning/relearning due right now */
  learningDue: number;
  relearning: number;
  /** Total in review state (shown in green on dashboard) */
  review: number;
  /** Review cards due today */
  reviewDue: number;
  total: number;
}

function matchesFolder(word: VocabWord, folderId?: string): boolean {
  if (!folderId || folderId === 'all') return true;
  return word.folderId === folderId;
}

export function computeReviewStats(
  words: VocabWord[],
  folderId?: string,
): ReviewStats {
  const stats: ReviewStats = {
    due: 0,
    new: 0,
    newDue: 0,
    learning: 0,
    learningDue: 0,
    relearning: 0,
    review: 0,
    reviewDue: 0,
    total: 0,
  };

  const now = Date.now();
  for (const word of words) {
    if (!matchesFolder(word, folderId) || word.suspended) continue;
    stats.total++;

    if (word.state === 'new') {
      stats.new++;
      stats.newDue++;
      stats.due++;
      continue;
    }

    if (word.state === 'learning') {
      stats.learning++;
      if (isCardDueNow(word, now)) {
        stats.learningDue++;
        stats.due++;
      }
      continue;
    }

    if (word.state === 'relearning') {
      stats.relearning++;
      stats.learning++;
      if (isCardDueNow(word, now)) {
        stats.learningDue++;
        stats.due++;
      }
      continue;
    }

    if (word.state === 'review') {
      stats.review++;
      if (isDueToday(word)) {
        stats.reviewDue++;
        stats.due++;
      }
    }
  }

  return stats;
}

/** Cards due right now for this filter (shown on deck button) */
export function countForFilter(stats: ReviewStats, filter: StudyFilter): number {
  switch (filter) {
    case 'due':
      return stats.due;
    case 'new':
      return stats.newDue;
    case 'learning':
      return stats.learningDue;
    case 'review':
      return stats.reviewDue;
    default:
      return stats.due;
  }
}

/** Total cards in this pile — deck is clickable if > 0 */
export function totalForFilter(stats: ReviewStats, filter: StudyFilter): number {
  switch (filter) {
    case 'due':
      return stats.due;
    case 'new':
      return stats.new;
    case 'learning':
      return stats.learning;
    case 'review':
      return stats.review;
    default:
      return stats.due;
  }
}

export function canStartFilter(stats: ReviewStats, filter: StudyFilter): boolean {
  return totalForFilter(stats, filter) > 0;
}

export const FILTER_LABELS: Record<StudyFilter, string> = {
  due: 'Study all due',
  new: 'New',
  learning: 'Learning',
  review: 'Review',
};

export const FILTER_DESCRIPTIONS: Record<StudyFilter, string> = {
  due: 'Relearning → Learning → Review → New (Anki order)',
  new: 'Never studied — starts 1m → 10m learning steps',
  learning: 'All learning cards — due now first, then waiting timers',
  review: 'All review cards — continue studying your review pile',
};
