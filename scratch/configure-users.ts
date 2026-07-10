import { prisma } from "../lib/prisma";
import { hashPassword } from "better-auth/crypto";

interface UserConfig {
  email: string;
  role: "admin" | "customer";
  password?: string;
  name?: string;
  phone?: string;
}

async function main() {
  const usersToConfigure: UserConfig[] = [
    {
      email: "midel@gmail.com",
      role: "customer",
      password: "Midel123",
      name: "Midel"
    },
    {
      email: "haris@gmail.com",
      role: "admin",
      password: "Haris123",
      name: "Haris Firmansyah"
    },
    {
      email: "nathan@gmail.com",
      role: "admin",
      password: "Nathan123",
      name: "nathan"
    },
    {
      email: "najmal@gmail.com",
      role: "admin",
      password: "Najmal123",
      name: "najmal"
    }
  ];

  for (const config of usersToConfigure) {
    console.log(`\nConfiguring ${config.email}...`);

    let user = await prisma.user.findFirst({
      where: { email: config.email }
    });

    if (!user) {
      console.log(`User ${config.email} not found. Creating user...`);
      user = await prisma.user.create({
        data: {
          email: config.email,
          name: config.name || config.email.split("@")[0],
          role: config.role,
          phone: config.phone || null,
        }
      });
      console.log(`Created user with ID: ${user.id}`);
    } else {
      // Update role and name if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: config.role,
          name: config.name || user.name
        }
      });
      console.log(`Updated user ${config.email} role to: ${config.role}`);
    }

    if (config.password) {
      console.log(`Hashing and setting password for ${config.email}...`);
      const hashedPassword = await hashPassword(config.password);

      // Check if account exists
      const account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: "email"
        }
      });

      if (account) {
        await prisma.account.update({
          where: { id: account.id },
          data: { password: hashedPassword }
        });
        console.log(`Updated existing password account record.`);
      } else {
        await prisma.account.create({
          data: {
            userId: user.id,
            accountId: config.email,
            providerId: "email",
            password: hashedPassword
          }
        });
        console.log(`Created new password account record.`);
      }
    }
  }

  console.log("\nConfiguration finished successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
