import { SEED_DECKS } from '../data/seedDecks';
import { DEFAULT_STUDY_SETTINGS, type StudySettings } from './studySettings';
import { useSettingsStore } from '../store/settingsStore';
import { useStudySettingsStore } from '../store/studySettingsStore';
import { useVocabStore } from '../store/vocabStore';
import type { SyncPayload } from '../types/sync';
import { SYNC_PAYLOAD_VERSION } from '../types/sync';

export const UPDATED_AT_KEY = 'korean-vocab-app-updated-at';
export const HAS_SYNCED_KEY = 'korean-vocab-has-synced';
const STORAGE_KEY = 'korean-vocab-app-v1';

const SEED_WORD_COUNT = SEED_DECKS.reduce((n, deck) => n + deck.words.length, 0);

export function hasSyncedBefore(): boolean {
  return localStorage.getItem(HAS_SYNCED_KEY) === 'true';
}

export function markSynced(): void {
  localStorage.setItem(HAS_SYNCED_KEY, 'true');
}

export function isLikelySeedOnly(words: Record<string, unknown>): boolean {
  return Object.keys(words).length <= SEED_WORD_COUNT + 2;
}

export function getLocalUpdatedAt(): string | null {
  return localStorage.getItem(UPDATED_AT_KEY);
}

export function touchLocalUpdatedAt(iso = new Date().toISOString()): void {
  localStorage.setItem(UPDATED_AT_KEY, iso);
}

export function buildPayloadFromStores(updatedAt?: string): SyncPayload {
  const vocab = useVocabStore.getState();
  const study = useStudySettingsStore.getState();
  const settings = useSettingsStore.getState();

  const studySettings: StudySettings = {
    newCardsPerDay: study.newCardsPerDay,
    reviewsPerDay: study.reviewsPerDay,
    learningSteps: study.learningSteps,
    relearningSteps: study.relearningSteps,
    graduatingInterval: study.graduatingInterval,
    easyInterval: study.easyInterval,
    showPronunciation: study.showPronunciation,
  };

  return {
    version: SYNC_PAYLOAD_VERSION,
    words: vocab.words,
    folders: vocab.folders,
    studySettings,
    sentenceSaveFolderId: settings.sentenceSaveFolderId,
    updatedAt: updatedAt ?? getLocalUpdatedAt() ?? new Date().toISOString(),
  };
}

export function applyPayloadToStores(payload: SyncPayload): void {
  useVocabStore.setState({
    words: payload.words,
    folders: payload.folders,
    initialized: true,
  });
  useVocabStore.getState().migrateSm2Fields();

  useStudySettingsStore.setState({
    ...DEFAULT_STUDY_SETTINGS,
    ...payload.studySettings,
  });

  useSettingsStore.setState({
    sentenceSaveFolderId: payload.sentenceSaveFolderId,
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ words: payload.words, folders: payload.folders }),
  );
  localStorage.setItem('korean-vocab-study-settings', JSON.stringify(payload.studySettings));
  localStorage.setItem(
    'korean-vocab-sentence-folder',
    payload.sentenceSaveFolderId,
  );
  touchLocalUpdatedAt(payload.updatedAt);
}

export function hasMeaningfulLocalData(): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as { words?: Record<string, unknown> };
    return Object.keys(data.words ?? {}).length > 0;
  } catch {
    return false;
  }
}
