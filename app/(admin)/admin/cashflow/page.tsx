import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { CashflowForm } from "@/components/admin/cashflow-form";
import { DeleteCashflowButton } from "@/components/admin/delete-cashflow-button";
import { CashflowChart } from "@/components/admin/cashflow-chart";
import { DateFilter } from "@/components/admin/date-filter";
import { GenderChart } from "@/components/admin/gender-chart";
export const metadata: Metadata = {
  title: "Keuangan — EyeCheck",
  description: "Kelola arus kas (Cashflow) klinik Optik Khayra",
};

// Format IDR helper
function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function CashflowPage(props: { 
  searchParams: Promise<{ q?: string; days?: string }> 
}) {
  const params = await props.searchParams;
  const days = params?.days || "all";

  // Gunakan tanggal UTC Midnight untuk mencocokkan penyimpanan di database (date @db.Date)
  const now = new Date();
  const shiftedNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const todayDateUTC = new Date(Date.UTC(
      shiftedNow.getUTCFullYear(),
      shiftedNow.getUTCMonth(),
      shiftedNow.getUTCDate(),
      0, 0, 0, 0
  ));

  let targetDate = new Date(todayDateUTC);

  let dateFilter = {};
  let bookingDateFilter = {};

  if (days === "all") {
    // Tidak membatasi tanggal
  } else if (days === "0") {
    // Jika hari ini kosong, tetap pakai tanggal hari ini
    targetDate = new Date(todayDateUTC);
    dateFilter = { date: targetDate };
    bookingDateFilter = { bookingDate: targetDate };
  } else if (days === "1") {
    // Kemarin
    targetDate.setUTCDate(targetDate.getUTCDate() - 1);
    dateFilter = { date: targetDate };
    bookingDateFilter = { bookingDate: targetDate };
  } else {
    // X Hari Lalu (Dari X hari lalu s/d Hari Ini)
    const count = parseInt(days);
    const gte = new Date(targetDate);
    gte.setUTCDate(gte.getUTCDate() - count);
    const lte = targetDate;
    dateFilter = { date: { gte, lte } };
    bookingDateFilter = { bookingDate: { gte, lte } };
  }

  const cashflows = await prisma.cashflow.findMany({
    where: dateFilter,
    orderBy: [
      { date: "desc" },
      { createdAt: "asc" }
    ],
  });

  const bookings = await prisma.booking.findMany({
    where: bookingDateFilter,
    select: { notes: true }
  });

  let maleCount = 0;
  let femaleCount = 0;

  bookings.forEach((b) => {
    const notes = b.notes || "";
    if (notes.includes("Kelamin: Laki-laki") || notes.toLowerCase().includes("kelamin: laki-laki")) {
      maleCount++;
    } else if (notes.includes("Kelamin: Perempuan") || notes.toLowerCase().includes("kelamin: perempuan")) {
      femaleCount++;
    }
  });

  const totalIncome = cashflows
    .filter((c) => c.type === "income")
    .reduce((sum, c) => sum + c.amount, 0);

  const totalExpense = cashflows
    .filter((c) => c.type === "expense")
    .reduce((sum, c) => sum + c.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Catatan Keuangan
          </h1>
          <p className="text-muted-foreground">
            Rekap pemasukan dan pengeluaran Optik Khayra
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <DateFilter defaultValue="all" />
          <CashflowForm />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pemasukan
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatRupiah(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengeluaran
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatRupiah(totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Saldo Bersih
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-primary" : "text-rose-600"}`}>
              {formatRupiah(netBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations Grid (Kurva Keuangan & Demografi Gender) */}
      <div className="grid gap-6 lg:grid-cols-4 items-start">
        <CashflowChart items={cashflows} days={days} />
        <GenderChart maleCount={maleCount} femaleCount={femaleCount} />
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cashflows.length > 0 ? (
                  cashflows.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.date.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {item.type === "income" ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                            Pemasukan
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">
                            Pengeluaran
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.description}</p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.notes}
                          </p>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${item.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                        {item.type === "income" ? "+" : "-"}{formatRupiah(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <DeleteCashflowButton id={item.id} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Belum ada catatan keuangan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
