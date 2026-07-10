import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  
  // 1. Get current date in Jakarta timezone
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
  
  console.log("=== JAKARTA TODAY ===");
  console.log("Local today:", `${year}-${month+1}-${day}`);
  console.log("Target Date (UTC Midnight):", targetDate.toISOString());

  // 2. Fetch bookings for today
  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: targetDate
    },
    select: {
      id: true,
      queueNumber: true,
      status: true,
      serviceType: true,
      bookingDate: true,
      notes: true,
      createdAt: true
    }
  });
  console.log("\n=== BOOKINGS TODAY ===");
  console.log(bookings);

  // 3. Fetch cashflows for today
  const cashflowsToday = await prisma.cashflow.findMany({
    where: {
      date: targetDate
    }
  });
  console.log("\n=== CASHFLOWS TODAY ===");
  console.log(cashflowsToday);

  // 4. Fetch all cashflows
  const allCashflows = await prisma.cashflow.findMany({
    take: 10,
    orderBy: { date: 'desc' }
  });
  console.log("\n=== ALL CASHFLOWS (LATEST 10) ===");
  console.log(allCashflows);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
