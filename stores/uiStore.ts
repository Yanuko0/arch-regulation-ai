// stores/uiStore.ts
import { create } from 'zustand';

interface UIStore {
  isSidebarOpen: boolean;
  isCalculatorOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (val: boolean) => void;
  toggleCalculator: () => void;
  setCalculatorOpen: (val: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isSidebarOpen: true,
  isCalculatorOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (val) => set({ isSidebarOpen: val }),
  toggleCalculator: () => set((s) => ({ isCalculatorOpen: !s.isCalculatorOpen })),
  setCalculatorOpen: (val) => set({ isCalculatorOpen: val }),
}));
