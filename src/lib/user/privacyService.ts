import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections } from "@/firebase/schema";

export type ContactVisibility = "everyone" | "after_accept" | "premium_only";
export type ProfileVisibility = "public" | "members_only" | "premium_only";
export type NotificationPreference = "all" | "important" | "none";

export interface PrivacySettings {
  contactVisibility: ContactVisibility;
  profileVisibility: ProfileVisibility;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showProfilePhoto: boolean;
  allowDirectMessages: boolean;
  notificationPreference: NotificationPreference;
  emailNotifications: boolean;
  smsNotifications: boolean;
  telegramNotifications: boolean;
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  contactVisibility: "after_accept",
  profileVisibility: "members_only",
  showOnlineStatus: true,
  showLastSeen: true,
  showProfilePhoto: true,
  allowDirectMessages: true,
  notificationPreference: "all",
  emailNotifications: true,
  smsNotifications: false,
  telegramNotifications: false,
};

export async function getPrivacySettings(uid: string): Promise<PrivacySettings> {
  if (!db) return DEFAULT_PRIVACY;
  try {
    const snap = await getDoc(doc(db, collections.privacySettings, uid));
    if (!snap.exists()) return DEFAULT_PRIVACY;
    return { ...DEFAULT_PRIVACY, ...snap.data() } as PrivacySettings;
  } catch {
    return DEFAULT_PRIVACY;
  }
}

export async function updatePrivacySettings(uid: string, settings: Partial<PrivacySettings>): Promise<boolean> {
  if (!db) return false;
  try {
    const ref = doc(db, collections.privacySettings, uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { ...settings, updatedAt: serverTimestamp() });
    } else {
      await setDoc(ref, { ...DEFAULT_PRIVACY, ...settings, createdAt: serverTimestamp() });
    }
    return true;
  } catch {
    return false;
  }
}

export function canViewContact(
  viewerUid: string | null,
  ownerUid: string,
  settings: PrivacySettings,
  hasAcceptedInterest: boolean,
  isPremium: boolean,
): boolean {
  if (viewerUid === ownerUid) return true;
  switch (settings.contactVisibility) {
    case "everyone": return true;
    case "after_accept": return hasAcceptedInterest;
    case "premium_only": return isPremium && hasAcceptedInterest;
    default: return false;
  }
}

export function canViewProfile(
  viewerUid: string | null,
  ownerUid: string,
  settings: PrivacySettings,
  isMember: boolean,
  isPremium: boolean,
): boolean {
  if (viewerUid === ownerUid) return true;
  switch (settings.profileVisibility) {
    case "public": return true;
    case "members_only": return isMember;
    case "premium_only": return isPremium;
    default: return true;
  }
}
