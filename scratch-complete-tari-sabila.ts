import { prisma } from "./lib/prisma";

async function main() {
  console.log("Updating Sabila and Tari to completed status...");

  // Waktu spesifik untuk Sabila
  // Mulai (actualServiceTime): 15:00
  // Selesai (updatedAt): 15:20
  const sabilaStart = new Date("2026-05-15T08:00:00.000Z"); // 15:00 WIB
  const sabilaEnd = new Date("2026-05-15T08:20:00.000Z");   // 15:20 WIB

  // Waktu spesifik untuk Tari
  // Mulai (actualServiceTime): 15:20
  // Selesai (updatedAt): 15:40
  // Estimasi Datang (estimatedServiceTime): Sabila + 20 menit -> Tari's arrival time should remain whatever it was, but let's check
  const tariStart = new Date("2026-05-15T08:20:00.000Z");   // 15:20 WIB
  const tariEnd = new Date("2026-05-15T08:40:00.000Z");     // 15:40 WIB

  // Update Sabila (email: sabila@khayra.com)
  const sabilaUser = await prisma.user.findUnique({
    where: { email: "sabila@khayra.com" }
  });

  if (sabilaUser) {
    const sabilaBooking = await prisma.booking.findFirst({
      where: { userId: sabilaUser.id, bookingDate: new Date("2026-05-15T00:00:00.000Z") }
    });

    if (sabilaBooking) {
      await prisma.booking.update({
        where: { id: sabilaBooking.id },
        data: {
          status: "completed",
          actualServiceTime: sabilaStart,
          // updatedAt is automatically handled by Prisma sometimes, but we can try to force it via direct raw update if needed
        }
      });
      // Gunakan query raw untuk update `updatedAt` secara spesifik
      await prisma.$executeRaw`UPDATE bookings SET "updatedAt" = ${sabilaEnd} WHERE "id" = ${sabilaBooking.id}`;
      console.log("Sabila updated: Mulai 15:00 WIB, Selesai 15:20 WIB");
    }
  } else {
    console.log("Sabila user not found.");
  }

  // Update Tari (email: tari@gmail.com)
  const tariUser = await prisma.user.findUnique({
    where: { email: "tari@gmail.com" }
  });

  if (tariUser) {
    const tariBooking = await prisma.booking.findFirst({
      where: { userId: tariUser.id }
    });

    if (tariBooking) {
      await prisma.booking.update({
        where: { id: tariBooking.id },
        data: {
          queueNumber: 20,
          status: "completed",
          actualServiceTime: tariStart,
        }
      });
      // Gunakan query raw untuk update `updatedAt` secara spesifik
      await prisma.$executeRaw`UPDATE bookings SET "updatedAt" = ${tariEnd} WHERE "id" = ${tariBooking.id}`;
      console.log("Tari updated: Mulai 15:20 WIB, Selesai 15:40 WIB");
    }
  } else {
    console.log("Tari user not found.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
