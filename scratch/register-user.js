const { auth } = require("../lib/auth");
const { prisma } = require("../lib/prisma");

async function main() {
  const email = "user@gmail.com";
  console.log(`Checking if user ${email} exists...`);
  
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existingUser) {
    console.log(`User ${email} exists. Deleting user...`);
    await prisma.user.delete({
      where: { email }
    });
    console.log(`Deleted user ${email}.`);
  }
  
  console.log(`Registering user ${email} using auth.api.signUpEmail...`);
  try {
    const mockHeaders = new Headers();
    const signUpRes = await auth.api.signUpEmail({
      headers: mockHeaders,
      body: {
        email: email,
        password: "user1234",
        name: "Test Customer",
        phone: "08123456789"
      }
    });
    console.log("Sign up response:", signUpRes);
  } catch (error) {
    console.error("Failed to register user:", error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
