// app/[locale]/(main)/chat/page.tsx — 主問答頁面
'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, Menu, Globe } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useRouter, useParams } from 'next/navigation';
import { SessionSidebar } from '@/components/features/SessionSidebar/SessionSidebar';
import { MessageItem } from '@/components/features/MessageItem/MessageItem';
import { InputBar } from '@/components/features/InputBar/InputBar';
import { FloorRatioCalculator } from '@/components/features/FloorRatioCalculator/FloorRatioCalculator';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator/LoadingIndicator';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner/DisclaimerBanner';
import { CitationAccordion } from '@/components/ui/CitationAccordion/CitationAccordion';
import { useStreamingResponse } from '@/hooks/useStreamingResponse';
import { useAuth } from '@/hooks/useAuth';
import { getMessages } from '@/lib/firebase/firebaseDb';
import { useChatStore } from '@/stores/chatStore';
import { useRegionStore } from '@/stores/regionStore';
import { useUIStore } from '@/stores/uiStore';
import { REGIONS } from '@/constants/regions';
import { SUPPORTED_LOCALES, LOCALE_LABELS } from '@/constants/locales';
import { stripCitationTags } from '@/lib/utils/citationParser';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '@/types/chat.types';

export default function ChatPage() {
  const t = useTranslations('chat');
  const tDisc = useTranslations('disclaimer');
  const tCalc = useTranslations('calculator');
  const tLang = useTranslations('language');
  const tCommon = useTranslations('common');
  const tOnboarding = useTranslations('onboarding');
  const router = useRouter();
  const params = useParams();
  const urlLocale = params.locale as string;

  const { activeId: guestId } = useAuth();
  const { startStream, stopStream } = useStreamingResponse();

  const {
    messages, addMessage, setMessages, clearMessages,
    sessions,
    currentSessionId, setCurrentSession,
    streamingContent, streamingCitations, isStreaming,
    streamingSessionId,
    resetStreaming,
  } = useChatStore();

  const { regionCode, subRegion, locale, setRegion, setSubRegion, setLocale } = useRegionStore();
  const { toggleSidebar, setCalculatorOpen } = useUIStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingUserMsg, setPendingUserMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 同步 URL 語系到 Store
  useEffect(() => {
    if (urlLocale && urlLocale !== locale) {
      setLocale(urlLocale);
    }
  }, [urlLocale, locale, setLocale]);

  // 自動捲動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // 新對話
  const handleNewSession = () => {
    setCurrentSession(null);
    clearMessages();
    setPendingUserMsg(null);
    setError(null);
    resetStreaming();
  };

  // 載入歷史對話
  const handleSelectSession = async (sessionId: string) => {
    setCurrentSession(sessionId);
    clearMessages();
    setCalculatorOpen(false);

    // 回復該對話的地區設定
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      if (session.regionCode) setRegion(session.regionCode);
      if (session.subRegion) setSubRegion(session.subRegion);
    }

    try {
      const data = await getMessages(sessionId);
      setMessages(data);
    } catch {
      setError('LOAD_SESSION_ERROR');
    }
  };

  // 送出訊息
  const handleSend = (text: string) => {
    if (!guestId || isStreaming) return;
    setError(null);

    // Optimistic UI：立即顯示使用者訊息
    const userMsg: ChatMessage = {
      id: `local_user_${Date.now()}`,
      sessionId: currentSessionId ?? '',
      role: 'user',
      content: text,
      citations: [],
      disclaimerShown: false,
      createdAt: new Date(),
      metadata: {
        regionCode,
        subRegion,
        locale,
      },
    };
    addMessage(userMsg);
    setPendingUserMsg(text);

    const history = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    startStream(
      {
        sessionId: currentSessionId,
        question: text,
        regionCode,
        subRegion,
        locale,
        conversationHistory: history,
        guestId,
      },
      (newSessionId) => {
        setCurrentSession(newSessionId);
        setPendingUserMsg(null);
      },
      (err) => {
        setError(err);
        setPendingUserMsg(null);
      }
    );
  };

  const citationLabels = {
    title: t('citationsTitle'),
    expand: t('expandCitation'),
    collapse: t('collapseCitation'),
    relevance: t('relevance'),
    viewSource: t('viewSource'),
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-primary)' }} suppressHydrationWarning={true}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <SessionSidebar
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        labels={{
          newSession: t('newSession'),
          sessionHistory: t('sessionHistory'),
          noSessions: t('noSessions'),
        }}
      />

      {/* ── 主內容區 ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-4 border-b border-zinc-800 shrink-0 z-20"
          style={{ background: 'var(--color-bg-glass)', padding: '0px 15px', height: '65px' }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition-colors shadow-sm md:hidden"
            >
              <Menu size={20} />
            </button>

            {/* 地區選擇 */}
            <div className="flex items-center gap-2">
              {/* 國家選擇 */}
              <select
                id="region-selector"
                value={regionCode}
                onChange={(e) => setRegion(e.target.value)}
                className="input-field text-xs py-1.5 px-3 w-auto cursor-pointer rounded-lg bg-zinc-900 border-zinc-800"
              >
                {REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.flag} {r.nameI18n[locale] ?? r.nameI18n['en']}
                  </option>
                ))}
              </select>

              {/* 行政區選擇 */}
              {REGIONS.find(r => r.code === regionCode)?.subRegions && (
                <select
                  id="subregion-selector"
                  value={subRegion}
                  onChange={(e) => setSubRegion(e.target.value)}
                  className="input-field text-xs py-1.5 px-3 w-auto cursor-pointer rounded-lg bg-zinc-900 border-zinc-800"
                >
                  <option value="ALL">{tOnboarding('allRegions')}</option>
                  {REGIONS.find(r => r.code === regionCode)?.subRegions?.map((sr) => (
                    <option key={sr.code} value={sr.code}>
                      {sr.nameI18n[locale] ?? sr.nameI18n['en']}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 主題切換 */}
            <ThemeToggle />

            <div className="w-px h-4 bg-zinc-800" />

            {/* 語系切換 */}
            <div className="flex items-center gap-1">
              <Globe size={18} className="text-slate-500" />
              <select
                id="locale-selector"
                value={locale}
                onChange={(e) => {
                  const newLocale = e.target.value;
                  setLocale(newLocale);
                  // 切換 URL 語系路徑
                  const pathname = window.location.pathname;
                  const segments = pathname.split('/');
                  segments[1] = newLocale; // 替換 [locale] 段
                  router.push(segments.join('/'));
                }}
                className="input-field text-xs py-1.5 px-2 w-auto cursor-pointer rounded-lg bg-transparent border-0 text-zinc-400"
              >
                {SUPPORTED_LOCALES.map((l) => (
                  <option key={l} value={l}>{LOCALE_LABELS[l]}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* 對話 + 計算器的水平佈局 */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* 對話區 */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* 訊息列表 */}
            <div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-24 py-10 space-y-8" style={{ padding: '10px 15px' }}>
              {/* 空狀態 */}
              {messages.length === 0 && !isStreaming && !pendingUserMsg && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 px-4">
                  <div className="w-20 h-20 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center mb-6 shadow-lg animate-fade-in overflow-hidden">
                    <img src="/bot-avatar.png" alt="Bot" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3 tracking-wide">{t('emptyState')}</h2>
                  <p className="text-base text-[var(--color-text-secondary)] max-w-lg leading-loose">{t('emptyStateDesc')}</p>

                  {/* 示範問題 */}
                  <div className="mt-10 flex flex-wrap gap-4 justify-center" style={{ padding: '8px 15px' }}>
                    {[
                      regionCode === 'TW' ? '第二種住宅區建蔽率上限？' : 'What is the maximum building coverage ratio?',
                      regionCode === 'TW' ? '違章建築如何處理？' : 'How are illegal structures handled?',
                      regionCode === 'TW' ? '商業區容積率規定？' : 'FAR limits for commercial zones?',
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        style={{ padding: '8px 12px' }}
                        className="text-sm font-medium px-6 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]
                                   hover:bg-[var(--color-accent-blue)] hover:text-white hover:border-[var(--color-accent-blue)] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 歷史訊息 */}
              {messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  locale={locale}
                  citationLabels={citationLabels}
                />
              ))}

              {/* 串流中的 AI 回答 (僅限當前對話正在串流時顯示) */}
              {isStreaming && currentSessionId === streamingSessionId && (
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base border bg-[var(--color-bg-primary)] border-[var(--color-text-secondary)] text-[var(--color-text-primary)] shadow-sm">
                    <Bot size={20} />
                  </div>
                  <div className="flex flex-col gap-3 flex-1 min-w-0 items-start">
                    <div className="px-2 py-1 text-base leading-loose max-w-full text-zinc-100 w-full">
                      {streamingContent ? (
                        <div className="markdown-content border-l-2 border-zinc-800 pl-6 ml-2">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {stripCitationTags(streamingContent)}
                          </ReactMarkdown>
                          <span className="typing-cursor" />
                        </div>
                      ) : (
                        <LoadingIndicator label={t('thinking')} />
                      )}
                    </div>

                    {/* 串流中的條款引用（陸續顯示） */}
                    <div className="pl-6 w-full max-w-3xl">
                      {streamingCitations.length > 0 && (
                        <CitationAccordion citations={streamingCitations} labels={citationLabels} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 錯誤提示 */}
              {error && (
                <div className="text-sm font-bold text-red-400 bg-red-950/30 border border-red-900/50 rounded-2xl px-6 py-4 text-center animate-shake">
                  ⚠️ {error === 'RATE_LIMIT_EXCEEDED' ? '請求過於頻繁，請稍後再試' :
                    error === 'QUOTA_EXCEEDED' ? tCommon('quotaExceeded') :
                      error === 'NETWORK_ERROR' ? '網路連線錯誤' : `錯誤：${error}`}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 輸入列 */}
            <div className="shrink-0 w-full px-6 md:px-12 lg:px-24 pb-8 pt-4 bg-[#000000]">
              <InputBar
                onSend={handleSend}
                isStreaming={isStreaming}
                onStop={stopStream}
                placeholder={t('inputPlaceholder')}
                sendHint={t('sendHint')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
