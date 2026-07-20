# WedBridge Installation Guide

## Prerequisites

- Node.js 18.17+ 
- npm or yarn
- Firebase project (Auth, Firestore, Storage enabled)
- Razorpay account (for payments)

## Steps

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd wedbridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`

4. **Deploy Firestore rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication > Email/Password
4. Create Firestore database (production mode)
5. Enable Storage
6. Copy config values to `.env.local`
7. Deploy `firestore.rules`

## Admin User Setup

1. Register a user via the app
2. In Firebase Console > Firestore > `users` collection
3. Set the user's `role` field to `"admin"`
4. Login at `/admin/login`
