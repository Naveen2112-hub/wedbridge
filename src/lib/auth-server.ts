import "server-only";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export interface AuthUser {
  uid: string;
  email: string | null;
}

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
