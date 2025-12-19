import crypto from 'crypto';
import { createError } from '../middleware/error-handler';

function getSecretKey(): Buffer {
  const raw = process.env.ARTICLE_KEY_ENCRYPTION_SECRET;
  if (!raw) throw createError('ARTICLE_KEY_ENCRYPTION_SECRET is not configured', 500);
  // Derive a stable 32-byte key from any string input.
  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptArticleKey(keyBytes32: Buffer): string {
  if (keyBytes32.length !== 32) throw new Error('keyBytes32 must be 32 bytes');
  const master = getSecretKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', master, iv);
  const ciphertext = Buffer.concat([cipher.update(keyBytes32), cipher.final()]);
  const tag = cipher.getAuthTag();
  // payload = iv(12) + tag(16) + ciphertext(32) => base64
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

export function decryptArticleKey(encryptedB64: string): Buffer {
  const master = getSecretKey();
  const payload = Buffer.from(encryptedB64, 'base64');
  if (payload.length < 12 + 16 + 1) throw new Error('Invalid encrypted key payload');
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const ciphertext = payload.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', master, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  if (plain.length !== 32) throw new Error('Decrypted key must be 32 bytes');
  return plain;
}



