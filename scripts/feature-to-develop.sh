#!/bin/bash
set -e

# Merge a feature branch into develop
# Usage: ./scripts/feature-to-develop.sh [branch-name]

if [ -z "$1" ]; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
else
  BRANCH="$1"
fi

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "develop" ]; then
  echo "❌ Error: Cannot merge $BRANCH into develop. Current branch is $BRANCH."
  exit 1
fi

echo "🔄 Fetching latest from remote..."
git fetch

echo "🔍 Ensuring $BRANCH is up to date..."
git checkout "$BRANCH"
git pull
git push

echo "📦 Switching to develop..."
git checkout develop
git pull

echo "🔀 Merging $BRANCH into develop..."
git merge "$BRANCH"
git push

echo "✅ Successfully merged $BRANCH → develop"
