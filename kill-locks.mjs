import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching active queries...");
  
  try {
    const queries = await prisma.$queryRawUnsafe(`
      SELECT pid, state, query
      FROM pg_stat_activity
      WHERE state = 'active' OR state = 'idle in transaction';
    `);
    
    console.log("Active queries:", queries);

    console.log("Killing locks...");
    const result = await prisma.$executeRawUnsafe(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE pid <> pg_backend_pid()
      AND (state = 'active' OR state = 'idle in transaction');
    `);
    
    console.log("Killed locks:", result);
  } catch (e) {
    console.error("Error killing locks:", e);
  }

  console.log("Finished.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
