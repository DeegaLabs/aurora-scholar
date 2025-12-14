FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8.15.0

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json ./

# Copy packages
COPY packages/sdk ./packages/sdk

# Copy api app
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client (required before building)
RUN pnpm --filter api db:generate

# Build SDK first
RUN pnpm --filter @aurora-scholar/sdk build

# Build API
RUN pnpm --filter api build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files
COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/apps/api/package.json ./
COPY --from=base /app/apps/api/prisma ./prisma
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/sdk/dist ./packages/sdk/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]
