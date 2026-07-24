import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { collections } from "@/firebase/schema";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ConversationSession {
  id: string;
  uid: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

const MAX_HISTORY = 20;

export async function getConversationHistory(uid: string, sessionId?: string): Promise<ConversationMessage[]> {
  if (!db) return [];
  try {
    let session: ConversationSession | null = null;

    if (sessionId) {
      const snap = await getDoc(doc(db, collections.conversationHistory, sessionId));
      if (snap.exists()) {
        session = { id: snap.id, ...(snap.data() as Omit<ConversationSession, "id">) };
      }
    }

    if (!session) {
      const snap = await getDocs(
        query(
          collection(db, collections.conversationHistory),
          where("uid", "==", uid),
          orderBy("updatedAt", "desc"),
          limit(1),
        ),
      );
      if (!snap.empty) {
        session = { id: snap.docs[0]!.id, ...(snap.docs[0]!.data() as Omit<ConversationSession, "id">) };
      }
    }

    return session?.messages ?? [];
  } catch {
    return [];
  }
}

export async function saveConversationMessage(
  uid: string,
  message: ConversationMessage,
  sessionId?: string,
): Promise<string | null> {
  if (!db) return null;
  try {
    let session: ConversationSession | null = null;

    if (sessionId) {
      const snap = await getDoc(doc(db, collections.conversationHistory, sessionId));
      if (snap.exists()) {
        session = { id: snap.id, ...(snap.data() as Omit<ConversationSession, "id">) };
      }
    }

    if (!session) {
      const snap = await getDocs(
        query(
          collection(db, collections.conversationHistory),
          where("uid", "==", uid),
          orderBy("updatedAt", "desc"),
          limit(1),
        ),
      );
      if (!snap.empty) {
        session = { id: snap.docs[0]!.id, ...(snap.docs[0]!.data() as Omit<ConversationSession, "id">) };
      }
    }

    const updatedMessages = [...(session?.messages ?? []), message].slice(-MAX_HISTORY);

    if (session) {
      await updateDoc(doc(db, collections.conversationHistory, session.id), {
        messages: updatedMessages,
        updatedAt: serverTimestamp(),
      });
      return session.id;
    }

    const ref = doc(collection(db, collections.conversationHistory));
    await setDoc(ref, {
      uid,
      messages: updatedMessages,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      title: message.content.slice(0, 50),
    });
    return ref.id;
  } catch {
    return null;
  }
}

export async function clearConversationHistory(uid: string, sessionId?: string): Promise<boolean> {
  if (!db) return false;
  try {
    if (sessionId) {
      const snap = await getDoc(doc(db, collections.conversationHistory, sessionId));
      if (snap.exists() && (snap.data() as { uid: string }).uid === uid) {
        await updateDoc(snap.ref, { messages: [], updatedAt: serverTimestamp() });
      }
      return true;
    }
    const snap = await getDocs(
      query(collection(db, collections.conversationHistory), where("uid", "==", uid)),
    );
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { messages: [], updatedAt: serverTimestamp() })));
    return true;
  } catch {
    return false;
  }
}
