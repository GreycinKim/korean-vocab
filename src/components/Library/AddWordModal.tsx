import { useEffect, useState } from 'react';
import type { VocabWord } from '../../types';
import { useVocabStore } from '../../store/vocabStore';
import styles from './AddWordModal.module.css';

interface AddWordModalProps {
  open: boolean;
  onClose: () => void;
  defaultFolderId: string;
  editWord?: VocabWord | null;
  onSaved?: (isNew: boolean) => void;
}

export function AddWordModal({
  open,
  onClose,
  defaultFolderId,
  editWord,
  onSaved,
}: AddWordModalProps) {
  const folders = useVocabStore((s) => s.folders);
  const addWord = useVocabStore((s) => s.addWord);
  const updateWord = useVocabStore((s) => s.updateWord);
  const moveWordToFolder = useVocabStore((s) => s.moveWordToFolder);

  const [korean, setKorean] = useState('');
  const [english, setEnglish] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [notes, setNotes] = useState('');
  const [folderId, setFolderId] = useState(defaultFolderId);

  useEffect(() => {
    if (editWord) {
      setKorean(editWord.korean);
      setEnglish(editWord.english);
      setPronunciation(editWord.pronunciation);
      setNotes(editWord.notes ?? '');
      setFolderId(editWord.folderId);
    } else {
      setKorean('');
      setEnglish('');
      setPronunciation('');
      setNotes('');
      setFolderId(defaultFolderId);
    }
  }, [editWord, defaultFolderId, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!korean.trim() || !english.trim()) return;

    if (editWord) {
      updateWord(editWord.id, {
        korean: korean.trim(),
        english: english.trim(),
        pronunciation: pronunciation.trim() || english.trim(),
        notes: notes.trim() || undefined,
      });
      if (folderId !== editWord.folderId) {
        moveWordToFolder(editWord.id, folderId);
      }
      onSaved?.(false);
    } else {
      addWord({
        korean: korean.trim(),
        english: english.trim(),
        pronunciation: pronunciation.trim() || english.trim(),
        notes: notes.trim() || undefined,
        folderId,
      });
      onSaved?.(true);
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="word-modal-title"
      >
        <h2 id="word-modal-title" className={styles.title}>
          {editWord ? 'Edit word' : 'Add word'}
        </h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Korean
            <input
              className={styles.inputKr}
              value={korean}
              onChange={(e) => setKorean(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className={styles.label}>
            English
            <input
              className={styles.input}
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              required
            />
          </label>
          <label className={styles.label}>
            Pronunciation
            <input
              className={styles.input}
              value={pronunciation}
              onChange={(e) => setPronunciation(e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Notes
            <textarea
              className={styles.input}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </label>
          <label className={styles.label}>
            Folder
            <select
              className={styles.input}
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
            >
              {Object.values(folders).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnSave}>
              {editWord ? 'Save' : 'Add word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
