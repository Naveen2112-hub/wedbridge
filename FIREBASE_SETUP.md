# Firebase Setup Guide

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Name your project (e.g., `wedbridge`)
4. Enable Google Analytics (optional)
5. Click "Create Project"

## 2. Enable Authentication

1. In the Firebase Console, go to **Authentication > Get Started**
2. Enable **Email/Password** sign-in method
3. Enable **Google** sign-in method (optional)
4. Add your app's domain to authorized domains

## 3. Create Firestore Database

1. Go to **Firestore Database > Create Database**
2. Start in **production mode**
3. Choose a location close to your users

## 4. Get Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register the app and copy the configuration
5. Add these values to your `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 5. Deploy Security Rules

### Firestore Rules

Deploy the `firestore.rules` file:

```bash
firebase deploy --only firestore:rules
```

Or paste the contents of `firestore.rules` into the Firebase Console:
- Go to **Firestore > Rules**
- Paste the rules
- Click "Publish"

### Storage Rules

Go to **Storage > Rules** and set:

```
rules_version = '2';
service cloud.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 6. Create Firestore Indexes

The following composite indexes are required (Firebase will auto-suggest these in the console when queries fail):

### Profiles Collection
- `status` (Ascending) + `gender` (Ascending) + `createdAt` (Descending)
- `status` (Ascending) + `gender` (Ascending) + `religion` (Ascending) + `createdAt` (Descending)
- `status` (Ascending) + `gender` (Ascending) + `district` (Ascending) + `createdAt` (Descending)
- `status` (Ascending) + `gender` (Ascending) + `verified` (Ascending) + `createdAt` (Descending)
- `userId` (Ascending) — for profile lookup by user

### Vendors Collection
- `status` (Ascending) + `featured` (Descending) + `rating` (Descending)
- `status` (Ascending) + `category` (Ascending) + `rating` (Descending)
- `status` (Ascending) + `city` (Ascending) + `rating` (Descending)
- `ownerUid` (Ascending) — for vendor lookup by owner

### Vendor Bookings Collection
- `userId` (Ascending) + `createdAt` (Descending)
- `vendorId` (Ascending) + `createdAt` (Descending)
- `createdAt` (Descending)

### Interests Collection
- `toUserId` (Ascending) + `createdAt` (Descending)
- `fromUserId` (Ascending) + `createdAt` (Descending)
- `fromUserId` (Ascending) + `toProfileId` (Ascending)

### Payments Collection
- `userId` (Ascending) + `createdAt` (Descending)
- `status` (Ascending) + `createdAt` (Descending)

### Notifications Collection
- `createdAt` (Descending)

### Audit Log Collection
- `createdAt` (Descending)

## 7. Create Admin User

1. Register a normal user through the app at `/register`
2. In Firebase Console, go to **Firestore > Data > users**
3. Find your user document and edit it
4. Add/set the field `role` to `"admin"`
5. Save the document
6. You can now log in at `/admin/login`

## 8. Storage Setup

1. Go to **Storage > Get Started**
2. Set up with production rules
3. The app uses Storage for:
   - Profile photos
   - Vendor logos and cover images
   - Vendor gallery images
