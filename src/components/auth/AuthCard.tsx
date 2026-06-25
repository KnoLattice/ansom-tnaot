import type { PropsWithChildren, ReactNode } from "react";
import { Sparkles } from "lucide-react";
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
  footer,
  className,
  children,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-8 shadow-soft-lg",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-primary)]">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="font-display text-lg text-[var(--color-text-primary)]">
          Adaptify
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-2xl text-[var(--color-text-primary)]">
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
