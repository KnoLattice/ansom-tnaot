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
        "relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-8 text-[var(--color-text-primary)] shadow-xl",
        className,
      )}
      style={{ animation: "fadeInUp 0.5s ease-out" }}
    >
      {/* Top accent — gradient line */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--color-accent-primary)] via-[var(--color-accent-secondary)] to-[var(--color-accent-primary)]" />

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
          {accent ?? "KNOWLATTICE"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
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
