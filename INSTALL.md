# Installation Guide

## Prerequisites

- Node.js 18.17 or higher
- npm 9.x or higher
- A Firebase project (see [Firebase Setup](FIREBASE_SETUP.md))

## Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase project configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Set Up Firebase

Follow the [Firebase Setup Guide](FIREBASE_SETUP.md) to:
- Enable Authentication
- Create Firestore collections
- Deploy security rules
- Set up Storage

### 4. Create an Admin User

1. Register a normal user at `/register`
2. In the Firebase Console, go to Firestore > `users` collection
3. Edit your user document and set `role` to `"admin"`
4. You can now access `/admin/login`

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 6. Build for Production

```bash
npm run build
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
