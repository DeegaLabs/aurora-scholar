import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/error-handler';
import crypto from 'crypto';

// TODO: Import Prisma client
// import { prisma } from '../config/database';

function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

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

export const generateToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { articleId, expiresIn } = req.body;

    if (!articleId || !expiresIn) {
      throw createError('Article ID and expiration are required', 400);
    }

    const token = generateAccessToken();
    const expiresAt = calculateExpiration(expiresIn);

    // TODO: Save to database with Prisma
    // await prisma.accessToken.create({
    //   data: { articleId, token, expiresAt },
    // });

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

  // TODO: Update in database with Prisma
  // await prisma.accessToken.updateMany({
  //   where: { articleId },
  //   data: { expiresAt },
  // });

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

  // TODO: Revoke by setting expiration to now
  // await prisma.accessToken.updateMany({
  //   where: { articleId },
  //   data: { expiresAt: new Date() },
  // });

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

    // TODO: Validate with Prisma
    // const accessToken = await prisma.accessToken.findUnique({
    //   where: { token: token as string },
    // });

    // Placeholder validation
    const isValid = true;
    const isExpired = false;

    if (!isValid) {
      throw createError('Invalid token', 403);
    }

    if (isExpired) {
      throw createError('Token has expired', 403);
    }

    res.json({
      success: true,
      data: {
        valid: true,
        articleId: 'placeholder-article-id',
      },
    });
  }
);
