import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

async function main() {
  const admins = [
    {
      email: "najmal@gmail.com",
      name: "najmal",
      password: "Najmal123",
      phone: "0898263868629",
      role: "admin"
    },
    {
      email: "midel@gmail.com",
      name: "Midel Admin",
      password: "Midel123",
      phone: "0897286818419",
      role: "admin"
    }
  ];

  for (const admin of admins) {
    console.log(`Checking if user ${admin.email} exists...`);
    const existingUser = await prisma.user.findFirst({
      where: { email: admin.email }
    });

    if (existingUser) {
      console.log(`Deleting existing user ${admin.email} (ID: ${existingUser.id})...`);
      // Delete user (Prisma should cascade delete sessions/accounts if onDelete: Cascade is set)
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
      console.log(`Deleted user ${admin.email}`);
    }

    console.log(`Recreating user ${admin.email} via signUpEmail API...`);
    try {
      const mockHeaders = new Headers();
      // Better Auth server API signUpEmail
      const res = await auth.api.signUpEmail({
        headers: mockHeaders,
        body: {
          email: admin.email,
          password: admin.password,
          name: admin.name,
          phone: admin.phone,
          role: admin.role,
        } as any
      });
      console.log(`Successfully recreated ${admin.email}:`, res);
    } catch (error) {
      console.error(`Failed to recreate ${admin.email}:`, error);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
