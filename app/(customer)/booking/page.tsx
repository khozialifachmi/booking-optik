import type { Metadata } from "next";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Clock, CheckCircle2, XCircle, ClipboardList, TrendingUp } from "lucide-react";
import { getDashboardBookingsAction } from "@/actions/booking-actions";
import { getUserMedicalRecordsAction } from "@/actions/medical-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { CancelButton } from "@/components/booking/cancel-button";
import { PrintQueueButton } from "@/components/admin/print-queue-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { formatJakartaTime } from "@/lib/format-time";

import { RefreshDashboard } from "@/components/admin/refresh-dashboard";

export const metadata: import("next").Metadata = {
  title: "Riwayat Pemeriksaan — EyeCheck",
  description: "Daftar riwayat pemeriksaan mata Anda",
};

export default async function BookingListPage() {
  let currentSession = null;
  try {
    const reqHeaders = await headers();
    currentSession = await auth.api.getSession({ headers: reqHeaders });
  } catch (e) {
    console.error("Session fetch error in booking list:", e);
  }
  // No redirect here; layout handles it.
  // We use dummy-user-id fallback in queries if session is missing due to transient errors
  const userId = currentSession?.user?.id || "dummy-user-id";

  const [stats, medicalRecords] = await Promise.all([
    getDashboardBookingsAction(),
    getUserMedicalRecordsAction(userId)
  ]);

  const history = stats.history;

  return (
    <div className="space-y-6">
      <RefreshDashboard interval={3000} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Riwayat Pemeriksaan
          </h1>
          <p className="text-muted-foreground">
            Daftar seluruh riwayat antrian dan hasil pemeriksaan mata Anda.
          </p>
        </div>
        <Link href="/booking/new" className={cn(buttonVariants({ variant: "default", size: "default" }), "gap-2 w-full sm:w-auto")}>
          <Plus className="h-4 w-4" />
          Daftar Pemeriksaan
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pemeriksaan
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Semua waktu
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Selesai
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pemeriksaan selesai
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menunggu Pemeriksaan
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.waiting}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Antri aktif
            </p>
          </CardContent>
        </Card>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <p className="text-center text-muted-foreground py-10">Anda belum memiliki riwayat pendaftaran pemeriksaan.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {history.map((booking) => {
            const record = (medicalRecords.success && medicalRecords.data) 
              ? medicalRecords.data.find((r: any) => r.bookingId === booking.id) 
              : null;
            
            return (
              <div key={booking.id} className="space-y-2">
                <Card className="border-border/50 shadow-sm relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      booking.status === 'completed' ? 'bg-green-500' : 
                      booking.status === 'cancelled' ? 'bg-destructive' : 
                      booking.status === 'serving' ? 'bg-primary animate-pulse' :
                      'bg-orange-500'}`} />
                    
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-lg ${
                              booking.status === 'completed' ? 'bg-green-500/10 text-green-600' : 
                              booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                              booking.status === 'serving' ? 'bg-primary/10 text-primary' :
                              'bg-orange-500/10 text-orange-600'}`}>
                                {booking.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : 
                                 booking.status === 'cancelled' ? <XCircle className="h-6 w-6" /> : 
                                 <Clock className="h-6 w-6" />}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-base">{booking.serviceType}</h3>
                                    <Badge variant="outline" className={`uppercase text-[10px] ${
                                      booking.status === 'completed' ? 'border-green-500/30 text-green-600 bg-green-500/5' : 
                                      booking.status === 'cancelled' ? 'border-destructive/30 text-destructive bg-destructive/5' : 
                                      booking.status === 'serving' ? 'border-primary/30 text-primary bg-primary/5' :
                                      'border-orange-500/30 text-orange-600 bg-orange-500/5'}`}>
                                        {booking.status === 'waiting' ? 'Menunggu' : 
                                         booking.status === 'serving' ? 'Sedang Dilayani' :
                                         booking.status === 'completed' ? 'Selesai' : 
                                         booking.status === 'cancelled' ? 'Dibatalkan' : 
                                         booking.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Tgl: {new Date(booking.bookingDate).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric', timeZone: 'Asia/Jakarta' })} | Jam Daftar: {formatJakartaTime(booking.createdAt)} WIB | Nomor: {booking.queueNumber ? `A-${booking.queueNumber.toString().padStart(2, "0")}` : "Verifikasi"}
                                </p>
                            </div>
                        </div>

                        {booking.status === 'waiting' && (
                           <div className="flex justify-end gap-2">
                              <PrintQueueButton 
                                queueNumber={booking.queueNumber ?? 0}
                                customerName={(() => {
                                  if (booking.notes && booking.notes.startsWith("Nama: ")) {
                                    return booking.notes.split(" | ")[0].replace("Nama: ", "");
                                  }
                                  return currentSession?.user?.name || "Pelanggan";
                                })()}
                                serviceType={booking.serviceType}
                                bookingTime={formatJakartaTime(booking.createdAt)}
                                bookingDate={new Date(booking.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                              />
                           </div>
                        )}
                        {booking.status === 'unverified' && (
                           <div className="flex justify-end gap-2">
                              <CancelButton bookingId={booking.id} />
                           </div>
                        )}
                    </CardContent>
                </Card>

                {/* Hasil Medis jika ada */}
                {record && (
                  <div className="ml-4 sm:ml-12 p-4 rounded-xl bg-emerald-500/5 border border-dashed border-emerald-500/30">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5 text-emerald-500" />
                      Hasil Pemeriksaan Refraksionis
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm italic text-emerald-950 dark:text-emerald-100 font-medium">"{record.notes}"</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
