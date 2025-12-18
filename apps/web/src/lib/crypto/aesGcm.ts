'use client';

export function bytesToBase64(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function aesGcmEncrypt(params: { keyBytes32: Uint8Array; plaintextJson: unknown }) {
  if (params.keyBytes32.length !== 32) throw new Error('keyBytes32 must be 32 bytes');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  // Make a copy backed by a plain ArrayBuffer (avoids SharedArrayBuffer typing in strict builds).
  const rawKey = new Uint8Array(params.keyBytes32).buffer;
  const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
  const plaintext = new TextEncoder().encode(JSON.stringify(params.plaintextJson));
  const ctBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return {
    ivB64: bytesToBase64(iv),
    ciphertextB64: bytesToBase64(new Uint8Array(ctBuf)),
    alg: 'AES-256-GCM' as const,
    v: 1 as const,
  };
}

export async function aesGcmDecrypt(params: { keyBytes32: Uint8Array; ivB64: string; ciphertextB64: string }) {
  if (params.keyBytes32.length !== 32) throw new Error('keyBytes32 must be 32 bytes');
  const iv = base64ToBytes(params.ivB64);
  const ciphertext = base64ToBytes(params.ciphertextB64);
  const rawKey = new Uint8Array(params.keyBytes32).buffer;
  const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt']);
  const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  const text = new TextDecoder().decode(new Uint8Array(ptBuf));
  return JSON.parse(text) as any;
}


