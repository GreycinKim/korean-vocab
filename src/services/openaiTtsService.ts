const TTS_URL = 'https://api.openai.com/v1/audio/speech';
const MODEL = 'tts-1';
const DEFAULT_VOICE = 'nova';
/** OpenAI allows 0.25–4.0; default 1.0. Slower helps when learning pronunciation. */
const SPEECH_SPEED = 0.75;

const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

async function fetchAudioUrl(text: string, apiKey: string, voice: string): Promise<string> {
  const cacheKey = `${voice}::${SPEECH_SPEED}::${text}`;
  const cached = audioCache.get(cacheKey);
  if (cached) return cached;

  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      input: text,
      voice,
      speed: SPEECH_SPEED,
      response_format: 'mp3',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `OpenAI TTS error ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(cacheKey, url);
  return url;
}

export async function speakWithOpenAI(
  text: string,
  apiKey: string,
  voice: string = DEFAULT_VOICE,
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Nothing to speak');

  stopSpeaking();

  const url = await fetchAudioUrl(trimmed, apiKey, voice);
  const audio = new Audio(url);
  currentAudio = audio;

  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null;
      reject(new Error('Could not play audio'));
    };
    audio.play().catch(reject);
  });
}
