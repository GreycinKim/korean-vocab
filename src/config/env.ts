/** OpenAI API key from project root `.env` (VITE_OPENAI_API_KEY). Restart dev server after changes. */
export function getOpenAiApiKey(): string {
  return (import.meta.env.VITE_OPENAI_API_KEY ?? '').trim();
}

export function hasOpenAiApiKey(): boolean {
  return getOpenAiApiKey().length > 0;
}

export function getSupabaseUrl(): string {
  return (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
}

export function getSupabaseAnonKey(): string {
  return (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
}

export function hasSupabaseConfig(): boolean {
  return getSupabaseUrl().length > 0 && getSupabaseAnonKey().length > 0;
}
