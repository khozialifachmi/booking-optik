const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const now = new Date();
    const shiftedNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const targetDate = new Date(Date.UTC(
        shiftedNow.getUTCFullYear(),
        shiftedNow.getUTCMonth(),
        shiftedNow.getUTCDate(),
        0, 0, 0, 0
    ));

    console.log("Querying with targetDate:", targetDate);

    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: targetDate
      },
      orderBy: [
        { sortPriority: 'asc' },
        { createdAt: 'asc' }
      ],
      take: 100
    });
    console.log("Found bookings:", bookings.length);
  } catch (err) {
    console.error("Dashboard database fetch error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
