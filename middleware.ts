// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // 跳過：api routes、_next 靜態檔、embed 頁面（無語系）、靜態資源
    '/((?!api|_next|embed|.*\\..*).*)',
    '/',
  ],
};
