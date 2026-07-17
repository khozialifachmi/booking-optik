import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.groupBy({
    by: ['bookingDate'],
    _count: { id: true }
  });
  console.log("Bookings by date:", bookings);
}
main().catch(console.error);
