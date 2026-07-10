const { prisma } = require("../lib/prisma");

async function main() {
  const email = "najmal@gmail.com";
  console.log(`Checking if user ${email} exists...`);
  
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    console.error(`User ${email} not found!`);
    return;
  }
  
  console.log(`Current user details:`, user);
  
  console.log(`Updating role to admin for ${email}...`);
  const updated = await prisma.user.update({
    where: { email },
    data: { role: "admin" }
  });
  
  console.log(`Successfully updated user:`, updated);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
