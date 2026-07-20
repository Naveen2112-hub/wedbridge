# Deployment Guide

## Option 1: Vercel (Recommended)

### Prerequisites
- A Vercel account
- A Firebase project

### Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Configure environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

4. Deploy. Vercel will automatically detect Next.js and run `npm run build`.

5. Your app will be live at `https://your-project.vercel.app`

### Custom Domain
1. Go to your Vercel project settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

## Option 2: Firebase Hosting

### Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)

### Steps

1. Initialize Firebase Hosting:
```bash
firebase init hosting
```
- Set public directory to `out` (for static export) or use the framework-aware setup
- Configure as a single-page app: No
- Set up automatic builds with GitHub: optional

2. For Next.js on Firebase Hosting, use `firebase-frameworks`:
```bash
npm install -g @firebase-frameworks/firebase
```

3. Build and deploy:
```bash
npm run build
firebase deploy --only hosting
```

## Environment Variables

Ensure all the following are set in your deployment environment:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID (optional) |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity ID (optional) |

## Post-Deployment Checklist

- [ ] Firebase Authentication is enabled
- [ ] Firestore security rules are deployed
- [ ] Storage rules are deployed
- [ ] Admin user is created with `role: "admin"`
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] All environment variables are set
- [ ] Analytics tracking is verified
- [ ] PWA manifest is accessible at `/manifest.json`
- [ ] Sitemap is accessible at `/sitemap.xml`
- [ ] robots.txt is accessible at `/robots.txt`
