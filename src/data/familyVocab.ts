import type { Folder, VocabWordInput } from '../types';

export const FAMILY_FOLDER: Folder = {
  id: 'family-people',
  name: 'Family & People',
  icon: 'users',
  color: '#EC4899',
  wordIds: [],
};

const now = new Date().toISOString();
const f = 'family-people';

export const FAMILY_WORDS: VocabWordInput[] = [
  { korean: '가족', english: 'Family', pronunciation: 'Ga-jok', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '아버지', english: 'Father', pronunciation: 'A-beo-ji', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '어머니', english: 'Mother', pronunciation: 'Eo-meo-ni', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '아빠', english: 'Dad', pronunciation: 'Ap-pa', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '엄마', english: 'Mom', pronunciation: 'Eom-ma', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '형', english: 'Older brother (male speaker)', pronunciation: 'Hyeong', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '누나', english: 'Older sister (male speaker)', pronunciation: 'Nu-na', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '오빠', english: 'Older brother (female speaker)', pronunciation: 'Op-pa', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '언니', english: 'Older sister (female speaker)', pronunciation: 'Eon-ni', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '동생', english: 'Younger sibling', pronunciation: 'Dong-saeng', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '할아버지', english: 'Grandfather', pronunciation: 'Har-abeo-ji', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '할머니', english: 'Grandmother', pronunciation: 'Hal-meo-ni', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '친구', english: 'Friend', pronunciation: 'Chin-gu', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '사람', english: 'Person / People', pronunciation: 'Sa-ram', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '남자', english: 'Man / Male', pronunciation: 'Nam-ja', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '여자', english: 'Woman / Female', pronunciation: 'Yeo-ja', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '아이', english: 'Child', pronunciation: 'A-i', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '선생님', english: 'Teacher', pronunciation: 'Seon-saeng-nim', notes: '-님 honorific', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
];
