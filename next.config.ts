import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // 在 Vercel 部署時可啟用 edge runtime
  // experimental: { serverComponentsExternalPackages: [] },
};

export default withNextIntl(nextConfig);
