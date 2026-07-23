import "server-only";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export interface AuthUser {
  uid: string;
  email: string | null;
}

/**
 * Verifies a Firebase ID token sent from the client in the Authorization
 * header ("Bearer <idToken>"). Returns null when the token is missing or
 * invalid so callers can return a 401 without crashing.
 */
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;

  const idToken = header.slice("Bearer ".length).trim();
  if (!idToken) return null;

  try {
    const decoded = await getFirebaseAdmin().auth().verifyIdToken(idToken);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}
