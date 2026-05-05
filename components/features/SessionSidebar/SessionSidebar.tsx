// components/features/SessionSidebar/SessionSidebar.tsx
'use client';
import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Building2, ChevronLeft, Trash2, PieChart, AlertCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useRegionStore } from '@/stores/regionStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { getSessions, deleteSession } from '@/lib/firebase/firebaseDb';
import { useTranslations } from 'next-intl';
import { REGIONS } from '@/constants/regions';
import Link from 'next/link';

interface SessionSidebarProps {
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  labels?: {
    newSession?: string;
    sessionHistory?: string;
    noSessions?: string;
    appName?: string;
  };
}

export function SessionSidebar({ onNewSession, onSelectSession, labels }: SessionSidebarProps) {
  const t = useTranslations('common');
  const { sessions, setSessions, removeSession, currentSessionId } = useChatStore();
  const { regionCode, locale } = useRegionStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { user, activeId, loginWithGoogle, logout, loading, authError, setAuthError } = useAuth();

  const currentRegion = REGIONS.find((r) => r.code === regionCode);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeId) return;
    getSessions(activeId, 30)
      .then((data) => setSessions(data))
      .catch((err) => console.error('[Sidebar] 讀取歷史紀錄失敗', err));
  }, [activeId, setSessions]);

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      removeSession(id);
      if (currentSessionId === id) {
        onNewSession();
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  return (
    <>
      {/* 手機版遮罩 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* 展開時的側欄 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-800 h-full transition-transform duration-300 md:static md:shrink-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}`}
        style={{ width: 'var(--sidebar-width)', background: 'var(--color-bg-secondary)' }}
      >
        {/* 品牌 Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800" style={{ padding: '0 8px' }}>
          <div className="flex items-center gap-2.5" style={{ padding: '5px 8px', width: '100%' }}>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
              <Building2 size={16} className="text-black" />
            </div>
            <div>
              <div className="text-[20px] font-bold text-white tracking-wide">
                {labels?.appName ?? '建築法規 AI'}
              </div>
              <div className="flex items-center gap-1 text-[14px] text-slate-500">
                <span>{currentRegion?.flag}</span>
                <span>{currentRegion?.nameI18n[locale] ?? regionCode}</span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-sm shrink-0 ml-2"
            title="隱藏側欄"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* 新對話按鈕 */}
        <div className="p-3" style={{ padding: '0px 8px', margin: '10px 0px' }}>
          <button
            id="new-session-btn"
            onClick={onNewSession}
            className="btn-accent w-full justify-center gap-2 py-2.5 text-sm"
          >
            <Plus size={15} />
            {labels?.newSession ?? '新對話'}
          </button>
        </div>

        {/* 歷史對話列表 */}
        <div className="flex-1 overflow-y-auto px-2 pb-4" style={{ padding: '5px 8px' }}>
          <div className="text-[14px] text-slate-600 uppercase tracking-wider px-2 mb-2" style={{ paddingBottom: '10px' }}>
            {labels?.sessionHistory ?? '歷史對話'}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-xs">
              {labels?.noSessions ?? '尚無對話紀錄'}
            </div>
          ) : (
            <div className="space-y-1" style={{ height: '30px' }}>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '3px 10px'
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all
                            flex items-center gap-2 group relative cursor-pointer
                            ${currentSessionId === session.id
                      ? 'bg-zinc-800/80 text-white font-medium border-zinc-700'
                      : 'hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border-transparent'
                    } border`}
                >
                  <MessageSquare size={13} className="shrink-0 opacity-60" />
                  <span className="flex-1 line-clamp-1">{session.title || '未命名對話'}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(session.id);
                    }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部登入/登出與儀表板區域 */}
        <div className="p-4 border-t border-zinc-800/50 space-y-3 bg-black/20" style={{ padding: '8px', margin: '8px 0px' }}>
          {user && (
            <Link
              href={`/${locale}/analytics`}
              style={{
                height: '40px'
              }}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all font-bold border border-sky-500/20 shadow-lg shadow-sky-500/5"
            >
              <PieChart size={15} />
              {t('analyticsDashboard')}
            </Link>
          )}
          {!loading && (
            user ? (
              <div className="flex flex-col bg-zinc-900/40" style={{ width: '100%', margin: '10px 0px', padding: '0px 10px' }}>
                <div className="flex items-center gap-2 px-1" style={{ padding: '20px 0px' }}>
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-[16px] font-bold text-sky-400">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div className="text-[14px] text-zinc-500 truncate flex-1">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={logout}
                  style={{
                    height: '40px',
                    border: '0.2px solid rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer'
                  }}
                  className="w-full text-center px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                style={{
                  height: '40px',
                  cursor: 'pointer'
                }}
                className="w-full justify-center flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs bg-white text-black hover:bg-zinc-200 transition-all font-bold shadow-lg active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t('login')}
              </button>
            )
          )}
        </div>
      </aside>

      {/* 縮小時的側欄 (僅桌機) */}
      {!isSidebarOpen && (
        <div className="hidden md:flex flex-col items-center py-4 border-r border-zinc-800 w-16 shrink-0" style={{ background: 'var(--color-bg-secondary)' }}>
          <button
            onClick={toggleSidebar}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition-all shadow-2xl group"
            title="展開側欄"
            style={{
              margin: '8px 12px 8px 6px'
            }}
          >
            <Building2 size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
      {/* 刪除確認彈窗 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-[2rem] bg-zinc-900/90 border border-zinc-800 shadow-2xl p-6 box-border">

            <div className="flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">

              {/* icon */}
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle size={24} />
              </div>

              {/* text */}
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {t('deleteConfirm')}
                </h3>
                <p className="text-sm text-zinc-400">
                  刪除後將無法恢復此對話內容。
                </p>
              </div>

              {/* buttons */}
              <div className="flex gap-3 w-full mt-4" style={{ padding: '0 10px' }}>

                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 h-10 rounded-xl text-sm font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
                >
                  {t('cancel')}
                </button>

                <button
                  onClick={() => {
                    handleDeleteSession(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="flex-1 h-10 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  {t('confirm')}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
      {/* 登入錯誤彈窗 */}
      {authError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] bg-zinc-900/90 border border-zinc-800 shadow-2xl p-8 box-border">
            <div className="flex flex-col items-center justify-center text-center gap-5">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <AlertCircle size={30} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  登入提示
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {authError}
                </p>
              </div>
              <button
                onClick={() => setAuthError(null)}
                className="w-full h-11 rounded-xl text-sm font-bold bg-zinc-100 text-black hover:bg-white transition-all shadow-lg"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
