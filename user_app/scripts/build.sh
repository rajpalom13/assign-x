#!/bin/bash
# AssignX Build Script
# Usage: ./scripts/build.sh [debug|release] [apk|appbundle|ios]

set -e

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Validate required environment variables
if [ -z "$SUPABASE_URL" ]; then
    echo "ERROR: SUPABASE_URL not set"
    echo "Create a .env file with SUPABASE_URL=https://your-project.supabase.co"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "ERROR: SUPABASE_ANON_KEY not set"
    echo "Create a .env file with SUPABASE_ANON_KEY=your-anon-key"
    exit 1
fi

BUILD_TYPE=${1:-debug}
TARGET=${2:-apk}

echo "Building AssignX ($BUILD_TYPE $TARGET)..."

# Build dart-define arguments
DART_DEFINES="--dart-define=SUPABASE_URL=$SUPABASE_URL"
DART_DEFINES="$DART_DEFINES --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"

# Add Google Web Client ID if configured
if [ -n "$GOOGLE_WEB_CLIENT_ID" ]; then
    DART_DEFINES="$DART_DEFINES --dart-define=GOOGLE_WEB_CLIENT_ID=$GOOGLE_WEB_CLIENT_ID"
fi

# Build command with dart-define
flutter build $TARGET --$BUILD_TYPE $DART_DEFINES

echo "Build complete!"
