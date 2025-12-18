import { createError } from '../middleware/error-handler';

export type GeminiModelName =
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'gemini-2.0-flash'
  | (string & {});

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw createError('GEMINI_API_KEY is not configured', 500);
  return key;
}

function getGeminiModel(): GeminiModelName {
  return (process.env.GEMINI_MODEL as GeminiModelName) || 'gemini-1.5-pro';
}

export async function geminiGenerateText(params: {
  system: string;
  user: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const key = getGeminiApiKey();
  const model = getGeminiModel();

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  const body = {
    // systemInstruction is supported by Gemini API; keep fallback by also including system in user prompt.
    systemInstruction: { parts: [{ text: params.system }] },
    contents: [{ role: 'user', parts: [{ text: params.user }] }],
    generationConfig: {
      temperature: params.temperature ?? 0.3,
      maxOutputTokens: params.maxOutputTokens ?? 1024,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as GeminiGenerateContentResponse;

  if (!res.ok) {
    const msg = json?.error?.message || `Gemini API error (HTTP ${res.status})`;
    throw createError(msg, 502);
  }

  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  if (!text.trim()) throw createError('Gemini returned empty response', 502);
  return text.trim();
}


