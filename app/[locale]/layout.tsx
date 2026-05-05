// app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Script from 'next/script';
import '../globals.css';

export const metadata: Metadata = {
// ... existing metadata ...
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          id="theme-initializer"
          suppressHydrationWarning={true}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storage = localStorage.getItem('arch-theme-store');
                  var theme = 'dark';
                  if (storage) {
                    var parsed = JSON.parse(storage);
                    theme = parsed.state.theme || 'dark';
                  }
                  
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.style.backgroundColor = '#f7f8fa';
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.style.backgroundColor = '#000000';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
