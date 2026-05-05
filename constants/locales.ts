// constants/locales.ts
export const SUPPORTED_LOCALES = ['zh-TW', 'en', 'ja', 'ko'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: SupportedLocale = 'zh-TW';

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  'zh-TW': '繁體中文',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
};

export const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  'zh-TW': '🇹🇼',
  'en': '🇺🇸',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
};

export const LOCALE_DEFAULT_REGION: Record<SupportedLocale, string> = {
  'zh-TW': 'TW',
  'en': 'US',
  'ja': 'JP',
  'ko': 'KR',
};
