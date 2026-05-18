import { useEffect } from 'react';
import { useVocabStore } from '../store/vocabStore';

const STORAGE_KEY = 'korean-vocab-app-v1';

export function loadFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as {
        words: Record<string, unknown>;
        folders: Record<string, unknown>;
      };
      useVocabStore.setState({
        words: data.words as ReturnType<typeof useVocabStore.getState>['words'],
        folders: data.folders as ReturnType<typeof useVocabStore.getState>['folders'],
      });
      useVocabStore.getState().migrateSm2Fields();
    }
  } catch {
    console.warn('Failed to load vocab from localStorage');
  }
}

export function usePersistence(): void {
  const words = useVocabStore((s) => s.words);
  const folders = useVocabStore((s) => s.folders);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ words, folders }),
      );
    } catch {
      console.warn('Failed to persist vocab to localStorage');
    }
  }, [words, folders]);
}
