import { create } from "zustand";

interface DashboardStore {
  stats: any;

  setStats: (stats: any) => void;
}

export const useDashboardStore =
  create<DashboardStore>((set) => ({
    stats: null,

    setStats: (stats) =>
      set({
        stats,
      }),
  }));