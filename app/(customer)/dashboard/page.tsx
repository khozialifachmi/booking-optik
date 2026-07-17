import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarPlus,
  Clock,
  ClipboardList,
  TrendingUp,
  History,
  Eye,
  Printer,
  X,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDashboardBookingsAction, getLiveQueueStatusAction, cancelBookingAction } from "@/actions/booking-actions";
import { getUserMedicalRecordsAction } from "@/actions/medical-actions";
import { LiveQueueSection } from "@/components/booking/live-queue-section";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrintQueueButton } from "@/components/admin/print-queue-button";
import { RefreshDashboard } from "@/components/admin/refresh-dashboard";
import { QueueNotifier } from "@/components/booking/queue-notifier";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { formatJakartaTime } from "@/lib/format-time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — EyeCheck",
  description: "Dashboard pelanggan EyeCheck",
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton for Live Queue */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </CardContent>
      </Card>
      
      {/* Skeleton for Bookings */}
      <Card className="border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function CustomerDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header (rendered instantly) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Selamat Datang! 👋
          </h1>
          <p className="text-muted-foreground">
            Kelola booking pemeriksaan mata Anda di sini.
          </p>
        </div>
        <Link href="/booking/new" className={cn(buttonVariants({ variant: "default" }), "gap-2 w-full sm:w-auto")}>
          <CalendarPlus className="h-4 w-4" />
          Daftar Pemeriksaan
        </Link>
      </div>

      {/* Stream the rest of the dashboard content */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContentWrapper />
      </Suspense>
    </div>
  );
}

async function DashboardContentWrapper() {
  // Session divalidasi di dalam Suspense untuk mendukung instant navigation
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    return redirect("/login");
  }

  return <DashboardContent userId={session.user.id} userName={session.user.name} />;
}

async function DashboardContent({ userId, userName }: { userId: string; userName: string }) {
  try {
    // Ambil semua data secara paralel agar rendering super cepat
    const [stats, liveQueue, medicalRecords] = await Promise.all([
      getDashboardBookingsAction(),
      getLiveQueueStatusAction(),
      getUserMedicalRecordsAction(userId)
    ]);

    const nextBooking = stats.nextBooking;
    const hasUnverified = stats.history.some(b => b.status === "unverified");

    return (
      <div className="space-y-6">
        <RefreshDashboard interval={15000} />

        {/* Real-time Monitoring Banner - Only show when calling */}
        {nextBooking?.status === "calling" && (
          <div className="flex items-center justify-between px-4 py-3 bg-amber-500/20 border border-amber-500/40 rounded-lg animate-bounce">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">PERHATIAN: NOMOR ANDA SEDANG DIPANGGIL!</span>
            </div>
            <span className="text-[10px] text-amber-800 font-medium italic">Segera menuju ruang periksa</span>
          </div>
        )}

        {/* Structured Live Queue Section */}
        {liveQueue.success && liveQueue.data && (
          <LiveQueueSection data={liveQueue.data} />
        )}

      {/* STATUS KONFIRMASI: Tampil ketika ada booking dengan status unverified */}
      {hasUnverified && (() => {
        const unverifiedBooking = stats.history.find(b => b.status === "unverified");
        if (!unverifiedBooking) return null;
        
        const customerName = (() => {
          if (unverifiedBooking?.notes?.startsWith("Nama: ")) {
            return unverifiedBooking.notes.split(" | ")[0].replace("Nama: ", "");
          }
          return userName || "Pelanggan";
        })();
        const serviceType = unverifiedBooking?.serviceType || "-";
        const rawDate = new Date(unverifiedBooking.bookingDate);
        // Force ke tengah hari agar toLocaleDateString tidak bergeser hari
        rawDate.setUTCHours(12, 0, 0, 0);
        
        const bookingDate = new Intl.DateTimeFormat('id-ID', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric',
          timeZone: 'Asia/Jakarta' 
        }).format(rawDate);
          
        const registeredAt = unverifiedBooking?.createdAt
          ? new Intl.DateTimeFormat('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'Asia/Jakarta'
            }).format(new Date(unverifiedBooking.createdAt)) + " WIB"
          : "-";

        return (
          <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-700 overflow-hidden">
            {/* Header Banner */}
            <div className="bg-amber-500/20 px-5 py-3 flex items-center gap-3 border-b border-amber-500/20">
              <div className="h-8 w-8 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-amber-700 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-amber-900 dark:text-amber-500 font-extrabold text-sm uppercase tracking-wide">Menunggu Konfirmasi Admin</p>
                <p className="text-amber-600 dark:text-amber-400 text-xs font-medium">Pendaftaran Anda sedang diverifikasi oleh admin</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-50 animate-ping" />
                <span className="h-2 w-2 rounded-full bg-amber-500 absolute" />
                <span className="text-[10px] font-bold text-amber-700 uppercase">Proses</span>
              </div>
            </div>

            {/* Detail Pendaftaran */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/60 rounded-xl p-3 border border-amber-200/60">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Nama</p>
                  <p className="font-semibold text-amber-900 truncate">{customerName}</p>
                </div>
                <div className="bg-white/60 rounded-xl p-3 border border-amber-200/60">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Jenis Layanan</p>
                  <p className="font-semibold text-amber-900 truncate">{serviceType}</p>
                </div>
                <div className="bg-white/60 rounded-xl p-3 border border-amber-200/60">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Tanggal Booking</p>
                  <p className="font-semibold text-amber-900 text-xs">{bookingDate}</p>
                </div>
                <div className="bg-white/60 rounded-xl p-3 border border-amber-200/60">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Waktu Daftar</p>
                  <p className="font-semibold text-amber-900">{registeredAt}</p>
                </div>
              </div>

              {/* Keterangan */}
              <div className="flex items-start gap-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl p-3">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800 text-xs leading-relaxed">
                  Bukti pembayaran Anda sedang diperiksa oleh admin. Setelah dikonfirmasi, Anda akan mendapatkan{" "}
                  <span className="font-bold">nomor antrian</span> dan dapat mencetak struk.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Status: Calling / Serving / Waiting (Live Notification) */}
      {nextBooking && (
        <>
          <QueueNotifier
            status={nextBooking.status}
            queueNumber={nextBooking.queueNumber}
            bookingId={nextBooking.id}
            callCount={nextBooking.callCount}
            userResponse={nextBooking.userResponse}
          />
          {nextBooking.status !== "unverified" && (
            <Card className={
              nextBooking.status === "serving" || nextBooking.status === "calling" 
                ? "border-green-500/50 bg-green-500/5" 
                : nextBooking.status === "cancelled"
                  ? "border-destructive/30 bg-destructive/[0.02]"
                  : nextBooking.status === "missed"
                    ? "border-rose-500/30 bg-rose-500/[0.02]"
                    : "border-primary/20 bg-primary/[0.02]"
            }>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarPlus className={
                    nextBooking.status === "serving" || nextBooking.status === "calling" 
                      ? "h-5 w-5 text-green-600" 
                      : nextBooking.status === "cancelled"
                        ? "h-5 w-5 text-destructive"
                        : nextBooking.status === "missed"
                          ? "h-5 w-5 text-rose-600 animate-bounce"
                          : "h-5 w-5 text-primary"
                  } />
                  {nextBooking.status === "serving" 
                    ? "Pemeriksaan Sedang Berlangsung" 
                    : nextBooking.status === "calling" 
                      ? "Anda Sedang Dipanggil!" 
                      : nextBooking.status === "cancelled"
                        ? "Pendaftaran Gagal"
                        : nextBooking.status === "missed"
                          ? "Antrian Anda Terlewat!"
                          : "Status Antrian"
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={
                        nextBooking.status === "serving" 
                          ? "flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white font-bold text-lg animate-pulse" 
                          : nextBooking.status === "cancelled"
                            ? "flex h-12 w-12 items-center justify-center rounded-xl bg-destructive text-destructive-foreground font-bold text-lg"
                            : nextBooking.status === "missed"
                              ? "flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600 text-white font-bold text-lg"
                              : "flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg"
                      }>
                        {nextBooking.status === "cancelled" ? "X" : `Q-${nextBooking.queueNumber?.toString().padStart(3, "0") || "---"}`}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {nextBooking.serviceType}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {nextBooking.bookingDate.toISOString().split('T')[0]} · {
                            nextBooking.status === "serving" 
                              ? "Sedang dilayani di ruang periksa" 
                              : nextBooking.status === "calling" 
                                ? "Segera menuju ruang periksa!" 
                                : nextBooking.status === "cancelled"
                                  ? "Pendaftaran dibatalkan/ditolak oleh admin."
                                  : nextBooking.status === "missed"
                                    ? "Anda tidak di lokasi saat dipanggil."
                                    : `Daftar: ${formatJakartaTime(nextBooking.createdAt)} WIB`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      nextBooking.status === "serving" || nextBooking.status === "calling" 
                        ? "border-green-500/30 text-green-600 uppercase bg-green-500/10" 
                        : nextBooking.status === "cancelled"
                          ? "border-destructive/30 text-destructive uppercase bg-destructive/10"
                          : nextBooking.status === "missed"
                            ? "border-rose-500/30 text-rose-600 uppercase bg-rose-500/10 animate-pulse"
                            : "border-primary/30 text-primary uppercase"
                    }>
                      {nextBooking.status === "serving" 
                        ? "Sedang Dilayani" 
                        : nextBooking.status === "calling" 
                          ? "Dipanggil" 
                          : nextBooking.status === "cancelled"
                            ? "Gagal"
                            : nextBooking.status === "missed"
                              ? "Terlewat"
                              : "Menunggu"
                      }
                    </Badge>
                    {nextBooking.status === "unverified" && (
                      <form action={async () => {
                        "use server";
                        await cancelBookingAction(nextBooking.id);
                      }}>
                        <Button variant="outline" size="sm" type="submit" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
                          Batalkan
                        </Button>
                      </form>
                    )}
                    {nextBooking.status === "waiting" && (
                      <div className="mt-4 pt-4 border-t border-dashed flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 p-3 rounded-lg border border-primary/20">
                          <Printer className="h-4 w-4" />
                          Pendaftaran dikonfirmasi! Silakan cetak nomor antrian Anda.
                        </div>
                        <PrintQueueButton
                          queueNumber={nextBooking.queueNumber ?? 0}
                          customerName={(() => {
                            if (nextBooking.notes && nextBooking.notes.startsWith("Nama: ")) {
                              return nextBooking.notes.split(" | ")[0].replace("Nama: ", "");
                            }
                            return userName || "Pelanggan";
                          })()}
                          serviceType={nextBooking.serviceType}
                          bookingTime={formatJakartaTime(nextBooking.createdAt)}
                          bookingDate={nextBooking.createdAt.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        />
                      </div>
                    )}
                    {nextBooking.status === "cancelled" && (
                      <div className="mt-4 pt-4 border-t border-dashed flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-destructive font-bold text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                          <X className="h-4 w-4" />
                          Pendaftaran gagal
                        </div>
                      </div>
                    )}
                    {nextBooking.status === "missed" && (
                      <div className="mt-4 pt-4 border-t border-dashed flex flex-col gap-3 w-full">
                        <div className="flex items-center gap-2 text-rose-600 font-bold text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          Antrian Anda Terlewat! Silakan lapor ke admin untuk dimasukkan kembali ke antrian.
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Link href="/booking" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}>
                        <History className="h-4 w-4 mr-2" />
                        Lihat Riwayat & Detail
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Medical Results Section (Hasil Terbaru) */}
      <div className="space-y-4">
        {(() => {
          const latestRecords = (medicalRecords.success && medicalRecords.data) ? medicalRecords.data : [];

          if (latestRecords.length > 0) {
            return (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Hasil Pemeriksaan Terakhir
                  </h2>
                  <Link href="/booking" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-primary text-xs")}>
                    Lihat Semua
                  </Link>
                </div>
                <div className="grid gap-4">
                  {(() => {
                    const record = latestRecords[0];
                    return (
                      <Card key={record.id} className="border-emerald-500/20 overflow-hidden shadow-sm bg-emerald-500/[0.02] hover:shadow-md transition-shadow">
                        <CardHeader className="bg-emerald-500/10 py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700">
                              <Badge className="bg-emerald-500 text-white">Q-{record.booking?.queueNumber || "---"}</Badge>
                              {record.booking?.serviceType || "Pemeriksaan Mata"}
                            </CardTitle>
                            <span className="text-[10px] text-emerald-600 font-medium">
                              {new Date(record.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4 pb-4">
                          <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-background border border-emerald-500/20">
                              <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Catatan Refraksionis:</p>
                              <p className="text-sm leading-relaxed font-medium italic text-emerald-950 dark:text-emerald-100">"{record.notes || "Hasil sedang diproses..."}"</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>
              </>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
  } catch (error) {
    console.error("Dashboard content error:", error);
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-6 text-center shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-destructive text-lg font-bold">Koneksi Database Terputus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-sm">Gagal mengambil data antrian dan riwayat pemeriksaan.</p>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2 max-w-md mx-auto">
            Pastikan project database Anda di Supabase telah diaktifkan/unpaused dan kredensial koneksi di file .env sudah benar.
          </p>
        </CardContent>
      </Card>
    );
  }
}