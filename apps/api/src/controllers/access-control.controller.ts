import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/error-handler';
import crypto from 'crypto';
import { prisma } from '../config/database';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import { decryptArticleKey } from '../services/article-secrets.service';

function calculateExpiration(expiresIn: string): Date | null {
  const now = new Date();
  switch (expiresIn) {
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'unlimited':
      return null;
    default:
      return null;
  }
}

function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map((x) => stableStringify(x)).join(',')}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

// In-memory nonce store for key claims (MVP).
const keyChallenges = new Map<string, { nonce: string; expiresAt: number }>(); // key = `${articleId}:${viewerWallet}`

export const generateToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { articleId, expiresIn } = req.body;

    if (!articleId || !expiresIn) {
      throw createError('Article ID and expiration are required', 400);
    }

    const token = generateAccessToken();
    const expiresAt = calculateExpiration(expiresIn);

    await prisma.accessToken.create({
      data: { articleId, token, expiresAt },
    });

    res.json({
      success: true,
      data: {
        token,
        expiresAt,
        link: `http://localhost:3000/article/${articleId}?token=${token}`,
      },
    });
  }
);

export const updateToken = asyncHandler(async (req: Request, res: Response) => {
  const { articleId, expiresIn } = req.body;

  if (!articleId || !expiresIn) {
    throw createError('Article ID and expiration are required', 400);
  }

  const expiresAt = calculateExpiration(expiresIn);

  await prisma.accessToken.updateMany({
    where: { articleId },
    data: { expiresAt },
  });

  res.json({
    success: true,
    data: {
      expiresAt,
      message: 'Token expiration updated',
    },
  });
});

export const revokeToken = asyncHandler(async (req: Request, res: Response) => {
  const { articleId } = req.body;

  if (!articleId) {
    throw createError('Article ID is required', 400);
  }

  await prisma.accessToken.updateMany({
    where: { articleId },
    data: { expiresAt: new Date() },
  });

  res.json({
    success: true,
    data: {
      message: 'Access token revoked',
    },
  });
});

export const validateToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token) {
      throw createError('Token is required', 400);
    }

    const accessToken = await prisma.accessToken.findUnique({
      where: { token: token as string },
    });

    if (!accessToken) {
      throw createError('Invalid token', 403);
    }

    if (accessToken.expiresAt && accessToken.expiresAt.getTime() <= Date.now()) {
      throw createError('Token has expired', 403);
    }

    res.json({
      success: true,
      data: {
        valid: true,
        articleId: accessToken.articleId,
      },
    });
  }
);

// ---- Wallet-grants (Private B) ----

export const createGrant = asyncHandler(async (req: Request, res: Response) => {
  const { articleId, viewerWallet, expiresIn } = req.body as {
    articleId?: string;
    viewerWallet?: string;
    expiresIn?: '24h' | '7d' | '30d' | 'unlimited';
  };
  const ownerWallet = req.auth?.wallet;
  if (!ownerWallet) throw createError('Unauthorized', 401);
  if (!articleId || !viewerWallet || !expiresIn) throw createError('articleId, viewerWallet, and expiresIn are required', 400);

  const expiresAt = calculateExpiration(expiresIn);

  // MVP: enforce that the article belongs to the owner wallet.
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw createError('Article not found', 404);
  if (article.authorWallet !== ownerWallet) throw createError('Unauthorized', 403);

  const grant = await prisma.accessGrant.upsert({
    where: { articleId_viewerWallet: { articleId, viewerWallet } },
    create: {
      articleId,
      ownerWallet,
      viewerWallet,
      expiresAt,
      revokedAt: null,
    },
    update: {
      ownerWallet,
      expiresAt,
      revokedAt: null,
    },
  });

  res.json({ success: true, data: grant });
});

export const listGrants = asyncHandler(async (req: Request, res: Response) => {
  const ownerWallet = req.auth?.wallet;
  if (!ownerWallet) throw createError('Unauthorized', 401);
  const { articleId } = req.query as { articleId?: string };

  const where: { ownerWallet: string; articleId?: string } = { ownerWallet };
  if (articleId) where.articleId = articleId;

  const grants = await prisma.accessGrant.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  res.json({ success: true, data: { items: grants } });
});

export const revokeGrant = asyncHandler(async (req: Request, res: Response) => {
  const ownerWallet = req.auth?.wallet;
  if (!ownerWallet) throw createError('Unauthorized', 401);
  const { articleId, viewerWallet } = req.body as { articleId?: string; viewerWallet?: string };
  if (!articleId || !viewerWallet) throw createError('articleId and viewerWallet are required', 400);

  const grant = await prisma.accessGrant.findUnique({
    where: { articleId_viewerWallet: { articleId, viewerWallet } },
  });
  if (!grant) throw createError('Grant not found', 404);
  if (grant.ownerWallet !== ownerWallet) throw createError('Unauthorized', 403);

  const updated = await prisma.accessGrant.update({
    where: { id: grant.id },
    data: { revokedAt: new Date() },
  });

  res.json({ success: true, data: updated });
});

function isGrantActive(grant: { expiresAt: Date | null; revokedAt: Date | null }) {
  if (grant.revokedAt) return false;
  if (grant.expiresAt && grant.expiresAt.getTime() <= Date.now()) return false;
  return true;
}

export const keyChallenge = asyncHandler(async (req: Request, res: Response) => {
  const viewerWallet = req.auth?.wallet;
  if (!viewerWallet) throw createError('Unauthorized', 401);
  const { articleId } = req.body as { articleId?: string };
  if (!articleId) throw createError('articleId is required', 400);

  const grant = await prisma.accessGrant.findUnique({
    where: { articleId_viewerWallet: { articleId, viewerWallet } },
  });
  if (!grant || !isGrantActive(grant)) throw createError('Access denied', 403);

  const nonce = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + 5 * 60 * 1000;
  keyChallenges.set(`${articleId}:${viewerWallet}`, { nonce, expiresAt });

  res.json({ success: true, data: { nonce, expiresAt } });
});

export const keyClaim = asyncHandler(async (req: Request, res: Response) => {
  const viewerWallet = req.auth?.wallet;
  if (!viewerWallet) throw createError('Unauthorized', 401);

  const { articleId, nonce, signature } = req.body as {
    articleId?: string;
    nonce?: string;
    signature?: string; // base64
  };
  if (!articleId || !nonce || !signature) throw createError('articleId, nonce, signature are required', 400);

  const chKey = `${articleId}:${viewerWallet}`;
  const ch = keyChallenges.get(chKey);
  if (!ch) throw createError('No active challenge', 400);
  if (ch.expiresAt < Date.now()) {
    keyChallenges.delete(chKey);
    throw createError('Challenge expired', 400);
  }
  if (ch.nonce !== nonce) throw createError('Invalid nonce', 400);

  const message = stableStringify({
    domain: 'aurora-scholar',
    action: 'access-key',
    wallet: viewerWallet,
    articleId,
    nonce,
  });
  const msgBytes = new TextEncoder().encode(message);
  const sigBytes = Buffer.from(signature, 'base64');
  if (sigBytes.length !== 64) throw createError('Invalid signature length', 400);

  const pubkey = new PublicKey(viewerWallet);
  const ok = nacl.sign.detached.verify(msgBytes, sigBytes, pubkey.toBytes());
  if (!ok) throw createError('Invalid signature', 401);

  // Consume challenge + re-check grant
  keyChallenges.delete(chKey);
  const grant = await prisma.accessGrant.findUnique({
    where: { articleId_viewerWallet: { articleId, viewerWallet } },
  });
  if (!grant || !isGrantActive(grant)) throw createError('Access denied', 403);

  const secret = await prisma.articleSecret.findUnique({ where: { articleId } });
  if (!secret) throw createError('Article key not found', 404);

  const keyBytes = decryptArticleKey(secret.encryptedKey);
  res.json({
    success: true,
    data: {
      key: keyBytes.toString('base64'),
    },
  });
});
