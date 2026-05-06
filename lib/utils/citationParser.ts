// lib/utils/citationParser.ts
import type { Citation } from '@/types/chat.types';
import type { SearchResult } from '@/types/api.types';
import { REGIONS } from '@/constants/regions';

// AI 回答中的條款標記格式：[來源::條款編號]
// 例：[建築法::第25條]、[Building Control Act::Section 8]
const CITATION_REGEX = /\[([^\]::]+?)::([^\]]+?)\]/g;

export interface ParsedCitation {
  rawTag: string;
  source: string;
  articleNumber: string;
}

/**
 * 從 AI 回答中解析所有 [來源::條款] 標記
 */
export function parseCitationsFromContent(content: string): ParsedCitation[] {
  const matches = [...content.matchAll(CITATION_REGEX)];
  const seen = new Set<string>();
  const result: ParsedCitation[] = [];

  for (const match of matches) {
    const key = `${match[1]}::${match[2]}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({
        rawTag: match[0],
        source: match[1].trim(),
        articleNumber: match[2].trim(),
      });
    }
  }
  return result;
}

/**
 * 將解析出的條款對應到向量搜尋結果，補充原文段落
 */
export function mergeCitationsWithSearchResults(
  parsed: ParsedCitation[],
  searchResults: SearchResult[],
  regionCode?: string
): Citation[] {
  const getNumbers = (str: string) => str.replace(/\D/g, '');
  
  return parsed.map((p, idx) => {
    const pNum = getNumbers(p.articleNumber);
    // 1. 先嘗試精確匹配 (來源 + 條號)
    const exactMatched = searchResults.find((r) => {
      const rNum = getNumbers(r.metadata.articleNumber);
      const isSourceMatch = r.metadata.source.includes(p.source) || p.source.includes(r.metadata.source);
      return isSourceMatch && rNum === pNum && pNum !== '';
    });

    // 2. 若沒找到精確匹配，則回退到來源匹配 (僅用於顯示標題，但不顯示原文)
    const sourceMatched = exactMatched || searchResults.find(
      (r) => r.metadata.source.includes(p.source) || p.source.includes(r.metadata.source)
    );

    let url = exactMatched?.metadata.url || sourceMatched?.metadata.url;

    // 校正網址：確保與當前地區相符，或在缺失時從 REGIONS 常數補足
    if (regionCode) {
      const region = REGIONS.find((r) => r.code === regionCode);
      if (region) {
        const sourceInfo = region.regulationSources.find(
          (s) => s.name.includes(p.source) || p.source.includes(s.name)
        );
        if (sourceInfo) {
          try {
            // 如果沒網址，或是網址的網域不符合該地區的預期 (例如在日本卻連向台灣法規網)
            const expectedDomain = new URL(sourceInfo.url).hostname;
            if (!url || !url.includes(expectedDomain)) {
              url = sourceInfo.url;
            }
          } catch {
            if (!url) url = sourceInfo.url;
          }
        }
      }
    }

    return {
      id: `citation_${idx}_${Date.now()}`,
      regulationId: exactMatched?.id ?? '',
      source: p.source,
      articleNumber: p.articleNumber,
      articleTitle: exactMatched?.metadata.articleTitle,
      excerpt: exactMatched?.metadata.content ?? '', // 只有精確匹配才有原文
      relevanceScore: exactMatched?.score ?? (sourceMatched?.score ? sourceMatched.score * 0.5 : 0),
      url: url,
      isExpanded: false,
    };
  });
}

/**
 * 清除回答中的條款標記（用於純文字顯示）
 */
export function stripCitationTags(content: string): string {
  return content.replace(CITATION_REGEX, (_, source, article) => `（${source} ${article}）`);
}
