import type { VocabWord } from '../../types';
import type { Grade } from '../../lib/sm2';
import { getIntervalPreview, showHardButton } from '../../lib/sm2';
import { getStudySettings } from '../../store/studySettingsStore';
import styles from './DeckControls.module.css';

interface DeckControlsProps {
  card: VocabWord;
  onGrade: (grade: Grade) => void;
  disabled?: boolean;
}

const BUTTONS: {
  grade: Grade;
  label: string;
  key: string;
  className: string;
}[] = [
  { grade: 'again', label: 'Again', key: '1', className: styles.again },
  { grade: 'hard', label: 'Hard', key: '2', className: styles.hard },
  { grade: 'good', label: 'Good', key: '3', className: styles.good },
  { grade: 'easy', label: 'Easy', key: '4', className: styles.easy },
];

export function DeckControls({ card, onGrade, disabled = false }: DeckControlsProps) {
  const settings = getStudySettings();

  const visibleButtons = BUTTONS.filter(
    (b) => b.grade !== 'hard' || showHardButton(card),
  );

  return (
    <div className={styles.wrap}>
      {disabled && (
        <p className={styles.disabledHint}>Tap the card to show the answer first</p>
      )}
      <div
        className={`${styles.controls} ${disabled ? styles.controlsDisabled : ''} ${
          visibleButtons.length === 3 ? styles.controlsThree : ''
        }`}
      >
        {visibleButtons.map(({ grade, label, key, className }) => (
          <button
            key={grade}
            type="button"
            className={`${styles.btn} ${className}`}
            onClick={() => onGrade(grade)}
            disabled={disabled}
          >
            <span className={styles.btnLabel}>{label}</span>
            <span className={styles.preview}>
              {getIntervalPreview(card, grade, settings)}
            </span>
            <span className={styles.kbd}>{key}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
