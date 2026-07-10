import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";

async function main() {
  console.log("Updating midel@gmail.com role to admin...");
  const user = await prisma.user.update({
    where: {
      email: "midel@gmail.com",
    },
    data: {
      role: "admin",
    },
  });
  console.log("Successfully updated role to admin:", user);

  console.log("Setting password for midel@gmail.com using setPassword API...");
  try {
    // Better Auth setPassword server-side API call
    // Let's call setPassword using the body format
    const res = await auth.api.setPassword({
      body: {
        userId: user.id,
        newPassword: "midel123",
      }
    });
    console.log("setPassword API success response:", res);
  } catch (error) {
    console.error("setPassword API failed:", error);
    console.log("Let's try a different approach if failed.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
