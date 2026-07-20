"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { collections, type AppUser } from "@/firebase/schema";

interface AdminAuthContextType {
  user: User | null;
  adminUser: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({ user: null, adminUser: null, loading: true, login: async () => ({ ok: false }), logout: async () => {} });

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setUser(null); setAdminUser(null); setLoading(false); return; }
      setUser(u);
      if (db) {
        try {
          const snap = await getDoc(doc(db, collections.users, u.uid));
          if (snap.exists()) {
            const data = snap.data() as Omit<AppUser, "uid">;
            if (data.role !== "admin") { setAdminUser(null); if (auth) await signOut(auth); }
            else setAdminUser({ uid: u.uid, ...data });
          } else { setAdminUser(null); }
        } catch { setAdminUser(null); }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth || !db) return { ok: false, error: "Authentication not configured." };
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, collections.users, cred.user.uid));
      if (!snap.exists() || (snap.data() as { role: string }).role !== "admin") {
        await signOut(auth);
        return { ok: false, error: "Access denied. Admin role required." };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Login failed" };
    }
  };

  const logout = async () => { if (auth) await signOut(auth); setAdminUser(null); router.push("/admin/login"); };

  return <AdminAuthContext.Provider value={{ user, adminUser, loading, login, logout }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() { return useContext(AdminAuthContext); }
