const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log("Testing with DATABASE_URL:", process.env.DATABASE_URL);
  console.log("Testing with DIRECT_URL:", process.env.DIRECT_URL);
  
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected;`;
    console.log("Connection successful!", result);
  } catch (error) {
    console.error("Connection failed!", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
