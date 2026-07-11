#!/bin/sh
set -e

echo "Applying database schema..."
npx prisma db push --skip-generate

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  node dist/prisma/seed.js
fi

echo "Starting API server..."
exec node dist/src/server.js
