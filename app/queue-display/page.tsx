import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/layout/logo";
import { Clock, Users, Monitor } from "lucide-react";


import { getLiveQueueStatusAction } from "@/actions/booking-actions";
import { RefreshDashboard } from "@/components/admin/refresh-dashboard";
import { LiveClock } from "@/components/live-clock";

export const metadata: Metadata = {
  title: "Antrian Live — EyeCheck",
  description: "Pantau antrian pemeriksaan mata EyeCheck secara real-time",
};

export const dynamic = "force-dynamic";

export default async function QueueDisplayPage() {
  const result = await getLiveQueueStatusAction();
  const queueData = result.success ? result.data : null;



  if (!queueData) {
      return (
          <div className="flex h-svh items-center justify-center">
              <p className="text-muted-foreground">Gagal mengambil data antrian.</p>
          </div>
      );
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-background via-background to-primary/5">
      <RefreshDashboard interval={15000} />
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 md:px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Monitor className="h-4 w-4" />
            Tampilan Antrian Live
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <div className="space-y-6">
          {/* Date & Time */}
          <div className="text-center text-muted-foreground text-lg">
            <LiveClock />
          </div>

          {/* Currently Calling, Serving & Completed */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Calling Card */}
            <Card className="border-amber-300 bg-amber-50 shadow-xl shadow-amber-500/5 overflow-hidden">
              <div className="bg-amber-500 py-2 text-center text-xs font-bold text-white uppercase tracking-widest">
                Antrian Dipanggil
              </div>
              <CardContent className="py-8 text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg animate-pulse">
                  <span className="text-4xl font-bold">
                    {queueData.currentCalling ? queueData.currentCalling.toString().padStart(2, "0") : "-"}
                  </span>
                </div>
                <p className="mt-4 text-lg font-bold text-amber-900 truncate px-2">
                  {queueData.currentCallingName}
                </p>
                <p className="text-[10px] text-amber-600 mt-1">Silakan menuju ke Resepsionis</p>
              </CardContent>
            </Card>

            {/* Serving Card */}
            <Card className="border-primary/30 bg-primary/[0.03] shadow-xl shadow-primary/5 overflow-hidden">
              <div className="bg-primary py-2 text-center text-xs font-bold text-white uppercase tracking-widest">
                Sedang Dilayani
              </div>
              <CardContent className="py-8 text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <span className="text-4xl font-bold">
                    {queueData.currentServing ? queueData.currentServing.toString().padStart(2, "0") : "-"}
                  </span>
                </div>
                <p className="mt-4 text-lg font-bold truncate px-2">
                  {queueData.currentServingName}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Sedang dalam pemeriksaan</p>
              </CardContent>
            </Card>

            {/* Recently Completed Card */}
            <Card className="border-emerald-300 bg-emerald-50 shadow-xl shadow-emerald-500/5 overflow-hidden">
              <div className="bg-emerald-500 py-2 text-center text-xs font-bold text-white uppercase tracking-widest">
                Antrian Selesai
              </div>
              <CardContent className="py-8 text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg opacity-80">
                  <span className="text-4xl font-bold">
                    {queueData.completed.length > 0 ? queueData.completed[0].queueNumber.toString().padStart(2, "0") : "-"}
                  </span>
                </div>
                <p className="mt-4 text-lg font-bold text-emerald-900 truncate px-2">
                  {queueData.completed.length > 0 ? queueData.completed[0].name : "-"}
                </p>
                <p className="text-[10px] text-emerald-600 mt-1">Pemeriksaan telah selesai</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border/50 bg-background p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium uppercase">Total Antrian</p>
              <p className="text-2xl font-bold mt-1">{queueData.totalToday}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium uppercase">Menunggu</p>
              <p className="text-2xl font-bold mt-1 text-amber-600">{queueData.waitingCount}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium uppercase">Selesai</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600">{queueData.completedCount}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium uppercase">Waktu Est.</p>
              <p className="text-2xl font-bold mt-1 text-primary">~{queueData.settings.avgServiceDuration}m</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming */}
            <Card className="border-border/50">
                <CardHeader>
                <CardTitle className="text-lg">Antrian Berikutnya</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                {queueData.upcoming.length > 0 ? queueData.upcoming.map((item) => (
                    <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3"
                    >
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                        {item.queueNumber.toString().padStart(2, "0")}
                        </span>
                        <span className="font-medium">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">
                        Est. {item.estimatedTime}
                    </Badge>
                    </div>
                )) : (
                    <p className="text-center text-sm text-muted-foreground py-4">Tidak ada antrian menunggu.</p>
                )}
                </CardContent>
            </Card>

            {/* Missed / Terlewat */}
            <Card className="border-border/50 border-rose-100 bg-rose-50/10">
                <CardHeader>
                <CardTitle className="text-lg text-rose-700">Antrian Terlewat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                {queueData.missed && queueData.missed.length > 0 ? queueData.missed.map((item) => (
                    <div
                    key={item.queueNumber}
                    className="flex items-center justify-between rounded-lg border border-rose-200 bg-white px-4 py-3"
                    >
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 font-bold text-rose-600">
                        {item.queueNumber.toString().padStart(2, "0")}
                        </span>
                        <span className="font-medium text-rose-900">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="border-rose-200 text-rose-600 bg-rose-50">
                        Terlewat
                    </Badge>
                    </div>
                )) : (
                    <p className="text-center text-sm text-muted-foreground py-4">Tidak ada antrian terlewat.</p>
                )}
                </CardContent>
            </Card>
          </div>

          {/* Auto refresh note */}
          <p className="text-center text-xs text-muted-foreground">
            Halaman ini akan diperbarui otomatis setiap 15 detik
          </p>
        </div>
      </div>
    </div>
  );
}
