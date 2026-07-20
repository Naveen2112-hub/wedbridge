import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { collections, type AppUser } from "@/firebase/schema";

export async function registerUser(email: string, password: string, displayName: string): Promise<{ ok: boolean; error?: string }> {
  if (!auth || !db) return { ok: false, error: "Authentication not configured." };
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    const userData: Omit<AppUser, "uid" | "createdAt"> = {
      email, displayName, role: "user", status: "active", verified: false, membershipTier: "free",
    };
    await setDoc(doc(db, collections.users, cred.user.uid), { ...userData, createdAt: serverTimestamp() });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Registration failed" };
  }
}

export async function loginUser(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!auth) return { ok: false, error: "Authentication not configured." };
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Login failed" };
  }
}

export async function loginWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  if (!auth || !db) return { ok: false, error: "Authentication not configured." };
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const userDoc = await getDoc(doc(db, collections.users, cred.user.uid));
    if (!userDoc.exists()) {
      const userData: Omit<AppUser, "uid" | "createdAt"> = {
        email: cred.user.email ?? "", displayName: cred.user.displayName ?? "", role: "user", status: "active", verified: false, membershipTier: "free",
      };
      await setDoc(doc(db, collections.users, cred.user.uid), { ...userData, createdAt: serverTimestamp() });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Google login failed" };
  }
}

export async function resetPassword(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!auth) return { ok: false, error: "Authentication not configured." };
  try {
    await sendPasswordResetEmail(auth, email);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Reset failed" };
  }
}

export async function logoutUser(): Promise<void> {
  if (auth) await signOut(auth);
}
