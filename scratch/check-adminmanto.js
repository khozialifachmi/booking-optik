const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      name: { contains: 'manto', mode: 'insensitive' }
    }
  });
  console.log("Users found:", users);
  
  const allAdmins = await prisma.user.findMany({
    where: { role: 'admin' }
  });
  console.log("All admins:", allAdmins);
}

main().catch(console.error).finally(() => prisma.$disconnect());
