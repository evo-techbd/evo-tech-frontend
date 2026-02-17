#!/bin/bash

# Post-build script for standalone Next.js builds
# This ensures all necessary files are in place for standalone deployment

set -e

echo "📦 Running post-build checks..."

# Check if standalone build was created
if [ -d ".next/standalone" ]; then
  echo "✅ Standalone build detected"
  
  # Copy public folder to standalone directory
  if [ -d "public" ]; then
    echo "📁 Copying public folder..."
    cp -r public .next/standalone/
  fi
  
  # Copy static files to standalone directory
  if [ -d ".next/static" ]; then
    echo "📁 Copying static files..."
    mkdir -p .next/standalone/.next
    cp -r .next/static .next/standalone/.next/
  fi
  
  echo "✅ Standalone build prepared successfully"
else
  echo "ℹ️  Standard build (non-standalone)"
fi

echo "✅ Post-build checks complete"
