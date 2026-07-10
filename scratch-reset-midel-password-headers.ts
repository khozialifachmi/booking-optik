import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      email: "midel@gmail.com",
    }
  });

  if (!user) {
    console.error("User not found!");
    return;
  }

  console.log("Setting password for midel@gmail.com using setPassword API with headers...");
  try {
    const mockHeaders = new Headers();
    const res = await auth.api.setPassword({
      headers: mockHeaders,
      body: {
        userId: user.id,
        newPassword: "midel123",
      }
    });
    console.log("setPassword API success response:", res);
  } catch (error) {
    console.error("setPassword API failed:", error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
