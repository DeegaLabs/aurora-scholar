import { createError } from '../middleware/error-handler';

export type GeminiModelName =
  | 'gemini-1.5-pro-latest'
  | 'gemini-1.5-flash-latest'
  | 'gemini-2.0-flash'
  | (string & {});

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    finishReason?: string;
    content?: {
      parts?: Array<{ text?: string }>;
    };
    safetyRatings?: Array<{
      category?: string;
      probability?: string;
      blocked?: boolean;
    }>;
  }>;
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: Array<{
      category?: string;
      probability?: string;
      blocked?: boolean;
    }>;
  };
  error?: { message?: string };
};

function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw createError('GEMINI_API_KEY is not configured', 500);
  return key;
}

function getGeminiModel(): GeminiModelName {
  // Gemini API commonly exposes *-latest model aliases.
  return (process.env.GEMINI_MODEL as GeminiModelName) || 'gemini-1.5-pro-latest';
}

export async function geminiGenerateText(params: {
  system: string;
  user: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
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
      ...(params.responseMimeType ? { responseMimeType: params.responseMimeType } : {}),
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

  const candidate0 = json?.candidates?.[0];
  const text = candidate0?.content?.parts?.map((p) => p.text || '').join('') || '';

  if (!text.trim()) {
    // Useful for debugging model/output issues (kept concise).
    console.error(
      '[gemini] empty text response:',
      JSON.stringify(
        {
          model,
          promptFeedback: json?.promptFeedback,
          candidate0: json?.candidates?.[0],
        },
        null,
        2
      ).slice(0, 4000)
    );
    const blockReason = json?.promptFeedback?.blockReason;
    const finishReason = candidate0?.finishReason;
    const msgParts = [
      'Gemini returned no text',
      blockReason ? `blockReason=${blockReason}` : null,
      finishReason ? `finishReason=${finishReason}` : null,
    ].filter(Boolean);
    throw createError(msgParts.join(' '), 502);
  }
  return text.trim();
}


