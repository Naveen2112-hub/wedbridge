/**
 * AI Chat Assistant Service
 * Users can ask natural language questions about their matches, membership, bookings, etc.
 * Routes queries to appropriate services and returns structured responses.
 */
import { db } from "@/firebase/config";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { collections, type ProfileDocument, type InterestDocument } from "@/firebase/schema";
import { calculateAge } from "@/lib/format";

export interface ChatResponse {
  text: string;
  action?: { type: "navigate" | "search" | "upgrade" | "view_profile"; payload?: unknown };
  suggestions?: string[];
}

export interface ConversationMessageLite {
  role: "user" | "assistant";
  content: string;
}

interface ChatContext {
  uid: string;
  profile?: ProfileDocument;
  history?: ConversationMessageLite[];
}

/**
 * Process a user's chat query and return a response.
 */
export async function processChatQuery(
  message: string,
  context: ChatContext,
): Promise<ChatResponse> {
  const text = message.toLowerCase().trim();

  // Match-related queries
  if (text.includes("match") || text.includes("பொருத்தம்")) {
    return {
      text: "I can help you find matches! Your AI matches are ready. Would you like to see your top matches today?",
      action: { type: "navigate", payload: "/ai-matches" },
      suggestions: ["Show my top matches", "Find new matches", "How are matches calculated?"],
    };
  }

  // Membership queries
  if (text.includes("membership") || text.includes("upgrade") || text.includes("premium") || text.includes("ப்ரீமியம்")) {
    return {
      text: "Upgrade to Premium to unlock unlimited interests, contact details, and AI matching. Premium plans start at ₹999/month.",
      action: { type: "navigate", payload: "/membership" },
      suggestions: ["Show membership plans", "Compare plans", "How to upgrade?"],
    };
  }

  // Wedding hall / vendor queries
  if (text.includes("hall") || text.includes("wedding hall") || text.includes("vendor") || text.includes("திருமண மண்டபம்")) {
    return {
      text: "I can help you find wedding halls and vendors! Check out our marketplace for marriage halls, photographers, caterers, and more.",
      action: { type: "navigate", payload: "/services" },
      suggestions: ["Show wedding halls", "Find photographers", "Browse all vendors"],
    };
  }

  // Interest queries
  if (text.includes("interest") || text.includes("அழைப்பு")) {
    try {
      const received = await getReceivedInterests(context.uid);
      const sent = await getSentInterests(context.uid);
      return {
        text: `You have ${received.length} received interests and ${sent.length} sent interests. ${received.filter((i) => i.status === "pending").length} are pending your response.`,
        action: { type: "navigate", payload: "/interests" },
        suggestions: ["Show received interests", "Show sent interests", "Send a new interest"],
      };
    } catch {
      return { text: "I couldn't fetch your interests right now. Please try the Interests page.", action: { type: "navigate", payload: "/interests" } };
    }
  }

  // Booking queries
  if (text.includes("booking") || text.includes("பதிவு")) {
    return {
      text: "You can track your vendor bookings in the My Bookings page.",
      action: { type: "navigate", payload: "/my-bookings" },
      suggestions: ["Show my bookings", "Book a vendor"],
    };
  }

  // Profile queries
  if (text.includes("profile") || text.includes("my profile") || text.includes("சுயவிவரம்")) {
    const completion = context.profile ? calculateProfileCompletion(context.profile) : 0;
    return {
      text: `Your profile is ${completion}% complete. ${completion < 80 ? "Complete your profile to get better matches!" : "Great! Your profile is well-completed."}`,
      action: { type: "navigate", payload: "/profile" },
      suggestions: ["Edit my profile", "View my profile", "Upload photo"],
    };
  }

  // Search queries
  if (text.includes("search") || text.includes("find") || text.includes("தேடு")) {
    return {
      text: "You can search for profiles using our AI Search. Try asking 'Show software engineers in Chennai' or 'Find premium brides under 27'.",
      action: { type: "navigate", payload: "/search" },
      suggestions: ["Search profiles", "AI search tips"],
    };
  }

  // Help
  if (text.includes("help") || text.includes("உதவி")) {
    return {
      text: "I'm your AI assistant! I can help you with:\n• Finding matches\n• Upgrading membership\n• Booking vendors\n• Tracking interests\n• Profile completion\n\nJust ask me anything!",
      suggestions: ["Show my matches", "How to upgrade?", "Find wedding halls"],
    };
  }

  // Default
  return {
    text: "I'm here to help! You can ask me about your matches, membership, interests, bookings, or profile. What would you like to know?",
    suggestions: ["Show my matches", "Upgrade membership", "Find wedding halls", "Track interests"],
  };
}

async function getReceivedInterests(uid: string): Promise<InterestDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.interests), where("toUserId", "==", uid), orderBy("createdAt", "desc"), limit(50)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<InterestDocument, "id">) }));
  } catch {
    return [];
  }
}

async function getSentInterests(uid: string): Promise<InterestDocument[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, collections.interests), where("fromUserId", "==", uid), orderBy("createdAt", "desc"), limit(50)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<InterestDocument, "id">) }));
  } catch {
    return [];
  }
}

function calculateProfileCompletion(profile: ProfileDocument): number {
  const fields = ["name", "dateOfBirth", "religion", "caste", "education", "occupation", "phone", "district", "state", "photoURL", "height", "annualIncome", "motherTongue", "maritalStatus"];
  let filled = 0;
  for (const f of fields) {
    const val = (profile as unknown as Record<string, unknown>)[f];
    if (val && typeof val === "string" && val.trim()) filled++;
    if (val && typeof val === "boolean" && val) filled++;
  }
  return Math.round((filled / fields.length) * 100);
}
