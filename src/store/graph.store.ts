import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewMode = "constellation" | "universe";

interface GraphStore {
  viewMode: ViewMode;
  selectedNodeId: string | null;
  isPanelOpen: boolean;
  activeDocumentId: string | null;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  selectNode: (nodeId: string | null) => void;
  togglePanel: (open?: boolean) => void;
  setActiveDocument: (docId: string | null) => void;
  reset: () => void;
}

export const useGraphStore = create<GraphStore>()(
  persist(
    (set) => ({
      viewMode: "universe",
      selectedNodeId: null,
      isPanelOpen: true,
      activeDocumentId: null,
      hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      setViewMode: (viewMode) => set({ viewMode }),
      selectNode: (selectedNodeId) => set({ selectedNodeId }),
      togglePanel: (open) =>
        set((state) => ({
          isPanelOpen: typeof open === "boolean" ? open : !state.isPanelOpen,
        })),
      setActiveDocument: (activeDocumentId) => set({ activeDocumentId }),

      reset: () =>
        set({
          viewMode: "universe",
          selectedNodeId: null,
          isPanelOpen: true,
          activeDocumentId: null,
        }),
    }),
    {
      name: "kl_graph",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
