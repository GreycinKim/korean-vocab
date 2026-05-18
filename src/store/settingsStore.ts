import { create } from 'zustand';

const SENTENCE_FOLDER_STORAGE = 'korean-vocab-sentence-folder';

interface SettingsStore {
  sentenceSaveFolderId: string;
  loadSettings: () => void;
  setSentenceSaveFolderId: (folderId: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  sentenceSaveFolderId: 'my-sentences',

  loadSettings: () => {
    try {
      const folderId = localStorage.getItem(SENTENCE_FOLDER_STORAGE) ?? 'my-sentences';
      set({ sentenceSaveFolderId: folderId });
    } catch {
      set({ sentenceSaveFolderId: 'my-sentences' });
    }
  },

  setSentenceSaveFolderId: (folderId) => {
    localStorage.setItem(SENTENCE_FOLDER_STORAGE, folderId);
    set({ sentenceSaveFolderId: folderId });
  },
}));
