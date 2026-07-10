import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/admin/search-bar";
import { DateFilter } from "@/components/admin/date-filter";
export const metadata: Metadata = {
  title: "Data Pelanggan — EyeCheck",
  description: "Database seluruh pelanggan Optik Khayra",
};

export default async function AdminCustomersPage(props: { 
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
    // Tetap gunakan hari ini
    targetDate = new Date(todayDateUTC);
  }

  const bookings = await prisma.booking.findMany({
    where: targetDate ? (
        days === "0" 
        ? { bookingDate: targetDate } // Tepat hari ini (atau tgl fallback demo)
        : { bookingDate: { gte: targetDate } } // Dari X hari lalu sampai sekarang
    ) : {},
    select: {
      id: true,
      serviceType: true,
      bookingDate: true,
      notes: true,
      user: {
        select: { name: true }
      }
    },
    orderBy: { bookingDate: 'desc' }
  });

  // Extract unique customers from booking notes
  const customersMap = new Map<string, any>();
  
  bookings.forEach(b => {
    let name = b.user?.name || "Pelanggan";
    let phone = "-";
    let usia = "-";
    let kelamin = "-";
    let keluhan = "-";
    let kacamata = "-";

    if (b.notes && b.notes.includes(" | ")) {
      const parts = b.notes.split(" | ");
      const foundName = parts.find(p => p.startsWith("Nama:"))?.replace("Nama: ", "");
      if (foundName) name = foundName;
      
      phone = parts.find(p => p.startsWith("HP:"))?.replace("HP: ", "") || "-";
      usia = parts.find(p => p.startsWith("Usia:"))?.replace("Usia: ", "") || "-";
      kelamin = parts.find(p => p.startsWith("Kelamin:"))?.replace("Kelamin: ", "") || "-";
      keluhan = parts.find(p => p.startsWith("Keluhan:"))?.replace("Keluhan: ", "") || "-";
      kacamata = parts.find(p => p.startsWith("Kacamata:"))?.replace("Kacamata: ", "") || "-";
    }
    
    const key = `${name.toLowerCase().trim()}-${phone.trim()}`;
    
    if (!customersMap.has(key)) {
      customersMap.set(key, {
          name,
          phone,
          usia,
          kelamin,
          keluhan,
          kacamata,
          totalVisits: 1,
          lastVisit: b.bookingDate,
          lastService: b.serviceType
      });
    } else {
      const existing = customersMap.get(key);
      existing.totalVisits += 1;
      if (b.bookingDate > existing.lastVisit) {
          existing.lastVisit = b.bookingDate;
          existing.lastService = b.serviceType;
          existing.keluhan = keluhan !== "-" ? keluhan : existing.keluhan;
          existing.kacamata = kacamata !== "-" ? kacamata : existing.kacamata;
          existing.usia = usia !== "-" ? usia : existing.usia;
          existing.kelamin = kelamin !== "-" ? kelamin : existing.kelamin;
      }
    }
  });

  const exactOrder = [
    "raihan",
    "oktaviana silitonga",
    "candra widiati",
    "putri nur arfianti",
    "yuli susi karmila sari",
    "eli",
    "susi",
    "desi ikarimawati",
    "may liana sari",
    "sudirman",
    "ossa",
    "irwandi",
    "hudorie",
    "lucky",
    "rahma",
    "ummayah",
    "seri jubaedah",
    "dimas",
    "sabila",
    "tari"
  ];

  let uniqueCustomers = Array.from(customersMap.values()).sort((a, b) => {
    const idxA = exactOrder.indexOf(a.name.toLowerCase().trim());
    const idxB = exactOrder.indexOf(b.name.toLowerCase().trim());
    
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    
    return b.lastVisit.getTime() - a.lastVisit.getTime();
  });

  if (q) {
      uniqueCustomers = uniqueCustomers.filter(c => c.name.toLowerCase().includes(q));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Database Pelanggan</h1>
        <p className="text-muted-foreground">Kumpulan kontak dan data kedatangan seluruh pelanggan Anda.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pelanggan Terdaftar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueCustomers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b bg-gray-50/50">
          <CardTitle className="text-lg">Daftar Kontak</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <DateFilter />
            <SearchBar placeholder="Cari nama pelanggan..." />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/40 whitespace-nowrap">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama Pelanggan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nomor HP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Usia / L/P</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Keluhan & Kacamata</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Kunjungan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tgl Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {uniqueCustomers.map((cust, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{cust.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{cust.phone}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{cust.usia} Thn / {cust.kelamin}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate" title={`Keluhan: ${cust.keluhan} | Kacamata: ${cust.kacamata}`}>
                        <div className="font-medium truncate">{cust.keluhan}</div>
                        <div className="text-xs opacity-70 truncate">Kacamata: {cust.kacamata}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-primary whitespace-nowrap">{cust.totalVisits} kali</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                        {cust.lastVisit.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
            {uniqueCustomers.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">Belum ada data pelanggan tersimpan pada periode ini.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
