import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const may15 = new Date('2026-05-15T00:00:00.000Z');
  
  // Calculate today in UTC
  const now = new Date();
  const jakartaOffset = 7 * 60 * 60 * 1000;
  const jakartaTime = new Date(now.getTime() + jakartaOffset);
  const todayDateUTC = new Date(Date.UTC(
      jakartaTime.getUTCFullYear(),
      jakartaTime.getUTCMonth(),
      jakartaTime.getUTCDate(),
      0, 0, 0, 0
  ));

  console.log("Preserving May 15:", may15);
  console.log("Preserving Today onwards:", todayDateUTC);

  // We want to delete bookings before today, EXCEPT May 15.
  const deletedBookings = await prisma.booking.deleteMany({
    where: {
      AND: [
        { bookingDate: { lt: todayDateUTC } },
        { bookingDate: { not: may15 } }
      ]
    }
  });
  console.log("Deleted testing bookings:", deletedBookings.count);

  const deletedCashflows = await prisma.cashflow.deleteMany({
    where: {
      AND: [
        { date: { lt: todayDateUTC } },
        { date: { not: may15 } }
      ]
    }
  });
  console.log("Deleted testing cashflows:", deletedCashflows.count);

  const deletedRecords = await prisma.medicalRecord.deleteMany({
    where: {
      AND: [
        { createdAt: { lt: todayDateUTC } },
        // Medical records don't have a "date" field in the same way, but let's assume they were created on those test days.
        // Wait, some medical records might have been created ON May 15. We don't want to delete those.
        // Actually, if we delete bookings, cascade might not delete medical records.
        // Let's just delete records where createdAt < today and > May 15 23:59:59 or < May 15 00:00:00
        {
          OR: [
            { createdAt: { lt: may15 } },
            { createdAt: { gte: new Date('2026-05-16T00:00:00.000Z'), lt: todayDateUTC } }
          ]
        }
      ]
    }
  });
  console.log("Deleted testing medical records:", deletedRecords.count);

}

main().catch(console.error);
