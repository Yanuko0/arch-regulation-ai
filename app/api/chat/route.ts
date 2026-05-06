// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/openai/embeddingService';
import { searchRegulations } from '@/lib/pinecone/vectorSearch';
import { buildChatSystemPrompt } from '@/lib/utils/promptBuilder';
import { openaiClient, geminiClient } from '@/lib/openai/openaiClient';
import { parseCitationsFromContent, mergeCitationsWithSearchResults } from '@/lib/utils/citationParser';

// 簡易 Rate Limiting（In-memory，重啟清空；正式環境建議用 Upstash Redis）
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(guestId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(guestId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(guestId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      question,
      regionCode = 'TW',
      subRegion,
      locale = 'zh-TW',
      conversationHistory = [],
      guestId,
    } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: 'MISSING_QUESTION' }, { status: 400 });
    }
    if (!guestId) {
      return NextResponse.json({ error: 'MISSING_GUEST_ID' }, { status: 400 });
    }

    // Rate Limit
    if (!checkRateLimit(guestId)) {
      return NextResponse.json({ error: 'RATE_LIMIT_EXCEEDED' }, { status: 429 });
    }

    // 生成 Embedding + 向量搜尋 (加入容錯機制)
    let searchResults: any[] = [];
    try {
      const embedding = await generateEmbedding(question);
      searchResults = await searchRegulations(embedding, regionCode, 10);
    } catch (embErr: unknown) {
      const errorMsg = embErr instanceof Error ? embErr.message : 'Unknown error';
      console.warn('[chat/route] Embedding 或 Pinecone 搜尋失敗 (可能是額度耗盡):', errorMsg);
    }

    // 組合法規上下文
    const regulationContext = searchResults
      .map((r) => `【${r.metadata.source} ${r.metadata.articleNumber}】\n${r.metadata.content}`)
      .join('\n\n');

    // 建構 System Prompt
    const systemPrompt = buildChatSystemPrompt(regionCode, subRegion, locale, regulationContext);

    // 建立 SSE Stream
    const encoder = new TextEncoder();
    let fullContent = '';

    const stream = new ReadableStream({
      async start(controller) {
        const enqueue = (event: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          // 判斷當前要使用的 AI Provider 與模型
          const provider = process.env.ACTIVE_AI_PROVIDER || 'openai';
          const aiClient = provider === 'gemini' ? geminiClient : openaiClient;
          const modelName = provider === 'gemini'
            ? (process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash')
            : (process.env.OPENAI_CHAT_MODEL || 'gpt-4o');

          // 先送出 sessionId（若是新建立的）
          enqueue({ type: 'session', sessionId: sessionId || `local_session_${Date.now()}` });

          const completion = await aiClient.chat.completions.create({
            model: modelName,
            stream: true,
            temperature: 0.1,
            messages: [
              { role: 'system', content: systemPrompt },
              ...conversationHistory.slice(-8).map((m: { role: string; content: string }) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
              })),
              { role: 'user', content: question },
            ],
          });

          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
              fullContent += delta;
              enqueue({ type: 'delta', content: delta });
            }
          }

          // 解析條款引用
          const parsedCitations = parseCitationsFromContent(fullContent);
          const citations = mergeCitationsWithSearchResults(parsedCitations, searchResults, regionCode);

          const messageId = `msg_${Date.now()}`;

          enqueue({ type: 'citations', citations });
          // 回傳產生的臨時或現有 sessionId
          enqueue({ type: 'done', messageId, sessionId: sessionId || `local_session_${Date.now()}` });
        } catch (err: any) {
          console.error('[chat/route] AI Completion Error:', err);

          // 檢查是否為額度耗盡 (429)
          if (err.status === 429 || err.message?.includes('quota') || err.message?.includes('429')) {
            enqueue({ type: 'error', code: 'QUOTA_EXCEEDED' });
            controller.close();
            return;
          }

          // 其他錯誤則使用模擬模式備援
          const mockText = `⚠️ **系統忙碌中 (Mock Mode)**\n\n由於目前 AI 服務暫時無法連線，系統已自動切換為模擬模式。\n\n針對您的問題：**「${question}」**\n\n請稍後再試，或檢查 API Key 額度是否充足。`;

          for (const char of mockText) {
            fullContent += char;
            enqueue({ type: 'delta', content: char });
            await new Promise((r) => setTimeout(r, 10));
          }

          enqueue({ type: 'citations', citations: [] });
          enqueue({ type: 'done', messageId: `msg_mock_${Date.now()}`, sessionId: sessionId || `local_session_${Date.now()}` });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: unknown) {
    console.error('[chat/route] 錯誤:', err);
    const errorMsg = err instanceof Error ? err.message : 'INTERNAL_ERROR';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
