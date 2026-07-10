const { auth } = require("../lib/auth");
const { prisma } = require("../lib/prisma");

async function main() {
  const email = "flowtest@gmail.com";
  const password = "flowtestpassword123";
  
  console.log("Cleaning up previous test user...");
  await prisma.user.deleteMany({
    where: { email }
  });
  
  console.log("Step 1: Signing up using auth.api.signUpEmail...");
  try {
    const mockHeaders = new Headers();
    const signUpRes = await auth.api.signUpEmail({
      headers: mockHeaders,
      body: {
        email,
        password,
        name: "Flow Test User",
        phone: "08111222333"
      }
    });
    console.log("Sign up response user id:", signUpRes?.user?.id);
    
    console.log("Step 2: Checking database records...");
    const dbUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }
    });
    console.log("Database user:", {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      accountsCount: dbUser.accounts.length
    });
    if (dbUser.accounts.length > 0) {
      console.log("Account provider:", dbUser.accounts[0].providerId);
      console.log("Account password hash:", dbUser.accounts[0].password);
    }
    
    console.log("Step 3: Trying to sign in using auth.api.signInEmail...");
    const signInRes = await auth.api.signInEmail({
      headers: mockHeaders,
      body: {
        email,
        password
      }
    });
    console.log("Sign in response successfully completed:", signInRes ? "YES" : "NO");
    console.log("Session token:", signInRes?.token);
  } catch (err) {
    console.error("Auth flow failed with error:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
