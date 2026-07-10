import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Skeleton ini muncul INSTAN saat user navigasi ke /admin/dashboard
// sehingga tidak perlu menunggu semua data DB selesai baru halaman muncul
export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-[220px]" />
          <Skeleton className="h-4 w-[280px]" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[130px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-[50px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-6 w-[180px]" />
          <Skeleton className="h-10 w-[220px]" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px] hidden sm:block" />
                <Skeleton className="h-4 w-[60px] hidden md:block" />
                <Skeleton className="h-6 w-[90px] rounded-full" />
                <div className="ml-auto flex gap-2">
                  <Skeleton className="h-8 w-[80px]" />
                  <Skeleton className="h-8 w-[60px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
