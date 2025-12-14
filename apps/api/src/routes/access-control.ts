import { Router } from 'express';
import {
  generateToken,
  updateToken,
  revokeToken,
  validateToken,
} from '../controllers/access-control.controller';

export const accessControlRouter: Router = Router();

/**
 * @swagger
 * /api/access-control/generate:
 *   post:
 *     summary: Generate access token for private article
 *     tags: [Access Control]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - articleId
 *               - expiresIn
 *             properties:
 *               articleId:
 *                 type: string
 *               expiresIn:
 *                 type: string
 *                 enum: [24h, 7d, 30d, unlimited]
 *     responses:
 *       200:
 *         description: Access token generated
 */
accessControlRouter.post('/generate', generateToken);

/**
 * @swagger
 * /api/access-control/update:
 *   put:
 *     summary: Update access token expiration
 *     tags: [Access Control]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - articleId
 *               - expiresIn
 *             properties:
 *               articleId:
 *                 type: string
 *               expiresIn:
 *                 type: string
 *                 enum: [24h, 7d, 30d, unlimited]
 *     responses:
 *       200:
 *         description: Token updated
 */
accessControlRouter.put('/update', updateToken);

/**
 * @swagger
 * /api/access-control/revoke:
 *   post:
 *     summary: Revoke access token
 *     tags: [Access Control]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - articleId
 *             properties:
 *               articleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token revoked
 */
accessControlRouter.post('/revoke', revokeToken);

/**
 * @swagger
 * /api/access-control/validate:
 *   get:
 *     summary: Validate access token
 *     tags: [Access Control]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       403:
 *         description: Token is invalid or expired
 */
accessControlRouter.get('/validate', validateToken);
