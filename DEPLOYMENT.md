# WedBridge Deployment Guide

## Vercel (Recommended)

1. Push code to GitHub
2. Import repo at [vercel.com](https://vercel.com/new)
3. Add environment variables in Vercel project settings
4. Deploy

## Environment Variables

All `NEXT_PUBLIC_*` variables must be set before build:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

## Firebase Configuration

### Firestore Rules

Deploy `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

### Storage Rules

Set Storage rules to allow owner-verified writes:
- Profiles: `request.resource.metadata.ownerId == request.auth.uid`
- Vendors: vendor owner verification via Firestore lookup

### Indexes

Create composite indexes in Firebase Console for:
- `profiles`: `status` + `gender` + `createdAt` (desc)
- `profiles`: `status` + `gender` + `religion` + `createdAt` (desc)
- `vendors`: `status` + `featured` + `rating` (desc)
- `vendorBookings`: `userId` + `createdAt` (desc)
- `vendorBookings`: `vendorId` + `createdAt` (desc)
- `interests`: `toUserId` + `createdAt` (desc)
- `interests`: `fromUserId` + `toProfileId`

## Post-Deployment Checklist

- [ ] Firebase Auth enabled (Email/Password)
- [ ] Firestore rules deployed
- [ ] Storage rules configured
- [ ] Composite indexes created
- [ ] Razorpay key configured
- [ ] Admin user role set in Firestore
- [ ] Service worker registering (check in production)
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots accessible at `/robots.txt`
- [ ] Manifest at `/manifest.webmanifest`
