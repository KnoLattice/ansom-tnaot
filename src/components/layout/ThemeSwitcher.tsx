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
  { id: "ink", label: "INK", description: "Light", isLight: true },
  { id: "deep-space", label: "DEEP SPACE", description: "Dark indigo", isLight: false },
  // { id: "obsidian", label: "OBSIDIAN", description: "Dark slate", isLight: false },
  // { id: "aurora", label: "AURORA", description: "Dark purple", isLight: false },
  // { id: "solar", label: "SOLAR", description: "Dark warm", isLight: false },
];

const SWATCH_COLORS: Record<ThemePreset, string> = {
  ink: "#F3F3F2",
  obsidian: "#0d0f13",
  "deep-space": "#060614",
  aurora: "#06050e",
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
          className="flex h-7 w-7 items-center justify-center border border-[var(--color-border-default)] bg-[var(--color-surface)] transition-colors hover:bg-[var(--color-surface-elevated)]"
          title="Switch theme"
        >
          {isLight ? (
            <Sun className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 border border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
      >
        <DropdownMenuLabel className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
          <Palette className="h-3 w-3" />
          Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={cn(
              "flex items-center gap-3 font-mono text-xs uppercase tracking-wider",
              currentTheme === theme.id && "font-bold",
            )}
          >
            {/* Color swatch */}
            <div
              className="h-3.5 w-3.5 shrink-0 border border-[var(--color-border-default)]"
              style={{ backgroundColor: SWATCH_COLORS[theme.id] }}
            />
            <div className="flex flex-col">
              <span>{theme.label}</span>
              <span className="text-[9px] normal-case tracking-normal text-[var(--color-text-muted)]">
                {theme.description}
              </span>
            </div>
            {currentTheme === theme.id && (
              <span className="ml-auto text-[var(--color-accent-primary)]">
                &bull;
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
