import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/error-handler';
import { blockchainService } from '../services/blockchain.service';
import { storageService } from '../services/storage.service';
import { createHash } from 'crypto';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import { prisma } from '../config/database';
import { encryptArticleKey } from '../services/article-secrets.service';

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

// Authenticated: list articles from DB for the connected wallet (includes private).
export const getMyArticles = asyncHandler(async (req: Request, res: Response) => {
  const wallet = req.auth?.wallet;
  if (!wallet) throw createError('Unauthorized', 401);

  const items = await prisma.article.findMany({
    where: { authorWallet: wallet },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      title: true,
      contentHash: true,
      arweaveId: true,
      isPublic: true,
      status: true,
      createdAt: true,
      publishedAt: true,
    },
  });

  res.json({
    success: true,
    data: { items },
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
  const { title, content, declaredIntuition, aiScope, isPublic, author, signature, signedPayload, articleKey, encryptedPayload } = req.body as {
    title?: string;
    content?: string;
    declaredIntuition?: string;
    aiScope?: string;
    isPublic?: boolean;
    author?: string;
    signature?: string; // base64
    signedPayload?: any;
    articleKey?: string; // base64, required for private
    encryptedPayload?: { ivB64: string; ciphertextB64: string; alg?: string; v?: number };
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
    isPublic: !!isPublic,
    createdAt: signedPayload?.createdAt,
  };

  const createdAtMs = Date.parse(String(expectedPayload.createdAt || ''));
  if (!Number.isFinite(createdAtMs)) throw createError('signedPayload.createdAt is required (ISO string)', 400);
  // 5 min window to reduce replay risk (MVP).
  if (Math.abs(Date.now() - createdAtMs) > 5 * 60 * 1000) throw createError('signedPayload expired', 400);

  const canonical = stableStringify(expectedPayload);
  const ok = verifySignature({ author, message: canonical, signatureB64: signature });
  if (!ok) throw createError('Invalid signature', 401);

  // If private, require client-side encryption payload + key.
  const isPrivate = !isPublic;
  if (isPrivate) {
    if (!articleKey || !encryptedPayload?.ivB64 || !encryptedPayload?.ciphertextB64) {
      throw createError('articleKey and encryptedPayload are required for private publish', 400);
    }
  }

  const uploadBody = isPrivate
    ? {
        // Store ciphertext only (confidential).
        content: JSON.stringify({
          encrypted: true,
          ...encryptedPayload,
        }),
        title,
        declaredIntuition: '', // do not upload plaintext
      }
    : {
        content,
        title,
        declaredIntuition,
      };

  const arweaveId = await storageService.uploadArticle({
    ...uploadBody,
    metadata: {
      aiScope: aiScope || '',
      isPublic: Boolean(isPublic),
      author,
      contentHash,
      intuitionHash,
      encrypted: isPrivate,
    },
  });

  // Persist minimal metadata in DB so we can manage private grants by articleId (UUID).
  const article = await prisma.article.upsert({
    where: { arweaveId },
    create: {
      title,
      content: isPrivate ? JSON.stringify({ encrypted: true, ...encryptedPayload }) : content,
      contentHash,
      authorWallet: author,
      arweaveId,
      isPublic: Boolean(isPublic),
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    update: {
      title,
      content: isPrivate ? JSON.stringify({ encrypted: true, ...encryptedPayload }) : content,
      contentHash,
      authorWallet: author,
      isPublic: Boolean(isPublic),
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  // For private articles, store encryption key from client (encrypted at rest).
  if (isPrivate) {
    const keyBytes = Buffer.from(articleKey!, 'base64');
    if (keyBytes.length !== 32) throw createError('articleKey must be 32 bytes (base64)', 400);
    const encryptedKey = encryptArticleKey(keyBytes);
    await prisma.articleSecret.upsert({
      where: { articleId: article.id },
      create: { articleId: article.id, encryptedKey },
      update: { encryptedKey },
    });
  }

  res.json({
    success: true,
    data: {
      articleId: article.id,
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
    const { id } = req.params;
    const wallet = req.auth?.wallet;
    if (!wallet) throw createError('Unauthorized', 401);

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        authorWallet: true,
        arweaveId: true,
        isPublic: true,
        publishedAt: true,
      },
    });
    if (!article) throw createError('Article not found', 404);

    if (article.isPublic) {
      res.json({ success: true, data: article });
      return;
    }

    // Private: author or an active grant can access metadata.
    if (article.authorWallet === wallet) {
      res.json({ success: true, data: article });
      return;
    }

    const grant = await prisma.accessGrant.findUnique({
      where: { articleId_viewerWallet: { articleId: id, viewerWallet: wallet } },
    });
    if (!grant) throw createError('Access denied (no grant)', 403);
    if (grant.revokedAt) throw createError('Access revoked', 403);
    if (grant.expiresAt && grant.expiresAt.getTime() <= Date.now()) throw createError('Access expired', 403);

    res.json({ success: true, data: article });
    return;
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

// Get article content from Arweave (public endpoint)
export const getArticleContent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params; // arweaveId

    if (!id) throw createError('Arweave ID is required', 400);

    try {
      // Fetch article JSON from Arweave
      const ar = await storageService.getContent(id);
      
      // Handle case where Arweave returns a string that might be JSON
      let articleData: any = ar;
      if (typeof ar === 'string') {
        try {
          articleData = JSON.parse(ar);
        } catch {
          // If it's not JSON, treat as plain text content
          articleData = { content: ar };
        }
      }
      
      if (!articleData || typeof articleData !== 'object') {
        throw createError('Invalid Arweave payload: expected JSON object', 400);
      }

      // Expected payload shape from our uploader:
      // { content, title, declaredIntuition, timestamp, version, author, contentHash, intuitionHash, aiScope, isPublic, encrypted }
      const content = String((articleData as any).content || '');
      const declaredIntuition = String((articleData as any).declaredIntuition || '');
      const title = String((articleData as any).title || '');
      const author = String((articleData as any).author || '');
      const aiScope = String((articleData as any).aiScope || '');
      const isPublic = Boolean((articleData as any).isPublic ?? true);
      const timestamp = (articleData as any).timestamp ? Number((articleData as any).timestamp) : null;
      const contentHash = (articleData as any).contentHash ? String((articleData as any).contentHash) : null;
      const intuitionHash = (articleData as any).intuitionHash ? String((articleData as any).intuitionHash) : null;

      res.json({
        success: true,
        data: {
          title,
          content,
          declaredIntuition,
          author,
          aiScope,
          isPublic,
          timestamp,
          contentHash,
          intuitionHash,
          arweaveId: id,
        },
      });
    } catch (error: any) {
      // Better error handling
      if (error.message?.includes('not found') || error.message?.includes('404') || error.message?.includes('processing')) {
        throw createError(error.message || 'Article not found on Arweave. It may still be processing.', 404);
      }
      if (error.statusCode === 400) {
        throw error; // Re-throw 400 errors as-is
      }
      throw createError(`Failed to load article content: ${error.message}`, 500);
    }
  }
);

export const verifyArticle = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params; // arweaveId (journal) OR DB id (fallback)

    // 1) Resolve arweaveId (prefer param as arweaveId; fallback to DB lookup)
    let arweaveId = id;
    let dbArticle: { id: string; arweaveId: string | null; authorWallet: string | null; isPublic: boolean | null } | null = null;
    try {
      dbArticle = await prisma.article.findFirst({
        where: {
          OR: [{ id }, { arweaveId: id }],
        },
        select: { id: true, arweaveId: true, authorWallet: true, isPublic: true },
      });
      if (dbArticle?.arweaveId) arweaveId = dbArticle.arweaveId;
    } catch {
      // DB is optional for public on-chain verification; ignore.
    }

    // 2) Fetch article JSON from Arweave
    const ar = await storageService.getContent(arweaveId);
    if (!ar || typeof ar !== 'object') throw createError('Invalid Arweave payload', 400);

    // Expected payload shape from our uploader:
    // { content, title, declaredIntuition, timestamp, version, author, contentHash, intuitionHash, aiScope, isPublic, encrypted }
    const content = String((ar as any).content || '');
    const declaredIntuition = String((ar as any).declaredIntuition || '');
    const title = String((ar as any).title || '');
    const author = String((ar as any).author || dbArticle?.authorWallet || '');
    const aiScope = String((ar as any).aiScope || '');
    const isPublic = Boolean((ar as any).isPublic ?? dbArticle?.isPublic ?? true);

    if (!author) throw createError('Missing author in Arweave payload', 400);
    if (!content) throw createError('Missing content in Arweave payload', 400);
    if (!declaredIntuition) throw createError('Missing declaredIntuition in Arweave payload', 400);

    // 3) Recalculate hashes from Arweave content
    const calculatedContentHashHex = sha256Hex(content);
    const calculatedIntuitionHashHex = sha256Hex(declaredIntuition);

    const arweaveContentHash = (ar as any).contentHash ? String((ar as any).contentHash) : null;
    const arweaveIntuitionHash = (ar as any).intuitionHash ? String((ar as any).intuitionHash) : null;

    const contentHashMatchesArweave = arweaveContentHash ? arweaveContentHash === calculatedContentHashHex : null;
    const intuitionHashMatchesArweave = arweaveIntuitionHash ? arweaveIntuitionHash === calculatedIntuitionHashHex : null;

    // 4) Compare against on-chain record (source of truth)
    const onChain = await blockchainService.getArticle(
      new PublicKey(author),
      Buffer.from(calculatedContentHashHex, 'hex')
    );

    const onChainFound = Boolean(onChain);
    const contentHashMatchesOnChain = onChainFound ? onChain!.contentHash.toString('hex') === calculatedContentHashHex : false;
    const intuitionHashMatchesOnChain = onChainFound ? onChain!.intuitionHash.toString('hex') === calculatedIntuitionHashHex : false;
    const arweaveIdMatchesOnChain = onChainFound ? String(onChain!.arweaveId) === arweaveId : false;
    const titleMatchesOnChain = onChainFound ? String(onChain!.title || '') === title : false;
    const aiScopeMatchesOnChain = onChainFound ? String(onChain!.aiScope || '') === (aiScope || '') : false;
    const isPublicMatchesOnChain = onChainFound ? Boolean(onChain!.isPublic) === Boolean(isPublic) : false;

    const verified =
      onChainFound &&
      contentHashMatchesOnChain &&
      intuitionHashMatchesOnChain &&
      arweaveIdMatchesOnChain &&
      isPublicMatchesOnChain;

    const message = verified
      ? 'Verificado: conteúdo do Arweave bate com o registro on-chain.'
      : !onChainFound
        ? 'Não verificado: registro on-chain não encontrado (programa/cluster incorreto ou artigo não registrado).'
        : 'Não verificado: divergência entre Arweave e on-chain.';

    res.json({
      success: true,
      data: {
        verified,
        message,
        arweaveId,
        author,
        declaredAiScope: aiScope || '',
        // Hashes
        calculated: {
          contentHash: calculatedContentHashHex,
          intuitionHash: calculatedIntuitionHashHex,
        },
        arweave: {
          contentHash: arweaveContentHash,
          intuitionHash: arweaveIntuitionHash,
          contentHashMatches: contentHashMatchesArweave,
          intuitionHashMatches: intuitionHashMatchesArweave,
        },
        onChain: onChainFound
          ? {
              contentHash: onChain!.contentHash.toString('hex'),
              intuitionHash: onChain!.intuitionHash.toString('hex'),
              arweaveId: onChain!.arweaveId,
              title: onChain!.title,
              aiScope: onChain!.aiScope,
              isPublic: onChain!.isPublic,
              timestamp: onChain!.timestamp,
              matches: {
                contentHash: contentHashMatchesOnChain,
                intuitionHash: intuitionHashMatchesOnChain,
                arweaveId: arweaveIdMatchesOnChain,
                title: titleMatchesOnChain,
                aiScope: aiScopeMatchesOnChain,
                isPublic: isPublicMatchesOnChain,
              },
            }
          : null,
      },
    });
  }
);
