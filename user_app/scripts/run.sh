#!/bin/bash
# AssignX Development Run Script
# Usage: ./scripts/run.sh

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

echo "Running AssignX in debug mode..."

# Build dart-define arguments
DART_DEFINES="--dart-define=SUPABASE_URL=$SUPABASE_URL"
DART_DEFINES="$DART_DEFINES --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"

# Add Google Web Client ID if configured
if [ -n "$GOOGLE_WEB_CLIENT_ID" ]; then
    DART_DEFINES="$DART_DEFINES --dart-define=GOOGLE_WEB_CLIENT_ID=$GOOGLE_WEB_CLIENT_ID"
fi

flutter run $DART_DEFINES
