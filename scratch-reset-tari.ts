import { prisma } from "./lib/prisma";

async function main() {
  console.log("Resetting Tari's booking to unverified status...");

  // 1. Cari user Tari berdasarkan email tari@gmail.com
  const user = await prisma.user.findUnique({
    where: { email: "tari@gmail.com" }
  });

  if (!user) {
    console.error("User Tari not found!");
    return;
  }

  // 2. Cari booking milik Tari untuk tanggal 15 Mei 2026
  const bookingDate = new Date("2026-05-15T00:00:00.000Z");
  const booking = await prisma.booking.findFirst({
    where: {
      userId: user.id,
      bookingDate: bookingDate
    }
  });

  if (!booking) {
    console.error("Booking for Tari on May 15, 2026 not found!");
    return;
  }

  console.log(`Found booking ID: ${booking.id}. Proceeding to reset...`);

  // 3. Hapus Cashflow terkait booking ini jika ada
  const deletedCashflow = await prisma.cashflow.deleteMany({
    where: {
      notes: { contains: booking.id }
    }
  });
  console.log(`Deleted ${deletedCashflow.count} cashflow records linked to this booking.`);

  // 4. Hapus Medical Record jika ada
  const deletedMedical = await prisma.medicalRecord.deleteMany({
    where: {
      bookingId: booking.id
    }
  });
  console.log(`Deleted ${deletedMedical.count} medical records linked to this booking.`);

  // 5. Update status booking menjadi unverified dan kosongkan nomor antrian
  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "unverified",
      queueNumber: null,
      sortPriority: null,
      actualServiceTime: null,
      userResponse: "none",
      callCount: 0
    }
  });

  console.log("Booking successfully reset to unverified:", updatedBooking);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
