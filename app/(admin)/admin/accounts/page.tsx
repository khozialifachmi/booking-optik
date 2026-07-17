import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/admin/search-bar";
import { DateFilter } from "@/components/admin/date-filter";
import { UserCheck, Users, ShieldCheck, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daftar Akun — Admin Portal",
  description: "Database seluruh akun yang terdaftar di aplikasi",
};

export default async function AdminAccountsPage(props: { 
  searchParams: Promise<{ q?: string; days?: string }> 
}) {
  const params = await props.searchParams;
  const q = params?.q?.toLowerCase() || "";
  const days = params?.days || "0";

  // Tanggal data riil (15 Mei 2026)
  const may15 = new Date('2026-05-15T00:00:00.000Z');

  // Tanggal hari ini di Jakarta
  const now = new Date();
  const jakartaOffset = 7 * 60 * 60 * 1000;
  const jakartaTime = new Date(now.getTime() + jakartaOffset);
  const todayStart = new Date(Date.UTC(jakartaTime.getUTCFullYear(), jakartaTime.getUTCMonth(), jakartaTime.getUTCDate(), 0, 0, 0, 0));
  const todayEnd   = new Date(Date.UTC(jakartaTime.getUTCFullYear(), jakartaTime.getUTCMonth(), jakartaTime.getUTCDate(), 23, 59, 59, 999));

  // Selalu tampilkan: admin + user di tgl 15 Mei + user di hari ini (real-time)
  // days filter hanya mempengaruhi apakah hari ini atau hanya tgl 15 yang ditampilkan
  let whereClause: any;
  if (days === "0") {
    // Hari ini: tampilkan admin + user terdaftar hari ini
    whereClause = {
      OR: [
        { role: "admin" },
        { createdAt: { gte: todayStart, lte: todayEnd } }
      ]
    };
  } else {
    // Semua riwayat / filter lain: tampilkan admin + 20 data riil tgl 15 + hari ini
    whereClause = {
      OR: [
        { role: "admin" },
        { createdAt: { gte: may15, lte: new Date(may15.getTime() + 86400000 - 1) } },
        { createdAt: { gte: todayStart, lte: todayEnd } }
      ]
    };
  }

  // Terapkan filter pencarian jika ada
  const searchFilter = q ? {
    OR: [
      { name: { contains: q, mode: 'insensitive' as const } },
      { email: { contains: q, mode: 'insensitive' as const } },
      { phone: { contains: q, mode: 'insensitive' as const } },
    ]
  } : null;

  const users = await prisma.user.findMany({
    where: searchFilter ? { AND: [whereClause, searchFilter] } : whereClause,
    orderBy: { createdAt: 'asc' },
  });

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const customerCount = totalUsers - adminCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Daftar Akun Terdaftar
        </h1>
        <p className="text-muted-foreground">Melihat siapa saja yang sudah mendaftar dan memiliki akun di Optik Khayra.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Akun</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Seluruh akun di database</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount}</div>
            <p className="text-xs text-muted-foreground">Akun role customer</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrator</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
            <p className="text-xs text-muted-foreground">Staff & Admin</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" /> Log Registrasi Akun
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <DateFilter />
            <div className="w-full sm:w-72">
              <SearchBar placeholder="Cari nama, email, atau HP..." />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Nama Lengkap</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">No. Telepon</th>
                  <th className="px-6 py-4 text-left">Peran (Role)</th>
                  <th className="px-6 py-4 text-left">Tgl Registrasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-6 py-4 font-semibold text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono">{user.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === 'admin' 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 italic">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                Tidak ada akun yang ditemukan.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
