// types/api.types.ts
import type { Citation } from './chat.types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface StreamEvent {
  type: 'session' | 'delta' | 'citations' | 'done' | 'error';
  sessionId?: string;
  content?: string;
  citations?: Citation[];
  messageId?: string;
  error?: string;
  code?: string;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: {
    source: string;
    articleNumber: string;
    articleTitle?: string;
    content: string;
    regionCode: string;
    url?: string;
  };
}
