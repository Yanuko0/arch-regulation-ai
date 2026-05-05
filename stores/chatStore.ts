// stores/chatStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, ChatSession, Citation } from '@/types/chat.types';

interface ChatStore {
  // 當前 session
  currentSessionId: string | null;
  sessions: ChatSession[];
  messages: ChatMessage[];

  // 串流狀態
  streamingSessionId: string | null;
  streamingContent: string;
  streamingCitations: Citation[];
  isStreaming: boolean;

  // Actions
  setCurrentSession: (id: string | null) => void;
  setSessions: (sessions: ChatSession[]) => void;
  addSession: (session: ChatSession) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setStreamingSessionId: (id: string | null) => void;
  appendStreamingContent: (delta: string) => void;
  setStreamingCitations: (citations: Citation[]) => void;
  setIsStreaming: (val: boolean) => void;
  resetStreaming: () => void;
  clearMessages: () => void;
  removeSession: (id: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      currentSessionId: null,
      sessions: [],
      messages: [],
      streamingSessionId: null,
      streamingContent: '',
      streamingCitations: [],
      isStreaming: false,

      setCurrentSession: (id) => set({ currentSessionId: id }),
      setSessions: (sessions) => set({ sessions }),
      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setStreamingSessionId: (id) => set({ streamingSessionId: id }),
      appendStreamingContent: (delta) =>
        set((state) => ({ streamingContent: state.streamingContent + delta })),
      setStreamingCitations: (citations) => set({ streamingCitations: citations }),
      setIsStreaming: (val) => set({ isStreaming: val }),
      resetStreaming: () =>
        set({ streamingSessionId: null, streamingContent: '', streamingCitations: [], isStreaming: false }),
      clearMessages: () => set({ messages: [] }),
      removeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
        })),
    }),
    {
      name: 'arch-chat-store',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
        sessions: state.sessions.slice(0, 50), // 只持久化最近50筆
      }),
    }
  )
);
