import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Clock,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  ImageIcon,
  CheckCircle,
  Check,
  X,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { 
  updateBookingStatusAction, 
  markAsMissedAction, 
  recallFromMissedAction, 
  toggleBookingStatusAction, 
  cancelBookingAction, 
  verifyPaymentAction,
  updateEstimatedTimeAction
} from "@/actions/admin-actions";
import { CallNextQueueButton } from "@/components/admin/call-next-queue-button";
import { DateFilter } from "@/components/admin/date-filter";
import { SearchBar } from "@/components/admin/search-bar";
import { RecallButton } from "@/components/admin/recall-button";
import { RefreshDashboard } from "@/components/admin/refresh-dashboard";
import { PrintQueueButton } from "@/components/admin/print-queue-button";
import { MedicalRecordForm } from "@/components/admin/medical-record-form";
import { SkipButton } from "@/components/admin/skip-button";
import { RecallMissedButton } from "@/components/admin/recall-missed-button";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

import { formatJakartaTime } from "@/lib/format-time";

export const metadata: Metadata = {
  title: "Admin Dashboard — EyeCheck",
  description: "Dashboard admin EyeCheck — kelola antri hari ini",
};

const statusConfig = {
  waiting: {
    label: "Menunggu",
    variant: "outline" as const,
    className: "border-amber-300 text-amber-700 bg-amber-50",
  },
  calling: {
    label: "Dipanggil",
    variant: "default" as const,
    className: "bg-amber-500 text-white animate-pulse",
  },
  serving: {
    label: "Sedang Dilayani",
    variant: "default" as const,
    className: "bg-primary text-primary-foreground",
  },
  completed: {
    label: "Selesai",
    variant: "secondary" as const,
    className: "bg-emerald-100 text-emerald-700",
  },
  cancelled: {
    label: "Dibatalkan",
    variant: "destructive" as const,
    className: "",
  },
  missed: {
    label: "Terlewat (Late)",
    variant: "outline" as const,
    className: "border-rose-300 text-rose-700 bg-rose-50",
  },
  unverified: {
    label: "Menunggu Konfirmasi",
    variant: "outline" as const,
    className: "border-purple-300 text-purple-700 bg-purple-50",
  },
};

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border/50">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24 hidden sm:block" />
              <Skeleton className="h-6 w-20 hidden md:block" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function AdminDashboard(props: { 
  searchParams: Promise<{ q?: string; days?: string }> 
}) {
  const params = await props.searchParams;
  const q = params?.q?.toLowerCase() || "";
  const days = params?.days || "0";

  // Gunakan tanggal UTC Midnight untuk mencocokkan penyimpanan di database (bookingDate @db.Date)
  const now = new Date();
  const shiftedNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const todayDateUTC = new Date(Date.UTC(
      shiftedNow.getUTCFullYear(),
      shiftedNow.getUTCMonth(),
      shiftedNow.getUTCDate(),
      0, 0, 0, 0
  ));

  let targetDate: Date | null = new Date(todayDateUTC);
  let displayTitle = "Antrian Hari Ini";

  if (days === "all") {
    targetDate = null;
    displayTitle = "Semua Riwayat Antrian";
  } else if (days !== "0") {
    const d = parseInt(days);
    targetDate.setUTCDate(targetDate.getUTCDate() - d);
    displayTitle = `Antrian ${d} Hari Lalu`;
  } else {
    // Tetap gunakan hari ini
    targetDate = new Date(todayDateUTC);
    displayTitle = "Antrian Hari Ini";
  }

  const dateString = targetDate ? targetDate.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "Semua Waktu";

  return (
    <div className="space-y-6">
      {/* Header elements rendered instantly */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard Admin</h1>
          <p className="text-muted-foreground">{dateString}</p>
          {targetDate && (
            <p className="text-[10px] text-gray-400 italic">
              Mode Sinkron: Mencocokkan tanggal {targetDate.toISOString().split('T')[0]} (Lokal Midnight)
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <DateFilter />
          <CallNextQueueButton />
        </div>
      </div>

      {/* Database querying parts are streamed inside Suspense */}
      <Suspense key={`${q}-${days}`} fallback={<AdminDashboardSkeleton />}>
        <AdminDashboardContent q={q} days={days} targetDate={targetDate} displayTitle={displayTitle} />
      </Suspense>
    </div>
  );
}

async function AdminDashboardContent({
  q,
  days,
  targetDate,
  displayTitle
}: {
  q: string;
  days: string;
  targetDate: Date | null;
  displayTitle: string;
}) {
  let bookings;
  try {
    bookings = await prisma.booking.findMany({
      where: targetDate ? {
        bookingDate: targetDate
      } : {},
      select: {
        id: true,
        queueNumber: true,
        status: true,
        serviceType: true,
        bookingDate: true,
        estimatedServiceTime: true,
        actualServiceTime: true,
        notes: true,
        userResponse: true,
        updatedAt: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: targetDate ? [
        { sortPriority: 'asc' },
        { createdAt: 'asc' }
      ] : [
        { bookingDate: 'desc' },
        { createdAt: 'asc' }
      ],
      take: 100
    });
  } catch (error) {
    console.error("Dashboard database fetch error:", error);
    return (
      <Card className="border-destructive/50 bg-destructive/5 p-6 text-center">
        <h2 className="text-lg font-bold text-destructive mb-2">Gagal Memuat Data Dashboard</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Ada kendala koneksi ke database. Silakan periksa koneksi internet Anda atau coba muat ulang halaman.
        </p>
        <Link
          href="/admin/dashboard"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-destructive text-destructive hover:bg-destructive/10"
          )}
        >
          Coba Lagi
        </Link>
      </Card>
    );
  }

  const getName = (b: any) => {
    if (b.notes && b.notes.startsWith("Nama: ")) {
      return b.notes.split(" | ")[0].replace("Nama: ", "");
    }
    return b.user?.name || "Pelanggan";
  };

  if (q) {
    bookings = bookings.filter((b) => getName(b).toLowerCase().includes(q));
  }

  const totalToday = bookings.length;
  const calling = bookings.filter((q) => q.status === "calling").length;
  const serving = bookings.filter((q) => q.status === "serving").length;
  const completed = bookings.filter((q) => q.status === "completed").length;
  const waiting = bookings.filter((q) => q.status === "waiting" || q.status === "missed").length;

  return (
    <div className="space-y-6">
      <RefreshDashboard interval={30000} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card Total Antrian */}
        <Link href="/admin/bookings" className="transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Antrian</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalToday}</div>
            </CardContent>
          </Card>
        </Link>

        {/* Card Sedang Dilayani */}
        <Link href="/admin/bookings?status=serving" className="transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sedang Dilayani</CardTitle>
              <PlayCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{serving}</div>
            </CardContent>
          </Card>
        </Link>

        {/* Card Menunggu */}
        <Link href="/admin/bookings?status=waiting" className="transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{waiting}</div>
            </CardContent>
          </Card>
        </Link>

        {/* Card Selesai */}
        <Link href="/admin/bookings?status=completed" className="transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Selesai</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{completed}</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Tabel Antrian */}
      <Card className="border-border/50 animate-in fade-in duration-300">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg">{displayTitle}</CardTitle>
          <SearchBar placeholder="Cari nama pelanggan..." />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">No. Antrian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Layanan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Est. Waktu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Jam Daftar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((item) => {
                  const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.waiting;
                  return (
                    <tr key={item.id} className={`transition-colors hover:bg-muted/30 ${item.status === "serving" ? "bg-primary/[0.03]" : ""}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${item.queueNumber ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"} text-sm font-bold`}>
                          {item.queueNumber || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <div className="flex flex-col gap-1">
                          <span>{getName(item)}</span>
                          {item.status !== "completed" && item.userResponse === "present" && (
                            <Badge className="w-fit bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] h-5 py-0 px-1.5 hover:bg-emerald-100">
                              <Check className="h-3 w-3 mr-1" /> Hadir
                            </Badge>
                          )}
                          {item.status !== "completed" && item.userResponse === "absent" && (
                            <Badge className="w-fit bg-rose-100 text-rose-700 border-rose-200 text-[10px] h-5 py-0 px-1.5 hover:bg-rose-100">
                              <X className="h-3 w-3 mr-1" /> Tidak Hadir
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{item.serviceType}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">
                            {formatJakartaTime(item.estimatedServiceTime)} WIB
                          </span>
                          <form
                            className="flex items-center gap-1"
                            action={async (formData) => {
                              "use server";
                              const newTime = formData.get("newTime") as string;
                              await updateEstimatedTimeAction(item.id, newTime);
                            }}
                          >
                            <input
                              type="time"
                              name="newTime"
                              defaultValue={formatJakartaTime(item.estimatedServiceTime)}
                              className="text-[10px] bg-muted border-none rounded px-1 w-16 focus:ring-1 ring-primary text-xs"
                            />
                            <button type="submit" className="text-[10px] bg-primary text-white rounded px-1.5 py-0.5 hover:bg-primary/90">
                              Set
                            </button>
                          </form>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                        {formatJakartaTime(item.createdAt)} WIB
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge className={config.className}>{config.label}</Badge>
                          {(item.status === "unverified" || item.status === "waiting") && (
                            <a href={`/api/payment-proof/${item.id}`} target="_blank" rel="noreferrer" className="text-[10px] flex items-center gap-1 text-primary hover:underline">
                              <ImageIcon className="h-3 w-3" /> Lihat Bukti
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {item.status === "unverified" && (
                            <form
                              action={async () => {
                                "use server";
                                await verifyPaymentAction(item.id);
                              }}
                            >
                              <Button type="submit" variant="default" size="sm" className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700">
                                <CheckCircle className="h-3 w-3" /> Konfirmasi
                              </Button>
                            </form>
                          )}
                          {(item.status === "calling" || item.status === "serving") && (
                            <div className="flex gap-1">
                              <RecallButton queueNumber={item.queueNumber || 0} />
                              <SkipButton bookingId={item.id} />
                            </div>
                          )}
                          {item.status === "missed" && (
                            <RecallMissedButton bookingId={item.id} queueNumber={item.queueNumber || 0} />
                          )}
                          <MedicalRecordForm bookingId={item.id} userId={item.userId} customerName={getName(item)} />
                          {item.status !== "completed" && item.status !== "cancelled" && (
                            <form
                              action={async () => {
                                "use server";
                                await cancelBookingAction(item.id);
                              }}
                            >
                              <Button type="submit" variant="outline" size="sm" className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
                                Batal
                              </Button>
                            </form>
                          )}
                          <form
                            action={async () => {
                              "use server";
                              await toggleBookingStatusAction(item.id, item.status);
                            }}
                          >
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              className="h-8"
                              disabled={item.status === "completed" || item.status === "cancelled"}
                            >
                              {item.status === "waiting" ? "Panggil" : item.status === "calling" ? "Layani" : item.status === "serving" ? "Selesaikan" : "Selesai"}
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {bookings.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Belum ada riwayat pendaftaran pada tanggal ini.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}