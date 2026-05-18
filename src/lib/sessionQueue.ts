import { compareAsc } from 'date-fns';
import type { VocabWord } from '../types';
import type { StudySettings } from './studySettings';
import { isCardDueNow, isDueToday } from './sm2';

export type StudyFilter = 'due' | 'new' | 'learning' | 'review';

function byDue(a: VocabWord, b: VocabWord): number {
  return compareAsc(new Date(a.dueDate), new Date(b.dueDate));
}

function matchesFolder(word: VocabWord, folderId?: string): boolean {
  if (!folderId || folderId === 'all') return true;
  return word.folderId === folderId;
}

export function buildSessionQueue(
  words: VocabWord[],
  filter: StudyFilter,
  folderId: string | 'all',
  settings: StudySettings,
  dailyCounts?: { newShown: number; reviewShown: number },
): VocabWord[] {
  const fid = folderId === 'all' ? undefined : folderId;
  const pool = words.filter((w) => matchesFolder(w, fid) && !w.suspended);
  const now = Date.now();

  const relearningDue = pool
    .filter((w) => w.state === 'relearning' && isCardDueNow(w, now))
    .sort(byDue);

  const learningDue = pool
    .filter((w) => w.state === 'learning' && isCardDueNow(w, now))
    .sort(byDue);

  const allLearning = pool
    .filter((w) => w.state === 'learning' || w.state === 'relearning')
    .sort(byDue);

  const reviewDue = pool
    .filter((w) => w.state === 'review' && isDueToday(w))
    .sort(byDue);

  const allReview = pool.filter((w) => w.state === 'review').sort(byDue);

  const newCards = pool.filter((w) => w.state === 'new').sort(byDue);

  const reviewCap = settings.reviewsPerDay - (dailyCounts?.reviewShown ?? 0);
  const newCap = settings.newCardsPerDay - (dailyCounts?.newShown ?? 0);

  const cappedReview = reviewDue.slice(0, Math.max(0, reviewCap));
  const cappedNew = newCards.slice(0, Math.max(0, newCap));

  const fullQueue = [...relearningDue, ...learningDue, ...cappedReview, ...cappedNew];

  switch (filter) {
    case 'new':
      return cappedNew;
    case 'learning':
      return allLearning;
    case 'review':
      return allReview;
    case 'due':
    default:
      return fullQueue;
  }
}
