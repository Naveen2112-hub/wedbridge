# Firebase Setup Guide for WedBridge

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it "wedbridge" (or your preferred name)
4. Enable Google Analytics (optional)
5. Wait for project creation

## 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. (Optional) Enable **Google** sign-in for social login

## 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Production mode**
4. Select a location close to your users (e.g., `asia-south1` for India)
5. Wait for provisioning

## 4. Enable Storage

1. Go to **Storage**
2. Click "Get started"
3. Choose production rules
4. Select same location as Firestore

## 5. Get Configuration

1. Go to **Project Settings** (gear icon)
2. Under "Your apps", click the web icon `</>`
3. Register app name "wedbridge"
4. Copy the `firebaseConfig` values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

## 6. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Firestore only)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## 7. Create Composite Indexes

Firebase Console > Firestore > Indexes > Composite. Create:

| Collection | Fields |
|---|---|
| profiles | status (asc) + gender (asc) + createdAt (desc) |
| profiles | status (asc) + gender (asc) + religion (asc) + createdAt (desc) |
| profiles | status (asc) + gender (asc) + district (asc) + createdAt (desc) |
| profiles | userId (asc) + createdAt (desc) |
| vendors | status (asc) + featured (desc) + rating (desc) |
| vendors | status (asc) + category (asc) + rating (desc) |
| vendors | ownerUid (asc) |
| vendorBookings | userId (asc) + createdAt (desc) |
| vendorBookings | vendorId (asc) + createdAt (desc) |
| vendorPackages | vendorId (asc) + createdAt (desc) |
| vendorGallery | vendorId (asc) + createdAt (desc) |
| vendorReviews | vendorId (asc) + createdAt (desc) |
| interests | toUserId (asc) + createdAt (desc) |
| interests | fromUserId (asc) + createdAt (desc) |
| interests | fromUserId (asc) + toProfileId (asc) |
| payments | userId (asc) + createdAt (desc) |
| notifications | createdAt (desc) |
| auditLog | createdAt (desc) |

## 8. Storage Rules

Deploy these rules via Firebase Console > Storage > Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    match /vendors/{vendorId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 9. Create Admin User

1. Register a user via the WedBridge app
2. Go to Firebase Console > Firestore > `users` collection
3. Find your user document
4. Edit the `role` field to `"admin"`
5. Login at `/admin/login`

## 10. Collections Overview

| Collection | Purpose |
|---|---|
| users | User accounts with role and membership tier |
| profiles | Matrimony profiles |
| vendors | Wedding service vendors |
| vendorPackages | Vendor pricing packages |
| vendorGallery | Vendor photo gallery |
| vendorReviews | Vendor reviews and ratings |
| vendorBookings | User booking requests |
| payments | Payment transactions |
| interests | Profile interest connections |
| notifications | Broadcast notifications |
| auditLog | Admin action audit trail |
| settings | Site-wide settings |
