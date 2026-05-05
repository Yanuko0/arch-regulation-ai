// hooks/useStreamingResponse.ts
'use client';
import { useCallback, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import type { Citation } from '@/types/chat.types';
import type { StreamEvent } from '@/types/api.types';
import { createSession, saveMessage, updateSessionTitle, updateSessionMetadata } from '@/lib/firebase/firebaseDb';
import { detectCategory } from '@/lib/utils/analytics';



interface StreamPayload {
  sessionId: string | null;
  question: string;
  regionCode: string;
  subRegion?: string;
  locale: string;
  conversationHistory: { role: string; content: string }[];
  guestId: string;
}

export function useStreamingResponse() {
  const abortRef = useRef<AbortController | null>(null);
  const {
    appendStreamingContent,
    setStreamingCitations,
    setIsStreaming,
    resetStreaming,
    addMessage,
    setCurrentSession,
    setStreamingSessionId,
    addSession,
  } = useChatStore();

  const startStream = useCallback(
    async (
      payload: StreamPayload,
      onDone?: (sessionId: string) => void,
      onError?: (err: string) => void
    ) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      resetStreaming();
      setIsStreaming(true);

      let activeSessionId = payload.sessionId;
      if (activeSessionId) {
        setStreamingSessionId(activeSessionId);
      }

      try {
        // Optimistic DB Save for User Message
        if (!activeSessionId) {
          try {
            activeSessionId = await createSession({
              regionCode: payload.regionCode,
              subRegion: payload.subRegion,
              locale: payload.locale,
              title: payload.question.slice(0, 30),
              guestId: payload.guestId,
            });
            setCurrentSession(activeSessionId);
            setStreamingSessionId(activeSessionId);
            addSession({
              id: activeSessionId,
              title: payload.question.slice(0, 30),
              guestId: payload.guestId,
              regionCode: payload.regionCode,
              locale: payload.locale,
              messageCount: 1,
              createdAt: new Date() as unknown as any,
              updatedAt: new Date() as unknown as any,
            });
          } catch (dbErr) {
            console.warn('[useStreamingResponse] 建立對話紀錄失敗，切換無痕模式:', dbErr);
            activeSessionId = `local_session_${Date.now()}`;
            setCurrentSession(activeSessionId);
          }
        }
        
        if (activeSessionId && !activeSessionId.startsWith('local_')) {
          // 確保 Session 的地區資訊與當前選擇一致，這對於圖表分析至關重要
          updateSessionMetadata(activeSessionId, {
            regionCode: payload.regionCode,
            subRegion: payload.subRegion || 'ALL'
          }).catch(() => {});

          saveMessage({ 
            sessionId: activeSessionId, 
            role: 'user', 
            content: payload.question,
            category: detectCategory(payload.question),
            metadata: {
              regionCode: payload.regionCode,
              subRegion: payload.subRegion,
              locale: payload.locale,
            }
          }).catch(() => {});
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, sessionId: activeSessionId }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? 'HTTP_ERROR');
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let finalSessionId = payload.sessionId ?? '';
        let finalCitations: Citation[] = [];
        let fullContent = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const lines = decoder.decode(value, { stream: true }).split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(line.slice(6)) as StreamEvent;

              if (event.type === 'error') {
                onError?.(event.code || 'UNKNOWN_ERROR');
                return;
              }

              if (event.type === 'session' && event.sessionId) {
                finalSessionId = event.sessionId;
                setCurrentSession(finalSessionId);
                setStreamingSessionId(finalSessionId);
              } else if (event.type === 'delta' && event.content) {
                fullContent += event.content;
                appendStreamingContent(event.content);
              } else if (event.type === 'citations' && event.citations) {
                finalCitations = event.citations as Citation[];
                setStreamingCitations(finalCitations);
              } else if (event.type === 'done') {
                // 加入完整訊息到本地 store
                addMessage({
                  id: event.messageId ?? `msg_${Date.now()}`,
                  sessionId: finalSessionId,
                  role: 'assistant',
                  content: fullContent,
                  citations: finalCitations,
                  disclaimerShown: true,
                  createdAt: new Date(),
                  metadata: {
                    regionCode: payload.regionCode,
                    subRegion: payload.subRegion,
                    locale: payload.locale,
                  },
                });
                
                // 背景儲存 AI 回答至 Firebase
                if (finalSessionId && !finalSessionId.startsWith('local_')) {
                  saveMessage({
                    sessionId: finalSessionId,
                    role: 'assistant',
                    content: fullContent,
                    citations: finalCitations,
                    disclaimerShown: true,
                    metadata: {
                      regionCode: payload.regionCode,
                      subRegion: payload.subRegion,
                      locale: payload.locale,
                    },
                  }).catch(() => {});
                  
                  if (!payload.sessionId) {
                    updateSessionTitle(finalSessionId, payload.question.slice(0, 40)).catch(() => {});
                  }
                }

                setIsStreaming(false);
                onDone?.(finalSessionId);
              }
            } catch {
              // 忽略單行解析錯誤
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
        setIsStreaming(false);
        onError?.(msg);
      }
    },
    [appendStreamingContent, setStreamingCitations, setIsStreaming, resetStreaming, addMessage, setCurrentSession, addSession]
  );

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, [setIsStreaming]);

  return { startStream, stopStream };
}
