#!/bin/sh
set -e

# Auto-generate JWT secrets if not provided
if [ -z "$JWT_SECRET" ]; then
  export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  echo "[auto] JWT_SECRET not set, generated a random one. It will change on restart — set it in .env to persist."
fi

if [ -z "$JWT_REFRESH_SECRET" ]; then
  export JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  echo "[auto] JWT_REFRESH_SECRET not set, generated a random one. It will change on restart — set it in .env to persist."
fi

echo "Running database migrations..."
cd /app/apps/api
npx prisma migrate deploy

echo "Starting API server..."
cd /app
node apps/api/dist/app.js
