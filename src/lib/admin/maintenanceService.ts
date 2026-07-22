import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections } from "@/firebase/schema";
import { logger } from "@/lib/monitoring/logger";

export interface MaintenanceState {
  enabled: boolean;
  message: string;
  startedAt: unknown;
  estimatedEnd?: string;
  startedBy?: string | null;
}

const defaultState: MaintenanceState = {
  enabled: false,
  message: "We are performing scheduled maintenance. We'll be back shortly.",
  startedAt: null,
};

const SETTINGS_DOC_ID = "maintenance";

export async function getMaintenanceState(): Promise<MaintenanceState> {
  if (!db) return defaultState;
  try {
    const snap = await getDoc(doc(db, collections.settings, SETTINGS_DOC_ID));
    if (!snap.exists()) return defaultState;
    return snap.data() as MaintenanceState;
  } catch { return defaultState; }
}

export async function setMaintenanceState(state: Partial<MaintenanceState>, adminUid?: string): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, collections.settings, SETTINGS_DOC_ID), {
      ...state,
      startedAt: state.enabled ? serverTimestamp() : null as unknown as undefined,
      startedBy: adminUid ?? state.startedBy,
    }, { merge: true });
    logger.info("Maintenance state updated", { enabled: state.enabled, adminUid });
  } catch (e) {
    logger.error("Failed to update maintenance state", { error: e instanceof Error ? e.message : String(e) });
  }
}

export async function enableMaintenance(message: string, estimatedEnd: string, adminUid: string): Promise<void> {
  await setMaintenanceState({ enabled: true, message, estimatedEnd, startedBy: adminUid }, adminUid);
}

export async function disableMaintenance(): Promise<void> {
  await setMaintenanceState({ enabled: false, startedAt: null, startedBy: null });
}
