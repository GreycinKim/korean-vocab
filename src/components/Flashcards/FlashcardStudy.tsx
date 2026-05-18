import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Undo2 } from 'lucide-react';
import type { StudyFilter } from '../../lib/sessionQueue';
import type { Grade } from '../../lib/sm2';
import { shouldScheduleLater } from '../../store/sessionStore';
import { useVocabStore } from '../../store/vocabStore';
import { useSessionStore, type UndoSnapshot } from '../../store/sessionStore';
import { useToastStore } from '../../store/toastStore';
import { FILTER_LABELS } from '../../utils/reviewStats';
import { Flashcard } from './Flashcard';
import { DeckControls } from './DeckControls';
import { ProgressBar, SessionSummary } from './SessionStats';
import styles from './FlashcardStudy.module.css';

function parseFilter(value: string | null): StudyFilter {
  const allowed: StudyFilter[] = ['due', 'new', 'learning', 'review'];
  if (value && allowed.includes(value as StudyFilter)) return value as StudyFilter;
  return 'due';
}

export function FlashcardStudy() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = parseFilter(searchParams.get('filter'));
  const folderId = searchParams.get('folder') ?? 'all';

  const words = useVocabStore((s) => s.words);
  const gradeWord = useVocabStore((s) => s.gradeWord);
  const restoreWord = useVocabStore((s) => s.restoreWord);
  const getStudyQueue = useVocabStore((s) => s.getStudyQueue);
  const addToast = useToastStore((s) => s.addToast);

  const active = useSessionStore((s) => s.active);
  const startSession = useSessionStore((s) => s.startSession);
  const endSession = useSessionStore((s) => s.endSession);
  const submitGrade = useSessionStore((s) => s.submitGrade);
  const getCurrentWordId = useSessionStore((s) => s.getCurrentWordId);
  const isQueueExhausted = useSessionStore((s) => s.isQueueExhausted);
  const resumeScheduledDue = useSessionStore((s) => s.resumeScheduledDue);
  const getProgress = useSessionStore((s) => s.getProgress);
  const getStats = useSessionStore((s) => s.getStats);
  const pollScheduled = useSessionStore((s) => s.pollScheduled);
  const getSessionCounts = useSessionStore((s) => s.getSessionCounts);
  const setUndoSnapshot = useSessionStore((s) => s.setUndoSnapshot);
  const applyUndoSnapshot = useSessionStore((s) => s.applyUndoSnapshot);
  const addScheduled = useSessionStore((s) => s.addScheduled);
  const undo = useSessionStore((s) => s.undo);
  const sessionFilter = useSessionStore((s) => s.filter);
  const startedAt = useSessionStore((s) => s.startedAt);
  const scheduledIds = useSessionStore((s) => s.scheduledIds);

  const [showAnswer, setShowAnswer] = useState(false);
  const [initError, setInitError] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [nextDueLabel, setNextDueLabel] = useState<string | null>(null);
  const initRef = useRef(false);

  const wordId = getCurrentWordId();
  const card = wordId ? words[wordId] : null;
  const progress = getProgress();
  const stats = getStats();
  const queueExhausted = active && isQueueExhausted();
  const counts = getSessionCounts((id) => words[id]);

  const getWord = useCallback((id: string) => words[id], [words]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const queue = getStudyQueue(filter, folderId === 'all' ? undefined : folderId);
    if (queue.length === 0) {
      setInitError(true);
      addToast(`No ${FILTER_LABELS[filter].toLowerCase()} cards to study`, 'info');
      return;
    }
    startSession(
      queue.map((w) => w.id),
      folderId as string | 'all',
      filter,
    );
    setShowAnswer(false);

    return () => {
      endSession();
      initRef.current = false;
    };
  }, [filter, folderId, getStudyQueue, startSession, endSession, addToast]);

  useEffect(() => {
    if (!active || queueExhausted) return;
    const tick = () => pollScheduled(getWord);
    const id = window.setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [active, queueExhausted, pollScheduled, getWord]);

  useEffect(() => {
    if (!queueExhausted) return;

    const updateLabel = () => {
      const ids = useSessionStore.getState().scheduledIds;
      if (ids.length === 0) {
        setNextDueLabel(null);
        return;
      }
      const times = ids
        .map((id) => words[id]?.dueDate)
        .filter(Boolean)
        .map((d) => new Date(d!).getTime());
      if (times.length === 0) {
        setNextDueLabel(null);
        return;
      }
      const soonest = Math.min(...times);
      const mins = Math.max(1, Math.ceil((soonest - Date.now()) / 60_000));
      setNextDueLabel(`${ids.length} card(s) due in ~${mins} min — wait or study again later`);
    };

    updateLabel();
    const tick = () => {
      if (resumeScheduledDue(getWord)) {
        setShowAnswer(false);
        return;
      }
      updateLabel();
    };
    const id = window.setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [queueExhausted, words, resumeScheduledDue, getWord]);

  const exitSession = useCallback(() => {
    endSession();
    navigate('/');
  }, [endSession, navigate]);

  const handleStudyAgain = useCallback(() => {
    resumeScheduledDue(getWord);
    const queue = getStudyQueue(filter, folderId === 'all' ? undefined : folderId);
    if (queue.length > 0) {
      startSession(
        queue.map((w) => w.id),
        folderId as string | 'all',
        filter,
      );
      setShowAnswer(false);
      return;
    }
    addToast('No cards due yet — learning cards return in 1–10 minutes', 'info');
  }, [filter, folderId, getStudyQueue, startSession, resumeScheduledDue, getWord, addToast]);

  const handleUndo = () => {
    if (!undo) return;
    restoreWord(undo.word);
    applyUndoSnapshot(undo);
    setShowAnswer(false);
    addToast('Undid last card', 'info');
  };

  const handleGrade = useCallback(
    (grade: Grade) => {
      if (!card || !showAnswer) {
        addToast('Tap the card to show the answer first', 'info');
        return;
      }

      const snap: UndoSnapshot = {
        wordId: card.id,
        word: { ...card },
        queue: [...useSessionStore.getState().queue],
        scheduledIds: [...useSessionStore.getState().scheduledIds],
        stats: { ...useSessionStore.getState().stats },
      };

      gradeWord(card.id, grade);
      submitGrade(grade);

      const updated = useVocabStore.getState().words[card.id];
      if (updated && shouldScheduleLater(updated)) {
        addScheduled(card.id);
      }

      setUndoSnapshot(snap);
      setShowAnswer(false);
    },
    [card, showAnswer, gradeWord, submitGrade, addScheduled, setUndoSnapshot, addToast],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!active || queueExhausted) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        setShowAnswer((s) => !s);
      }
      if (e.key === 'Escape') {
        setConfirmExit(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if (showAnswer) {
        const map: Record<string, Grade> = {
          '1': 'again',
          '2': 'hard',
          '3': 'good',
          '4': 'easy',
        };
        if (map[e.key]) {
          e.preventDefault();
          handleGrade(map[e.key]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, queueExhausted, showAnswer, handleGrade, handleUndo]);

  if (initError) {
    return (
      <div className={styles.study}>
        <p className={styles.tapHint}>No cards available for this deck.</p>
        <button type="button" className={styles.exitBtn} onClick={exitSession}>
          <ArrowLeft size={18} />
          Back to dashboard
        </button>
      </div>
    );
  }

  if (!active) {
    return (
      <div className={styles.loading}>
        <Loader2 size={28} className={styles.spin} />
      </div>
    );
  }

  if (queueExhausted) {
    const timeMin = Math.max(1, Math.round((Date.now() - startedAt) / 60_000));
    const pendingCount = scheduledIds.length;
    return (
      <div className={styles.study}>
        <SessionSummary
          reviewed={stats.reviewed}
          again={stats.again}
          hard={stats.hard}
          good={stats.good}
          easy={stats.easy}
          filterLabel={FILTER_LABELS[sessionFilter]}
          timeMinutes={timeMin}
          nextDueLabel={nextDueLabel}
          pendingCount={pendingCount}
          onHome={exitSession}
          onStudyAgain={handleStudyAgain}
          onWaitForCards={() => {
            if (resumeScheduledDue(getWord)) {
              setShowAnswer(false);
            } else {
              addToast('Still waiting — cards return after 1m / 10m steps', 'info');
            }
          }}
        />
      </div>
    );
  }

  if (!card) {
    return (
      <div className={styles.loading}>
        <Loader2 size={28} className={styles.spin} />
      </div>
    );
  }

  return (
    <div className={styles.study}>
      <header className={styles.topBar}>
        <button
          type="button"
          className={styles.exitBtn}
          onClick={() => (confirmExit ? exitSession() : setConfirmExit(true))}
        >
          <ArrowLeft size={18} />
          {confirmExit ? 'Leave?' : 'Exit'}
        </button>
        <div className={styles.sessionCounters}>
          <span className={styles.cNew}>{counts.new} new</span>
          <span className={styles.cLearning}>{counts.learning} learning</span>
          <span className={styles.cReview}>{counts.review} review</span>
        </div>
        <button
          type="button"
          className={styles.undoBtn}
          onClick={handleUndo}
          disabled={!undo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>
      </header>

      <ProgressBar
        reviewed={progress.reviewed}
        initial={progress.initial}
        inLearning={progress.scheduled}
      />

      {!showAnswer && (
        <p className={styles.tapHint}>Tap the card to reveal the answer</p>
      )}

      <div className={styles.cardArea}>
        <Flashcard word={card} flipped={showAnswer} onFlip={() => setShowAnswer((s) => !s)} />
      </div>

      <DeckControls card={card} onGrade={handleGrade} disabled={!showAnswer} />
    </div>
  );
}
