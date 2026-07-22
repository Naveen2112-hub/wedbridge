/**
 * Shared API Layer
 * Platform-agnostic API client that works in both Next.js and React Native/Expo.
 * Uses fetch (available in both environments) instead of Firebase SDK directly.
 * This allows the mobile app to reuse all API routes without duplicating logic.
 */

const API_BASE = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000");

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Generic API request function. Works in browser, Node.js, and React Native.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ===== AI Endpoints =====

export const aiApi = {
  search: (query: string) => apiRequest<{ filters: unknown; explanation: string; confidence: number }>("/api/ai/search", { method: "POST", body: { query } }),
  chat: (message: string, uid: string) => apiRequest<{ text: string; suggestions?: string[] }>("/api/ai/chat", { method: "POST", body: { message, uid } }),
  recommendations: (uid: string) => apiRequest<{ recommendations: unknown[] }>("/api/ai/recommendations", { method: "POST", body: { uid } }),
  verifyProfile: (photoURL: string, userId: string) => apiRequest<{ isVerified: boolean; fraudScore: number }>("/api/ai/verify-profile", { method: "POST", body: { photoURL, userId } }),
  adminChat: (message: string) => apiRequest<{ text: string }>("/api/ai/admin-chat", { method: "POST", body: { message } }),
  analytics: () => apiRequest<unknown>("/api/ai/analytics"),
};

// ===== Telegram Endpoints =====

export const telegramApi = {
  imports: (status?: string) => apiRequest<{ imports: unknown[] }>(`/api/telegram/imports${status ? `?status=${status}` : ""}`),
  importDetail: (id: string) => apiRequest<{ import: unknown }>(`/api/telegram/imports/${id}`),
  reviewImport: (importId: string, action: "approve" | "reject", reviewedBy: string) => apiRequest<{ ok: boolean }>("/api/telegram/imports/review", { method: "POST", body: { importId, action, reviewedBy } }),
  importAnalytics: () => apiRequest<unknown>("/api/telegram/imports/analytics"),
};

// ===== Auth Endpoints (for mobile - uses Firebase Auth directly) =====

export const authApi = {
  // Mobile apps will use Firebase Auth SDK directly, but these endpoints
  // handle profile creation and token validation.
  validateToken: (token: string) => apiRequest<{ uid: string; email: string }>("/api/auth/validate", { method: "POST", body: { token } }),
};

/**
 * Export a shared types file for the mobile app.
 * The mobile app can import these types to ensure API compatibility.
 */
export type ApiClient = typeof apiRequest;
