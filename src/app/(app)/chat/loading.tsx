import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-5rem)] border border-[var(--color-border-default)]">
      <div className="w-[260px] shrink-0 border-r border-[var(--color-border-default)] p-4">
        <Skeleton className="mb-3 h-4 w-20" />
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      <div className="flex-1 p-4">
        <Skeleton className="mb-4 h-8 w-full" />
        <Skeleton className="mb-3 h-24 w-3/4" />
        <Skeleton className="mb-3 h-16 w-1/2" />
        <Skeleton className="h-24 w-2/3" />
      </div>
    </div>
  );
}
