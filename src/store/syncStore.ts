import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { hasSupabaseConfig } from '../config/env';
import { getSupabase } from '../lib/supabaseClient';
import { pushLocalToRemote, syncForUser } from '../services/syncService';

export type SyncStatus = 'disabled' | 'idle' | 'syncing' | 'synced' | 'error';

interface SyncStore {
  enabled: boolean;
  user: User | null;
  status: SyncStatus;
  lastSyncedAt: string | null;
  error: string | null;
  init: () => () => void;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
}

let syncQueue: Promise<void> = Promise.resolve();

function runSync(task: () => Promise<void>): Promise<void> {
  syncQueue = syncQueue.then(task).catch(() => undefined);
  return syncQueue;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  enabled: hasSupabaseConfig(),
  user: null,
  status: hasSupabaseConfig() ? 'idle' : 'disabled',
  lastSyncedAt: null,
  error: null,

  init: () => {
    const supabase = getSupabase();
    if (!supabase) return () => undefined;

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      set({ user, status: user ? 'idle' : 'idle', error: null });

      if (user) {
        void get().syncNow();
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      set({ user });
      if (user) void get().syncNow();
    });

    return () => listener.subscription.unsubscribe();
  },

  signInWithEmail: async (email) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Sync is not configured');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw new Error(error.message);
  },

  signOut: async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ user: null, status: 'idle', lastSyncedAt: null, error: null });
  },

  syncNow: async () => {
    const { user, enabled } = get();
    if (!enabled || !user) return;

    await runSync(async () => {
      set({ status: 'syncing', error: null });
      try {
        await syncForUser(user.id);
        set({
          status: 'synced',
          lastSyncedAt: new Date().toISOString(),
          error: null,
        });
      } catch (err) {
        set({
          status: 'error',
          error: err instanceof Error ? err.message : 'Sync failed',
        });
      }
    });
  },
}));

export function schedulePush(): void {
  const { user, enabled } = useSyncStore.getState();
  if (!enabled || !user) return;

  void runSync(async () => {
    useSyncStore.setState({ status: 'syncing', error: null });
    try {
      await pushLocalToRemote(user.id);
      useSyncStore.setState({
        status: 'synced',
        lastSyncedAt: new Date().toISOString(),
        error: null,
      });
    } catch (err) {
      useSyncStore.setState({
        status: 'error',
        error: err instanceof Error ? err.message : 'Sync failed',
      });
    }
  });
}
