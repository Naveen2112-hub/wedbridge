import "server-only";
import { initializeApp, getApps, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | null = null;
// Track whether validation has run in this process
let validated = false;

function getCredentials(): ServiceAccount {
  const projectId      = process.env.FIREBASE_PROJECT_ID;
  const clientEmail    = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw  = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      "Firebase Admin is not configured. " +
      "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment.",
    );
  }

  // Vercel stores the private key with literal \n — convert back to newlines
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  return { projectId, clientEmail, privateKey };
}

export function getFirebaseAdmin(): App {
  if (app) return app;

  // Reuse existing app (e.g. during hot-reload in dev)
  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0]!;
    return app;
  }

  app = initializeApp({ credential: cert(getCredentials()) });

  // Run env validation once per process (logs warnings but does not throw for optional vars)
  if (!validated) {
    validated = true;
    import("@/lib/env/validate")
      .then(({ validateEnv }) => validateEnv())
      .catch(() => {});
  }

  return app;
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseAdmin());
}
