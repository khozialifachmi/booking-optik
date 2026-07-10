const { auth } = require("../lib/auth");
const { prisma } = require("../lib/prisma");

async function main() {
  const email = "rolesignup@gmail.com";
  const password = "password123";
  
  console.log("Cleaning up previous test user...");
  await prisma.user.deleteMany({
    where: { email }
  });
  
  console.log("Signing up with role 'admin'...");
  try {
    const mockHeaders = new Headers();
    const signUpRes = await auth.api.signUpEmail({
      headers: mockHeaders,
      body: {
        email,
        password,
        name: "Role Sign Up Test",
        phone: "0811223344",
        role: "admin"
      }
    });
    console.log("Sign up response user role:", signUpRes?.user?.role);
    
    const dbUser = await prisma.user.findUnique({
      where: { email }
    });
    console.log("Database user role:", dbUser?.role);
  } catch (err) {
    console.error("Error during signup:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
