import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { VocabAudioButton } from '../Flashcards/VocabAudioButton';
import type { VocabWord } from '../../types';
import styles from './WordRow.module.css';

function formatDue(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days}d`;
}

const STATE_CLASSES: Record<string, string> = {
  new: 'badgeNew',
  learning: 'badgeLearning',
  review: 'badgeReview',
  relearning: 'badgeRelearning',
};

function stateBadgeClass(state: string): string {
  const key = STATE_CLASSES[state] ?? 'badgeNew';
  return styles[key as keyof typeof styles] as string;
}

interface WordRowProps {
  word: VocabWord;
  onEdit: (word: VocabWord) => void;
  onDelete: (id: string) => void;
}

export function WordRow({ word, onEdit, onDelete }: WordRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `word-${word.id}`,
    data: { wordId: word.id },
  });

  const stateLabel = word.state ?? 'new';

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${styles.row} ${isDragging ? styles.rowDragging : ''}`}
    >
      <td data-label="Korean">
        <div className={styles.koreanCell}>
          <button
            type="button"
            className={styles.dragHandle}
            {...listeners}
            {...attributes}
            aria-label={`Drag ${word.korean} to a folder`}
          >
            <GripVertical size={16} />
          </button>
          <VocabAudioButton text={word.korean} label="Play Korean" layout="inline" />
          <span className={styles.korean}>{word.korean}</span>
        </div>
      </td>
      <td data-label="English">{word.english}</td>
      <td data-label="Pronunciation">{word.pronunciation || '—'}</td>
      <td data-label="Due">{formatDue(word.dueDate)}</td>
      <td data-label="State">
        <span className={`${styles.badge} ${stateBadgeClass(stateLabel)}`}>
          {stateLabel}
        </span>
      </td>
      <td data-label="Actions">
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onEdit(word)}
            aria-label="Edit word"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onDelete(word.id)}
            aria-label="Delete word"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
