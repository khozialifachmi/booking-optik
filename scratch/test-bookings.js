const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const bookings = await prisma.booking.findMany({ 
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { status: true, bookingDate: true, estimatedServiceTime: true, createdAt: true }
  });
  console.log('Recent bookings:', JSON.stringify(bookings, null, 2));
}
run().catch(console.error).finally(()=>prisma.$disconnect());
