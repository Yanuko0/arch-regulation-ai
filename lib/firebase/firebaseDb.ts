// lib/firebase/firebaseDb.ts
// 無登入版本：使用 guestSessionId (localStorage)
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, orderBy, query, limit, Timestamp, type DocumentData } from 'firebase/firestore';
import { firebaseApp } from './firebaseConfig';
import type { ChatSession, ChatMessage, Citation } from '@/types/chat.types';

export const db = getFirestore(firebaseApp);

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function createSession(data: {
  regionCode: string;
  subRegion?: string;
  locale: string;
  title: string;
  guestId: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'sessions'), {
    guestId: data.guestId,
    regionCode: data.regionCode,
    subRegion: data.subRegion || 'ALL',
    locale: data.locale,
    title: data.title,
    messageCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

export async function getSession(sessionId: string): Promise<ChatSession | null> {
  const snap = await getDoc(doc(db, 'sessions', sessionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ChatSession;
}

export async function getSessions(guestId: string, pageLimit = 20): Promise<ChatSession[]> {
  const q = query(
    collection(db, 'sessions'),
    orderBy('updatedAt', 'desc'),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as ChatSession))
    .filter((s: DocumentData) => s.guestId === guestId);
}

export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), {
    title,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteSession(sessionId: string): Promise<void> {
  await deleteDoc(doc(db, 'sessions', sessionId));
}

export async function updateSessionMetadata(sessionId: string, data: { regionCode?: string; subRegion?: string; locale?: string }): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ─── Messages ──────────────────────────────────────────────────────────────────

export async function saveMessage(data: {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  disclaimerShown?: boolean;
  category?: string;
}): Promise<string> {
  const ref = await addDoc(
    collection(db, 'sessions', data.sessionId, 'messages'),
    {
      role: data.role,
      content: data.content,
      citations: data.citations ?? [],
      disclaimerShown: data.disclaimerShown ?? false,
      category: data.category ?? '其他',
      createdAt: Timestamp.now(),
    }
  );
  // 更新 session messageCount + updatedAt + category
  const sessionRef = doc(db, 'sessions', data.sessionId);
  const sessionSnap = await getDoc(sessionRef);
  if (sessionSnap.exists()) {
    const sessionData = sessionSnap.data();
    const currentCategories = sessionData.categories || {};
    if (data.category && data.role === 'user') {
      currentCategories[data.category] = (currentCategories[data.category] || 0) + 1;
    }
    
    await updateDoc(sessionRef, {
      messageCount: (sessionData.messageCount ?? 0) + 1,
      categories: currentCategories,
      updatedAt: Timestamp.now(),
    });
  }
  return ref.id;
}

export async function getAllSessionsForAnalytics(): Promise<Record<string, unknown>[]> {
  const q = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'), limit(500));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  const q = query(
    collection(db, 'sessions', sessionId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, sessionId, ...d.data() } as ChatMessage));
}
