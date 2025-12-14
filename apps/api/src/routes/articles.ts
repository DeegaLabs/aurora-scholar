import { Router } from 'express';
import {
  getArticles,
  getArticleById,
  createArticle,
  publishArticle,
  verifyArticle,
} from '../controllers/articles.controller';

export const articlesRouter: Router = Router();

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get all public articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author wallet
 *     responses:
 *       200:
 *         description: List of articles
 */
articlesRouter.get('/', getArticles);

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Access token for private articles
 *     responses:
 *       200:
 *         description: Article details
 *       404:
 *         description: Article not found
 */
articlesRouter.get('/:id', getArticleById);

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create a new article draft
 *     tags: [Articles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - authorWallet
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               abstract:
 *                 type: string
 *               authorWallet:
 *                 type: string
 *     responses:
 *       201:
 *         description: Article created
 */
articlesRouter.post('/', createArticle);

/**
 * @swagger
 * /api/articles/{id}/publish:
 *   post:
 *     summary: Publish article to Arweave and Solana
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPublic
 *             properties:
 *               isPublic:
 *                 type: boolean
 *               expiresIn:
 *                 type: string
 *                 enum: [24h, 7d, 30d, unlimited]
 *     responses:
 *       200:
 *         description: Article published
 */
articlesRouter.post('/:id/publish', publishArticle);

/**
 * @swagger
 * /api/articles/{id}/verify:
 *   post:
 *     summary: Verify article authenticity
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification result
 */
articlesRouter.post('/:id/verify', verifyArticle);
