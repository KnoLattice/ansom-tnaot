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
        "relative w-full max-w-md overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-8 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]",
        "backdrop-blur-2xl",
        className,
      )}
    >
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.35em] text-white/60">
          {accent ?? "KnowLattice"}
        </p>
        <h1 className="font-display text-3xl font-semibold text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-white/70">{description}</p>
        )}
      </div>
      <div className="mt-8 space-y-6 text-white">{children}</div>
      {footer && <div className="mt-8 text-center text-sm text-white/70">{footer}</div>}
      <div className="pointer-events-none absolute inset-0 border border-white/[0.02]" />
      <div className="pointer-events-none absolute -top-24 right-10 h-72 w-72 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-3xl" />
    </div>
  );
}
