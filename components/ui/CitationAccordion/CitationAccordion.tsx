// components/ui/CitationAccordion/CitationAccordion.tsx
'use client';
import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, FileText } from 'lucide-react';
import type { Citation } from '@/types/chat.types';
import { useCitationFetcher } from '@/hooks/useCitationFetcher';
import { useRegionStore } from '@/stores/regionStore';

interface CitationAccordionProps {
  citations: Citation[];
  regionCode?: string; // 歷史記錄的地區
  labels?: {
    title?: string;
    expand?: string;
    collapse?: string;
    relevance?: string;
    viewSource?: string;
  };
}

export function CitationAccordion({ citations, regionCode: historicalRegionCode, labels }: CitationAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { regionCode: currentRegionCode } = useRegionStore();
  const { fetchedExcerpts, fetchArticle } = useCitationFetcher();
  
  // 優先使用歷史紀錄的地區，若無則使用目前選取的地區
  const effectiveRegionCode = historicalRegionCode || currentRegionCode;

  if (!citations || citations.length === 0) return null;

  // 使用 useCallback 包裹，確保子項目渲染時函數參考不變
  const toggle = useCallback((id: string, citation: Citation) => {
    const isExpanding = !expandedIds.has(id);
    
    setExpandedIds((prev) => {
      const next = new Set(prev);
      isExpanding ? next.add(id) : next.delete(id);
      return next;
    });

    if (isExpanding) {
      fetchArticle(id, citation, effectiveRegionCode);
    }
  }, [expandedIds, fetchArticle, effectiveRegionCode]);

  return (
    <div
      className="mt-4 px-[15px] rounded-[8px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30 animate-fade-in shadow-sm"
      style={{ animationDelay: '0.2s', padding: '8px' }}
    >
      <div className="flex items-center gap-2 px-5 py-3.5 bg-[var(--color-bg-secondary)]/50 border-b border-[var(--color-border)]">
        <FileText size={20} className="text-[var(--color-accent-blue)]" />
        <span className="font-semibold text-[var(--color-text-primary)] uppercase tracking-widest text-[13px]">
          {labels?.title ?? 'Referenced Articles'} ({citations.length})
        </span>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {citations.map((citation) => {
          const isExpanded = expandedIds.has(citation.id);
          const pct = Math.round(citation.relevanceScore * 100);
          const currentContent = fetchedExcerpts[citation.id] || citation.excerpt;

          return (
            <div key={citation.id} className="group">
              <button
                onClick={() => toggle(citation.id, citation)}
                aria-expanded={isExpanded}
                className="w-full flex items-center justify-between px-5 py-4 text-left
                           hover:bg-[var(--color-bg-card)] transition-colors duration-200 group"
              >
                <div className="flex flex-col gap-1 min-w-0" style={{ padding: '3px 5px' }}>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                    {citation.source}
                  </span>
                  <span className="text-xs text-[var(--color-accent-blue)] font-medium">
                    {citation.articleNumber}
                    {citation.articleTitle && (
                      <span className="text-[var(--color-text-muted)] font-normal ml-1">
                        — {citation.articleTitle}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {pct > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-blue)] to-sky-300 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[var(--color-text-secondary)] w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  )}
                  {isExpanded
                    ? <ChevronUp size={16} className="text-[var(--color-text-secondary)]" />
                    : <ChevronDown size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors" />
                  }
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 animate-fade-in-up">
                  <div
                    className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[8px] p-5
                                text-sm text-[var(--color-text-secondary)] leading-loose whitespace-pre-wrap
                                font-mono text-[13px] shadow-inner"
                    style={{ margin: '8px 0px', padding: '12px' }}
                  >
                    {currentContent ? (
                      currentContent
                    ) : (
                      <div className="flex flex-col gap-3 py-2">
                        <div className="flex items-center gap-3 text-[var(--color-accent-blue)] mb-1">
                          <div className="w-4 h-4 rounded-full border-2 border-[var(--color-accent-blue)]/30 border-t-[var(--color-accent-blue)] animate-spin" />
                          <span className="text-xs font-medium tracking-wider">正在檢索法規資料庫...</span>
                        </div>
                        <div className="space-y-3 animate-pulse">
                          <div className="h-4 bg-[var(--color-bg-secondary)] rounded-md w-full" />
                          <div className="h-4 bg-[var(--color-bg-secondary)] rounded-md w-[92%]" />
                          <div className="h-4 bg-[var(--color-bg-secondary)] rounded-md w-[95%]" />
                          <div className="h-4 bg-[var(--color-bg-secondary)] rounded-md w-[40%]" />
                        </div>
                      </div>
                    )}
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
