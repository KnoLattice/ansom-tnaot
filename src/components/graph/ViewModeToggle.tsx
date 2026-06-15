"use client";

import { cn } from "@/lib/utils";
import { useGraphStore, type ViewMode } from "@/store/graph.store";
import { motion } from "framer-motion";

const MODES: Array<{ value: ViewMode; label: string }> = [
  { value: "constellation", label: "Constellation" },
  { value: "universe", label: "Universe" },
];

export function ViewModeToggle() {
  const viewMode = useGraphStore((state) => state.viewMode);
  const setViewMode = useGraphStore((state) => state.setViewMode);

  return (
    <div className="relative flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs text-white/70">
      {MODES.map((mode) => {
        const active = mode.value === viewMode;
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => setViewMode(mode.value)}
            className={cn(
              "relative z-10 rounded-full px-4 py-1 font-medium transition",
              active ? "text-black" : "text-white/70 hover:text-white",
            )}
          >
            {active && (
              <motion.span
                layoutId="view-toggle"
                className="absolute inset-0 -z-10 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
