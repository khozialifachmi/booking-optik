const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all users from database...");
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    console.log("All users in database:");
    users.forEach(u => {
      console.log(`Email: ${u.email}, Role: ${u.role}, Name: ${u.name}, Created: ${u.createdAt}`);
    });
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
