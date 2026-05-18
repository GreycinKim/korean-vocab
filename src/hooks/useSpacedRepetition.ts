import { compareAsc } from 'date-fns';
import type { VocabWord } from '../types';

export function sortByDueDate(words: VocabWord[]): VocabWord[] {
  return [...words].sort((a, b) =>
    compareAsc(new Date(a.dueDate), new Date(b.dueDate)),
  );
}
