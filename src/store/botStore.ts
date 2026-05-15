import { create } from "zustand";

interface BotState {
  active: boolean;
  toggle: () => void;
  setActive: (v: boolean) => void;
}

export const useBotStore = create<BotState>((set) => ({
  active: true,
  toggle: () => set((s) => ({ active: !s.active })),
  setActive: (v) => set({ active: v }),
}));
