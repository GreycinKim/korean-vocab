export type ScoreLevel = 'new' | 'again' | 'hard' | 'good' | 'easy';

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export type Page = 'home' | 'flashcards' | 'library' | 'structure';

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'particle' | 'other';

export type VerbTense = 'present' | 'past' | 'future';

export type PuzzleMode = 'free' | 'sentence';

export interface VocabWord {
  id: string;
  korean: string;
  english: string;
  pronunciation: string;
  notes?: string;
  folderId: string;
  tags?: string[];
  pos?: PartOfSpeech;
  dictionaryForm?: string;
  /** SM-2 schedule */
  state: CardState;
  interval: number;
  easeFactor: number;
  repetitions: number;
  learningStep: number;
  lapses: number;
  reviews: number;
  dueDate: string;
  lastReviewed?: string;
  score?: ScoreLevel;
  suspended?: boolean;
  previousInterval?: number;
}

/** Input for creating a card — SM-2 fields default via newCardSchedule() */
export type VocabWordInput = Pick<VocabWord, 'korean' | 'english' | 'folderId'> &
  Partial<Omit<VocabWord, 'id' | 'korean' | 'english' | 'folderId'>>;

export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId?: string;
  wordIds: string[];
}

export interface DroppedTile {
  wordId: string;
  position: { x: number; y: number };
  revealed: boolean;
}

export interface SentencePiece {
  id: string;
  type: 'word' | 'particle';
  wordId?: string;
  particleKey?: string;
  particleForm?: string;
  tense?: VerbTense;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

/** Phase 1 — pattern library entry */
export interface SentencePattern {
  id: string;
  label: string;
  description: string;
  englishExample: string;
  koreanGold: string;
  slotHints: string[];
}

/** Phase 2 — grammar check API result */
export interface GrammarCheckResult {
  correct: boolean;
  score: number;
  feedback: string;
  correctedSentence?: string;
  tips: string[];
}

/** Phase 3 — AI chunk for building tiles */
export interface SentenceChunk {
  korean: string;
  english: string;
  role: 'subject' | 'object' | 'verb' | 'particle' | 'other';
  particleKey?: string;
  note?: string;
}

export interface GenerateSentenceResult {
  english: string;
  korean: string;
  chunks: SentenceChunk[];
}
