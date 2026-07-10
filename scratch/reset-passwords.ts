import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

async function main() {
  const adminEmails = ["najmal@gmail.com", "midel@gmail.com"];
  const passwords = {
    "najmal@gmail.com": "Najmal123",
    "midel@gmail.com": "Midel123"
  };

  for (const email of adminEmails) {
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      console.log(`User ${email} not found!`);
      continue;
    }

    // Ensure role is admin
    if (user.role !== "admin") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "admin" }
      });
      console.log(`Updated role to admin for ${email}`);
    }

    const newPassword = passwords[email as keyof typeof passwords];
    console.log(`Setting password for ${email} to ${newPassword}...`);
    try {
      const mockHeaders = new Headers();
      await auth.api.setPassword({
        headers: mockHeaders,
        body: {
          userId: user.id,
          newPassword: newPassword,
        }
      });
      console.log(`Successfully reset password for ${email}`);
    } catch (error) {
      console.error(`Failed to set password for ${email}:`, error);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
