import { prisma } from "./lib/prisma";

async function main() {
  const bookingDate = new Date("2026-05-15T00:00:00.000Z");
  const bookings = await prisma.booking.findMany({
    where: { bookingDate },
    include: { user: true },
    orderBy: { sortPriority: "asc" }
  });

  console.log("May 15, 2026 Bookings Count:", bookings.length);
  for (const b of bookings) {
    console.log(`No. ${b.queueNumber} - Name: ${b.notes?.split(" | ")[0] || b.user.name} - Email: ${b.user.email} - Status: ${b.status} - ID: ${b.id}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
