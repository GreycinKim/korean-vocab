import type { Folder, VocabWordInput } from '../types';

export const FOOD_FOLDER: Folder = {
  id: 'food-dining',
  name: 'Food & Dining',
  icon: 'utensils',
  color: '#EF4444',
  wordIds: [],
};

const now = new Date().toISOString();
const f = 'food-dining';

export const FOOD_WORDS: VocabWordInput[] = [
  { korean: '밥', english: 'Rice / Meal', pronunciation: 'Bap', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '물', english: 'Water', pronunciation: 'Mul', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '김치', english: 'Kimchi', pronunciation: 'Kim-chi', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '불고기', english: 'Bulgogi', pronunciation: 'Bul-go-gi', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '비빔밥', english: 'Bibimbap', pronunciation: 'Bi-bim-bap', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '라면', english: 'Ramyeon / Instant noodles', pronunciation: 'Ra-myeon', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '고기', english: 'Meat', pronunciation: 'Go-gi', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '생선', english: 'Fish', pronunciation: 'Saeng-seon', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '야채', english: 'Vegetables', pronunciation: 'Ya-chae', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '과일', english: 'Fruit', pronunciation: 'Gwa-il', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '맛있어요', english: "It's delicious", pronunciation: 'Ma-si-sseo-yo', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '맵다', english: 'Spicy', pronunciation: 'Maep-da', notes: '맵어요 = polite form', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '달다', english: 'Sweet', pronunciation: 'Dal-da', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '식당', english: 'Restaurant', pronunciation: 'Sik-dang', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '메뉴', english: 'Menu', pronunciation: 'Me-nyu', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '주문', english: 'Order', pronunciation: 'Ju-mun', notes: '주문하다 = to order', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '계산', english: 'Bill / Check', pronunciation: 'Gye-san', notes: '계산해 주세요 = check please', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '숟가락', english: 'Spoon', pronunciation: 'Sut-ga-rak', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '젓가락', english: 'Chopsticks', pronunciation: 'Jeot-ga-rak', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
  { korean: '커피', english: 'Coffee', pronunciation: 'Keo-pi', folderId: f, interval: 0, easeFactor: 2.5, dueDate: now },
];
