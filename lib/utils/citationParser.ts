// lib/utils/citationParser.ts
import type { Citation } from '@/types/chat.types';
import type { SearchResult } from '@/types/api.types';

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
  searchResults: SearchResult[]
): Citation[] {
  return parsed.map((p, idx) => {
    // 嘗試模糊匹配：來源名稱包含 + 條款編號相近
    const matched = searchResults.find(
      (r) =>
        (r.metadata.source.includes(p.source) || p.source.includes(r.metadata.source)) &&
        r.metadata.articleNumber.replace(/\s/g, '') === p.articleNumber.replace(/\s/g, '')
    ) ?? searchResults.find(
      (r) => r.metadata.source.includes(p.source) || p.source.includes(r.metadata.source)
    );

    return {
      id: `citation_${idx}_${Date.now()}`,
      regulationId: matched?.id ?? '',
      source: p.source,
      articleNumber: p.articleNumber,
      articleTitle: matched?.metadata.articleTitle,
      excerpt: matched?.metadata.content ?? '',
      relevanceScore: matched?.score ?? 0,
      url: matched?.metadata.url,
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
