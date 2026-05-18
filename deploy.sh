#!/bin/bash

# Symphony Training Centre - Deploy Script
echo "🚀 Starting deployment process..."

# Check if we're in production mode
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  Setting NODE_ENV to production"
    export NODE_ENV=production
fi

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install --production

# Generate Prisma Client
echo "🗄️  Generating Prisma Client..."
npx prisma generate

# Push database schema
echo "🔄 Pushing database schema..."
npx prisma db push

# Build the application
echo "🔨 Building application..."
npm run build

# Start the production server
echo "🌟 Starting production server..."
npm start
