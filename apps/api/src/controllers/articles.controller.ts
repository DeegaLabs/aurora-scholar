import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/error-handler';

// TODO: Import Prisma client and services
// import { prisma } from '../config/database';
// import { storageService } from '../services/storage.service';
// import { blockchainService } from '../services/blockchain.service';

export const getArticles = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, author: _author } = req.query;

  // TODO: Implement with Prisma
  // const articles = await prisma.article.findMany({
  //   where: {
  //     isPublic: true,
  //     status: 'PUBLISHED',
  //     ...(author && { authorWallet: author as string }),
  //   },
  //   skip: (Number(page) - 1) * Number(limit),
  //   take: Number(limit),
  //   orderBy: { publishedAt: 'desc' },
  // });

  res.json({
    success: true,
    data: {
      items: [],
      total: 0,
      page: Number(page),
      pageSize: Number(limit),
      totalPages: 0,
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
