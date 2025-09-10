#!/bin/bash

# Database initialization script for Docker
set -e

echo "🔧 Initializing database..."

# Check if Prisma is available
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not available"
    exit 1
fi

# Generate Prisma client
echo "📦 Generating Prisma client..."
if bun run db:generate; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

# Push database schema
echo "🗄️ Pushing database schema..."
if bun run db:push; then
    echo "✅ Database schema pushed successfully"
else
    echo "❌ Failed to push database schema"
    exit 1
fi

echo "🎉 Database initialization complete!"
