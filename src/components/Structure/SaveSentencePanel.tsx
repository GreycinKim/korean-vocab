import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookmarkPlus, ExternalLink } from 'lucide-react';
import type { FullAnalysis } from '../../services/grammarService';
import { useVocabStore } from '../../store/vocabStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import styles from './SaveSentencePanel.module.css';

interface SaveSentencePanelProps {
  result: FullAnalysis;
}

function buildNotes(result: FullAnalysis, useCorrected: boolean): string {
  const lines = [`Structure Lab · Grammar ${result.grammar.score}/100`];
  if (useCorrected && result.grammar.correctedSentence && result.grammar.correctedSentence !== result.korean) {
    lines.push(`Original: ${result.korean}`);
  }
  const breakdown = result.breakdown.chunks
    .map((c) => `${c.korean} (${c.english})`)
    .join(' · ');
  if (breakdown) lines.push(breakdown);
  return lines.join('\n');
}

export function SaveSentencePanel({ result }: SaveSentencePanelProps) {
  const navigate = useNavigate();
  const folders = useVocabStore((s) => s.folders);
  const words = useVocabStore((s) => s.words);
  const addWord = useVocabStore((s) => s.addWord);
  const sentenceSaveFolderId = useSettingsStore((s) => s.sentenceSaveFolderId);
  const setSentenceSaveFolderId = useSettingsStore((s) => s.setSentenceSaveFolderId);
  const addToast = useToastStore((s) => s.addToast);

  const hasCorrection =
    !!result.grammar.correctedSentence &&
    result.grammar.correctedSentence.trim() !== result.korean.trim();

  const [folderId, setFolderId] = useState(sentenceSaveFolderId);
  const [useCorrected, setUseCorrected] = useState(hasCorrection);
  const [saved, setSaved] = useState(false);

  const folderOptions = useMemo(
    () => Object.values(folders).sort((a, b) => a.name.localeCompare(b.name)),
    [folders],
  );

  const koreanToSave =
    useCorrected && result.grammar.correctedSentence
      ? result.grammar.correctedSentence.trim()
      : result.korean.trim();

  const handleSave = () => {
    if (!folders[folderId]) {
      addToast('Choose a folder', 'error');
      return;
    }

    const duplicate = Object.values(words).some(
      (w) => w.folderId === folderId && w.korean === koreanToSave,
    );
    if (duplicate) {
      addToast('This sentence is already in that folder', 'info');
      return;
    }

    addWord({
      korean: koreanToSave,
      english: result.english.trim(),
      pronunciation: '',
      notes: buildNotes(result, useCorrected),
      folderId,
      tags: ['sentence'],
    });

    setSentenceSaveFolderId(folderId);
    setSaved(true);
    const folderName = folders[folderId].name;
    addToast(`Saved to ${folderName}`, 'success');
  };

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>
        <BookmarkPlus size={18} />
        Save as flashcard
      </h2>
      <p className={styles.hint}>
        Add this sentence to a folder and study it in Flashcards.
      </p>

      <div className={styles.preview}>
        <div>
          <span className={styles.label}>Korean</span>
          <p className={styles.kr}>{koreanToSave}</p>
        </div>
        <div>
          <span className={styles.label}>English</span>
          <p className={styles.en}>{result.english}</p>
        </div>
      </div>

      {hasCorrection && (
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={useCorrected}
            onChange={(e) => {
              setUseCorrected(e.target.checked);
              setSaved(false);
            }}
          />
          Use suggested Korean ({result.grammar.correctedSentence})
        </label>
      )}

      <label className={styles.fieldLabel}>
        Folder
        <select
          className={styles.select}
          value={folderId}
          onChange={(e) => {
            setFolderId(e.target.value);
            setSaved(false);
          }}
        >
          {folderOptions.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? 'Saved' : 'Save to folder'}
        </button>
        {saved && (
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => navigate(`/library/${folderId}`)}
          >
            <ExternalLink size={14} />
            View in Library
          </button>
        )}
      </div>
    </section>
  );
}
