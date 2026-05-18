import type { Folder, VocabWord } from './index';
import type { StudySettings } from '../lib/studySettings';

export const SYNC_PAYLOAD_VERSION = 1;

export interface SyncPayload {
  version: typeof SYNC_PAYLOAD_VERSION;
  words: Record<string, VocabWord>;
  folders: Record<string, Folder>;
  studySettings: StudySettings;
  sentenceSaveFolderId: string;
  updatedAt: string;
}
