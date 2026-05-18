import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Folder, VocabWord, VocabWordInput } from '../types';
import { SEED_DECKS, SEED_VERSION } from '../data/seedDecks';
import { sortByDueDate } from '../hooks/useSpacedRepetition';
import { normalizeCard, newCardSchedule } from '../lib/cardDefaults';
import { gradeCard, type Grade } from '../lib/sm2';
import { buildSessionQueue, type StudyFilter } from '../lib/sessionQueue';
import { computeReviewStats, type ReviewStats } from '../utils/reviewStats';
import { getStudySettings } from './studySettingsStore';

function normalizeWords(words: Record<string, VocabWord>): Record<string, VocabWord> {
  const out: Record<string, VocabWord> = {};
  for (const [id, w] of Object.entries(words)) {
    out[id] = normalizeCard(w);
  }
  return out;
}

function buildInitialState(): { words: Record<string, VocabWord>; folders: Record<string, Folder> } {
  const words: Record<string, VocabWord> = {};
  const folders: Record<string, Folder> = {};

  for (const { folder, words: seedWords } of SEED_DECKS) {
    const wordIds: string[] = [];
    for (const w of seedWords) {
      const id = uuid();
      words[id] = normalizeCard({ ...w, id });
      wordIds.push(id);
    }
    folders[folder.id] = { ...folder, wordIds };
  }

  return { words, folders };
}

function applySeedDecks(
  words: Record<string, VocabWord>,
  folders: Record<string, Folder>,
  onlyMissing: boolean,
): { words: Record<string, VocabWord>; folders: Record<string, Folder>; changed: boolean } {
  const nextWords = { ...words };
  const nextFolders = { ...folders };
  let changed = false;

  for (const { folder, words: seedWords } of SEED_DECKS) {
    if (onlyMissing && nextFolders[folder.id]) continue;

    const wordIds: string[] = [];
    for (const w of seedWords) {
      const id = uuid();
      nextWords[id] = normalizeCard({ ...w, id });
      wordIds.push(id);
    }
    nextFolders[folder.id] = { ...folder, wordIds };
    changed = true;
  }

  return { words: nextWords, folders: nextFolders, changed };
}

interface VocabStore {
  words: Record<string, VocabWord>;
  folders: Record<string, Folder>;
  initialized: boolean;
  initialize: () => void;
  migrateSeedDecks: () => void;
  migrateSeedWords: () => void;
  migrateSm2Fields: () => void;
  addWord: (word: VocabWordInput) => string;
  updateWord: (id: string, updates: Partial<VocabWord>) => void;
  deleteWord: (id: string) => void;
  addFolder: (folder: Omit<Folder, 'id' | 'wordIds'>) => string;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  moveWordToFolder: (wordId: string, folderId: string) => void;
  importCSV: (csv: string, folderId: string) => number;
  gradeWord: (id: string, grade: Grade) => void;
  restoreWord: (word: VocabWord) => void;
  getDueWords: (folderId?: string) => VocabWord[];
  getReviewStats: (folderId?: string) => ReviewStats;
  getStudyQueue: (filter: StudyFilter, folderId?: string) => VocabWord[];
  getWordsByFolder: (folderId: string) => VocabWord[];
  searchWords: (query: string) => VocabWord[];
}

export const useVocabStore = create<VocabStore>((set, get) => ({
  ...buildInitialState(),
  initialized: false,

  initialize: () => {
    const hasStorage = localStorage.getItem('korean-vocab-app-v1');
    if (hasStorage) {
      get().migrateSm2Fields();
      if (!localStorage.getItem(SEED_VERSION)) {
        get().migrateSeedDecks();
        get().migrateSeedWords();
        localStorage.setItem(SEED_VERSION, 'true');
      }
      set({ initialized: true });
      return;
    }
    if (!localStorage.getItem('appInitialized')) {
      localStorage.setItem('appInitialized', 'true');
    }
    localStorage.setItem(SEED_VERSION, 'true');
    set({ ...buildInitialState(), initialized: true });
  },

  migrateSm2Fields: () => {
    set((state) => {
      const words = normalizeWords(state.words);
      const changed = Object.keys(words).some(
        (id) => words[id].state !== state.words[id]?.state,
      );
      return changed ? { words } : state;
    });
  },

  migrateSeedDecks: () => {
    set((state) => {
      const result = applySeedDecks(state.words, state.folders, true);
      if (!result.changed) return state;
      return { words: result.words, folders: result.folders };
    });
  },

  migrateSeedWords: () => {
    set((state) => {
      const words = { ...state.words };
      const folders = { ...state.folders };
      let changed = false;

      for (const { folder, words: seedWords } of SEED_DECKS) {
        if (!folders[folder.id] || seedWords.length === 0) continue;
        const wordIds = [...folders[folder.id].wordIds];

        for (const w of seedWords) {
          const exists = Object.values(words).some(
            (x) => x.korean === w.korean && x.folderId === folder.id,
          );
          if (exists) continue;
          const id = uuid();
          words[id] = normalizeCard({ ...w, id });
          wordIds.push(id);
          changed = true;
        }

        folders[folder.id] = { ...folders[folder.id], wordIds };
      }

      return changed ? { words, folders } : state;
    });
  },

  addWord: (word) => {
    const id = uuid();
    const schedule = newCardSchedule();
    const newWord: VocabWord = normalizeCard({ ...schedule, ...word, id });
    set((state) => {
      const folder = state.folders[word.folderId];
      if (!folder) return state;
      return {
        words: { ...state.words, [id]: newWord },
        folders: {
          ...state.folders,
          [word.folderId]: {
            ...folder,
            wordIds: [...folder.wordIds, id],
          },
        },
      };
    });
    return id;
  },

  updateWord: (id, updates) => {
    set((state) => {
      const word = state.words[id];
      if (!word) return state;
      return { words: { ...state.words, [id]: { ...word, ...updates } } };
    });
  },

  restoreWord: (word) => {
    set((state) => ({
      words: { ...state.words, [word.id]: word },
    }));
  },

  deleteWord: (id) => {
    set((state) => {
      const word = state.words[id];
      if (!word) return state;
      const { [id]: _, ...words } = state.words;
      const folders = { ...state.folders };
      const folder = folders[word.folderId];
      if (folder) {
        folders[word.folderId] = {
          ...folder,
          wordIds: folder.wordIds.filter((wid) => wid !== id),
        };
      }
      return { words, folders };
    });
  },

  addFolder: (folder) => {
    const id = uuid();
    set((state) => ({
      folders: {
        ...state.folders,
        [id]: { ...folder, id, wordIds: [] },
      },
    }));
    return id;
  },

  updateFolder: (id, updates) => {
    set((state) => {
      const folder = state.folders[id];
      if (!folder) return state;
      return { folders: { ...state.folders, [id]: { ...folder, ...updates } } };
    });
  },

  deleteFolder: (id) => {
    set((state) => {
      const folder = state.folders[id];
      if (!folder) return state;
      const words = { ...state.words };
      folder.wordIds.forEach((wid) => delete words[wid]);
      const { [id]: _, ...folders } = state.folders;
      return { words, folders };
    });
  },

  moveWordToFolder: (wordId, folderId) => {
    set((state) => {
      const word = state.words[wordId];
      if (!word || word.folderId === folderId) return state;
      const oldFolder = state.folders[word.folderId];
      const newFolder = state.folders[folderId];
      if (!oldFolder || !newFolder) return state;
      const folders = { ...state.folders };
      folders[word.folderId] = {
        ...oldFolder,
        wordIds: oldFolder.wordIds.filter((id) => id !== wordId),
      };
      folders[folderId] = {
        ...newFolder,
        wordIds: [...newFolder.wordIds, wordId],
      };
      return {
        words: { ...state.words, [wordId]: { ...word, folderId } },
        folders,
      };
    });
  },

  importCSV: (csv, folderId) => {
    const lines = csv.trim().split(/\r?\n/);
    let count = 0;
    const startIdx = lines[0]?.toLowerCase().includes('korean') ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 2) continue;
      const [korean, english, pronunciation = '', notes = ''] = parts;
      get().addWord({
        korean,
        english,
        pronunciation: pronunciation || english,
        notes: notes || undefined,
        folderId,
      });
      count++;
    }
    return count;
  },

  gradeWord: (id, grade) => {
    const word = get().words[id];
    if (!word) return;
    const updates = gradeCard(word, grade, getStudySettings());
    get().updateWord(id, updates);
  },

  getDueWords: (folderId) => {
    return get().getStudyQueue('due', folderId);
  },

  getReviewStats: (folderId) => {
    return computeReviewStats(Object.values(get().words), folderId);
  },

  getStudyQueue: (filter, folderId) => {
    const list = buildSessionQueue(
      Object.values(get().words),
      filter,
      folderId ?? 'all',
      getStudySettings(),
    );
    return sortByDueDate(list);
  },

  getWordsByFolder: (folderId) => {
    const folder = get().folders[folderId];
    if (!folder) return [];
    return folder.wordIds.map((id) => get().words[id]).filter(Boolean);
  },

  searchWords: (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return Object.values(get().words);
    return Object.values(get().words).filter(
      (w) =>
        w.korean.includes(q) ||
        w.english.toLowerCase().includes(q) ||
        w.pronunciation.toLowerCase().includes(q),
    );
  },
}));
