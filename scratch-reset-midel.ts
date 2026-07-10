import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";

async function main() {
  console.log("Checking midel accounts...");
  const midelUser = await prisma.user.findFirst({
    where: {
      email: "midel@gmail.com",
    },
    include: {
      accounts: true,
    }
  });

  if (!midelUser) {
    console.log("midel@gmail.com not found!");
    return;
  }

  console.log("Found midel user:", midelUser);

  // We want to reset the password. Better Auth has auth.password.hashPassword or similar
  // Let's see if there is an auth.api or auth.password
  console.log("Exposed auth properties:", Object.keys(auth));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
