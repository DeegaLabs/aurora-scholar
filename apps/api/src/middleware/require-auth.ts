import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './error-handler';

export type AuthClaims = {
  sub: string; // wallet publicKey (base58)
  iat: number;
  exp: number;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: { wallet: string; claims: AuthClaims };
    }
  }
}

function getJwtSecret() {
  const secret = process.env.API_JWT_SECRET;
  if (!secret) {
    throw createError('API_JWT_SECRET is not configured', 500);
  }
  return secret;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  // Public allowlist (MVP):
  // - Journal needs to list public articles without wallet.
  // Note: this middleware is mounted at `/api`, so req.path starts with `/articles`, etc.
  if (req.method === 'GET' && (req.path === '/articles' || req.path.startsWith('/articles/'))) {
    return next();
  }

  const header = req.headers.authorization || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return next(createError('Missing Authorization Bearer token', 401));

  const token = m[1];
  try {
    const claims = jwt.verify(token, getJwtSecret()) as AuthClaims;
    if (!claims?.sub) return next(createError('Invalid token', 401));
    req.auth = { wallet: claims.sub, claims };
    return next();
  } catch (e: any) {
    return next(createError(e?.message || 'Invalid token', 401));
  }
}


