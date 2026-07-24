# WedBridge — Tamil Nadu Matrimony & Wedding Marketplace

AI-powered matrimony platform connecting Tamil Nadu families with verified profiles, plus a full wedding vendor marketplace.

## Features

- **AI-Powered Matchmaking** — 21-factor compatibility engine with Gemini AI integration
- **Profile Verification** — Photo authenticity detection, fraud scoring, manual review
- **Vendor Marketplace** — Book photographers, caterers, halls, and more with availability calendars
- **Telegram Bot** — Biodata OCR import, notifications, broadcast system
- **Membership Plans** — Razorpay-integrated subscriptions with invoice generation
- **PWA** — Offline support, push notifications, installable on mobile
- **Admin Dashboard** — Analytics, user management, vendor approval, audit logs
- **Multi-language** — English and Tamil support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Email/Password + Google) |
| Storage | Firebase Storage |
| Payments | Razorpay |
| AI | Google Gemini |
| Notifications | Telegram Bot API |
| Hosting | Vercel |
| Testing | Playwright (E2E) |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Fill in all required values

# Start dev server
npm run dev

# Build for production
npm run build && npm start
```

## Environment Variables

See [`.env.example`](./.env.example) for the full list. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase client API key |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_PROJECT_ID` | Yes | Firebase Admin project ID |
| `FIREBASE_CLIENT_EMAIL` | Yes | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Yes | Firebase Admin private key |
| `RAZORPAY_KEY_ID` | Yes* | Razorpay key ID (*for payments) |
| `RAZORPAY_KEY_SECRET` | Yes* | Razorpay secret (*for payments) |
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram bot token |
| `GEMINI_API_KEY` | Optional | Google Gemini AI key |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:unit` | Run unit tests |

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Public pages (home, about, contact)
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes (server-side)
│   ├── profile/            # User profile pages
│   ├── search/             # Profile search
│   ├── vendor/             # Vendor marketplace
│   └── ...
├── components/             # React components
├── firebase/               # Firebase client config
├── lib/                    # Business logic & services
│   ├── ai/                 # AI engine, matching, recommendations
│   ├── admin/              # Admin services
│   ├── auth/               # Auth provider
│   ├── marketplace/        # Vendor booking, reviews, availability
│   ├── membership/         # Payments, subscriptions, invoices
│   ├── notifications/      # Notification system
│   ├── ocr/                # OCR pipeline for biodata
│   ├── security/           # Rate limiting, sanitization
│   ├── user/               # Blocking, reporting, privacy
│   └── ...
├── firebase/               # Firebase config & schema
└── middleware.ts           # Edge middleware (route protection)
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check with capability flags |
| POST | `/api/razorpay/create-order` | Create Razorpay payment order |
| POST | `/api/razorpay/verify` | Verify payment & activate membership |
| PATCH | `/api/razorpay/verify` | Update payment status (failed/refunded) |
| GET | `/api/invoices` | List user invoices |
| POST | `/api/ai/chat` | AI chat assistant with conversation history |
| POST | `/api/ai/search` | Natural-language search parsing |
| POST | `/api/ai/recommendations` | Personalized recommendations |
| POST | `/api/user/block` | Block a user |
| DELETE | `/api/user/block` | Unblock a user |
| POST | `/api/user/report` | Report a user |
| GET/PUT | `/api/user/privacy` | Get/update privacy settings |
| GET/PUT | `/api/vendor/availability` | Vendor availability management |
| POST | `/api/telegram/webhook` | Telegram webhook handler |
| GET | `/api/ai/analytics` | Admin analytics dashboard |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full deployment guide.

## Security

- All API routes use Firebase Auth verification
- Firestore and Storage rules enforce ownership-based access
- Rate limiting on sensitive endpoints
- CSP headers, HSTS, X-Frame-Options on all responses
- Input sanitization on all user inputs

## License

Proprietary. All rights reserved.
