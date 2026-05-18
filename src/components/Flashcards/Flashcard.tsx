import type { VocabWord } from '../../types';
import { VocabAudioButton } from './VocabAudioButton';
import styles from './Flashcard.module.css';

interface FlashcardProps {
  word: VocabWord;
  flipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ word, flipped, onFlip }: FlashcardProps) {
  return (
    <div
      className={styles.cardWrap}
      onClick={onFlip}
      onKeyDown={(e) => e.key === ' ' && (e.preventDefault(), onFlip())}
      role="button"
      tabIndex={0}
      aria-label={flipped ? 'Show Korean' : 'Show English'}
    >
      <div className={`${styles.cardInner} ${flipped ? styles.cardInnerFlipped : ''}`}>
        <div className={styles.cardFront}>
          <VocabAudioButton text={word.korean} label="Play Korean" />
          <p className={styles.korean}>{word.korean}</p>
          {word.pronunciation.trim() && (
            <p className={styles.pronunciation}>{word.pronunciation}</p>
          )}
          <span className={styles.hint}>Space to flip</span>
        </div>
        <div className={styles.cardBack}>
          <VocabAudioButton text={word.english} label="Play English" />
          <p className={styles.english}>{word.english}</p>
          {word.notes && <p className={styles.notes}>{word.notes}</p>}
        </div>
      </div>
    </div>
  );
}
