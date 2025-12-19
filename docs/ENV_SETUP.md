# Environment Variables Setup

This document describes all required and optional environment variables for Aurora Scholar.

## Web App (`apps/web`)

Create `apps/web/.env.local` (or `.env`):

```bash
# API Base URL (required for production, optional for dev with fallback)
# Example: http://localhost:3001 (dev) or https://api.aurora-scholar.com (prod)
NEXT_PUBLIC_API_URL=

# Solana RPC URL (optional, defaults to devnet)
# Example: https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_RPC=
```

**Notes:**
- If `NEXT_PUBLIC_API_URL` is not set, the app will fallback to `http://localhost:3001` in development.
- In production, if not set, it assumes same-origin (behind reverse proxy).

## API (`apps/api`)

Create `apps/api/.env`:

```bash
# Server
PORT=3001

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/aurora_scholar?schema=public"

# JWT Authentication (REQUIRED)
# Generate with: openssl rand -hex 32
API_JWT_SECRET=

# Article Key Encryption (REQUIRED for private articles)
# Generate with: openssl rand -hex 32
ARTICLE_KEY_ENCRYPTION_SECRET=

# AI (Gemini) - REQUIRED
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-pro-latest

# Irys/Arweave Storage - REQUIRED
# Solana private key (base58) for Irys funding/upload
# Generate with: solana-keygen new --outfile irys-keypair.json && solana-keygen pubkey irys-keypair.json
# Then encode: node -e "const kp = require('./irys-keypair.json'); console.log(require('bs58').encode(Buffer.from(kp.secretKey)))"
IRYS_PRIVATE_KEY=
IRYS_NODE_URL=https://devnet.irys.xyz

# Solana RPC (optional, defaults to devnet)
SOLANA_RPC_URL=https://api.devnet.solana.com

# Arweave Gateway (optional, defaults to https://arweave.net)
ARWEAVE_GATEWAY_URL=https://arweave.net
```

## Quick Setup Commands

### Generate Secrets

```bash
# API_JWT_SECRET
openssl rand -hex 32

# ARTICLE_KEY_ENCRYPTION_SECRET
openssl rand -hex 32

# IRYS_PRIVATE_KEY (Solana keypair, base58)
solana-keygen new --outfile irys-keypair.json
node -e "const kp = require('./irys-keypair.json'); console.log(require('bs58').encode(Buffer.from(kp.secretKey)))"
```

### Fund Irys Account (Devnet)

```bash
# Get the Irys account address
solana-keygen pubkey irys-keypair.json

# Fund with SOL (devnet)
solana airdrop 1 <IRYS_PUBKEY> --url devnet
```

## Production Considerations

- **Never commit `.env` files** to version control.
- Use secure secret management (e.g., Vercel, Railway, AWS Secrets Manager).
- Rotate secrets periodically.
- Use different secrets for dev/staging/production.
- Ensure `IRYS_PRIVATE_KEY` has sufficient SOL balance for uploads.


