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
        "relative w-full max-w-md overflow-hidden rounded-3xl border border-border-default bg-surface p-8 text-text-primary shadow-panel",
        "backdrop-blur-2xl",
        className,
      )}
    >
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.35em] text-text-muted">
          {accent ?? "KnowLattice"}
        </p>
        <h1 className="font-display text-3xl font-semibold text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-text-secondary">{description}</p>
        )}
      </div>
      <div className="mt-8 space-y-6">{children}</div>
      {footer && <div className="mt-8 text-center text-sm text-text-secondary">{footer}</div>}
      <div className="pointer-events-none absolute -top-24 right-10 h-72 w-72 rounded-full bg-gradient-to-br from-accent-primary/10 to-transparent blur-3xl" />
    </div>
  );
}
