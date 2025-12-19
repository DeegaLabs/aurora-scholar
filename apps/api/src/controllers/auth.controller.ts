import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/error-handler';
import crypto from 'crypto';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import jwt from 'jsonwebtoken';

type Challenge = { nonce: string; expiresAt: number };

// MVP: in-memory nonce store (single API instance). Replace with Redis/DB later.
const challenges = new Map<string, Challenge>(); // wallet -> challenge

function getJwtSecret() {
  const secret = process.env.API_JWT_SECRET;
  if (!secret) throw createError('API_JWT_SECRET is not configured', 500);
  return secret;
}

function nowMs() {
  return Date.now();
}

function b64ToBytes(b64: string) {
  return Buffer.from(b64, 'base64');
}

function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map((x) => stableStringify(x)).join(',')}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

export const authChallenge = asyncHandler(async (req: Request, res: Response) => {
  const { wallet } = req.body as { wallet?: string };
  if (!wallet) throw createError('wallet is required', 400);

  // Validate base58 pubkey
  try {
    // eslint-disable-next-line no-new
    new PublicKey(wallet);
  } catch {
    throw createError('Invalid wallet public key', 400);
  }

  const nonce = crypto.randomBytes(16).toString('hex');
  const expiresAt = nowMs() + 5 * 60 * 1000; // 5 minutes
  challenges.set(wallet, { nonce, expiresAt });

  res.json({
    success: true,
    data: {
      nonce,
      expiresAt,
    },
  });
});

export const authVerify = asyncHandler(async (req: Request, res: Response) => {
  const { wallet, signature, nonce } = req.body as {
    wallet?: string;
    signature?: string; // base64
    nonce?: string;
  };
  if (!wallet || !signature || !nonce) throw createError('wallet, signature, and nonce are required', 400);

  const ch = challenges.get(wallet);
  if (!ch) throw createError('No active challenge for wallet', 400);
  if (ch.expiresAt < nowMs()) {
    challenges.delete(wallet);
    throw createError('Challenge expired', 400);
  }
  if (ch.nonce !== nonce) throw createError('Invalid nonce', 400);

  const message = stableStringify({
    domain: 'aurora-scholar',
    action: 'auth',
    wallet,
    nonce,
  });

  const msgBytes = new TextEncoder().encode(message);
  const sigBytes = b64ToBytes(signature);

  if (sigBytes.length !== 64) throw createError('Invalid signature length', 400);

  const pubkey = new PublicKey(wallet);
  const ok = nacl.sign.detached.verify(msgBytes, sigBytes, pubkey.toBytes());
  if (!ok) throw createError('Invalid signature', 401);

  // Consume nonce to prevent replay
  challenges.delete(wallet);

  const token = jwt.sign({}, getJwtSecret(), {
    subject: wallet,
    expiresIn: '2h',
  });

  res.json({
    success: true,
    data: {
      token,
      wallet,
      expiresIn: '2h',
    },
  });
});



