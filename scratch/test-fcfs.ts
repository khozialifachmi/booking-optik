import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany({
    where: { bookingDate: new Date('2026-05-15T00:00:00.000Z') },
    orderBy: { queueNumber: 'asc' }
  });

  let totalWaiting = 0;
  let totalService = 0;
  let totalTurnaround = 0;
  let count = 0;

  for (const b of bookings) {
    if (b.estimatedServiceTime && b.actualServiceTime && b.updatedAt) {
      const wait = Math.max(0, Math.round((b.actualServiceTime.getTime() - b.estimatedServiceTime.getTime()) / 60000));
      const service = Math.max(0, Math.round((b.updatedAt.getTime() - b.actualServiceTime.getTime()) / 60000));
      const turnaround = Math.max(0, Math.round((b.updatedAt.getTime() - b.estimatedServiceTime.getTime()) / 60000));
      
      totalWaiting += wait;
      totalService += service;
      totalTurnaround += turnaround;
      count++;
    }
  }

  console.log("Count:", count);
  console.log("Avg Waiting:", (totalWaiting / count).toFixed(1));
  console.log("Avg Service:", (totalService / count).toFixed(1));
  console.log("Avg Turnaround:", (totalTurnaround / count).toFixed(1));
}

main().catch(console.error);
