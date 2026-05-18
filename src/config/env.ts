/** OpenAI API key from project root `.env` (VITE_OPENAI_API_KEY). Restart dev server after changes. */
export function getOpenAiApiKey(): string {
  return (import.meta.env.VITE_OPENAI_API_KEY ?? '').trim();
}

export function hasOpenAiApiKey(): boolean {
  return getOpenAiApiKey().length > 0;
}
