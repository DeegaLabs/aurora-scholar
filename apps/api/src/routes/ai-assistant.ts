import { Router } from 'express';
import { analyzeText, chat } from '../controllers/ai-assistant.controller';

export const aiAssistantRouter: Router = Router();

/**
 * @swagger
 * /api/ai-assistant/analyze:
 *   post:
 *     summary: Analyze text and return suggestions
 *     tags: [AI Assistant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text to analyze
 *               sources:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Sources to consider
 *               cursorPosition:
 *                 type: integer
 *                 description: Current cursor position
 *               agentConfig:
 *                 type: object
 *                 description: Custom agent configuration
 *     responses:
 *       200:
 *         description: Analysis results with suggestions
 */
aiAssistantRouter.post('/analyze', analyzeText);

/**
 * @swagger
 * /api/ai-assistant/chat:
 *   post:
 *     summary: Ask a specific question about the article
 *     tags: [AI Assistant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - text
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question to ask
 *               text:
 *                 type: string
 *                 description: Current article text
 *               cursorPosition:
 *                 type: integer
 *               sources:
 *                 type: array
 *                 items:
 *                   type: object
 *               chatHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *               agentConfig:
 *                 type: object
 *     responses:
 *       200:
 *         description: AI response
 */
aiAssistantRouter.post('/chat', chat);
