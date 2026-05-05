'use client';

import { useState } from 'react';
import { Building2, X, User as UserIcon, LogIn, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { REGIONS } from '@/constants/regions';
import { useRegionStore } from '@/stores/regionStore';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

interface StartChatButtonProps {
  locale: string;
  labels: {
    startChat: string;
  };
}

export function StartChatButton({ locale, labels }: StartChatButtonProps) {
  const router = useRouter();
  const { regionCode, setRegion, subRegion, setSubRegion } = useRegionStore();
  const { user, loginWithGoogle, logout } = useAuth();

  const t = useTranslations('onboarding');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'guest' | 'login'>('guest');

  const selectedCountry = REGIONS.find((r) => r.code === regionCode) || REGIONS[0];

  const handleStart = () => {
    setIsModalOpen(true);
  };

  const handleEnterChat = () => {
    setIsModalOpen(false);

    // Auto map region to locale
    let targetLocale = locale;
    if (regionCode === 'TW') targetLocale = 'zh-TW';
    else if (regionCode === 'JP') targetLocale = 'ja';
    else if (regionCode === 'KR') targetLocale = 'ko';
    else if (regionCode === 'US' || regionCode === 'GB') targetLocale = 'en';

    // Check if user selected Google Login but hasn't logged in
    if (authMode === 'login' && !user) {
      loginWithGoogle();
      return;
    }

    router.push(`/${targetLocale}/chat`);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
        <button
          onClick={handleStart}
          className="btn-accent text-xl px-16 py-5 w-full sm:w-80 md:w-96 justify-center rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] transition-all duration-300"
        >
          <Building2 size={26} className="mr-3" />
          <span className="font-bold tracking-wider">{labels.startChat}</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-8 backdrop-blur-md bg-black/60 overflow-y-auto">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

          <div style={{ padding: '20px' }} className="relative glass-card w-full max-w-xl border-zinc-700 bg-zinc-950/95 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up rounded-[2.5rem]">
            {/* 裝飾光暈 */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div style={{ margin: '5px 0px' }} className="flex items-center justify-between p-10 pb-6">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('title')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 pt-0 space-y-10" style={{ minHeight: '250px' }} >
              {/* 身份選擇 */}
              < div className="space-y-6">
                <div style={{ fontSize: '20px', padding: "8px 5px" }} className="text-xs font-bold text-zinc-500 tracking-widest uppercase px-1">{t('authTitle')}</div>
                {user ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-md">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden w-full">
                      <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 font-bold text-2xl border border-sky-500/20 shrink-0 shadow-inner">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-bold text-white truncate">{user.email}</div>
                        <div className="text-xs text-sky-500/80 font-medium">{t('loggedIn')}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setAuthMode('guest');
                      }}
                      style={{ display: "flex", flexDirection: "row", padding: "10px 12px", margin: "0px 10px", backgroundColor: "red", color: "white", fontSize: '14px' }}
                      className="w-full sm:w-auto rounded-2xl text-xs font-bold bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700/50 shadow-lg active:scale-95"
                    >
                      {t('logout')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <button
                      onClick={() => {
                        loginWithGoogle();
                        setAuthMode('login');
                      }}
                      style={{ display: "flex", flexDirection: "row", padding: "8px" }}
                      className={`group flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border transition-all duration-300 shadow-xl active:scale-95 ${authMode === 'login'
                        ? 'border-sky-500/50 bg-sky-500/10'
                        : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700'
                        }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">{t('googleLogin')}</span>
                    </button>
                    <button
                      onClick={() => setAuthMode('guest')}
                      style={{ display: "flex", flexDirection: "row", padding: "8px" }}
                      className={`group flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border transition-all duration-300 shadow-xl active:scale-95 ${authMode === 'guest'
                        ? 'border-sky-500/50 bg-sky-500/10'
                        : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700'
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg group-hover:scale-110 ${authMode === 'guest' ? 'bg-sky-500 text-white shadow-sky-500/30' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                        <UserIcon size={28} />
                      </div>
                      <span className="text-sm font-bold group-hover:text-sky-400 transition-colors">{t('guestMode')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 地區選擇 */}
              <div className="space-y-6" style={{ margin: "10px 0px 20px 0px" }}>
                <div style={{ fontSize: '20px', padding: "8px 5px" }} className="text-xs font-bold text-zinc-500 tracking-widest uppercase px-1">{t('regionTitle')}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[16px] text-zinc-500 uppercase tracking-widest px-1">{t('country')}</label>
                    <select
                      value={regionCode}
                      onChange={(e) => {
                        setRegion(e.target.value);
                        setSubRegion('ALL');
                      }}
                      className="w-full input-field text-sm py-4 px-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-white focus:border-sky-500/50 transition-all shadow-inner"
                    >
                      {REGIONS.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.flag} {r.nameI18n[locale] ?? r.nameI18n['en']}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[16px] text-zinc-500 uppercase tracking-widest px-1">{t('subRegion')}</label>
                    <select
                      value={subRegion}
                      onChange={(e) => setSubRegion(e.target.value)}
                      disabled={!selectedCountry.subRegions}
                      style={{ fontSize: '16px' }}
                      className="w-full input-field text-sm py-4 px-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-white focus:border-sky-500/50 transition-all disabled:opacity-50 shadow-inner"
                    >
                      <option value="ALL">{t('allRegions')}</option>
                      {selectedCountry.subRegions?.map((sr) => (
                        <option key={sr.code} value={sr.code}>
                          {sr.nameI18n[locale] ?? sr.nameI18n['en']}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleEnterChat}
                className="w-full btn-accent py-5 rounded-[2rem] flex justify-center items-center gap-3 text-xl font-black tracking-[0.2em] shadow-[0_10px_30px_rgba(56,189,248,0.2)] hover:shadow-[0_15px_40px_rgba(56,189,248,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all"
              >
                {t('enterSystem')} <MapPin size={22} className="animate-bounce" />
              </button>
            </div>
          </div >
        </div >
      )
      }
    </>
  );
}
