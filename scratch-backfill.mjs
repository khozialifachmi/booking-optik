import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === "year").value, 10);
  const month = parseInt(parts.find(p => p.type === "month").value, 10) - 1;
  const day = parseInt(parts.find(p => p.type === "day").value, 10);
  const targetDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

  // Ambil booking 'ali' yang terlewat cashflow-nya
  const bookingId = 'b7f292ce-26da-4019-b5e6-ccc19896cdfb';
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) {
    console.log("Booking tidak ditemukan.");
    return;
  }

  // Cek apakah cashflow untuk booking ini sudah ada
  const existingCashflow = await prisma.cashflow.findFirst({
    where: {
      notes: {
        contains: bookingId
      }
    }
  });

  if (existingCashflow) {
    console.log("Cashflow untuk booking ini sudah ada:", existingCashflow);
    return;
  }

  // Buat cashflow baru
  const customerName = "ali";
  const newCashflow = await prisma.cashflow.create({
    data: {
      type: "income",
      amount: 15000,
      description: `Pendaftaran Pemeriksaan Mata - ${customerName}`,
      date: targetDate,
      notes: `Otomatis dari verifikasi booking ID: ${bookingId} (Backfill)`
    }
  });

  console.log("Berhasil menambahkan cashflow backfill:", newCashflow);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
