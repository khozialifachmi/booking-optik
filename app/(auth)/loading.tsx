import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AuthLoading() {
  return (
    <div className="min-h-svh flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex flex-col items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full mt-2" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
}
