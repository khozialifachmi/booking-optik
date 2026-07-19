import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { DateFilter } from "@/components/admin/date-filter";
import { PrintReportButton } from "@/components/admin/print-report-button";
import { Clock, Users, Calculator, BookOpen, AlertCircle } from "lucide-react";
import { AddRegistrantDialog } from "@/components/admin/add-registrant-dialog";
import { DeleteBookingButton } from "@/components/admin/delete-booking-button";
import { RefreshDashboard } from "@/components/admin/refresh-dashboard";

import { formatJakartaTime } from "@/lib/format-time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Perhitungan FCFS — EyeCheck",
  description: "Laporan analisis penjadwalan antrean dengan metode First-Come, First-Served",
};

const statusConfig = {
  waiting: { label: "Menunggu", className: "border-amber-300 text-amber-700 bg-amber-50" },
  calling: { label: "Dipanggil", className: "bg-amber-500 text-white animate-pulse" },
  serving: { label: "Sedang Dilayani", className: "bg-primary text-primary-foreground" },
  completed: { label: "Selesai", className: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Dibatalkan", className: "bg-gray-100 text-gray-500 border-gray-200" },
  missed: { label: "Terlewat", className: "border-rose-300 text-rose-700 bg-rose-50" },
  unverified: { label: "Menunggu Konfirmasi", className: "border-purple-300 text-purple-700 bg-purple-50" },
};

export default async function AdminFCFSPage(props: {
  searchParams: Promise<{ days?: string }>
}) {
  const params = await props.searchParams;
  const days = params?.days || "0";

  // LOGIKA SINKRON: Menggunakan Local Midnight Jakarta untuk menyamakan dengan Dashboard
  const now = new Date();
  const shiftedNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const todayDateUTC = new Date(Date.UTC(
      shiftedNow.getUTCFullYear(),
      shiftedNow.getUTCMonth(),
      shiftedNow.getUTCDate(),
      0, 0, 0, 0
  ));

  let targetDate: Date | null = new Date(todayDateUTC);
  let displayTitle = "Perhitungan FCFS Hari Ini";

  if (days === "all") {
    targetDate = null;
    displayTitle = "Semua Riwayat Perhitungan FCFS";
  } else if (days !== "0") {
    const d = parseInt(days);
    targetDate.setUTCDate(targetDate.getUTCDate() - d);
    displayTitle = `Perhitungan FCFS ${d} Hari Lalu`;
  } else {
    // Tetap gunakan hari ini
    targetDate = new Date(todayDateUTC);
    displayTitle = "Perhitungan FCFS Hari Ini";
  }

  const dateString = targetDate ? targetDate.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta"
  }) : "Semua Waktu";

  // Ambil semua booking yang terverifikasi (memiliki nomor antrean)
  const bookings = await prisma.booking.findMany({
    where: targetDate ? {
      bookingDate: targetDate,
      queueNumber: { not: null }
    } : {
      queueNumber: { not: null }
    },
    select: {
      id: true,
      queueNumber: true,
      status: true,
      serviceType: true,
      bookingDate: true,
      estimatedServiceTime: true,
      actualServiceTime: true,
      updatedAt: true,
      createdAt: true,
      notes: true,
      user: {
        select: { name: true }
      }
    },
    orderBy: targetDate ? [
      { createdAt: 'asc' }
    ] : [
      { bookingDate: 'desc' },
      { createdAt: 'asc' }
    ],
    take: 100
  });

  const getName = (b: any) => {
    if (b.notes && b.notes.startsWith("Nama: ")) {
      return b.notes.split(" | ")[0].replace("Nama: ", "");
    }
    return b.user?.name || "Pelanggan";
  };

  // Lakukan perhitungan FCFS untuk tiap pelanggan
  let totalWaitingTime = 0;
  let totalServiceTime = 0;
  let totalTurnaroundTime = 0;

  let countWaitingCalc = 0; // Pelanggan yang sudah mulai dilayani / dipanggil / selesai
  let countCompletedCalc = 0; // Pelanggan yang sudah selesai dilayani

  const calculatedBookings = bookings.map((item) => {
    const arrivalTime = item.estimatedServiceTime; // Jam janji temu (A_i)
    const serviceStartTime = item.actualServiceTime; // Mulai pelayanan (S_start)
    const completionTime = item.status === "completed" ? item.updatedAt : null; // Selesai pelayanan (C_i)

    let waitingTime = null;
    let serviceTime = null;
    let turnaroundTime = null;

    // 1. Hitung Waktu Tunggu (Waiting Time, W_i) = S_start - A_i
    if (serviceStartTime) {
      const diffMs = serviceStartTime.getTime() - arrivalTime.getTime();
      // Waktu tunggu minimal 0 (jika dilayani lebih cepat dari jadwal kedatangan)
      waitingTime = Math.max(0, Math.round(diffMs / 60000));
      totalWaitingTime += waitingTime;
      countWaitingCalc++;
    }

    // 2. Hitung Waktu Pelayanan (Service Time, T_service) = C_i - S_start
    if (serviceStartTime && completionTime) {
      const diffMs = completionTime.getTime() - serviceStartTime.getTime();
      serviceTime = Math.max(0, Math.round(diffMs / 60000));
      totalServiceTime += serviceTime;
      countCompletedCalc++;
    }

    // 3. Hitung Waktu Putar (Turnaround Time, TA_i) = C_i - A_i
    if (completionTime) {
      const diffMs = completionTime.getTime() - arrivalTime.getTime();
      turnaroundTime = Math.max(0, Math.round(diffMs / 60000));
      totalTurnaroundTime += turnaroundTime;
    }

    return {
      ...item,
      customerName: getName(item),
      arrivalTime,
      serviceStartTime,
      completionTime,
      waitingTime,
      serviceTime,
      turnaroundTime
    };
  });

  // Hitung rata-rata
  const avgWaitingTime = countWaitingCalc > 0 ? (totalWaitingTime / countWaitingCalc).toFixed(1) : "0.0";
  const avgServiceTime = countCompletedCalc > 0 ? (totalServiceTime / countCompletedCalc).toFixed(1) : "0.0";
  const avgTurnaroundTime = countCompletedCalc > 0 ? (totalTurnaroundTime / countCompletedCalc).toFixed(1) : "0.0";

  // Fungsi pemformat untuk selalu menggunakan menit
  const formatAverageTime = (avgStr: string) => {
    return {
      value: avgStr,
      unit: "menit"
    };
  };

  const formattedWaiting = formatAverageTime(avgWaitingTime);
  const formattedService = formatAverageTime(avgServiceTime);
  const formattedTurnaround = formatAverageTime(avgTurnaroundTime);

  return (
    <div className="space-y-6">
      <RefreshDashboard interval={3000} />
      {/* Header Laporan */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-5 print:border-none print:pb-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Laporan Perhitungan FCFS</h1>
          <p className="text-muted-foreground">{dateString}</p>
          <p className="text-xs text-gray-400 italic print:hidden">
            Metrik penjadwalan antrean berdasarkan algoritma First Come First Served (FCFS)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <AddRegistrantDialog />
          <DateFilter />
          <PrintReportButton />
        </div>
      </div>

      {/* Ringkasan Metrik FCFS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 print:gap-2">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Rata-rata Waktu Tunggu (AWT)</CardTitle>
            <Clock className="h-4 w-4 text-amber-500 print:hidden" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{formattedWaiting.value} <span className="text-sm font-normal text-muted-foreground">{formattedWaiting.unit}</span></div>
            <p className="text-[10px] text-muted-foreground mt-1">Rata-rata pelanggan mengantri sebelum dilayani</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Rata-rata Waktu Layanan (AST)</CardTitle>
            <Calculator className="h-4 w-4 text-primary print:hidden" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formattedService.value} <span className="text-sm font-normal text-muted-foreground">{formattedService.unit}</span></div>
            <p className="text-[10px] text-muted-foreground mt-1">Rata-rata durasi pelayanan pemeriksaan mata</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Rata-rata Waktu Keseluruhan (ATT)</CardTitle>
            <Clock className="h-4 w-4 text-emerald-500 print:hidden" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{formattedTurnaround.value} <span className="text-sm font-normal text-muted-foreground">{formattedTurnaround.unit}</span></div>
            <p className="text-[10px] text-muted-foreground mt-1">Rata-rata total waktu kedatangan hingga selesai</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Pelanggan Terlayani</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground print:hidden" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{countCompletedCalc} <span className="text-sm font-normal text-muted-foreground">pelanggan</span></div>
            <p className="text-[10px] text-muted-foreground mt-1">Jumlah pelanggan berstatus selesai dari total {bookings.length} antrean</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Detail Perhitungan FCFS */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{displayTitle}</CardTitle>
            <CardDescription className="text-xs print:hidden">Tabel analisis penjadwalan antrean FCFS per hari.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground uppercase font-medium">
                  <th className="px-4 py-3 text-center w-12">No</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Layanan</th>
                  <th className="px-4 py-3 text-center">Jam Datang</th>
                  <th className="px-4 py-3 text-center">Tanggal</th>
                  <th className="px-4 py-3 text-center text-amber-700">Estimasi Waktu Tunggu</th>
                  <th className="px-4 py-3 text-center text-primary">Estimasi Waktu Pemeriksaan</th>
                  <th className="px-4 py-3 text-center print:hidden">Status</th>
                  <th className="px-4 py-3 text-center print:hidden w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {calculatedBookings.map((item) => {
                  const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.waiting;
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-muted/30">
                      {/* No Antrean */}
                      <td className="px-4 py-3 text-center font-bold">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs">
                          {item.queueNumber}
                        </span>
                      </td>
                      {/* Nama */}
                      <td className="px-4 py-3 font-medium">{item.customerName}</td>
                      {/* Layanan */}
                      <td className="px-4 py-3 text-xs text-muted-foreground">{item.serviceType}</td>
                      {/* Jam Datang */}
                      <td className="px-4 py-3 text-center font-mono text-xs">
                        {formatJakartaTime(item.arrivalTime)} WIB
                      </td>
                      {/* Tanggal */}
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                        {item.bookingDate.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                      </td>
                      {/* Estimasi Waktu Tunggu */}
                      <td className="px-4 py-3 text-center font-semibold text-xs text-amber-600">
                        {item.waitingTime !== null ? `${item.waitingTime} menit` : <span className="text-gray-300 font-normal">-</span>}
                      </td>
                      {/* Estimasi Waktu Pemeriksaan (Waktu Dilayani & Waktu Selesai) */}
                      <td className="px-4 py-3 text-center text-xs text-primary">
                        <div className="flex flex-col items-center gap-0.5">
                          <div>
                            <span className="text-muted-foreground text-[10px]">Mulai: </span>
                            <span className="font-mono font-semibold">
                              {item.serviceStartTime ? (
                                formatJakartaTime(item.serviceStartTime) + " WIB"
                              ) : (
                                "-"
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[10px]">Selesai: </span>
                            <span className="font-mono font-semibold">
                              {item.completionTime ? (
                                formatJakartaTime(item.completionTime) + " WIB"
                              ) : (
                                "-"
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 text-center print:hidden">
                        <Badge className={config.className}>{config.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center print:hidden whitespace-nowrap">
                        <DeleteBookingButton bookingId={item.id} name={item.customerName} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {bookings.length === 0 && (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p>Belum ada antrean terdaftar/terverifikasi pada tanggal ini.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referensi Rumus Akademik */}
      <Card className="border-border/50 print:hidden">
        <CardHeader className="flex flex-row items-center gap-3 bg-muted/20 border-b">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Referensi Rumus Penjadwalan FCFS</CardTitle>
            <CardDescription className="text-xs">Rumus yang digunakan dalam perhitungan antrean.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm text-muted-foreground space-y-4 leading-relaxed">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-1">1. Waktu Tunggu (Wi)</h4>
              <p className="text-xs mb-2">Selisih waktu ketika pelanggan dipanggil/dilayani dengan estimasi janji kedatangan.</p>
              <div className="bg-background px-3 py-1.5 rounded font-mono text-xs text-amber-600 border w-fit">
                Wi = Max(0, S_start - A)
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-1">2. Waktu Pelayanan (T_service)</h4>
              <p className="text-xs mb-2">Durasi waktu pemeriksaan mata dari awal dilayani hingga status diselesaikan.</p>
              <div className="bg-background px-3 py-1.5 rounded font-mono text-xs text-primary border w-fit">
                T_service = C - S_start
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-semibold text-foreground mb-1">3. Waktu Keseluruhan (TAi)</h4>
              <p className="text-xs mb-2">Total waktu yang dihabiskan pelanggan di sistem, dari estimasi kedatangan hingga selesai.</p>
              <div className="bg-background px-3 py-1.5 rounded font-mono text-xs text-emerald-600 border w-fit">
                TA_i = C - A = Wi + T_service
              </div>
            </div>
          </div>
          <div className="text-xs bg-muted/20 border p-3 rounded-lg flex gap-2">
            <span className="font-bold text-foreground">Keterangan:</span>
            <span>
              <strong>A</strong> = Waktu Kedatangan (Estimated Arrival/Service Time), 
              <strong> S_start</strong> = Waktu Mulai Dilayani (Actual Service Time), 
              <strong> C</strong> = Waktu Selesai (Completed Time/Record Updated).
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
