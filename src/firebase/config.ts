import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyBZFm9tNyR6uCoImTGT-ht4hHKyGCGtr1g",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "wedbridge-db0e2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "wedbridge-db0e2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "wedbridge-db0e2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "497344418429",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:497344418429:web:9a51144414d4c95d215714",
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (typeof window !== "undefined" && firebaseConfig.apiKey) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
    enableIndexedDbPersistence(dbInstance).catch(() => { /* already enabled or unsupported */ });
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export const db = dbInstance;
export const auth = authInstance;
export const storage = storageInstance;
export { app };
export const isFirebaseConfigured = Boolean(app);
