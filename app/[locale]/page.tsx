// app/[locale]/page.tsx — Landing Page
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Building2, FileText, Globe, Calculator, ChevronRight, Layers } from 'lucide-react';
import { REGIONS } from '@/constants/regions';
import { StartChatButton } from '@/components/features/StartChatButton/StartChatButton';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('landing');
  const tc = await getTranslations('common');

  const features = [
    { icon: FileText, key: 'feature1', titleKey: 'feature1Title', descKey: 'feature1Desc', color: 'amber' },
    { icon: Globe, key: 'feature2', titleKey: 'feature2Title', descKey: 'feature2Desc', color: 'blue' },
    { icon: Layers, key: 'feature3', titleKey: 'feature3Title', descKey: 'feature3Desc', color: 'purple' },
  ] as const;

  return (
    <main className="min-h-screen flex flex-col" suppressHydrationWarning>
      {/* ── Navbar ────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800 backdrop-blur-xl bg-black/90">
        <div className="w-full px-6 md:px-12 lg:px-24 h-20 flex items-center justify-between"
          style={{ padding: "0px 15px" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <Building2 size={16} className="text-black" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">{tc('appName')}</span>
          </div>

          <div className="flex items-center gap-5">
            {/* 語系切換（簡易版） */}
            <div className="hidden sm:flex items-center p-3 gap-3 rounded-full border border-zinc-800 bg-zinc-900/60 backdrop-blur"
              style={{ height: '40px', alignItems: 'center', padding: '0px 12px' }}>

              {(['zh-TW', 'en', 'ja', 'ko'] as const).map((l) => {
                const active = locale === l;

                return (
                  <Link
                    key={l}
                    href={`/${l}`}

                    className={`
                        relative text-sm px-6 py-3 rounded-full whitespace-nowrap
                        transition-all duration-200 ease-out

                        ${active
                        ? 'bg-white text-black font-semibold shadow-md scale-[1.08]'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                      }

                        active:scale-95
                    `}
                    style={{ padding: '0px 10px' }}
                  >
                    {l === 'zh-TW' ? '繁中' : l === 'en' ? 'EN' : l === 'ja' ? '日本語' : '한국어'}
                  </Link>
                );
              })}

            </div>
            <Link href={`/${locale}/chat`} className="btn-accent text-sm py-2 px-5">
              {t('startChat')}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <section className="flex-1 w-full flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 py-24 md:py-32 lg:py-40 text-center"
        style={{ padding: "20px 20px" }}>
        {/* 頂部標籤 */}
        <div className="badge border border-zinc-700 text-zinc-300 bg-zinc-900 mb-10 px-6 py-2 font-mono shadow-sm">
          <Building2 size={12} className="mr-1" />
          AI-Powered · Multi-Region · Real Regulations
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-[1.3] sm:leading-[1.2] tracking-tight">
          {t('heroTitle')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-white leading-normal block sm:inline mt-2 sm:mt-0">
            {t('heroTitleAccent')}
          </span>
        </h1>

        <p style={{ margin: "15px 0px 25px 0px" }} className="text-lg sm:text-xl md:text-2xl text-zinc-400 w-full px-4 sm:px-12 md:px-24 lg:px-48 mb-14 leading-loose tracking-wide">
          {t('heroDesc')}
        </p>

        {/* CTA */}
        <StartChatButton locale={locale} labels={{ startChat: t('startChat') }} />

        {/* 支援地區徽章 */}
        <div className="mt-20 flex flex-wrap justify-center gap-3 px-6 md:px-12">

          {REGIONS.map((r) => (
            <div
              key={r.code}
              style={{ height: "48px", padding: "0 12px", marginTop: "15px" }}
              className="flex items-center gap-2 px-6 py-3 rounded-full
                 border border-zinc-800 bg-zinc-900/60
                 text-sm text-zinc-300
                 hover:bg-zinc-800/60 hover:text-white
                 transition-all duration-200 ease-out
                 shadow-sm hover:shadow-md cursor-default"
            >
              <span className="text-lg">{r.flag}</span>
              <span className="font-medium tracking-wide whitespace-nowrap">
                {r.nameI18n[locale] ?? r.nameI18n['en']}
              </span>
            </div>
          ))}

        </div>
      </section>

      {/* ── Features ──────────────────────────────── */}
      <section style={{ padding: "30px 20px" }} className="w-full px-6 md:px-12 lg:px-24 py-28 md:py-36 border-t border-zinc-900 bg-zinc-950/30">
        <div className="w-full" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="text-center mb-24 px-4" style={{ marginBottom: "25px" }}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-wider">
              {t('coreFeatures')}
            </h2>
            <p className="text-zinc-500 text-sm sm:text-base tracking-[0.2em] uppercase">
              {t('featureTagline')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-10 md:gap-14">
            {features.map(({ icon: Icon, key, titleKey, descKey }) => {
              return (
                <div key={key}
                  style={{ padding: "15px" }}
                  className="flex-1 min-w-[300px] max-w-[400px] glass-card flex flex-col p-10 md:p-12 border-zinc-800 hover:border-sky-500/50 transition-all duration-500 bg-zinc-900/40 hover:bg-zinc-900/60 hover:-translate-y-3 shadow-2xl group">
                  {/* 第一列：圖示 + 標題 */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:bg-sky-500/10 group-hover:border-sky-500/20 transition-colors">
                      <Icon size={28} className="text-sky-400" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight group-hover:text-sky-400 transition-colors">{t(titleKey)}</h3>
                  </div>
                  {/* 第二列：解釋 */}
                  <div className="flex-1" style={{ padding: "10px" }}>
                    <p className="text-lg text-zinc-400 leading-relaxed font-light tracking-wide">{t(descKey)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="w-full border-t border-zinc-900 py-12 md:py-16 text-center text-sm text-zinc-500">
        <p>{tc('footer')}</p>
      </footer>
    </main>
  );
}
