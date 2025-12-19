import { getAuthToken, setAuthToken } from './token';

import { getApiBaseUrl } from '../api/baseUrl';

function bytesToBase64(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export async function authChallenge(wallet: string) {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/auth/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
  return json?.data as { nonce: string; expiresAt: number };
}

export async function authVerify(params: { wallet: string; nonce: string; signatureBytes: Uint8Array }) {
  const baseUrl = getApiBaseUrl();
  const signature = bytesToBase64(params.signatureBytes);
  const res = await fetch(`${baseUrl}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet: params.wallet, nonce: params.nonce, signature }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
  const token = String(json?.data?.token || '');
  if (!token) throw new Error('Token inválido');
  setAuthToken(token);
  return token;
}

export function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}


