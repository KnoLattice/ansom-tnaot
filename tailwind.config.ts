import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",
        halo: "var(--color-halo)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "accent-primary": "var(--color-accent-primary)",
        "accent-secondary": "var(--color-accent-secondary)",
        "border-subtle": "var(--color-border-subtle)",
        "border-default": "var(--color-border-default)",
        "node-mastered": "var(--color-node-mastered)",
        "node-proficient": "var(--color-node-proficient)",
        "node-developing": "var(--color-node-developing)",
        "node-low": "var(--color-node-low)",
        "node-locked": "var(--color-node-locked)",
        // 5-tier mastery gradient (blueprint spec)
        "mastery-0": "#DC2626", // red-600 — struggling
        "mastery-1": "#D97706", // amber-600 — emerging
        "mastery-2": "#CA8A04", // yellow-600 — developing
        "mastery-3": "#16A34A", // green-600 — proficient
        "mastery-4": "#059669", // emerald-600 — mastered
      },
      borderColor: {
        DEFAULT: "var(--color-border-subtle)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Instrument Serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "soft-sm": "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "soft": "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
        "soft-md": "0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
        "soft-lg": "0 8px 32px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.04)",
        glow: "0 0 40px rgba(79, 70, 229, 0.15)",
        panel: "0 8px 32px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
        xl: "0.875rem",
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
