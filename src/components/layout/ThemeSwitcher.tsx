"use client";

import { Sun, Moon, Palette } from "lucide-react";
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
  { id: "ink", label: "Ink", description: "Warm light", isLight: true },
  { id: "deep-space", label: "Deep Space", description: "Navy dark", isLight: false },
  { id: "aurora", label: "Aurora", description: "Purple dark", isLight: false },
];

const SWATCH_COLORS: Record<ThemePreset, string> = {
  ink: "#F8F6F3",
  obsidian: "#0d0f13",
  "deep-space": "#0F172A",
  aurora: "#050712",
  solar: "#0d0a05",
  custom: "#333333",
};

export function ThemeSwitcher() {
  const currentTheme = useThemeStore((s) => s.currentTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const isLight = currentTheme === "ink";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] transition-all duration-150 hover:bg-[var(--color-surface-elevated)] kl-elevation-1"
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
        className="w-52 rounded-[var(--radius-dialog)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-primary)] kl-elevation-2"
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Palette className="h-3.5 w-3.5" />
          Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={cn(
              "flex items-center gap-3 text-sm",
              currentTheme === theme.id && "font-semibold text-[var(--color-accent-primary)]",
            )}
          >
            {/* Color swatch */}
            <div
              className="h-4 w-4 shrink-0 rounded-full border border-[var(--color-border-subtle)]"
              style={{ backgroundColor: SWATCH_COLORS[theme.id] }}
            />
            <div className="flex flex-col">
              <span>{theme.label}</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {theme.description}
              </span>
            </div>
            {currentTheme === theme.id && (
              <span className="ml-auto text-[var(--color-accent-primary)]">&bull;</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
