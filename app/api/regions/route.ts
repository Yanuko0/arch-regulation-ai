// app/api/regions/route.ts
import { NextResponse } from 'next/server';
import { REGIONS } from '@/constants/regions';

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      data: {
        regions: REGIONS.map((r) => ({
          code: r.code,
          flag: r.flag,
          nameI18n: r.nameI18n,
          regulationLanguage: r.regulationLanguage,
          availableLocales: r.availableLocales,
        })),
      },
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
      },
    }
  );
}
