import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DashboardPanel, DashboardPanelType } from '@/types';

// Extend the panel type locally to include fee_status
export type ExtendedPanelType = DashboardPanelType | 'fee_status';

export interface ExtendedDashboardPanel extends Omit<DashboardPanel, 'type'> {
  type: ExtendedPanelType;
}

interface DashboardStore {
  panels: ExtendedDashboardPanel[];
  reorderPanels: (activeId: string, overId: string) => void;
  togglePanelVisible: (id: string) => void;
}

const INITIAL_PANELS: ExtendedDashboardPanel[] = [
  { id: 'stats', title: '統計サマリー', type: 'stats', position: 0, visible: true },
  { id: 'recent_students', title: '最近の生徒', type: 'recent_students', position: 1, visible: true },
  { id: 'upcoming_lessons', title: '直近のレッスン', type: 'upcoming_lessons', position: 2, visible: true },
  { id: 'teacher_load', title: '講師稼働状況', type: 'teacher_load', position: 3, visible: true },
  { id: 'fee_status', title: '月謝状況', type: 'fee_status', position: 4, visible: true },
];

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
  panels: INITIAL_PANELS,

  reorderPanels: (activeId, overId) =>
    set((state) => {
      const panels = [...state.panels].sort((a, b) => a.position - b.position);
      const activeIndex = panels.findIndex((p) => p.id === activeId);
      const overIndex = panels.findIndex((p) => p.id === overId);
      if (activeIndex === -1 || overIndex === -1) return state;

      const reordered = [...panels];
      const [moved] = reordered.splice(activeIndex, 1);
      reordered.splice(overIndex, 0, moved);

      return {
        panels: reordered.map((p, i) => ({ ...p, position: i })),
      };
    }),

  togglePanelVisible: (id) =>
    set((state) => ({
      panels: state.panels.map((p) =>
        p.id === id ? { ...p, visible: !p.visible } : p
      ),
    })),
    }),
    {
      name: "kurietto-dashboard",
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
);
