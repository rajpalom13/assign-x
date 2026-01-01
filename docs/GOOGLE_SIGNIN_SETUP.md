# Google Sign In Setup Guide

## Prerequisites
- Firebase project: `assign-x` (already configured ✅)
- Supabase project: `eowrlcwcqrpavpfspcza` (already configured ✅)

## Step 1: Get Google OAuth Credentials

### Option A: Use Firebase Console (Easier)

1. Go to [Firebase Console - Authentication](https://console.firebase.google.com/project/assign-x/authentication/providers)
2. Click **Google** provider
3. Enable if not already enabled
4. You'll see:
   - **Web SDK configuration** section
   - Copy the **Web client ID** (looks like: `xxx.apps.googleusercontent.com`)
   - Copy the **Web client secret**

### Option B: Use Google Cloud Console (More Control)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=assign-x)
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `AssignX Supabase`
5. Authorized redirect URIs: `https://eowrlcwcqrpavpfspcza.supabase.co/auth/v1/callback`
6. Click **Create**
7. Copy **Client ID** and **Client Secret**

## Step 2: Configure Supabase

1. Go to [Supabase Dashboard - Auth Providers](https://supabase.com/dashboard/project/eowrlcwcqrpavpfspcza/auth/providers)
2. Find **Google** provider
3. Click **Enable**
4. Enter:
   - **Client ID**: (from Step 1)
   - **Client Secret**: (from Step 1)
5. Click **Save**

## Step 3: Configure Android App

### Get SHA-1 Fingerprint

```bash
cd d:/assign-x/user_app/android
./gradlew signingReport
```

Look for the **debug** variant SHA-1 fingerprint.

### Add SHA-1 to Firebase

1. Go to [Firebase Project Settings](https://console.firebase.google.com/project/assign-x/settings/general)
2. Scroll to **Your apps** → Select Android app
3. Click **Add fingerprint**
4. Paste your SHA-1
5. Download the updated `google-services.json`

## Step 4: Update Environment Variables

Add to your `.env` file:

```bash
# Google OAuth (get from Firebase Console)
GOOGLE_WEB_CLIENT_ID=YOUR-WEB-CLIENT-ID.apps.googleusercontent.com
```

## Step 5: Run the App

```bash
cd d:/assign-x/user_app

# Option 1: Using scripts (recommended - automatically loads .env)
./scripts/run.sh

# Option 2: Manual with dart-define
flutter run \
  --dart-define=SUPABASE_URL="https://eowrlcwcqrpavpfspcza.supabase.co" \
  --dart-define=SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --dart-define=GOOGLE_WEB_CLIENT_ID="YOUR-WEB-CLIENT-ID.apps.googleusercontent.com"
```

## How It Works

```
User clicks "Sign in with Google"
         ↓
Google Sign In SDK (native Android)
         ↓
Returns: ID Token + Access Token
         ↓
Your App sends tokens to Supabase
         ↓
Supabase.auth.signInWithIdToken()
         ↓
Supabase validates with Google
         ↓
Returns: Supabase Session + User
```

## Troubleshooting

### Error: "Google Web Client ID not configured"
- Make sure you added `--dart-define=GOOGLE_WEB_CLIENT_ID=...` when running
- Or add `GOOGLE_WEB_CLIENT_ID` to your `.env` file and use `./scripts/run.sh`

### Error: "12500: Sign in failed"
- SHA-1 fingerprint not added to Firebase
- Run `./gradlew signingReport` and add SHA-1 to Firebase Console

### Error: "Invalid ID Token"
- Google provider not enabled in Supabase Dashboard
- Check: https://supabase.com/dashboard/project/eowrlcwcqrpavpfspcza/auth/providers

## Testing

1. Click "Sign in with Google" button
2. Select Google account
3. Grant permissions
4. App should redirect to home screen
5. Check Supabase Dashboard → Authentication → Users to see new user
