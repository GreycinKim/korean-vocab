import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, RotateCcw, Sparkles } from 'lucide-react';
import { useVocabStore } from '../../store/vocabStore';
import {
  canStartFilter,
  countForFilter,
  computeReviewStats,
  FILTER_DESCRIPTIONS,
  FILTER_LABELS,
  totalForFilter,
  type StudyFilter,
} from '../../utils/reviewStats';
import styles from './Home.module.css';

const FILTERS: {
  id: StudyFilter;
  icon: typeof BookOpen;
  colorClass: string;
}[] = [
  { id: 'due', icon: BookOpen, colorClass: styles.due },
  { id: 'new', icon: Sparkles, colorClass: styles.new },
  { id: 'learning', icon: RotateCcw, colorClass: styles.learning },
  { id: 'review', icon: Brain, colorClass: styles.review },
];

export function Home() {
  const navigate = useNavigate();
  const folders = useVocabStore((s) => s.folders);
  const words = useVocabStore((s) => s.words);

  const [folderId, setFolderId] = useState('all');

  const stats = useMemo(
    () => computeReviewStats(Object.values(words), folderId === 'all' ? undefined : folderId),
    [words, folderId],
  );

  const startStudy = (filter: StudyFilter) => {
    if (!canStartFilter(stats, filter)) return;
    navigate(`/flashcards/study?filter=${filter}&folder=${folderId}`);
  };

  return (
    <div className={styles.home}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Study dashboard</h1>
        <p className={styles.subtitle}>
          Red = learning pile, green = review pile. Tap a deck to study — waiting cards
          (1m / 10m timers) are included so you can jump back in.
        </p>
        <label className={styles.folderLabel}>
          Folder
          <select
            className={styles.folderSelect}
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
          >
            <option value="all">All folders</option>
            {Object.values(folders).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className={styles.countBar}>
        <span className={styles.countNew}>{stats.new} new</span>
        <span className={styles.countLearning}>{stats.learning} in learning</span>
        <span className={styles.countReview}>{stats.review} in review</span>
      </div>

      <div className={styles.grid}>
        {FILTERS.map(({ id, icon: Icon, colorClass }) => {
          const dueCount = countForFilter(stats, id);
          const total = totalForFilter(stats, id);
          const canStart = canStartFilter(stats, id);
          const waiting = dueCount === 0 && total > 0;
          return (
            <button
              key={id}
              type="button"
              className={`${styles.card} ${colorClass} ${!canStart ? styles.cardDisabled : ''}`}
              onClick={() => startStudy(id)}
              disabled={!canStart}
            >
              <Icon size={22} className={styles.cardIcon} />
              <span className={styles.cardCount}>{dueCount > 0 ? dueCount : total}</span>
              <span className={styles.cardLabel}>{FILTER_LABELS[id]}</span>
              <span className={styles.cardDueHint}>
                {waiting
                  ? `${total} waiting — tap to continue`
                  : `${dueCount} due now · ${total} total`}
              </span>
              <span className={styles.cardDesc}>{FILTER_DESCRIPTIONS[id]}</span>
            </button>
          );
        })}
      </div>

      <p className={styles.footer}>
        {stats.total} words · {stats.due} due to study now
      </p>
    </div>
  );
}
