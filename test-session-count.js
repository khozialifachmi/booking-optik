const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const sessions = await prisma.session.count();
  console.log("Total users:", users);
  console.log("Total sessions:", sessions);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
