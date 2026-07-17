import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/admin/search-bar";
import { DateFilter } from "@/components/admin/date-filter";

import { formatJakartaTime } from "@/lib/format-time";
export const metadata: Metadata = {
  title: "Riwayat Semua Booking — EyeCheck",
  description: "Daftar riwayat pemeriksaan pelanggan Optik Khayra",
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

export default async function AdminBookingsPage(props: { 
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

  if (days === "all") {
    targetDate = null;
  } else if (days !== "0") {
    const d = parseInt(days);
    targetDate.setUTCDate(targetDate.getUTCDate() - d);
  } else {
    // Keep it on today even if it's empty
    targetDate = new Date(todayDateUTC);
  }

  let bookings = await prisma.booking.findMany({
    where: targetDate ? (
        days === "0" 
        ? { bookingDate: targetDate } // Tepat hari ini (atau tgl fallback demo)
        : { bookingDate: { gte: targetDate } } // Dari X hari lalu sampai sekarang
    ) : {},
    select: {
      id: true,
      queueNumber: true,
      status: true,
      serviceType: true,
      bookingDate: true,
      estimatedServiceTime: true,
      notes: true,
      user: {
        select: { name: true }
      }
    },
    orderBy: [
      { bookingDate: 'desc' },
      { queueNumber: 'asc' }
    ],
    take: 100
  });

  const getName = (b: any) => {
    if (b.notes && b.notes.startsWith("Nama: ")) {
        return b.notes.split(" | ")[0].replace("Nama: ", "");
    }
    return b.user?.name || "Pelanggan";
  };

  if (q) {
    bookings = bookings.filter(b => getName(b).toLowerCase().includes(q));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Semua Riwayat Booking</h1>
        <p className="text-muted-foreground">Catatan seluruh antrian dan pemeriksaan pelanggan dari awal hingga saat ini.</p>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b bg-gray-50/50">
          <CardTitle className="text-lg">Daftar Lengkap Antrian</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <DateFilter />
            <SearchBar placeholder="Cari nama pelanggan..." />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Layanan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Jam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((item) => {
                  const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.waiting;
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                        {item.bookingDate.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {item.queueNumber || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{getName(item)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.serviceType}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatJakartaTime(item.estimatedServiceTime)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={config.className}>{config.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {bookings.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">Belum ada riwayat pendaftaran.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
