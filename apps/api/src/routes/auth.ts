import { Router } from 'express';
import { authChallenge, authVerify } from '../controllers/auth.controller';

export const authRouter: Router = Router();

/**
 * @swagger
 * /api/auth/challenge:
 *   post:
 *     summary: Create a wallet auth challenge (nonce)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [wallet]
 *             properties:
 *               wallet:
 *                 type: string
 *     responses:
 *       200:
 *         description: Challenge created
 */
authRouter.post('/challenge', authChallenge);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify wallet signature and issue JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [wallet, signature, nonce]
 *             properties:
 *               wallet:
 *                 type: string
 *               nonce:
 *                 type: string
 *               signature:
 *                 type: string
 *                 description: Base64 signature over canonical payload
 *     responses:
 *       200:
 *         description: JWT issued
 */
authRouter.post('/verify', authVerify);



