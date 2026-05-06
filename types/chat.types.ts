// types/chat.types.ts
import type { Timestamp } from 'firebase/firestore';

export interface ChatSession {
  id: string;
  regionCode: string;
  subRegion?: string;
  guestId?: string;
  locale: string;
  title: string;
  messageCount: number;
  isDeleted?: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  disclaimerShown: boolean;
  createdAt: Timestamp | Date;
  metadata?: {
    regionCode?: string;
    subRegion?: string;
    locale?: string;
  };
}

export interface Citation {
  id: string;
  regulationId: string;
  source: string;
  articleNumber: string;
  articleTitle?: string;
  excerpt: string;
  relevanceScore: number;
  url?: string;
  isExpanded?: boolean;
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}
