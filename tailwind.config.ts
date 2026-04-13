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
      },
      borderColor: {
        DEFAULT: "var(--color-border-subtle)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Syne", "sans-serif"],
        mono: ["var(--font-mono)", "\"JetBrains Mono\"", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(99, 102, 241, 0.25)",
        panel: "0 30px 80px rgba(0, 0, 0, 0.45)",
      },
      borderRadius: {
        xl: "1.5rem",
        lg: "1.25rem",
        md: "1rem",
        sm: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
