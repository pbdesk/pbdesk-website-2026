#!/bin/bash
set -e

# Merge a feature branch to develop, then develop to main
# Usage: ./scripts/merge-to-main.sh <branch-name>

if [ -z "$1" ]; then
  echo "Usage: ./scripts/merge-to-main.sh <branch-name>"
  exit 1
fi

BRANCH="$1"

echo "🔄 Fetching latest from remote..."
git fetch

echo "📦 Switching to develop..."
git checkout develop
git pull

echo "🔀 Merging $BRANCH into develop..."
git merge "$BRANCH"
git push

echo "📦 Switching to main..."
git checkout main
git pull

echo "🔀 Merging develop into main..."
git merge develop
git push

echo "✅ Successfully merged $BRANCH → develop → main"
