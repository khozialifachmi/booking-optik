const { auth } = require("../lib/auth");
const { prisma } = require("../lib/prisma");

async function main() {
  const email = "midel@gmail.com";
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
        password: "midel123",
        name: "Midel Admin",
        phone: "0897286818419"
      }
    });
    console.log("Sign up response:", signUpRes);
    
    console.log("Updating role to admin...");
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "admin" }
    });
    console.log("Admin account successfully created and updated:", updatedUser);
  } catch (error) {
    console.error("Failed to register/update admin:", error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
