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
        <Card className="border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/10 shadow-lg shadow-amber-500/5 overflow-hidden flex flex-col">
          <div className="bg-amber-500 py-2 text-center text-xs font-bold text-white uppercase tracking-widest">
            Antrian Dipanggil
          </div>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-6 text-center">
             <div className={`inline-flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg mb-4 ${data.currentCalling > 0 ? "bg-amber-500 text-white shadow-amber-500/20 animate-pulse" : "bg-muted text-muted-foreground shadow-none"}`}>
               <span className="text-4xl font-bold">
                 {data.currentCalling > 0 ? data.currentCalling.toString().padStart(2, "0") : "-"}
               </span>
             </div>
             <p className={`text-lg font-bold text-center px-4 truncate w-full ${data.currentCalling === 0 ? "text-muted-foreground" : "text-amber-900 dark:text-amber-200"}`}>
               {data.currentCallingName || "-"}
             </p>
             <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-semibold">Silakan menuju ke Resepsionis</p>
          </CardContent>
        </Card>

        {/* Sedang Dilayani Card */}
        <Card className="border-primary/30 dark:border-primary/20 bg-primary/[0.03] dark:bg-primary/5 shadow-lg shadow-primary/5 overflow-hidden flex flex-col">
          <div className="bg-primary py-2 text-center text-xs font-bold text-white uppercase tracking-widest">
            Sedang Dilayani
          </div>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-6 text-center">
             <div className={`inline-flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg mb-4 ${data.currentServing > 0 ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-muted text-muted-foreground shadow-none"}`}>
               <span className="text-4xl font-bold">
                 {data.currentServing > 0 ? data.currentServing.toString().padStart(2, "0") : "-"}
               </span>
             </div>
             <p className={`text-lg font-bold text-center px-4 truncate w-full ${data.currentServing === 0 ? "text-muted-foreground" : "text-foreground"}`}>
               {data.currentServingName || "-"}
             </p>
             <p className="text-[10px] text-muted-foreground mt-2 font-semibold">Sedang dalam pemeriksaan</p>
          </CardContent>
        </Card>

        {/* Antrian Terakhir Selesai Card */}
        <Card className="border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/10 shadow-lg shadow-emerald-500/5 overflow-hidden flex flex-col">
          <div className="bg-emerald-500 py-2 text-center text-xs font-bold text-white uppercase tracking-widest">
            Antrian Selesai (Terbaru)
          </div>
          <CardContent className="flex-1 flex flex-col items-center justify-center py-6 text-center">
             {data.completed.length > 0 ? (
               <>
                 <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 mb-4 opacity-90">
                   <span className="text-4xl font-bold">
                     {data.completed[0].queueNumber.toString().padStart(2, "0")}
                   </span>
                 </div>
                 <p className="text-lg font-bold text-emerald-900 dark:text-emerald-200 text-center truncate w-full px-4">
                   {data.completed[0].name}
                 </p>
                 <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">Pemeriksaan telah selesai</p>
               </>
             ) : (
               <>
                 <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-none mb-4">
                   <span className="text-4xl font-bold">-</span>
                 </div>
                 <p className="text-lg font-bold text-muted-foreground text-center truncate w-full px-4">
                   -
                 </p>
                 <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">Belum ada yang selesai</p>
               </>
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
