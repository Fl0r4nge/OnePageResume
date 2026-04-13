# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

# ============================================================
# Stage 2: Build everything
# ============================================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

# Build shared -> api -> web
RUN pnpm --filter @one-page-resume/shared build
RUN cd apps/api && npx prisma generate
RUN pnpm --filter @one-page-resume/api build
RUN pnpm --filter @one-page-resume/web build

# Patch shared package.json to point to compiled output for production
RUN node -e "\
  const fs = require('fs');\
  const pkg = JSON.parse(fs.readFileSync('packages/shared/package.json','utf8'));\
  pkg.main = './dist/index.js';\
  pkg.types = './dist/index.d.ts';\
  fs.writeFileSync('packages/shared/package.json', JSON.stringify(pkg, null, 2));\
"


# ============================================================
# Stage 3: Production runner
# ============================================================
FROM node:20-alpine AS runner

# Install Chromium for Puppeteer PDF generation
RUN apk add --no-cache chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# Copy package manifests for install
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/packages/shared ./packages/shared

# Generate Prisma client for production runtime
RUN cd apps/api && npx prisma generate

# Copy entrypoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
