import { Skeleton } from "@/components/ui/skeleton";

export default function MasteryLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-[60vh]" />
    </div>
  );
}
