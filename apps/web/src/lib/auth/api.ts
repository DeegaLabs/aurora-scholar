import { getAuthToken, setAuthToken, clearAuthToken } from './token';
import { getApiBaseUrl } from '../api/baseUrl';

function bytesToBase64(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map((x) => stableStringify(x)).join(',')}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
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

/**
 * Refreshes the auth token by re-authenticating with the wallet.
 * This function should be called when a JWT expires.
 * It uses window.solana (Phantom) or dispatches a custom event to trigger re-auth.
 */
export async function refreshAuthToken(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot refresh token on server');
  }

  // Try to get from window.solana directly (Phantom - most common)
  const solana = (window as any).solana;
  if (solana && solana.isPhantom && solana.publicKey && solana.signMessage) {
    const wallet = typeof solana.publicKey === 'string' 
      ? solana.publicKey 
      : solana.publicKey.toBase58();

    // Clear old token
    clearAuthToken();

    // Get challenge
    const ch = await authChallenge(wallet);

    // Sign message
    const message = stableStringify({
      domain: 'aurora-scholar',
      action: 'auth',
      wallet,
      nonce: ch.nonce,
    });

    // Request signature from wallet
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await solana.signMessage(encodedMessage, 'utf8');
    const signatureBytes = signedMessage.signature;

    // Verify and get new token
    return await authVerify({
      wallet,
      nonce: ch.nonce,
      signatureBytes,
    });
  }

  // If Phantom is not available, dispatch event to trigger re-auth via AuthGate
  // This will cause the AuthGate to re-authenticate
  window.dispatchEvent(new CustomEvent('aurora:refresh-auth'));
  
  // Wait a bit for the auth to complete, then check if we have a new token
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newToken = getAuthToken();
  if (newToken) {
    return newToken;
  }

  throw new Error('Não foi possível renovar o token. Por favor, reconecte sua wallet.');
}


