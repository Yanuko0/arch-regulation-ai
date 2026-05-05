// stores/regionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { LOCALE_DEFAULT_REGION } from '@/constants/locales';

interface RegionStore {
  regionCode: string;
  subRegion: string;
  locale: string;
  setRegion: (code: string) => void;
  setSubRegion: (code: string) => void;
  setLocale: (locale: string) => void;
}

export const useRegionStore = create<RegionStore>()(
  persist(
    (set) => ({
      regionCode: LOCALE_DEFAULT_REGION[DEFAULT_LOCALE],
      subRegion: 'ALL',
      locale: DEFAULT_LOCALE,
      setRegion: (code) => set({ regionCode: code, subRegion: 'ALL' }),
      setSubRegion: (code) => set({ subRegion: code }),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'arch-region-store' }
  )
);
