import type { VocabWordInput } from '../types';

const now = new Date().toISOString();
const f = 'everyday-korean';

/** Extra verb dictionary forms for sentence practice (merged into Everyday Korean on seed). */
export const SENTENCE_VERB_WORDS: VocabWordInput[] = [
  {
    korean: '기도하다',
    english: 'to pray',
    pronunciation: 'Gi-do-ha-da',
    notes: 'Noun: 기도 · Conjugate for tense on sentence board',
    folderId: f,
    pos: 'verb',
    interval: 0,
    easeFactor: 2.5,
    dueDate: now,
  },
  {
    korean: '사랑하다',
    english: 'to love',
    pronunciation: 'Sa-rang-ha-da',
    folderId: f,
    pos: 'verb',
    interval: 0,
    easeFactor: 2.5,
    dueDate: now,
  },
  {
    korean: '믿다',
    english: 'to believe',
    pronunciation: 'Mit-da',
    folderId: f,
    pos: 'verb',
    interval: 0,
    easeFactor: 2.5,
    dueDate: now,
  },
  {
    korean: '가다',
    english: 'to go',
    pronunciation: 'Ga-da',
    folderId: f,
    pos: 'verb',
    interval: 0,
    easeFactor: 2.5,
    dueDate: now,
  },
  {
    korean: '오다',
    english: 'to come',
    pronunciation: 'O-da',
    folderId: f,
    pos: 'verb',
    interval: 0,
    easeFactor: 2.5,
    dueDate: now,
  },
  {
    korean: '먹다',
    english: 'to eat',
    pronunciation: 'Meok-da',
    folderId: f,
    pos: 'verb',
    interval: 0,
    easeFactor: 2.5,
    dueDate: now,
  },
  {
    korean: '하다',
    english: 'to do',
    pronunciation: 'Ha-da',
    folderId: f,
    pos: 'verb',
    interval: 0,
    easeFactor: 2.5,
    dueDate: now,
  },
];
