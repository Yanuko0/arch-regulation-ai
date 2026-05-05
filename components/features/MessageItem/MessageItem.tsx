// components/features/MessageItem/MessageItem.tsx
'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot } from 'lucide-react';
import { CitationAccordion } from '@/components/ui/CitationAccordion/CitationAccordion';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner/DisclaimerBanner';
import { getDisclaimerText } from '@/lib/utils/promptBuilder';
import { stripCitationTags } from '@/lib/utils/citationParser';
import { useAuth } from '@/hooks/useAuth';
import type { ChatMessage } from '@/types/chat.types';

interface MessageItemProps {
  message: ChatMessage;
  locale?: string;
  citationLabels?: {
    title?: string;
    expand?: string;
    collapse?: string;
    relevance?: string;
    viewSource?: string;
  };
}

export function MessageItem({ message, locale = 'zh-TW', citationLabels }: MessageItemProps) {
  const { user } = useAuth();
  const isUser = message.role === 'user';
  const displayContent = isUser ? message.content : stripCitationTags(message.content);

  return (
    <div
      className={`flex gap-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* 頭像 */}
      <div
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base border overflow-hidden
                    ${isUser
            ? 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-primary)]'
            : 'bg-white border-[var(--color-border)] shadow-sm'
          }`}
      >
        {isUser ? (
          user?.photoURL ? (
            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
          ) : (
            <User size={18} />
          )
        ) : (
          <img src="/bot-avatar.png" alt="Bot" className="w-full h-full object-cover" />
        )}
      </div>

      {/* 氣泡內容 */}
      <div className={`flex flex-col gap-3 flex-1 min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-2 py-1 text-base leading-loose max-w-full
                      ${isUser
              ? 'text-[var(--color-text-secondary)]'
              : 'text-[var(--color-text-primary)] w-full'
            }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content border-l-2 border-[var(--color-border)] pl-6 ml-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {displayContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* AI 回答：條款引用 + 免責聲明 */}
        {!isUser && (
          <div className="pl-8 w-full rounded-[5px] p-[5px]" style={{ marginBottom: '25px' }}>
            {message.citations && message.citations.length > 0 && (
              <CitationAccordion
                citations={message.citations}
                regionCode={message.metadata?.regionCode}
                labels={citationLabels}
              />
            )}
            {message.disclaimerShown && (
              <div className="mt-4 rounded-[5px] p-[5px]">
                <DisclaimerBanner
                  content={getDisclaimerText(locale)}
                  compact
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
