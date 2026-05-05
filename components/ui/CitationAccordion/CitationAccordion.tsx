// components/ui/CitationAccordion/CitationAccordion.tsx
'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, FileText } from 'lucide-react';
import type { Citation } from '@/types/chat.types';

interface CitationAccordionProps {
  citations: Citation[];
  labels?: {
    title?: string;
    expand?: string;
    collapse?: string;
    relevance?: string;
    viewSource?: string;
  };
}

export function CitationAccordion({ citations, labels }: CitationAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (!citations || citations.length === 0) return null;

  const toggle = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div
      className="mt-4 px-[15px] rounded-[8px] overflow-hidden border border-zinc-800 bg-zinc-950 animate-fade-in"
      style={{ animationDelay: '0.2s', padding: '8px' }}
    >
      {/* 標題列 */}
      <div className="flex items-center gap-2 px-5 py-3.5 bg-zinc-900 border-b border-zinc-800">
        <FileText size={20} className="text-sky-400" />
        <span className="font-semibold text-zinc-300 uppercase tracking-widest font-size-[20px]">
          {labels?.title ?? 'Referenced Articles'} ({citations.length})
        </span>
      </div>

      {/* 條款列表 */}
      <div className="divide-y divide-zinc-800">
        {citations.map((citation) => {
          const isExpanded = expandedIds.has(citation.id);
          const pct = Math.round(citation.relevanceScore * 100);

          return (
            <div key={citation.id} className="group">
              {/* 可點擊的條款標題 */}
              <button
                onClick={() => toggle(citation.id)}
                aria-expanded={isExpanded}
                className="w-full flex items-center justify-between px-5 py-4 text-left
                           hover:bg-zinc-900 transition-colors duration-200 group"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-semibold text-white truncate">
                    {citation.source}
                  </span>
                  <span className="text-xs text-sky-400 font-medium">
                    {citation.articleNumber}
                    {citation.articleTitle && (
                      <span className="text-zinc-500 font-normal ml-1">
                        — {citation.articleTitle}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {/* 相關度進度條 */}
                  {pct > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-300 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  )}
                  {isExpanded
                    ? <ChevronUp size={16} className="text-zinc-400" />
                    : <ChevronDown size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                  }
                </div>
              </button>

              {/* 展開的條文原文 */}
              {isExpanded && (
                <div className="px-5 pb-5 animate-fade-in-up">
                  <div
                    className="bg-black border border-zinc-800 rounded-xl p-5
                               text-sm text-zinc-300 leading-loose whitespace-pre-wrap
                               font-mono text-[13px]"
                    style={{
                      margin: '8px 0px',
                    }}
                  >
                    {citation.excerpt || '（系統尚未匯入此法規的完整原始文字檔）'}
                  </div>

                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-400
                                 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink size={11} />
                      {labels?.viewSource ?? 'View source regulation'}
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
