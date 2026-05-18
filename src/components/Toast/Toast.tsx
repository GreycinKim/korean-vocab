import { useToastStore } from '../../store/toastStore';
import styles from './Toast.module.css';

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type]}`}
          role="status"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
