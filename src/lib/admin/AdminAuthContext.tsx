"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { collections, type AppUser, type Language } from "@/firebase/schema";

interface AdminAuthContextType { user: User | null; adminUser: AppUser | null; loading: boolean; login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>; logout: () => Promise<void>; }
const AdminAuthContext = createContext<AdminAuthContextType>({ user: null, adminUser: null, loading: true, login: async () => ({ ok: false }), logout: async () => {} });

function readLanguage(): Language { if (typeof window === "undefined") return "en"; return window.localStorage.getItem("wedbridge:lang") === "ta" ? "ta" : "en"; }

function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-credential": "Invalid email or password. Please check your credentials.",
    "auth/wrong-password": "Wrong password. Please try again.",
    "auth/user-not-found": "No account found with this email.",
    "auth/user-disabled": "This account has been disabled. Contact support.",
    "auth/too-many-requests": "Too many failed attempts. Try again later.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/missing-password": "Please enter your password.",
    "auth/internal-error": "An internal error occurred. Please try again.",
  };
  return map[code] ?? (e instanceof Error ? e.message : "Login failed. Please try again.");
}

async function readUserDoc(user: User): Promise<AppUser | null> {
  if (!db) return null;
  const ref = doc(db, collections.users, user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as Omit<AppUser, "uid">;
  return { uid: user.uid, ...data };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }

    let settled = false;
    const settle = () => { if (!settled) { settled = true; setLoading(false); } };

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setUser(null); setAdminUser(null); settle(); return; }
      setUser(u);
      try {
        const appUser = await readUserDoc(u);
        if (appUser && appUser.role === "admin") setAdminUser(appUser);
        else setAdminUser(null);
      } catch { setAdminUser(null); }
      settle();
    });

    const timeout = setTimeout(() => settle(), 3000);
    return () => { unsub(); clearTimeout(timeout); };
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) return { ok: false, error: "Authentication is not configured." };
    if (!db) return { ok: false, error: "Database is unavailable. Please try again later." };
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      try {
        const appUser = await readUserDoc(cred.user);
        if (!appUser || appUser.role !== "admin") { await signOut(auth); return { ok: false, error: "Access denied. Administrator account required." }; }
        setAdminUser(appUser);
        return { ok: true };
      } catch {
        await signOut(auth);
        return { ok: false, error: "Unable to verify admin permissions. Check your connection and try again." };
      }
    } catch (e) { return { ok: false, error: friendlyAuthError(e) }; }
  };
  const logout = async () => { if (auth) await signOut(auth); setAdminUser(null); router.push("/admin/login"); };

  return <AdminAuthContext.Provider value={{ user, adminUser, loading, login, logout }}>{children}</AdminAuthContext.Provider>;
}
export function useAdminAuth() { return useContext(AdminAuthContext); }
