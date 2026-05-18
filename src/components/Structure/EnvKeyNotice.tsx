import { Key } from 'lucide-react';
import { hasOpenAiApiKey } from '../../config/env';
import styles from './StructureLab.module.css';

export function EnvKeyNotice() {
  if (hasOpenAiApiKey()) return null;

  return (
    <div className={styles.envNotice} role="status">
      <Key size={16} aria-hidden />
      <div>
        <strong>OpenAI API key missing.</strong> Create a <code>.env</code> file in the project
        root with <code>VITE_OPENAI_API_KEY=sk-...</code> (see <code>.env.example</code>), then
        restart <code>npm run dev</code>.
      </div>
    </div>
  );
}
