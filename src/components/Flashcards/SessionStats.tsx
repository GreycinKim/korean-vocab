import styles from './SessionStats.module.css';

interface ProgressBarProps {
  reviewed: number;
  initial: number;
  inLearning: number;
}

export function ProgressBar({ reviewed, initial, inLearning }: ProgressBarProps) {
  const pct = initial > 0 ? Math.min(100, (reviewed / initial) * 100) : 0;
  return (
    <div className={styles.stats}>
      <div className={styles.barWrap}>
        <div className={styles.barFill} style={{ width: `${pct}%` }} />
      </div>
      <p className={styles.label}>
        {reviewed} reviewed · {initial} in deck
        {inLearning > 0 && ` · ${inLearning} still learning`}
      </p>
    </div>
  );
}

interface SessionSummaryProps {
  reviewed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  filterLabel?: string;
  timeMinutes?: number;
  nextDueLabel?: string | null;
  pendingCount?: number;
  onHome: () => void;
  onStudyAgain: () => void;
  onWaitForCards?: () => void;
}

export function SessionSummary({
  reviewed,
  again,
  hard,
  good,
  easy,
  filterLabel,
  timeMinutes,
  nextDueLabel,
  pendingCount = 0,
  onHome,
  onStudyAgain,
  onWaitForCards,
}: SessionSummaryProps) {
  const correct = good + easy;
  const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;

  return (
    <div className={styles.summary}>
      <h2>Session complete</h2>
      {filterLabel && (
        <p className={styles.filterTag}>{filterLabel} deck</p>
      )}
      <div className={styles.summaryGrid}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{reviewed}</div>
          <div className={styles.statLabel}>Reviewed</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{accuracy}%</div>
          <div className={styles.statLabel}>Accuracy</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{again}</div>
          <div className={styles.statLabel}>Again</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{good + easy}</div>
          <div className={styles.statLabel}>Good / Easy</div>
        </div>
      </div>
      <p className={styles.breakdown}>
        Hard: {hard} · Good: {good} · Easy: {easy}
        {timeMinutes != null && ` · Time: ${timeMinutes} min`}
      </p>
      {nextDueLabel && <p className={styles.nextDue}>{nextDueLabel}</p>}
      <div className={styles.summaryActions}>
        <button type="button" className={styles.btnHome} onClick={onHome}>
          Back to dashboard
        </button>
        {pendingCount > 0 && onWaitForCards && (
          <button type="button" className={styles.btnWait} onClick={onWaitForCards}>
            Check for due cards
          </button>
        )}
        <button type="button" className={styles.btnRestart} onClick={onStudyAgain}>
          Study due cards
        </button>
      </div>
    </div>
  );
}
