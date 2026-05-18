import type { Folder, VocabWordInput } from '../types';
import { CHURCH_FOLDER, CHURCH_WORDS } from './churchVocab';
import { NUMBERS_FOLDER, NUMBERS_WORDS } from './numbersVocab';
import { GREETINGS_FOLDER, GREETINGS_WORDS } from './greetingsVocab';
import { FOOD_FOLDER, FOOD_WORDS } from './foodVocab';
import { FAMILY_FOLDER, FAMILY_WORDS } from './familyVocab';
import { MY_SENTENCES_FOLDER } from './mySentencesFolder';
import { SENTENCE_VERB_WORDS } from './sentenceVerbs';

export const EVERYDAY_FOLDER: Folder = {
  id: 'everyday-korean',
  name: 'Everyday Korean',
  icon: 'message-circle',
  color: '#10B981',
  wordIds: [],
};

export const SEED_DECKS: {
  folder: Folder;
  words: VocabWordInput[];
}[] = [
  { folder: CHURCH_FOLDER, words: CHURCH_WORDS },
  { folder: NUMBERS_FOLDER, words: NUMBERS_WORDS },
  { folder: EVERYDAY_FOLDER, words: SENTENCE_VERB_WORDS },
  { folder: GREETINGS_FOLDER, words: GREETINGS_WORDS },
  { folder: FOOD_FOLDER, words: FOOD_WORDS },
  { folder: FAMILY_FOLDER, words: FAMILY_WORDS },
  { folder: MY_SENTENCES_FOLDER, words: [] },
];

export const SEED_VERSION = 'korean-vocab-seed-v4';
