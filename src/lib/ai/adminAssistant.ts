/**
 * AI Admin Assistant
 * Allows admin to type natural language queries like:
 * "Show today's registrations", "Pending OCR", "Revenue", "Membership sales", "Duplicate profiles"
 */
import { db } from "@/firebase/config";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { collections } from "@/firebase/schema";
import { getOcrAnalytics } from "@/lib/ocr/analytics";

export interface AdminChatResponse {
  text: string;
  data?: Record<string, unknown>;
  action?: { type: "navigate"; payload: string };
}

/**
 * Process an admin's natural language query.
 */
export async function processAdminQuery(message: string): Promise<AdminChatResponse> {
  const text = message.toLowerCase().trim();

  // Today's registrations
  if (text.includes("registration") || text.includes("new user") || text.includes("பதிவு")) {
    return await handleRegistrationsQuery();
  }

  // Pending OCR
  if (text.includes("ocr") || text.includes("pending ocr") || text.includes("import")) {
    return await handleOcrQuery();
  }

  // Revenue
  if (text.includes("revenue") || text.includes("payment") || text.includes("வருவாய்")) {
    return await handleRevenueQuery();
  }

  // Membership sales
  if (text.includes("membership") || text.includes("subscription") || text.includes("premium")) {
    return await handleMembershipQuery();
  }

  // Duplicate profiles
  if (text.includes("duplicate") || text.includes("நகல்")) {
    return await handleDuplicateQuery();
  }

  // Analytics / overview
  if (text.includes("analytics") || text.includes("overview") || text.includes("dashboard") || text.includes("summary")) {
    return await handleOverviewQuery();
  }

  // Help
  if (text.includes("help") || text.includes("உதவி")) {
    return {
      text: "I can help you with:\n• Today's registrations\n• Pending OCR imports\n• Revenue overview\n• Membership sales\n• Duplicate profiles\n• Analytics summary\n\nJust ask me anything!",
    };
  }

  return {
    text: "I can help you check registrations, OCR imports, revenue, membership sales, duplicates, and analytics. What would you like to know?",
  };
}

async function handleRegistrationsQuery(): Promise<AdminChatResponse> {
  if (!db) return { text: "Database unavailable" };
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const snap = await getDocs(query(collection(db, collections.users), orderBy("createdAt", "desc"), limit(100)));
    const users = snap.docs.map((d) => d.data() as { createdAt?: { seconds?: number } });
    const todayCount = users.filter((u) => {
      if (!u.createdAt?.seconds) return false;
      return new Date(u.createdAt.seconds * 1000) >= today;
    }).length;
    return {
      text: `Today's registrations: ${todayCount}\nTotal users in last 100: ${users.length}`,
      data: { todayCount, recentCount: users.length },
      action: { type: "navigate", payload: "/admin/users" },
    };
  } catch {
    return { text: "Failed to fetch registration data." };
  }
}

async function handleOcrQuery(): Promise<AdminChatResponse> {
  try {
    const analytics = await getOcrAnalytics();
    return {
      text: `OCR Imports:\n• Total: ${analytics.totalImports}\n• Pending: ${analytics.pendingCount}\n• Approved: ${analytics.approvedCount}\n• Failed: ${analytics.failedCount}\n• Success Rate: ${Math.round(analytics.successRate * 100)}%\n• Avg Confidence: ${Math.round(analytics.averageConfidence * 100)}%`,
      data: analytics as unknown as Record<string, unknown>,
      action: { type: "navigate", payload: "/admin/telegram" },
    };
  } catch {
    return { text: "Failed to fetch OCR data." };
  }
}

async function handleRevenueQuery(): Promise<AdminChatResponse> {
  if (!db) return { text: "Database unavailable" };
  try {
    const snap = await getDocs(query(collection(db, collections.payments), where("status", "==", "success"), limit(500)));
    const payments = snap.docs.map((d) => d.data() as { amount?: number });
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
    return {
      text: `Revenue Summary:\n• Total payments: ${payments.length}\n• Total revenue: ₹${totalRevenue.toLocaleString("en-IN")}`,
      data: { totalRevenue, paymentCount: payments.length },
      action: { type: "navigate", payload: "/admin/payments" },
    };
  } catch {
    return { text: "Failed to fetch revenue data." };
  }
}

async function handleMembershipQuery(): Promise<AdminChatResponse> {
  if (!db) return { text: "Database unavailable" };
  try {
    const snap = await getDocs(query(collection(db, collections.payments), where("status", "==", "success"), limit(500)));
    const payments = snap.docs.map((d) => d.data() as { plan?: string; amount?: number });
    const byPlan: Record<string, { count: number; revenue: number }> = {};
    for (const p of payments) {
      const plan = p.plan ?? "unknown";
      if (!byPlan[plan]) byPlan[plan] = { count: 0, revenue: 0 };
      byPlan[plan].count++;
      byPlan[plan].revenue += p.amount ?? 0;
    }
    const lines = Object.entries(byPlan).map(([plan, data]) => `• ${plan}: ${data.count} sales, ₹${data.revenue.toLocaleString("en-IN")}`);
    return {
      text: `Membership Sales:\n${lines.join("\n")}`,
      data: { byPlan },
      action: { type: "navigate", payload: "/admin/membership" },
    };
  } catch {
    return { text: "Failed to fetch membership data." };
  }
}

async function handleDuplicateQuery(): Promise<AdminChatResponse> {
  try {
    const analytics = await getOcrAnalytics();
    return {
      text: `Duplicate Profiles:\n• Total duplicates: ${analytics.duplicateCount}\n• Duplicate rate: ${Math.round(analytics.duplicateRate * 100)}%`,
      data: { duplicateCount: analytics.duplicateCount, duplicateRate: analytics.duplicateRate },
      action: { type: "navigate", payload: "/admin/telegram" },
    };
  } catch {
    return { text: "Failed to fetch duplicate data." };
  }
}

async function handleOverviewQuery(): Promise<AdminChatResponse> {
  if (!db) return { text: "Database unavailable" };
  try {
    const [userSnap, profileSnap, paymentSnap] = await Promise.all([
      getDocs(query(collection(db, collections.users), limit(1))),
      getDocs(query(collection(db, collections.profiles), limit(1))),
      getDocs(query(collection(db, collections.payments), limit(1))),
    ]);
    const ocrAnalytics = await getOcrAnalytics();
    return {
      text: `Platform Overview:\n• Users: ${userSnap.size}+\n• Profiles: ${profileSnap.size}+\n• Payments: ${paymentSnap.size}+\n• OCR Success Rate: ${Math.round(ocrAnalytics.successRate * 100)}%\n• Avg OCR Confidence: ${Math.round(ocrAnalytics.averageConfidence * 100)}%`,
      action: { type: "navigate", payload: "/admin/dashboard" },
    };
  } catch {
    return { text: "Failed to fetch overview data." };
  }
}
