import { NextRequest, NextResponse } from "next/server";
import { processChatQuery } from "@/lib/ai/chatAssistant";
import { getAuthUser } from "@/lib/auth-server";
import { checkRateLimit, getClientIP, sanitizeInput } from "@/lib/security/securityService";
import { getConversationHistory, saveConversationMessage } from "@/lib/ai/conversationHistory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_RESPONSES: Record<string, string> = {
  match: "I'm having trouble connecting to the AI service right now. You can still browse profiles on the Search page and use filters to find matches manually.",
  membership: "I can't reach the AI service at the moment. You can view membership plans on the Membership page.",
  vendor: "The AI service is temporarily unavailable. Please browse vendors directly on the Services page.",
  default: "I'm having trouble responding right now. Please try again in a moment, or browse the site directly.",
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("match") || lower.includes("profile")) return FALLBACK_RESPONSES.match!;
  if (lower.includes("membership") || lower.includes("plan") || lower.includes("premium")) return FALLBACK_RESPONSES.membership!;
  if (lower.includes("vendor") || lower.includes("service") || lower.includes("booking")) return FALLBACK_RESPONSES.vendor!;
  return FALLBACK_RESPONSES.default!;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIP(req);
  const rl = checkRateLimit(`ai-chat:${user.uid}:${ip}`, { windowMs: 60_000, maxRequests: 20 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json() as { message: string; profile?: unknown; sessionId?: string };
    const rawMessage = body.message;
    if (!rawMessage || typeof rawMessage !== "string" || rawMessage.length > 2000) {
      return NextResponse.json({ error: "message is required (max 2000 chars)" }, { status: 400 });
    }

    const message = sanitizeInput(rawMessage, 2000);
    const sessionId = body.sessionId;

    // Load conversation history for context
    const history = await getConversationHistory(user.uid, sessionId);

    // Save user message
    await saveConversationMessage(user.uid, {
      role: "user",
      content: message,
      timestamp: new Date(),
    }, sessionId);

    let response: { text: string; suggestions?: string[]; action?: unknown };
    let usedFallback = false;

    try {
      response = await processChatQuery(message, {
        uid: user.uid,
        profile: body.profile as never,
        history,
      });
    } catch {
      // AI service unavailable — return a helpful fallback
      usedFallback = true;
      response = {
        text: getFallbackResponse(message),
        suggestions: ["Show my matches", "Browse vendors", "View membership plans"],
      };
    }

    // Save assistant response
    await saveConversationMessage(user.uid, {
      role: "assistant",
      content: response.text,
      timestamp: new Date(),
      metadata: { usedFallback },
    }, sessionId);

    return NextResponse.json({ ...response, sessionId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Chat failed" },
      { status: 500 },
    );
  }
}
