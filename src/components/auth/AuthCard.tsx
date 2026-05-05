import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps extends PropsWithChildren {
  title: string;
  description?: string;
  accent?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  accent,
  footer,
  className,
  children,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md border border-[var(--color-border-default)] bg-[var(--color-surface)] p-8 text-[var(--color-text-primary)]",
        className,
      )}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--color-accent-primary)]" />

      <div className="space-y-2">
        <p className="kl-data-label">
          {accent ?? "KNOWLATTICE"}
        </p>
        <h1 className="font-mono text-2xl font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
        )}
      </div>
      <div className="mt-8 space-y-6">{children}</div>
      {footer && <div className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">{footer}</div>}
    </div>
  );
}
