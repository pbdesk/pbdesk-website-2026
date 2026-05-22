#!/bin/bash
set -e

# Merge develop branch into main
# Usage: ./scripts/develop-to-main.sh

echo "🔄 Fetching latest from remote..."
git fetch

echo "🔍 Ensuring develop is up to date..."
git checkout develop
git pull

echo "📦 Switching to main..."
git checkout main
git pull

echo "🔀 Merging develop into main..."
git merge develop
git push

echo "✅ Successfully merged develop → main"
