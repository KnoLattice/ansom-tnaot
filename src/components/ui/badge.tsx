import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]",
        secondary:
          "border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]",
        destructive:
          "border-[#F40139] bg-[#F40139]/10 text-[#F40139]",
        outline: "border-[var(--color-border-default)] text-[var(--color-text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
