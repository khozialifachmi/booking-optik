import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="flex flex-col min-h-svh animate-in fade-in duration-300">
      {/* Navbar Skeleton */}
      <div className="h-16 border-b flex items-center justify-between px-4 md:px-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      
      {/* Hero Skeleton */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-20 md:py-32 flex flex-col items-center gap-6">
        <Skeleton className="h-12 w-[300px] md:w-[500px]" />
        <Skeleton className="h-12 w-[250px] md:w-[400px]" />
        <Skeleton className="h-20 w-full max-w-2xl" />
        <div className="flex gap-4 mt-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
      </main>
    </div>
  );
}
