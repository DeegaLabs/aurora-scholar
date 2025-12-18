type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success?: false; error?: string; message?: string };

function getApiBaseUrl() {
  // For local dev, docker-compose sets NEXT_PUBLIC_API_URL=http://localhost:3001
  // For Vercel, it's configured via `apps/web/vercel.json`.
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  if (envUrl) return envUrl;

  // Dev fallback: default API runs on 3001. Avoid calling the Next server origin.
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:3001';

  return '';
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const baseUrl = getApiBaseUrl();
  // If baseUrl is set (or defaulted), call API directly.
  // If baseUrl is empty (prod behind proxy), fall back to same-origin.
  const url = baseUrl
    ? `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
    : `${path.startsWith('/') ? '' : '/'}${path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg =
      (json as ApiError | null)?.message ||
      (json as ApiError | null)?.error ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // API returns { success: true, data: ... }
  const payload = json as ApiSuccess<T> | T;
  if (payload && typeof payload === 'object' && 'success' in (payload as any) && (payload as any).success === true) {
    return (payload as ApiSuccess<T>).data;
  }
  return payload as T;
}

export interface AiAssistantChatRequest {
  question: string;
  text: string;
  cursorPosition?: number;
  sources?: unknown[];
  chatHistory?: unknown[];
  agentConfig?: unknown;
}

export interface AiAssistantChatResponse {
  answer: string;
  suggestions?: string[];
  references?: unknown[];
  timestamp?: number;
}

export async function aiAssistantChat(req: AiAssistantChatRequest) {
  return postJson<AiAssistantChatResponse>('/api/ai-assistant/chat', req);
}

export interface AiAssistantAnalyzeRequest {
  text: string;
  sources?: unknown[];
  cursorPosition?: number;
  agentConfig?: unknown;
}

export interface AiAssistantAnalyzeResponse {
  suggestions?: Array<{ id: string; type: string; text: string; priority?: string }>;
  corrections?: unknown[];
  references?: unknown[];
  warnings?: unknown[];
  authenticityAlerts?: unknown[];
  timestamp?: number;
}

export async function aiAssistantAnalyze(req: AiAssistantAnalyzeRequest) {
  return postJson<AiAssistantAnalyzeResponse>('/api/ai-assistant/analyze', req);
}


