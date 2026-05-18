import type { GenerateSentenceResult, GrammarCheckResult } from '../types';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

async function chatJson<T>(
  apiKey: string,
  system: string,
  user: string,
): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `API error ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from API');
  return JSON.parse(content) as T;
}

export async function translateKoreanToEnglish(
  apiKey: string,
  korean: string,
): Promise<{ english: string }> {
  return chatJson<{ english: string }>(
    apiKey,
    `Translate Korean to natural English for a church vocabulary learner.
Respond ONLY with JSON: { "english": "translation" }`,
    korean,
  );
}

export async function translateEnglishToKorean(
  apiKey: string,
  english: string,
): Promise<{ korean: string }> {
  return chatJson<{ korean: string }>(
    apiKey,
    `Translate English to natural polite Korean (해요체 when appropriate) for a church vocabulary learner.
Respond ONLY with JSON: { "korean": "translation" }`,
    english,
  );
}

export async function checkGrammar(
  apiKey: string,
  korean: string,
  english: string,
  learnerWroteKorean: boolean,
): Promise<GrammarCheckResult> {
  const focus = learnerWroteKorean
    ? `The learner wrote this Korean themselves. Evaluate if their Korean is grammatically correct, natural, with proper particles (조사) and SOV order.`
    : `Evaluate if this Korean correctly and naturally expresses the English meaning.`;

  return chatJson<GrammarCheckResult>(
    apiKey,
    `You are a Korean language teacher helping English-speaking church learners.
${focus}
Use polite 해요체 context unless formal 합니다체 is clearly required.
Respond ONLY with valid JSON:
{
  "correct": boolean,
  "score": number (0-100),
  "feedback": "2-3 sentences",
  "correctedSentence": "optional improved Korean",
  "tips": ["tip 1", "tip 2"]
}`,
    `English meaning: ${english}\nKorean: ${korean}`,
  );
}

export async function breakdownKorean(
  apiKey: string,
  korean: string,
  english: string,
): Promise<GenerateSentenceResult> {
  return chatJson<GenerateSentenceResult>(
    apiKey,
    `Break down this Korean sentence for an English-speaking learner.
Explain each chunk's role (subject, object, verb, particle, other).
Respond ONLY with valid JSON:
{
  "english": "english meaning",
  "korean": "full korean sentence",
  "chunks": [
    { "korean": "word", "english": "gloss", "role": "subject|object|verb|particle|other", "note": "optional grammar note" }
  ]
}`,
    `English: ${english}\nKorean: ${korean}`,
  );
}

export interface FullAnalysis {
  korean: string;
  english: string;
  grammar: GrammarCheckResult;
  breakdown: GenerateSentenceResult;
}

export async function analyzeFromKorean(
  apiKey: string,
  koreanInput: string,
): Promise<FullAnalysis> {
  const { english } = await translateKoreanToEnglish(apiKey, koreanInput);
  const grammar = await checkGrammar(apiKey, koreanInput, english, true);
  const breakdown = await breakdownKorean(apiKey, koreanInput, english);
  return { korean: koreanInput, english, grammar, breakdown };
}

export async function analyzeFromEnglish(
  apiKey: string,
  englishInput: string,
): Promise<FullAnalysis> {
  const { korean } = await translateEnglishToKorean(apiKey, englishInput);
  const grammar = await checkGrammar(apiKey, korean, englishInput, false);
  const breakdown = await breakdownKorean(apiKey, korean, englishInput);
  return { korean, english: englishInput, grammar, breakdown };
}
