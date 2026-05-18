import { getSupabase } from '../lib/supabaseClient';
import {
  applyPayloadToStores,
  buildPayloadFromStores,
  getLocalUpdatedAt,
  hasMeaningfulLocalData,
  hasSyncedBefore,
  isLikelySeedOnly,
  markSynced,
  touchLocalUpdatedAt,
} from '../lib/syncPayload';
import type { SyncPayload } from '../types/sync';

function isPayload(value: unknown): value is SyncPayload {
  if (!value || typeof value !== 'object') return false;
  const p = value as SyncPayload;
  return (
    p.version === 1 &&
    typeof p.words === 'object' &&
    typeof p.folders === 'object' &&
    typeof p.updatedAt === 'string'
  );
}

export async function fetchRemotePayload(userId: string): Promise<SyncPayload | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_vocab')
    .select('payload, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.payload || !isPayload(data.payload)) return null;

  const payload = data.payload as SyncPayload;
  if (data.updated_at && payload.updatedAt < data.updated_at) {
    payload.updatedAt = data.updated_at;
  }
  return payload;
}

export async function pushRemotePayload(userId: string, payload: SyncPayload): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from('user_vocab').upsert(
    {
      user_id: userId,
      payload,
      updated_at: payload.updatedAt,
    },
    { onConflict: 'user_id' },
  );

  if (error) throw new Error(error.message);
}

export async function syncForUser(userId: string): Promise<'pulled' | 'pushed' | 'noop'> {
  const remote = await fetchRemotePayload(userId);
  const localAt = getLocalUpdatedAt();
  const hasLocal = hasMeaningfulLocalData();
  const localPayload = hasLocal ? buildPayloadFromStores() : null;
  const seedOnly = localPayload ? isLikelySeedOnly(localPayload.words) : false;

  if (!remote) {
    if (hasLocal && !seedOnly) {
      const payload = buildPayloadFromStores(new Date().toISOString());
      touchLocalUpdatedAt(payload.updatedAt);
      await pushRemotePayload(userId, payload);
      markSynced();
      return 'pushed';
    }
    return 'noop';
  }

  if (!hasLocal || seedOnly || !hasSyncedBefore()) {
    applyPayloadToStores(remote);
    markSynced();
    return 'pulled';
  }

  const remoteTime = new Date(remote.updatedAt).getTime();
  const localTime = localAt ? new Date(localAt).getTime() : 0;

  if (remoteTime > localTime) {
    applyPayloadToStores(remote);
    markSynced();
    return 'pulled';
  }

  if (localTime > remoteTime) {
    const payload = buildPayloadFromStores(new Date().toISOString());
    touchLocalUpdatedAt(payload.updatedAt);
    await pushRemotePayload(userId, payload);
    markSynced();
    return 'pushed';
  }

  markSynced();
  return 'noop';
}

export async function pushLocalToRemote(userId: string): Promise<void> {
  const payload = buildPayloadFromStores(new Date().toISOString());
  touchLocalUpdatedAt(payload.updatedAt);
  await pushRemotePayload(userId, payload);
  markSynced();
}
