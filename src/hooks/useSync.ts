import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { touchLocalUpdatedAt } from '../lib/syncPayload';
import { schedulePush } from '../store/syncStore';
import { useSettingsStore } from '../store/settingsStore';
import { useStudySettingsStore } from '../store/studySettingsStore';
import { useSyncStore } from '../store/syncStore';
import { useVocabStore } from '../store/vocabStore';

const DEBOUNCE_MS = 2000;

export function useSync(): void {
  const user = useSyncStore((s) => s.user);
  const words = useVocabStore((s) => s.words);
  const folders = useVocabStore((s) => s.folders);
  const initialized = useVocabStore((s) => s.initialized);
  const studySlice = useStudySettingsStore(
    useShallow((s) => ({
      newCardsPerDay: s.newCardsPerDay,
      reviewsPerDay: s.reviewsPerDay,
      learningSteps: s.learningSteps,
      relearningSteps: s.relearningSteps,
      graduatingInterval: s.graduatingInterval,
      easyInterval: s.easyInterval,
      showPronunciation: s.showPronunciation,
    })),
  );
  const sentenceSaveFolderId = useSettingsStore((s) => s.sentenceSaveFolderId);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !initialized) return;

    touchLocalUpdatedAt();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      schedulePush();
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, initialized, words, folders, studySlice, sentenceSaveFolderId]);
}
