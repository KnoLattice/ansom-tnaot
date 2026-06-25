import type { MasteryBand } from "@/lib/types/api";

export type ThemePreset = "deep-space" | "aurora" | "solar" | "obsidian" | "custom" | "ink" | "atelier" | "atelier-dark";

export type MasteryColorMap = Record<MasteryBand | "locked", string>;

export interface ThemeOverrides {
  canvasColor?: string;
  accentPrimary?: string;
  accentSecondary?: string;
  nodeColors?: Partial<MasteryColorMap>;
  panelOpacity?: number;
  panelBlur?: number;
  starfield?: boolean;
  nebula?: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  basePreset: ThemePreset;
  overrides: ThemeOverrides;
  graphPreferences: {
    defaultViewMode: "constellation" | "universe";
    edgeStyle: "straight" | "curved" | "step";
    nodeSize: "compact" | "default" | "large";
    showMasteryRings?: boolean;
  };
  layoutPreferences: {
    hudPositions: {
      masteryPanel: "bottom-left" | "top-left";
      documentSwitcher: "top-right" | "top-center";
      sessionCTA: "bottom-right" | "bottom-center";
    };
    progressOverlay: "bottom" | "top-right";
  };
}
