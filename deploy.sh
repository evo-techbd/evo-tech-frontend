#!/bin/bash

# Hostinger Deployment Script for Evo-Tech Frontend
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting Hostinger deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Run this script from the frontend directory."
  exit 1
fi

# Pull latest changes (if using Git)
if [ -d ".git" ]; then
  echo "📥 Pulling latest changes from Git..."
  git pull origin main
else
  echo "⚠️  Not a Git repository. Skipping git pull."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production=false

# Build the application with standalone output
echo "🔨 Building application for production..."
BUILD_STANDALONE=true npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo "❌ PM2 is not installed. Installing PM2 globally..."
  npm install -g pm2
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start or restart with PM2
if pm2 list | grep -q "evo-tech-frontend"; then
  echo "🔄 Restarting application with PM2..."
  pm2 restart ecosystem.config.js
else
  echo "▶️  Starting application with PM2..."
  pm2 start ecosystem.config.js
fi

# Save PM2 process list
pm2 save

# Display status
echo ""
echo "✅ Deployment complete!"
echo ""
pm2 status
echo ""
echo "📊 To view logs: pm2 logs evo-tech-frontend"
echo "🔄 To restart: pm2 restart evo-tech-frontend"
echo "⏹️  To stop: pm2 stop evo-tech-frontend"
