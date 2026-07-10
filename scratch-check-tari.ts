import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cashflows = await prisma.cashflow.findMany({
    where: { description: { contains: 'Tari', mode: 'insensitive' } }
  });
  console.log("Cashflows for Tari:", cashflows);
}

main().catch(console.error).finally(() => prisma.$disconnect());
