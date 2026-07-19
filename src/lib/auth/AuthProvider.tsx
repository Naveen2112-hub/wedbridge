"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, sendPasswordResetEmail, updateProfile, onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/firebase/config";
import { collections, type UserRole, type Language, type Gender, type ContactVisibility } from "@/firebase/schema";

export interface CompleteProfileInput { name: string; gender: Gender; dateOfBirth: string; religion: string; caste: string; district: string; phone: string; email?: string; photoURL?: string; contactVisibility: ContactVisibility; }
interface AuthContextValue {
  user: User | null; role: UserRole | null; profileCompleted: boolean; loading: boolean; configured: boolean;
  registerWithEmail: (name: string, email: string, password: string) => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  completeProfile: (data: CompleteProfileInput) => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
const googleProvider = new GoogleAuthProvider();

function readLanguage(): Language { if (typeof window === "undefined") return "en"; return window.localStorage.getItem("wedbridge:lang") === "ta" ? "ta" : "en"; }

async function ensureUserDoc(user: User, defaults: Partial<Record<string, unknown>> = {}): Promise<{ role: UserRole; profileCompleted: boolean }> {
  if (!db) throw new Error("Firestore not configured");
  const ref = doc(db, collections.users, user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload = { uid: user.uid, role: "user" as UserRole, name: user.displayName ?? defaults.name ?? "", email: user.email ?? "", phone: user.phoneNumber ?? "", gender: null, profileCompleted: false, photoURL: user.photoURL ?? "", contactVisibility: "after_accept" as ContactVisibility, language: readLanguage(), createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...defaults };
    await setDoc(ref, payload);
    return { role: "user", profileCompleted: false };
  }
  const data = snap.data();
  return { role: (data.role as UserRole) ?? "user", profileCompleted: Boolean(data.profileCompleted) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured || !auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (u) => { setUser(u); if (u && db) { const meta = await ensureUserDoc(u); setRole(meta.role); setProfileCompleted(meta.profileCompleted); } else { setRole(null); setProfileCompleted(false); } setLoading(false); });
    return () => unsub();
  }, [configured]);

  const registerWithEmail = useCallback(async (name: string, email: string, password: string) => {
    if (!auth || !db) throw new Error("auth.error.notConfigured");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await ensureUserDoc(cred.user, { name });
    setUser(cred.user); setRole("user"); setProfileCompleted(false);
    return cred.user;
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth || !db) throw new Error("auth.error.notConfigured");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const meta = await ensureUserDoc(cred.user);
    setUser(cred.user); setRole(meta.role); setProfileCompleted(meta.profileCompleted);
    return cred.user;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!auth || !db) throw new Error("auth.error.notConfigured");
    const cred = await signInWithPopup(auth, googleProvider);
    const meta = await ensureUserDoc(cred.user, { name: cred.user.displayName ?? "" });
    setUser(cred.user); setRole(meta.role); setProfileCompleted(meta.profileCompleted);
    return cred.user;
  }, []);

  const resetPassword = useCallback(async (email: string) => { if (!auth) throw new Error("auth.error.notConfigured"); await sendPasswordResetEmail(auth, email); }, []);

  const logout = useCallback(async () => { if (!auth) return; await signOut(auth); setUser(null); setRole(null); setProfileCompleted(false); }, []);

  const completeProfile = useCallback(async (data: CompleteProfileInput) => {
    if (!auth || !db || !auth.currentUser) throw new Error("auth.error.notConfigured");
    const ref = doc(db, collections.users, auth.currentUser.uid);
    await setDoc(ref, { name: data.name, gender: data.gender, dateOfBirth: data.dateOfBirth, religion: data.religion, caste: data.caste, district: data.district, phone: data.phone, email: data.email ?? auth.currentUser.email ?? "", photoURL: data.photoURL ?? auth.currentUser.photoURL ?? "", contactVisibility: data.contactVisibility, profileCompleted: true, updatedAt: serverTimestamp() }, { merge: true });
    setProfileCompleted(true);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, role, profileCompleted, loading, configured, registerWithEmail, loginWithEmail, loginWithGoogle, resetPassword, logout, completeProfile }), [user, role, profileCompleted, loading, configured, registerWithEmail, loginWithEmail, loginWithGoogle, resetPassword, logout, completeProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be used within an AuthProvider"); return ctx; }
