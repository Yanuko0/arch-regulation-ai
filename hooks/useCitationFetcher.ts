import { useState, useCallback } from 'react';
import type { Citation } from '@/types/chat.types';

/**
 * 專門處理法規原文抓取的 Hook
 * 實現 UI 與 邏輯分離
 */
export function useCitationFetcher() {
  const [fetchedExcerpts, setFetchedExcerpts] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const fetchArticle = useCallback(async (id: string, citation: Citation, regionCode: string = 'TW') => {
    // 如果已經有資料或是正在抓取中，就跳過
    if (fetchedExcerpts[id] || loadingIds.has(id)) return;
    if (citation.excerpt && !citation.excerpt.includes('尚未匯入')) return;

    setLoadingIds(prev => new Set(prev).add(id));
    
    try {
      const resp = await fetch(`/api/regulations/article?lawName=${encodeURIComponent(citation.source)}&articleNumber=${encodeURIComponent(citation.articleNumber)}&regionCode=${regionCode}`);
      
      if (!resp.ok) {
        setFetchedExcerpts(prev => ({ ...prev, [id]: '目前資料庫暫無資料,請待下次更新' }));
        return;
      }

      const data = await resp.json();
      
      if (data.content) {
        setFetchedExcerpts(prev => ({ ...prev, [id]: data.content }));
      } else {
        setFetchedExcerpts(prev => ({ ...prev, [id]: '目前資料庫暫無資料,請待下次更新' }));
      }
    } catch (err) {
      console.error('[useCitationFetcher] Fetch failed:', err);
      setFetchedExcerpts(prev => ({ ...prev, [id]: '目前資料庫暫無資料,請待下次更新' }));
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [fetchedExcerpts, loadingIds]);

  return { fetchedExcerpts, loadingIds, fetchArticle };
}
