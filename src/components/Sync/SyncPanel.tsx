import { useState } from 'react';
import { Cloud, CloudOff, Loader2, LogOut } from 'lucide-react';
import { hasSupabaseConfig } from '../../config/env';
import { useSyncStore } from '../../store/syncStore';
import { useToastStore } from '../../store/toastStore';
import styles from './SyncPanel.module.css';

export function SyncPanel() {
  const addToast = useToastStore((s) => s.addToast);
  const { enabled, user, status, lastSyncedAt, error, signInWithEmail, signOut, syncNow } =
    useSyncStore();
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  if (!enabled) return null;

  const statusLabel =
    status === 'syncing'
      ? 'Syncing…'
      : status === 'error'
        ? 'Sync error'
        : status === 'synced'
          ? 'Synced'
          : user
            ? 'Signed in'
            : 'Not signed in';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await signInWithEmail(email);
      addToast('Check your email for the sign-in link', 'info');
      setOpen(false);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Sign-in failed', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.trigger} ${status === 'error' ? styles.triggerError : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Cloud sync"
        title={hasSupabaseConfig() ? statusLabel : 'Sync not configured'}
      >
        {status === 'syncing' ? (
          <Loader2 size={18} className={styles.spin} />
        ) : user ? (
          <Cloud size={18} />
        ) : (
          <CloudOff size={18} />
        )}
        <span className={styles.triggerText}>{statusLabel}</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Close sync panel"
            onClick={() => setOpen(false)}
          />
          <div className={styles.panel} role="dialog" aria-label="Cloud sync">
            <h2 className={styles.panelTitle}>Sync across devices</h2>
            <p className={styles.panelHint}>
              Sign in with email. Your vocab, folders, and study settings sync to your account.
            </p>

            {user ? (
              <>
                <p className={styles.email}>{user.email}</p>
                {lastSyncedAt && (
                  <p className={styles.meta}>
                    Last sync: {new Date(lastSyncedAt).toLocaleString()}
                  </p>
                )}
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.actions}>
                  <button type="button" className={styles.btn} onClick={() => void syncNow()}>
                    Sync now
                  </button>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={() => void signOut()}
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <form className={styles.form} onSubmit={handleSignIn}>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <button type="submit" className={styles.btn} disabled={sending}>
                  {sending ? 'Sending…' : 'Email me a sign-in link'}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
