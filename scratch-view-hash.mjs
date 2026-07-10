import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.account.findMany({
    take: 5,
  });
  accounts.forEach(a => {
    console.log(`Account ID: ${a.id}, Provider: ${a.providerId}, Hash: ${a.password}`);
  });
}

main().finally(() => prisma.$disconnect());
