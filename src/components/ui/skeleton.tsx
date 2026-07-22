import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-[var(--color-surface)] transition-opacity duration-150", className)}
      {...props}
    />
  );
}

export { Skeleton };
