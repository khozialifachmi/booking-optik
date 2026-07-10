import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.cashflow.findMany({
    where: { date: new Date('2026-05-15T00:00:00.000Z') }
  });
  console.log("May 15 Cashflows count:", all.length);
  console.log(all.map(c => c.description));
}

main().catch(console.error).finally(() => prisma.$disconnect());
