import { prisma } from "./lib/prisma";
import { auth } from "./lib/auth";

async function main() {
  console.log("Updating Tari's account details...");
  const oldEmail = "tari@khayra.com";
  const newEmail = "tari@gmail.com";
  const newPassword = "Tari1234";

  // Get the hashed password using Better Auth context
  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(newPassword);
  console.log("Generated hash for Tari1234:", hashedPassword);

  // Find user by old email or new email
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: oldEmail },
        { email: newEmail }
      ]
    }
  });

  if (existingUser) {
    console.log(`Found existing user with ID: ${existingUser.id}`);
    
    // Update User email
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        email: newEmail,
        name: "Tari"
      }
    });
    console.log("Updated user email to", newEmail);

    // Upsert Account record
    const account = await prisma.account.findFirst({
      where: { userId: existingUser.id }
    });

    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          accountId: newEmail,
          password: hashedPassword
        }
      });
      console.log("Updated existing account with new email and password");
    } else {
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          accountId: newEmail,
          providerId: "credential",
          password: hashedPassword
        }
      });
      console.log("Created new account linked to the user");
    }
  } else {
    console.log("Tari's user not found. Creating a brand new user...");
    // Create new user using Better Auth API
    const res = await auth.api.signUpEmail({
      body: {
        email: newEmail,
        password: newPassword,
        name: "Tari",
        role: "customer",
        phone: "081234567020"
      }
    });
    console.log("Sign up result:", res);
  }

  console.log("Tari account updated successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
