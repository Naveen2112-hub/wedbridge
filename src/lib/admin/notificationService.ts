import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections, type NotificationDocument } from "@/firebase/schema";
import { sanitizeText } from "@/lib/utils";

export interface BroadcastInput { title: string; message: string; target: "all" | "premium" | "free" | "vendors"; }
export async function broadcastNotification(input: BroadcastInput): Promise<void> {
  if (!db) return;
  try { await addDoc(collection(db, collections.notifications), { ...input, title: sanitizeText(input.title), message: sanitizeText(input.message), sentBy: "admin", createdAt: serverTimestamp() } as Omit<NotificationDocument, "id">); } catch { /* ignore */ }
}
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) { const cells = lines[i].split(",").map((c) => c.trim()); const row: Record<string, string> = {}; headers.forEach((h, idx) => { row[h] = cells[idx] ?? ""; }); rows.push(row); }
  return rows;
}
export function detectDuplicates(rows: Record<string, string>[], key: string): number[] {
  const seen = new Map<string, number>(); const dupes: number[] = [];
  rows.forEach((r, i) => { const v = r[key]; if (v) { if (seen.has(v)) dupes.push(i); else seen.set(v, i); } });
  return dupes;
}
export interface OCRResult { name: string; dob: string; religion: string; caste: string; education: string; occupation: string; phone: string; district: string; }
export function mockOCR(fileName: string): OCRResult {
  const religions = ["Hindu", "Christian", "Muslim", "Sikh", "Jain"]; const castes = ["Iyer", "Nadar", "Vanniyar", "Reddy", "Chettiar"]; const educations = ["B.E.", "M.B.B.S.", "M.Tech", "B.Com", "M.B.A."]; const occupations = ["Software Engineer", "Doctor", "Teacher", "Business", "Govt Employee"]; const districts = ["Chennai", "Coimbatore", "Madurai", "Tirunelveli", "Salem"]; const idx = fileName.length % 5;
  return { name: `Profile ${idx + 1}`, dob: `199${idx}-0${idx + 1}-1${idx}`, religion: religions[idx], caste: castes[idx], education: educations[idx], occupation: occupations[idx], phone: `98${idx}0${idx}0${idx}0${idx}0`, district: districts[idx] };
}
