#!/bin/bash

# run.sh - Run superviser_app with environment variables
# Usage: ./scripts/run.sh

set -e

cd "$(dirname "$0")/.."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file with the required environment variables."
    exit 1
fi

# Load environment variables from .env file
export $(cat .env | grep -v '^#' | xargs)

# Verify required environment variables
if [ -z "$SUPABASE_URL" ]; then
    echo "Error: SUPABASE_URL not set in .env file"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "Error: SUPABASE_ANON_KEY not set in .env file"
    exit 1
fi

# Build dart-define arguments
DART_DEFINES="--dart-define=SUPABASE_URL=$SUPABASE_URL"
DART_DEFINES="$DART_DEFINES --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"

# Add Google Web Client ID if configured
if [ -n "$GOOGLE_WEB_CLIENT_ID" ]; then
    DART_DEFINES="$DART_DEFINES --dart-define=GOOGLE_WEB_CLIENT_ID=$GOOGLE_WEB_CLIENT_ID"
fi

echo "Running superviser_app with environment variables..."
flutter run $DART_DEFINES
