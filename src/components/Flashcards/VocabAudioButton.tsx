import { useState } from 'react';
import { Loader2, Volume2 } from 'lucide-react';
import { getOpenAiApiKey, hasOpenAiApiKey } from '../../config/env';
import { speakWithOpenAI, stopSpeaking } from '../../services/openaiTtsService';
import { useToastStore } from '../../store/toastStore';
import styles from './VocabAudioButton.module.css';

interface VocabAudioButtonProps {
  text: string;
  label?: string;
  /** overlay = top-right on flashcard; inline = compact row button */
  layout?: 'overlay' | 'inline';
}

export function VocabAudioButton({
  text,
  label = 'Play audio',
  layout = 'overlay',
}: VocabAudioButtonProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  const configured = hasOpenAiApiKey();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!configured) {
      addToast('Add VITE_OPENAI_API_KEY to .env and restart the dev server', 'error');
      return;
    }

    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }

    setLoading(true);
    try {
      setPlaying(true);
      await speakWithOpenAI(text, getOpenAiApiKey());
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not play audio', 'error');
    } finally {
      setPlaying(false);
      setLoading(false);
    }
  };

  const layoutClass = layout === 'inline' ? styles.btnInline : styles.btnOverlay;

  return (
    <button
      type="button"
      className={`${styles.btn} ${layoutClass} ${playing ? styles.btnActive : ''} ${!configured ? styles.btnMuted : ''}`}
      onClick={handleClick}
      disabled={loading || !text.trim()}
      aria-label={label}
      title={
        configured
          ? label
          : 'Add VITE_OPENAI_API_KEY to .env (see .env.example)'
      }
    >
      {loading ? <Loader2 size={20} className={styles.spin} /> : <Volume2 size={20} />}
    </button>
  );
}
