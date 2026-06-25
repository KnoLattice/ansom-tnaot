"use client";

import { Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useThemeStore } from "@/store/theme.store";
import type { ThemePreset } from "@/themes/types";
import { cn } from "@/lib/utils";

const THEMES: { id: ThemePreset; label: string; description: string; isLight: boolean }[] = [
  { id: "atelier", label: "Atelier", description: "Light, warm", isLight: true },
  { id: "atelier-dark", label: "Atelier Dark", description: "Dark, cozy", isLight: false },
  { id: "ink", label: "Ink", description: "Light, clean", isLight: true },
  { id: "deep-space", label: "Deep Space", description: "Dark, indigo", isLight: false },
];

const SWATCH_COLORS: Record<string, string> = {
  atelier: "#FAFAF7",
  "atelier-dark": "#1A1816",
  ink: "#F3F3F2",
  "deep-space": "#060614",
  obsidian: "#0d0f13",
  aurora: "#06050e",
  solar: "#0d0a05",
  custom: "#333333",
};

export function ThemeSwitcher() {
  const currentTheme = useThemeStore((s) => s.currentTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const isLight = currentTheme === "atelier" || currentTheme === "ink";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] transition-colors hover:bg-[var(--color-surface-elevated)]"
          title="Switch theme"
        >
          {isLight ? (
            <Sun className="h-4 w-4 text-[var(--color-text-secondary)]" />
          ) : (
            <Moon className="h-4 w-4 text-[var(--color-text-secondary)]" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-soft-md"
      >
        <DropdownMenuLabel className="text-xs font-medium text-[var(--color-text-muted)]">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg text-sm",
              currentTheme === theme.id && "font-medium",
            )}
          >
            <div
              className="h-5 w-5 shrink-0 rounded-md border border-[var(--color-border-subtle)]"
              style={{ backgroundColor: SWATCH_COLORS[theme.id] }}
            />
            <div className="flex flex-col">
              <span className="text-[var(--color-text-primary)]">{theme.label}</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {theme.description}
              </span>
            </div>
            {currentTheme === theme.id && (
              <div className="ml-auto h-2 w-2 rounded-full bg-[var(--color-accent-primary)]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
