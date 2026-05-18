import { useState } from 'react';
import { Languages, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { getOpenAiApiKey, hasOpenAiApiKey } from '../../config/env';
import { useToastStore } from '../../store/toastStore';
import {
  type FullAnalysis,
  analyzeFromEnglish,
  analyzeFromKorean,
} from '../../services/grammarService';
import { EnvKeyNotice } from './EnvKeyNotice';
import { SaveSentencePanel } from './SaveSentencePanel';
import styles from './StructureLab.module.css';

type LabMode = 'korean' | 'english';

export function StructureLab() {
  const addToast = useToastStore((s) => s.addToast);

  const [mode, setMode] = useState<LabMode>('english');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const [result, setResult] = useState<FullAnalysis | null>(null);

  const reset = () => {
    setInput('');
    setResult(null);
    setStep('');
  };

  const switchMode = (m: LabMode) => {
    setMode(m);
    reset();
  };

  const handleAnalyze = async () => {
    const openaiApiKey = getOpenAiApiKey();
    if (!openaiApiKey) {
      addToast('Add VITE_OPENAI_API_KEY to your .env file and restart the dev server', 'error');
      return;
    }
    const text = input.trim();
    if (!text) {
      addToast(mode === 'korean' ? 'Type a Korean sentence' : 'Type an English sentence', 'info');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      if (mode === 'korean') {
        setStep('Translating → checking grammar → breakdown…');
        setResult(await analyzeFromKorean(openaiApiKey, text));
      } else {
        setStep('Translating → checking grammar → breakdown…');
        setResult(await analyzeFromEnglish(openaiApiKey, text));
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Analysis failed', 'error');
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  return (
    <div className={styles.lab}>
      <EnvKeyNotice />

      <section className={styles.card}>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'korean' ? styles.modeBtnActive : ''}`}
            onClick={() => switchMode('korean')}
          >
            <span className={styles.modeFlag}>한</span>
            Korean → English
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'english' ? styles.modeBtnActive : ''}`}
            onClick={() => switchMode('english')}
          >
            <span className={styles.modeFlag}>En</span>
            English → Korean
          </button>
        </div>

        <p className={styles.modeDesc}>
          {mode === 'korean'
            ? 'Type Korean — get English, grammar check on your Korean, then a breakdown.'
            : 'Type English — get Korean, grammar check, then a breakdown.'}
        </p>

        <textarea
          className={styles.textarea}
          placeholder={
            mode === 'korean'
              ? '예: 저는 하나님을 사랑해요'
              : 'e.g. I love God'
          }
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setResult(null);
          }}
          rows={3}
        />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleAnalyze}
            disabled={loading || !hasOpenAiApiKey()}
          >
            {loading ? (
              <>
                <Loader2 size={16} className={styles.spin} />
                {step || 'Analyzing…'}
              </>
            ) : (
              <>
                <Languages size={16} />
                Analyze
              </>
            )}
          </button>
          <button type="button" className={styles.btn} onClick={reset} disabled={loading}>
            <RotateCcw size={14} />
            Clear
          </button>
        </div>

        {!hasOpenAiApiKey() && (
          <p className={styles.apiWarn}>
            Add <code>VITE_OPENAI_API_KEY</code> to <code>.env</code> and restart the dev server.
          </p>
        )}
      </section>

      {result && (
        <>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>
              <ArrowRight size={18} />
              Translation
            </h2>
            <div className={styles.translationGrid}>
              <div className={styles.translationBlock}>
                <span className={styles.translationLabel}>Korean</span>
                <p className={styles.translationKr}>{result.korean}</p>
              </div>
              <div className={styles.translationBlock}>
                <span className={styles.translationLabel}>English</span>
                <p className={styles.translationEn}>{result.english}</p>
              </div>
            </div>
          </section>

          <SaveSentencePanel result={result} />

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Grammar check</h2>
            <div className={styles.feedback}>
              <div className={styles.scoreRow}>
                <span className={styles.feedbackScore}>{result.grammar.score}</span>
                <span className={styles.scoreOut}>/100</span>
                {result.grammar.correct ? (
                  <span className={styles.badgeOk}>Looks good</span>
                ) : (
                  <span className={styles.badgeFix}>Needs work</span>
                )}
              </div>
              <p className={styles.feedbackText}>{result.grammar.feedback}</p>
              {result.grammar.correctedSentence && (
                <p className={styles.corrected}>
                  Suggested Korean: <strong>{result.grammar.correctedSentence}</strong>
                </p>
              )}
              {result.grammar.tips.length > 0 && (
                <ul className={styles.tips}>
                  {result.grammar.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Sentence breakdown</h2>
            <div className={styles.chunkPreview}>
              <div className={styles.chunkList}>
                {result.breakdown.chunks.map((c, i) => (
                  <div key={i} className={styles.chunkItem}>
                    <span className={styles.chunkKr}>{c.korean}</span>
                    <span className={styles.chunkEn}>{c.english}</span>
                    <span className={styles.chunkRole}>{c.role}</span>
                    {c.note && <span className={styles.chunkNote}>{c.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
