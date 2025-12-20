type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success?: false; error?: string; message?: string };
import { getAuthHeader, refreshAuthToken } from '@/lib/auth/api';
import { getApiBaseUrl } from './baseUrl';

async function postJson<T>(path: string, body: unknown, retryOnAuth = true): Promise<T> {
  const baseUrl = getApiBaseUrl();
  // If baseUrl is set (or defaulted), call API directly.
  // If baseUrl is empty (prod behind proxy), fall back to same-origin.
  const url = baseUrl
    ? `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
    : `${path.startsWith('/') ? '' : '/'}${path}`;

  // Get locale from cookie (client-side only)
  let locale = 'en';
  if (typeof document !== 'undefined') {
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1];
    locale = cookieLocale || 'en';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept-Language': locale === 'pt' ? 'pt-BR,pt' : 'en',
      ...getAuthHeader() 
    },
    body: JSON.stringify({ ...(body as Record<string, unknown>), locale }),
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
    
    // Check if it's a JWT expired error and retry after refreshing token
    if (retryOnAuth && (res.status === 401 || msg.toLowerCase().includes('jwt') || msg.toLowerCase().includes('token') || msg.toLowerCase().includes('expired'))) {
      try {
        await refreshAuthToken();
        // Retry the request once after refreshing token
        return postJson<T>(path, body, false);
      } catch (refreshError: any) {
        // If refresh fails, show a user-friendly error and throw
        const refreshMsg = refreshError?.message || 'Falha ao renovar autenticação';
        throw new Error(`${refreshMsg}. Por favor, reconecte sua wallet.`);
      }
    }
    
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
  locale?: string;
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
  locale?: string;
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


