// app/api/calculator/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/openai/embeddingService';
import { searchRegulations } from '@/lib/pinecone/vectorSearch';
import { buildCalculatorSystemPrompt } from '@/lib/utils/promptBuilder';
import { openaiClient, geminiClient } from '@/lib/openai/openaiClient';
import { parseCitationsFromContent, mergeCitationsWithSearchResults } from '@/lib/utils/citationParser';
import { saveMessage } from '@/lib/firebase/firebaseDb';
import { detectCategory } from '@/lib/utils/analytics';

export async function POST(req: NextRequest) {
  try {
    const { 
      question, 
      regionCode = 'TW', 
      subRegion, 
      locale = 'zh-TW', 
      structuredInput,
      sessionId,
      guestId
    } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: 'MISSING_QUESTION' }, { status: 400 });
    }

    // 結合結構化輸入與自然語言問題
    const fullQuery = structuredInput
      ? `${question}。基地面積：${structuredInput.landArea ?? '未知'} m²，用地分區：${structuredInput.zoneType ?? '未知'}，建築用途：${structuredInput.buildingUsage ?? '未知'}`
      : question;

    // 背景儲存使用者問題到 Firebase (如果有會話)
    if (sessionId && !sessionId.startsWith('local_')) {
      saveMessage({
        sessionId,
        role: 'user',
        content: fullQuery,
        category: detectCategory(fullQuery),
      }).catch(err => console.error('[calculator/saveUser] 失敗:', err));
    }

    const embedding = await generateEmbedding(fullQuery);
    const searchResults = await searchRegulations(embedding, regionCode, 8);

    const regulationContext = searchResults
      .map((r) => `【${r.metadata.source} ${r.metadata.articleNumber}】\n${r.metadata.content}`)
      .join('\n\n');

    const systemPrompt = buildCalculatorSystemPrompt(regionCode, subRegion, locale, regulationContext);
    
    const provider = process.env.ACTIVE_AI_PROVIDER || 'openai';
    const aiClient = provider === 'gemini' ? geminiClient : openaiClient;
    const modelName = provider === 'gemini' 
      ? (process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-pro')
      : (process.env.OPENAI_CHAT_MODEL || 'gpt-4o');

    const completion = await aiClient.chat.completions.create({
      model: modelName,
      temperature: 0.05,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: fullQuery },
      ],
    });

    const answer = completion.choices[0]?.message?.content ?? '';

    const parsedCitations = parseCitationsFromContent(answer);
    const citations = mergeCitationsWithSearchResults(parsedCitations, searchResults);

    // 背景儲存 AI 回答到 Firebase
    if (sessionId && !sessionId.startsWith('local_')) {
      saveMessage({
        sessionId,
        role: 'assistant',
        content: answer,
        citations,
        disclaimerShown: true,
      }).catch(err => console.error('[calculator/saveAssistant] 失敗:', err));
    }

    return NextResponse.json({
      success: true,
      data: { answer, citations },
    });
  } catch (err: any) {
    console.error('[calculator/route] 錯誤:', err);
    return NextResponse.json({ 
      error: 'CALCULATOR_ERROR',
      details: err.message
    }, { status: 500 });
  }
}

