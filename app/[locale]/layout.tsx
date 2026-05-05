// app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: '建築法規 AI 助手 | Architecture Regulation AI',
    template: '%s | 建築法規 AI 助手',
  },
  description:
    '多國建築法規 AI 問答助手，精準引用法規條款，支援建蔽率容積率計算，涵蓋台灣、日本、美國、韓國。',
  keywords: ['建築法規', '建蔽率', '容積率', 'AI', '法規助手', 'Building Code', 'Architecture'],
  openGraph: {
    title: '建築法規 AI 助手',
    description: '精準引用公開法規，AI 智慧解答建築問題',
    type: 'website',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
