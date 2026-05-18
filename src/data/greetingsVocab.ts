import type { Folder, VocabWordInput } from '../types';

export const GREETINGS_FOLDER: Folder = {
  id: 'greetings-basics',
  name: 'Greetings & Basics',
  icon: 'hand-wave',
  color: '#F59E0B',
  wordIds: [],
};

const now = new Date().toISOString();
const f = 'greetings-basics';

export const GREETINGS_WORDS: VocabWordInput[] = [
  { korean: '안녕하세요', english: 'Hello (formal)', pronunciation: 'An-nyeong-ha-se-yo', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '안녕', english: 'Hi / Bye (informal)', pronunciation: 'An-nyeong', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '감사합니다', english: 'Thank you (formal)', pronunciation: 'Gam-sa-ham-ni-da', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '고맙습니다', english: 'Thank you', pronunciation: 'Go-map-seum-ni-da', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '죄송합니다', english: 'I am sorry (formal)', pronunciation: 'Joe-song-ham-ni-da', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '미안해요', english: 'Sorry', pronunciation: 'Mi-an-hae-yo', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '네', english: 'Yes', pronunciation: 'Ne', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '아니요', english: 'No', pronunciation: 'A-ni-yo', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '안녕히 가세요', english: 'Goodbye (to person leaving)', pronunciation: 'An-nyeong-hi ga-se-yo', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '안녕히 계세요', english: 'Goodbye (to person staying)', pronunciation: 'An-nyeong-hi gye-se-yo', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '만나서 반갑습니다', english: 'Nice to meet you', pronunciation: 'Man-na-seo ban-gap-seum-ni-da', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '이름', english: 'Name', pronunciation: 'I-reum', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '저는', english: 'I am / As for me', pronunciation: 'Jeo-neun', notes: 'Topic marker -는', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '괜찮아요', english: "It's okay / I'm fine", pronunciation: 'Gwaen-chan-a-yo', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '주세요', english: 'Please give me', pronunciation: 'Ju-se-yo', notes: 'Polite request ending', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
];
