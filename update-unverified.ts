import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.booking.updateMany({
    where: {
      status: 'unverified'
    },
    data: {
      status: 'waiting'
    }
  });
  console.log(`Updated ${updated.count} bookings from unverified to waiting.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
