import "server-only";
import { initializeApp, getApps, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | null = null;

function getCredentials(): ServiceAccount {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error("Firebase Admin environment variables are not configured.");
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  return { projectId, clientEmail, privateKey };
}

export function getFirebaseAdmin(): App {
  if (app) return app;

  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }

  app = initializeApp({ credential: cert(getCredentials()) });
  return app;
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseAdmin());
}
