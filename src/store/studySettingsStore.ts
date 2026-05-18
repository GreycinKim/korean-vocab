import { create } from 'zustand';
import {
  DEFAULT_STUDY_SETTINGS,
  type StudySettings,
} from '../lib/studySettings';

const STORAGE_KEY = 'korean-vocab-study-settings';

interface StudySettingsStore extends StudySettings {
  load: () => void;
  update: (updates: Partial<StudySettings>) => void;
}

export function getStudySettings(): StudySettings {
  const s = useStudySettingsStore.getState();
  return {
    newCardsPerDay: s.newCardsPerDay,
    reviewsPerDay: s.reviewsPerDay,
    learningSteps: s.learningSteps,
    relearningSteps: s.relearningSteps,
    graduatingInterval: s.graduatingInterval,
    easyInterval: s.easyInterval,
    showPronunciation: s.showPronunciation,
  };
}

export const useStudySettingsStore = create<StudySettingsStore>((set, get) => ({
  ...DEFAULT_STUDY_SETTINGS,

  load: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ ...DEFAULT_STUDY_SETTINGS, ...JSON.parse(raw) });
      }
    } catch {
      set({ ...DEFAULT_STUDY_SETTINGS });
    }
  },

  update: (updates) => {
    const next = { ...get(), ...updates };
    const { load: _, update: __, ...settings } = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    set(updates);
  },
}));
