"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { collections, type AppUser } from "@/firebase/schema";

interface AuthContextType { user: User | null; appUser: AppUser | null; loading: boolean; }
const AuthContext = createContext<AuthContextType>({ user: null, appUser: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && db) {
        try { const snap = await getDoc(doc(db, collections.users, u.uid)); setAppUser(snap.exists() ? { uid: u.uid, ...(snap.data() as Omit<AppUser, "uid">) } : null); } catch { setAppUser(null); }
      } else { setAppUser(null); }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return <AuthContext.Provider value={{ user, appUser, loading }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
