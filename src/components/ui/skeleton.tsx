import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-[var(--color-surface)]", className)}
      {...props}
    />
  );
}

export { Skeleton };
