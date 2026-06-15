import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string | false;
  className?: string;
}

const sizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-6 w-6",
};

export function Spinner({ size = "md", label, className }: SpinnerProps) {
  const showLabel = label !== false && size !== "sm";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "animate-spin border-2 border-[var(--color-border-default)] border-t-[var(--color-accent-primary)]",
          sizes[size],
        )}
      />
      {showLabel && (
        <span className="kl-data-label animate-pulse">
          {label || "LOADING"}
        </span>
      )}
    </div>
  );
}
