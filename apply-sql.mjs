import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting raw SQL execution...");
  
  try {
    console.log("Altering table users...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailChangeCount" INTEGER NOT NULL DEFAULT 0;`);
    console.log("Altered users successfully.");
  } catch (e) {
    console.error("Error altering users:", e.message);
  }

  try {
    console.log("Creating cashflows table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "cashflows" (
          "id" TEXT PRIMARY KEY,
          "type" TEXT NOT NULL,
          "amount" INTEGER NOT NULL,
          "description" TEXT NOT NULL,
          "date" DATE NOT NULL,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    console.log("Created cashflows table successfully.");
  } catch (e) {
    console.error("Error creating cashflows:", e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "cashflows_date_idx" ON "cashflows" ("date");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "cashflows_type_idx" ON "cashflows" ("type");`);
    console.log("Created indexes successfully.");
  } catch (e) {
    console.error("Error creating indexes:", e.message);
  }

  console.log("Finished all migrations.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
