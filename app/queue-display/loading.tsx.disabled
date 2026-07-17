import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function QueueDisplayLoading() {
  return (
    <div className="min-h-svh flex flex-col animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="h-16 border-b flex items-center justify-between px-4 md:px-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="mx-auto max-w-4xl w-full px-4 py-8 md:px-6 md:py-12 space-y-8">
        <Skeleton className="h-4 w-40 mx-auto" />

        {/* 3 Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50">
              <div className="h-8 bg-muted" />
              <CardContent className="py-8 flex flex-col items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-2xl" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>

        {/* Lists Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border/50">
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
