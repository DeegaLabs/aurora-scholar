import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/error-handler';
import { blockchainService } from '../services/blockchain.service';
import { storageService } from '../services/storage.service';
import { createHash } from 'crypto';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';

// TODO: Import Prisma client and services
// import { prisma } from '../config/database';

export const getArticles = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, author } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Math.min(Number(limit) || 20, 100));

  // MVP: list public articles directly from on-chain program accounts.
  // Future: replace with Prisma + indexer/cache for scale.
  const all = await blockchainService.getPublicArticles(500);
  const filtered = author
    ? all.filter((a) => String(a.author) === String(author))
    : all;

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (pageNum - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  res.json({
    success: true,
    data: {
      items: pageItems.map((a) => ({
        title: a.title,
        author: String(a.author),
        timestamp: a.timestamp,
        contentHash: a.contentHash.toString('hex'),
        arweaveId: a.arweaveId,
        aiScope: a.aiScope,
      })),
      total,
      page: pageNum,
      pageSize,
      totalPages,
    },
  });
});

function sha256Hex(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map((x) => stableStringify(x)).join(',')}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

function verifySignature(params: { author: string; message: string; signatureB64: string }) {
  const pubkey = new PublicKey(params.author);
  const msgBytes = new TextEncoder().encode(params.message);
  const sigBytes = Buffer.from(params.signatureB64, 'base64');
  if (sigBytes.length !== 64) return false;
  return nacl.sign.detached.verify(msgBytes, sigBytes, pubkey.toBytes());
}

/**
 * MVP: upload article payload to Arweave (via Irys) and return hashes + arweaveId
 * so the frontend wallet can submit the on-chain transaction.
 */
export const preparePublish = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, declaredIntuition, aiScope, isPublic, author, signature, signedPayload } = req.body as {
    title?: string;
    content?: string;
    declaredIntuition?: string;
    aiScope?: string;
    isPublic?: boolean;
    author?: string;
    signature?: string; // base64
    signedPayload?: any;
  };

  if (!title || !content || !declaredIntuition || !author || !signature || !signedPayload) {
    throw createError('title, content, declaredIntuition, author, signature, and signedPayload are required', 400);
  }

  // Verify user approval over a deterministic payload (anti-tampering).
  const contentHash = sha256Hex(content);
  const intuitionHash = sha256Hex(declaredIntuition);

  const expectedPayload = {
    author,
    title,
    contentHash,
    intuitionHash,
    aiScope: aiScope || '',
    isPublic: Boolean(isPublic),
    createdAt: signedPayload?.createdAt,
  };

  const createdAtMs = Date.parse(String(expectedPayload.createdAt || ''));
  if (!Number.isFinite(createdAtMs)) throw createError('signedPayload.createdAt is required (ISO string)', 400);
  // 5 min window to reduce replay risk (MVP).
  if (Math.abs(Date.now() - createdAtMs) > 5 * 60 * 1000) throw createError('signedPayload expired', 400);

  const canonical = stableStringify(expectedPayload);
  const ok = verifySignature({ author, message: canonical, signatureB64: signature });
  if (!ok) throw createError('Invalid signature', 401);

  const arweaveId = await storageService.uploadArticle({
    title,
    content,
    declaredIntuition,
    metadata: {
      aiScope: aiScope || '',
      isPublic: Boolean(isPublic),
      author,
      contentHash,
      intuitionHash,
    },
  });

  res.json({
    success: true,
    data: {
      arweaveId,
      arweaveUrl: storageService.getArweaveUrl(arweaveId),
      contentHash,
      intuitionHash,
      title,
      aiScope: aiScope || '',
      isPublic: Boolean(isPublic),
      author,
    },
  });
});

export const getArticleById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: _id } = req.params;
    const { token: _token } = req.query;

    // TODO: Implement with Prisma
    // Check if article exists
    // If private, validate access token

    res.json({
      success: true,
      data: null,
    });
  }
);

export const createArticle = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, content, abstract: _abstract, authorWallet } = req.body;

    if (!title || !content || !authorWallet) {
      throw createError('Missing required fields', 400);
    }

    // TODO: Implement with Prisma
    // Generate content hash
    // Save to database

    res.status(201).json({
      success: true,
      data: {
        id: 'placeholder-id',
        title,
        status: 'DRAFT',
      },
    });
  }
);

export const publishArticle = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isPublic, expiresIn: _expiresIn } = req.body;

    // TODO: Implement full publish flow
    // 1. Get article from database
    // 2. Generate SHA-256 hash
    // 3. Upload to Arweave via Irys
    // 4. Register on Solana
    // 5. Generate access token if private
    // 6. Update database

    res.json({
      success: true,
      data: {
        articleId: id,
        arweaveId: 'placeholder-arweave-id',
        solanaTxId: 'placeholder-solana-tx',
        contentHash: 'placeholder-hash',
        explorerUrl: 'https://explorer.solana.com/tx/placeholder',
        arweaveUrl: 'https://arweave.net/placeholder',
        ...((!isPublic) && {
          privateLink: `http://localhost:3000/article/${id}?token=placeholder-token`,
        }),
      },
    });
  }
);

export const verifyArticle = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: _id } = req.params;

    // TODO: Implement verification
    // 1. Get article from database
    // 2. Fetch content from Arweave
    // 3. Recalculate hash
    // 4. Compare with on-chain hash
    // 5. Return verification result

    res.json({
      success: true,
      data: {
        verified: true,
        message: 'Article is authentic',
        onChainHash: 'placeholder-hash',
        calculatedHash: 'placeholder-hash',
        explorerUrl: 'https://explorer.solana.com/tx/placeholder',
      },
    });
  }
);
