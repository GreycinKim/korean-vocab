import type { Folder, VocabWordInput } from '../types';

export const NUMBERS_FOLDER: Folder = {
  id: 'numbers-time',
  name: 'Numbers & Time',
  icon: 'clock',
  color: '#0EA5E9',
  wordIds: [],
};

const now = new Date().toISOString();

export const NUMBERS_WORDS: VocabWordInput[] = [
  { korean: '하나', english: 'One', pronunciation: 'Ha-na', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '둘', english: 'Two', pronunciation: 'Dul', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '셋', english: 'Three', pronunciation: 'Set', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '넷', english: 'Four', pronunciation: 'Net', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '다섯', english: 'Five', pronunciation: 'Da-seot', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '여섯', english: 'Six', pronunciation: 'Yeo-seot', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '일곱', english: 'Seven', pronunciation: 'Il-gop', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '여덟', english: 'Eight', pronunciation: 'Yeo-deol', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '아홉', english: 'Nine', pronunciation: 'A-hop', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '열', english: 'Ten', pronunciation: 'Yeol', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '스물', english: 'Twenty', pronunciation: 'Seu-mul', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '서른', english: 'Thirty', pronunciation: 'Seo-reun', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '백', english: 'Hundred', pronunciation: 'Baek', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '천', english: 'Thousand', pronunciation: 'Cheon', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '시간', english: 'Hour / Time', pronunciation: 'Si-gan', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '분', english: 'Minute', pronunciation: 'Bun', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '초', english: 'Second', pronunciation: 'Cho', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '오늘', english: 'Today', pronunciation: 'O-neul', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '어제', english: 'Yesterday', pronunciation: 'Eo-je', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '내일', english: 'Tomorrow', pronunciation: 'Nae-il', folderId: 'numbers-time', interval: 0, easeFactor: 2.5, dueDate: now },
];
