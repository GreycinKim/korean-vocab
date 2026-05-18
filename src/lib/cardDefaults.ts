import type { VocabWord, VocabWordInput } from '../types';

/** Default SM-2 fields for a brand-new card */
export function newCardSchedule(): Pick<
  VocabWord,
  | 'state'
  | 'interval'
  | 'easeFactor'
  | 'repetitions'
  | 'learningStep'
  | 'lapses'
  | 'reviews'
  | 'dueDate'
  | 'suspended'
> {
  return {
    state: 'new',
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    learningStep: 0,
    lapses: 0,
    reviews: 0,
    dueDate: new Date().toISOString(),
    suspended: false,
  };
}

export function normalizeCard(word: VocabWordInput & { id: string }): VocabWord {
  const merged: VocabWord = {
    ...newCardSchedule(),
    ...word,
    id: word.id,
    pronunciation: word.pronunciation?.trim() || word.english,
    learningStep: word.learningStep ?? 0,
    repetitions: word.repetitions ?? 0,
    lapses: word.lapses ?? 0,
    reviews: word.reviews ?? 0,
    suspended: word.suspended ?? false,
  };

  if (merged.state) return merged;

  let state: VocabWord['state'] = 'new';
  if (merged.interval >= 1 && merged.lastReviewed) {
    state = 'review';
  } else if (merged.lastReviewed) {
    state = merged.score === 'again' ? 'relearning' : 'learning';
  }

  return { ...merged, state };
}
