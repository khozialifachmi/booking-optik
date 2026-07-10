import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  const days = "0";

  const now = new Date();
  const shiftedNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const todayDateUTC = new Date(Date.UTC(
      shiftedNow.getUTCFullYear(),
      shiftedNow.getUTCMonth(),
      shiftedNow.getUTCDate(),
      0, 0, 0, 0
  ));

  let targetDate = new Date(todayDateUTC);

  if (days === "all") {
    targetDate = null;
  } else if (days !== "0") {
    const d = parseInt(days);
    targetDate.setUTCDate(targetDate.getUTCDate() - d);
  } else {
    const countToday = await prisma.booking.count({
      where: { bookingDate: todayDateUTC }
    });
    console.log("countToday:", countToday);
    if (countToday === 0) {
      targetDate = new Date(Date.UTC(2026, 4, 15, 0, 0, 0, 0)); // 15 Mei 2026
    }
  }

  console.log("targetDate:", targetDate);

  const bookings = await prisma.booking.findMany({
    where: targetDate ? (
        days === "0" 
        ? { bookingDate: targetDate } 
        : { bookingDate: { gte: targetDate } } 
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

  console.log("Bookings fetched:", bookings.length);
}

test().catch(console.error).finally(() => prisma.$disconnect());
