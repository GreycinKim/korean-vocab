import { addDays, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import type { CardState, ScoreLevel, VocabWord } from '../types';
import type { StudySettings } from './studySettings';
import { DEFAULT_STUDY_SETTINGS } from './studySettings';

export type Grade = Exclude<ScoreLevel, 'new'>;

export function applyFuzz(intervalDays: number): number {
  const fuzz = Math.random() * 0.1 - 0.05;
  return Math.max(1, Math.round(intervalDays * (1 + fuzz)));
}

export function calculateDueDateDays(intervalDays: number): string {
  const due = setMilliseconds(setSeconds(setMinutes(setHours(addDays(new Date(), intervalDays), 4), 0), 0), 0);
  return due.toISOString();
}

export function calculateDueDateMinutes(minutes: number): string {
  return addMinutes(new Date(), minutes).toISOString();
}

function clampEase(ease: number): number {
  return Math.min(3.0, Math.max(1.3, ease));
}

function learningStepMinutes(settings: StudySettings, state: CardState, step: number): number {
  const steps = state === 'relearning' ? settings.relearningSteps : settings.learningSteps;
  return steps[step] ?? steps[steps.length - 1] ?? 10;
}

export function gradeCard(
  card: VocabWord,
  grade: Grade,
  settings: StudySettings = DEFAULT_STUDY_SETTINGS,
): Partial<VocabWord> {
  const now = new Date();
  let {
    interval,
    easeFactor,
    repetitions,
    learningStep,
    lapses,
    reviews,
  } = card;
  let state: CardState = card.state === 'new' ? 'learning' : card.state;

  const previousInterval = interval;
  reviews += 1;
  let dueDate: string;
  let score: ScoreLevel = grade;

  if (state === 'learning') {
    if (grade === 'again') {
      state = 'learning';
      learningStep = 0;
      interval = 0;
      repetitions = 0;
      dueDate = calculateDueDateMinutes(learningStepMinutes(settings, 'learning', 0));
    } else if (grade === 'good') {
      const nextStep = learningStep + 1;
      if (nextStep >= settings.learningSteps.length) {
        state = 'review';
        interval = settings.graduatingInterval;
        repetitions = 1;
        learningStep = 0;
        easeFactor = clampEase(easeFactor);
        dueDate = calculateDueDateDays(applyFuzz(interval));
      } else {
        state = 'learning';
        learningStep = nextStep;
        interval = 0;
        repetitions = 0;
        dueDate = calculateDueDateMinutes(learningStepMinutes(settings, 'learning', nextStep));
      }
    } else if (grade === 'easy') {
      state = 'review';
      interval = settings.easyInterval;
      repetitions = 1;
      learningStep = 0;
      easeFactor = clampEase(easeFactor + 0.15);
      dueDate = calculateDueDateDays(applyFuzz(interval));
    } else {
      // hard on learning — treat as good but stay on current step with shorter delay
      const mins = learningStepMinutes(settings, 'learning', learningStep);
      state = 'learning';
      interval = 0;
      dueDate = calculateDueDateMinutes(Math.max(1, Math.floor(mins * 1.5)));
    }
  } else if (state === 'review') {
    if (grade === 'again') {
      state = 'relearning';
      learningStep = 0;
      interval = 0;
      repetitions = 0;
      lapses += 1;
      easeFactor = clampEase(easeFactor - 0.2);
      dueDate = calculateDueDateMinutes(learningStepMinutes(settings, 'relearning', 0));
    } else if (grade === 'hard') {
      interval = applyFuzz(Math.max(1, Math.round(interval * 1.2)));
      easeFactor = clampEase(easeFactor - 0.15);
      repetitions += 1;
      dueDate = calculateDueDateDays(interval);
    } else if (grade === 'good') {
      interval = applyFuzz(Math.max(1, Math.round(interval * easeFactor)));
      repetitions += 1;
      dueDate = calculateDueDateDays(interval);
    } else {
      interval = applyFuzz(Math.max(1, Math.round(interval * easeFactor * 1.3)));
      easeFactor = clampEase(easeFactor + 0.15);
      repetitions += 1;
      dueDate = calculateDueDateDays(interval);
    }
  } else {
    // relearning
    if (grade === 'again') {
      learningStep = 0;
      interval = 0;
      dueDate = calculateDueDateMinutes(learningStepMinutes(settings, 'relearning', 0));
    } else if (grade === 'good') {
      const nextStep = learningStep + 1;
      if (nextStep >= settings.relearningSteps.length) {
        state = 'review';
        interval = Math.max(
          1,
          lapses > 0 ? Math.floor(previousInterval * 0.5) : settings.graduatingInterval,
        );
        interval = applyFuzz(interval);
        learningStep = 0;
        repetitions = Math.max(1, repetitions);
        dueDate = calculateDueDateDays(interval);
      } else {
        learningStep = nextStep;
        interval = 0;
        dueDate = calculateDueDateMinutes(learningStepMinutes(settings, 'relearning', nextStep));
      }
    } else if (grade === 'easy') {
      state = 'review';
      interval = applyFuzz(Math.max(settings.graduatingInterval, Math.round(previousInterval * easeFactor)));
      learningStep = 0;
      easeFactor = clampEase(easeFactor + 0.15);
      repetitions = Math.max(1, repetitions);
      dueDate = calculateDueDateDays(interval);
    } else {
      const mins = learningStepMinutes(settings, 'relearning', learningStep);
      interval = 0;
      dueDate = calculateDueDateMinutes(Math.max(1, Math.floor(mins * 1.5)));
    }
  }

  return {
    state,
    interval,
    easeFactor: clampEase(easeFactor),
    repetitions,
    learningStep,
    lapses,
    reviews,
    dueDate,
    lastReviewed: now.toISOString(),
    score,
    previousInterval,
  };
}

function previewLearning(
  card: VocabWord,
  grade: Grade,
  settings: StudySettings,
): string {
  const state = card.state === 'new' ? 'learning' : card.state;
  const steps = state === 'relearning' ? settings.relearningSteps : settings.learningSteps;

  if (grade === 'again') {
    const m = steps[0] ?? 1;
    return m < 60 ? `${m}m` : `${Math.round(m / 60)}h`;
  }
  if (grade === 'easy' && (card.state === 'new' || card.state === 'learning')) {
    return `${settings.easyInterval}d`;
  }
  if (grade === 'good') {
    const next = card.learningStep + 1;
    if (next >= steps.length) {
      return `${settings.graduatingInterval}d`;
    }
    const m = steps[next] ?? 10;
    return m < 60 ? `${m}m` : `${Math.round(m / 60)}h`;
  }
  if (grade === 'hard') {
    const m = steps[card.learningStep] ?? 1;
    return `<${Math.max(1, Math.floor(m * 1.5))}m`;
  }
  return '—';
}

function previewReview(card: VocabWord, grade: Grade, settings: StudySettings): string {
  const { interval, easeFactor } = card;
  if (grade === 'again') {
    const m = settings.relearningSteps[0] ?? 10;
    return m < 60 ? `${m}m` : `${Math.round(m / 60)}h`;
  }
  if (grade === 'hard') {
    return `${Math.max(1, Math.round(interval * 1.2))}d`;
  }
  if (grade === 'good') {
    return `${Math.max(1, Math.round(interval * easeFactor))}d`;
  }
  return `${Math.max(1, Math.round(interval * easeFactor * 1.3))}d`;
}

export function getIntervalPreview(
  card: VocabWord,
  grade: Grade,
  settings: StudySettings = DEFAULT_STUDY_SETTINGS,
): string {
  const effectiveState = card.state === 'new' ? 'learning' : card.state;
  if (effectiveState === 'learning' || effectiveState === 'relearning') {
    return previewLearning(card, grade, settings);
  }
  return previewReview(card, grade, settings);
}

export function isCardDueNow(card: VocabWord, now = Date.now()): boolean {
  if (card.suspended) return false;
  return new Date(card.dueDate).getTime() <= now;
}

export function isDueToday(card: VocabWord, now = new Date()): boolean {
  if (card.suspended) return false;
  const due = new Date(card.dueDate);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return due.getTime() <= end.getTime();
}

export function showHardButton(card: VocabWord): boolean {
  return card.state === 'review' || card.state === 'relearning';
}
