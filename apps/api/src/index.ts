import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { articlesRouter } from './routes/articles';
import { aiAssistantRouter } from './routes/ai-assistant';
import { accessControlRouter } from './routes/access-control';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/error-handler';
import { requireAuth } from './middleware/require-auth';

// Load environment variables
dotenv.config();

const app: ReturnType<typeof express> = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Swagger configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aurora Scholar API',
      version: '1.0.0',
      description: 'API for decentralized scientific publishing on Solana',
      contact: {
        name: 'Aurora Scholar Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public auth routes (no auth required)
app.use('/api/auth', authRouter);

// All other API endpoints require wallet-auth
app.use('/api', requireAuth);

// Routes
app.use('/api/articles', articlesRouter);
app.use('/api/ai-assistant', aiAssistantRouter);
app.use('/api/access-control', accessControlRouter);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Aurora Scholar API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api/docs`);
});

export default app;
