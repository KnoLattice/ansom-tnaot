"use client";

import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { useThemeStore } from "@/store/theme.store";
import type { MasteryColorMap } from "@/themes/types";

const MASTER_COLOR_KEYS: Array<keyof MasteryColorMap> = [
  "mastered",
  "proficient",
  "developing",
  "low",
  "locked",
];

export function ThemeProvider({ children }: PropsWithChildren) {
  const { currentTheme, userOverrides } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = currentTheme;

    if (userOverrides.canvasColor) {
      root.style.setProperty("--color-canvas", userOverrides.canvasColor);
    } else {
      root.style.removeProperty("--color-canvas");
    }

    if (userOverrides.accentPrimary) {
      root.style.setProperty("--color-accent-primary", userOverrides.accentPrimary);
    } else {
      root.style.removeProperty("--color-accent-primary");
    }

    if (userOverrides.accentSecondary) {
      root.style.setProperty(
        "--color-accent-secondary",
        userOverrides.accentSecondary,
      );
    } else {
      root.style.removeProperty("--color-accent-secondary");
    }

    if (userOverrides.panelBlur !== undefined) {
      root.style.setProperty("--panel-blur", `${userOverrides.panelBlur}px`);
    } else {
      root.style.removeProperty("--panel-blur");
    }

    if (userOverrides.panelOpacity !== undefined) {
      root.style.setProperty("--panel-opacity", `${userOverrides.panelOpacity}`);
    } else {
      root.style.removeProperty("--panel-opacity");
    }

    if (userOverrides.starfield !== undefined) {
      root.style.setProperty(
        "--space-starfield-opacity",
        userOverrides.starfield ? "1" : "0",
      );
    } else {
      root.style.removeProperty("--space-starfield-opacity");
    }

    if (userOverrides.nebula !== undefined) {
      root.style.setProperty(
        "--space-nebula-opacity",
        userOverrides.nebula ? "1" : "0",
      );
    } else {
      root.style.removeProperty("--space-nebula-opacity");
    }

    if (userOverrides.nodeColors) {
      MASTER_COLOR_KEYS.forEach((key) => {
        const value = userOverrides.nodeColors?.[key];
        if (value) {
          root.style.setProperty(`--color-node-${key}`, value);
        } else {
          root.style.removeProperty(`--color-node-${key}`);
        }
      });
    } else {
      MASTER_COLOR_KEYS.forEach((key) =>
        root.style.removeProperty(`--color-node-${key}`),
      );
    }
  }, [currentTheme, userOverrides]);

  return <>{children}</>;
}
