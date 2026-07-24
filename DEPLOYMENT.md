# WedBridge Deployment Guide

## Prerequisites

1. **Firebase Project** — Create at [console.firebase.google.com](https://console.firebase.google.com)
2. **Razorpay Account** — Create at [razorpay.com](https://razorpay.com), complete KYC
3. **Telegram Bot** — Create via [@BotFather](https://t.me/BotFather)
4. **Gemini API Key** — Get from [aistudio.google.com](https://aistudio.google.com)
5. **Vercel Account** — Create at [vercel.com](https://vercel.com)

## Step 1: Firebase Setup

1. Create a Firebase project
2. Enable **Authentication** → Sign-in method → Email/Password and Google
3. Enable **Firestore Database** (production mode)
4. Enable **Storage**
5. Create a Web App in Firebase project settings
6. Copy the Firebase config (apiKey, authDomain, etc.)
7. Generate a Service Account key (Project Settings → Service Accounts → Generate New Private Key)

### Deploy Rules and Indexes

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes (takes 5-10 minutes)
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage
```

## Step 2: Environment Variables

Copy `.env.example` to `.env.local` and fill in all values. For Vercel deployment, add all variables in the Vercel dashboard under Settings → Environment Variables.

### Critical Variables

| Variable | Where to Find |
|----------|---------------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project Settings → Web App |
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings → Service Accounts |
| `FIREBASE_CLIENT_EMAIL` | Service Account JSON → `client_email` |
| `FIREBASE_PRIVATE_KEY` | Service Account JSON → `private_key` (paste with `\n` characters) |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys |
| `TELEGRAM_BOT_TOKEN` | BotFather → /newbot → copy token |
| `GEMINI_API_KEY` | Google AI Studio → Get API Key |

## Step 3: Vercel Deployment

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Framework preset: **Next.js** (auto-detected)
4. Add all environment variables from `.env.example`
5. Deploy

### Vercel Configuration

The `vercel.json` file configures:
- **Region**: `bom1` (Mumbai — closest to Tamil Nadu users)
- **Function timeouts**: AI routes 60s, Telegram webhook 300s
- **Cache headers**: Static chunks 1 year immutable, service worker no-cache

## Step 4: Telegram Webhook Setup

After deploying, register the Telegram webhook:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://yourdomain.com/api/telegram/webhook" \
  -d "secret_token=<YOUR_TELEGRAM_WEBHOOK_SECRET>"
```

Generate the webhook secret:
```bash
openssl rand -hex 32
```

## Step 5: Post-Deploy Verification

1. Visit `https://yourdomain.com/api/health` — all capabilities should be `true`
2. Test user registration and login
3. Test membership purchase with Razorpay test mode
4. Test Telegram bot by sending a message
5. Run Lighthouse audit (target: Performance ≥ 90, SEO = 100)

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:
1. Runs ESLint
2. Runs TypeScript typecheck
3. Builds the project
4. Deploys to Vercel (on push to main branch)

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VERCEL_ORG_ID` | Vercel org ID |

## Rollback

To rollback a Vercel deployment:
1. Go to Vercel dashboard → Deployments
2. Find the last stable deployment
3. Click "Promote to Production"
