import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeConfig, ThemeOverrides, ThemePreset } from "@/themes/types";

const DEFAULT_GRAPH_PREFERENCES: ThemeConfig["graphPreferences"] = {
  defaultViewMode: "universe",
  edgeStyle: "curved",
  nodeSize: "default",
  showMasteryRings: true,
};

const DEFAULT_LAYOUT_PREFERENCES: ThemeConfig["layoutPreferences"] = {
  hudPositions: {
    masteryPanel: "bottom-left",
    documentSwitcher: "top-right",
    sessionCTA: "bottom-right",
  },
  progressOverlay: "bottom",
};

const cloneLayoutPreferences = () => ({
  hudPositions: { ...DEFAULT_LAYOUT_PREFERENCES.hudPositions },
  progressOverlay: DEFAULT_LAYOUT_PREFERENCES.progressOverlay,
});

const cloneGraphPreferences = () => ({ ...DEFAULT_GRAPH_PREFERENCES });

interface ThemeState {
  currentTheme: ThemePreset;
  userOverrides: ThemeOverrides;
  layoutPreferences: ThemeConfig["layoutPreferences"];
  graphPreferences: ThemeConfig["graphPreferences"];
  setTheme: (name: ThemePreset) => void;
  applyOverride: <K extends keyof ThemeOverrides>(
    key: K,
    value: ThemeOverrides[K],
  ) => void;
  resetToPreset: () => void;
  setLayoutPreferences: (
    preferences: Partial<ThemeConfig["layoutPreferences"]>,
  ) => void;
  setGraphPreferences: (
    preferences: Partial<ThemeConfig["graphPreferences"]>,
  ) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: "atelier",
      userOverrides: {},
      layoutPreferences: cloneLayoutPreferences(),
      graphPreferences: cloneGraphPreferences(),
      setTheme: (currentTheme) => set({ currentTheme }),
      applyOverride: (key, value) =>
        set((state) => ({
          userOverrides: {
            ...state.userOverrides,
            [key]: value,
          },
        })),
      resetToPreset: () =>
        set({
          userOverrides: {},
          layoutPreferences: cloneLayoutPreferences(),
          graphPreferences: cloneGraphPreferences(),
        }),
      setLayoutPreferences: (preferences) =>
        set((state) => ({
          layoutPreferences: {
            hudPositions: {
              ...state.layoutPreferences.hudPositions,
              ...preferences.hudPositions,
            },
            progressOverlay:
              preferences.progressOverlay ??
              state.layoutPreferences.progressOverlay,
          },
        })),
      setGraphPreferences: (preferences) =>
        set((state) => ({
          graphPreferences: {
            ...state.graphPreferences,
            ...preferences,
          },
        })),
    }),
    { name: "kl_theme" },
  ),
);
