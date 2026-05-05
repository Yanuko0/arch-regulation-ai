// app/embed/page.tsx — 嵌入用精簡版頁面（無語系前綴）
'use client';
import { useEffect, useRef, useState } from 'react';
import { Bot, Building2, Send, ExternalLink } from 'lucide-react';
import { CitationAccordion } from '@/components/ui/CitationAccordion/CitationAccordion';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner/DisclaimerBanner';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { getDisclaimerText } from '@/lib/utils/promptBuilder';
import { stripCitationTags } from '@/lib/utils/citationParser';
import { REGIONS } from '@/constants/regions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Citation } from '@/types/chat.types';
import '../globals.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
}

export default function EmbedPage() {
  const [regionCode, setRegionCode] = useState('TW');
  const [locale, setLocale] = useState('zh-TW');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingCitations, setStreamingCitations] = useState<Citation[]>([]);
  const [guestId, setGuestId] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = localStorage.getItem('arch_guest_id') ?? `guest_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('arch_guest_id', id);
    setGuestId(id);

    // 讀取 URL 參數
    const params = new URLSearchParams(window.location.search);
    if (params.get('region')) setRegionCode(params.get('region')!);
    if (params.get('locale')) setLocale(params.get('locale')!);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !guestId) return;
    const q = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: 'user', content: q, citations: [] }]);
    setIsStreaming(true);
    setStreamingContent('');
    setStreamingCitations([]);

    let fullContent = '';
    let finalCitations: Citation[] = [];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, regionCode, locale, guestId, conversationHistory: [], sessionId: null }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const ev = JSON.parse(line.slice(6));
            if (ev.type === 'delta') { fullContent += ev.content; setStreamingContent(fullContent); }
            if (ev.type === 'citations') { finalCitations = ev.citations; setStreamingCitations(ev.citations); }
            if (ev.type === 'done') {
              setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: 'assistant', content: fullContent, citations: finalCitations }]);
              setIsStreaming(false);
              setStreamingContent('');
              setStreamingCitations([]);
            }
          } catch {}
        }
      }
    } catch { setIsStreaming(false); }
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body style={{ margin: 0 }} suppressHydrationWarning>
        <div className="flex flex-col h-screen" style={{ fontFamily: 'Inter, Noto Sans TC, sans-serif' }}>
          {/* 嵌入 Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 shrink-0"
               style={{ background: 'rgba(8,14,28,0.98)' }}>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-slate-200">建築法規 AI 助手</span>
            </div>
            <div className="flex items-center gap-2">
              <select value={regionCode} onChange={(e) => setRegionCode(e.target.value)}
                className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 rounded px-1.5 py-1">
                {REGIONS.map((r) => <option key={r.code} value={r.code}>{r.flag} {r.nameI18n['en']}</option>)}
              </select>
              <a href={`/zh-TW/chat`} target="_blank" rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 transition-colors">
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* 訊息列表 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {messages.length === 0 && !isStreaming && (
              <div className="text-center py-8">
                <Bot size={24} className="text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">請輸入建築法規問題</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed
                                 ${msg.role === 'user'
                                   ? 'bg-amber-500/20 border border-amber-500/30 text-slate-200'
                                   : 'bg-slate-800/60 border border-slate-700 text-slate-300'}`}>
                  {msg.role === 'user'
                    ? msg.content
                    : <ReactMarkdown remarkPlugins={[remarkGfm]}>{stripCitationTags(msg.content)}</ReactMarkdown>
                  }
                  {msg.role === 'assistant' && msg.citations.length > 0 && (
                    <CitationAccordion citations={msg.citations} />
                  )}
                  {msg.role === 'assistant' && (
                    <DisclaimerBanner content={getDisclaimerText(locale)} compact />
                  )}
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex gap-2">
                <div className="max-w-[85%] bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300">
                  {streamingContent
                    ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{stripCitationTags(streamingContent)}</ReactMarkdown>
                    : <LoadingIndicator size="sm" label="查詢法規中..." />}
                  {streamingCitations.length > 0 && <CitationAccordion citations={streamingCitations} />}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* 輸入列 */}
          <div className="p-2 border-t border-slate-800 shrink-0" style={{ background: 'rgba(8,14,28,0.98)' }}>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="輸入建築法規問題..."
                className="input-field text-xs py-2 flex-1"
                disabled={isStreaming}
              />
              <button onClick={handleSend} disabled={!input.trim() || isStreaming}
                className="btn-accent w-9 h-9 p-0 justify-center rounded-lg">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
