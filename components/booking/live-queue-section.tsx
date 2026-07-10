"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

interface LiveQueueSectionProps {
  data: {
    currentServing: number;
    currentServingName: string;
    currentCalling: number;
    currentCallingName: string;
    currentName: string;
    currentEstimatedTime?: string | null;
    totalToday: number;
    waitingCount: number;
    completedCount: number;
    upcoming: Array<{
      id: string;
      queueNumber: number;
      name: string;
      estimatedTime: string;
    }>;
    completed: Array<{
      id: string;
      queueNumber: number;
      name: string;
      estimatedTime: string;
    }>;
    settings?: {
      avgServiceDuration: number;
      openTime: string;
      closeTime: string;
    };
    pendingConfirmation?: boolean;
  };
}

export function LiveQueueSection({ data }: LiveQueueSectionProps) {
  return (
    <div className="space-y-6">
      {/* Operational Settings Banner */}
      {data.settings && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3 px-4 bg-muted/50 rounded-lg border border-border/50 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">Jam Operasional:</span> {data.settings.openTime} - {data.settings.closeTime} WIB
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {/* Antrian Dipanggil Card */}
        <Card className="border-amber-500/50 bg-amber-500/5 shadow-md">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-sm font-semibold text-amber-600 uppercase tracking-wider">
              Antrian Dipanggil
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
             <div className={`inline-flex h-24 w-24 items-center justify-center rounded-2xl shadow-lg mb-3 animate-pulse ${data.currentCalling > 0 ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-muted text-muted-foreground shadow-none"}`}>
               <span className="text-4xl font-bold">
                 {data.currentCalling > 0 ? data.currentCalling.toString().padStart(2, "0") : "-"}
               </span>
             </div>
             <p className={`text-xl font-bold text-center px-4 ${data.currentCalling === 0 ? "text-muted-foreground text-lg" : "text-amber-900"}`}>
               {data.currentCallingName}
             </p>
             <p className="text-[10px] text-amber-600 mt-1 font-medium text-center px-2">Silakan menuju ke Resepsionis</p>
          </CardContent>
        </Card>

        {/* Sedang Dilayani Card */}
        <Card className="border-primary/50 bg-primary/5 shadow-md">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">
              Sedang Dilayani
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
             <div className={`inline-flex h-24 w-24 items-center justify-center rounded-2xl shadow-lg mb-3 ${data.currentServing > 0 ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-muted text-muted-foreground shadow-none"}`}>
               <span className="text-4xl font-bold">
                 {data.currentServing > 0 ? data.currentServing.toString().padStart(2, "0") : "-"}
               </span>
             </div>
             <p className={`text-xl font-bold text-center px-4 ${data.currentServing === 0 ? "text-muted-foreground text-lg" : ""}`}>
               {data.currentServingName}
             </p>
             <p className="text-[10px] text-muted-foreground mt-1 font-medium text-center px-2">Sedang dalam pemeriksaan</p>
          </CardContent>
        </Card>

        {/* Antrian Terakhir Selesai Card */}
        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">
              Antrian Selesai (Terbaru)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
             {data.completed.length > 0 ? (
               <>
                 <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 mb-3 opacity-80">
                   <span className="text-4xl font-bold">
                     {data.completed[0].queueNumber.toString().padStart(2, "0")}
                   </span>
                 </div>
                 <p className="text-xl font-bold text-emerald-700 text-center truncate w-full px-4">
                   {data.completed[0].name}
                 </p>
                 <p className="text-[10px] text-emerald-600 mt-1 font-medium text-center px-2">Pemeriksaan telah selesai</p>
               </>
             ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <div className="h-24 w-24 flex items-center justify-center">
                      <span className="text-4xl font-bold opacity-20">-</span>
                    </div>
                    <p className="text-sm">Belum ada yang selesai</p>
                  </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming (Large Cards) */}
      {data.upcoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider pl-1">
             <Clock className="h-4 w-4" />
             Antrian Berikutnya
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
             {data.upcoming.map((item) => (
               <Card key={item.id} className="border-orange-500/30 bg-orange-500/5 shadow-sm">
                 <CardContent className="flex flex-col items-center justify-center py-4 px-2">
                    <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-sm mb-3">
                      <span className="text-2xl sm:text-3xl font-bold">
                        {item.queueNumber.toString().padStart(2, "0")}
                      </span>
                    </div>
                    <p className="text-base font-bold text-orange-700 text-center line-clamp-1 w-full px-1">
                      {item.name}
                    </p>
                    <Badge variant="outline" className="mt-2 text-[10px] font-medium text-orange-600/80 border-orange-500/30 bg-orange-50">
                       Est. {item.estimatedTime}
                    </Badge>
                 </CardContent>
               </Card>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
