import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, defaultSettings, type SiteSettings } from "@/lib/admin/schema";

const SETTINGS_DOC = "global";

export async function getSettings(): Promise<SiteSettings> {
  if (!db) return defaultSettings;
  try {
    const snap = await getDoc(doc(db, collections.settings, SETTINGS_DOC));
    if (!snap.exists()) return defaultSettings;
    return { ...defaultSettings, ...(snap.data() as Partial<SiteSettings>) };
  } catch { return defaultSettings; }
}

export async function saveSettings(data: SiteSettings): Promise<void> {
  if (!db) return;
  try { await setDoc(doc(db, collections.settings, SETTINGS_DOC), { ...data, updatedAt: serverTimestamp() }, { merge: true }); } catch { /* ignore */ }
}
