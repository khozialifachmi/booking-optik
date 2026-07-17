const { PrismaClient } = require('@prisma/client');

// Use their actual DIRECT_URL to connect directly to the real DB
const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres.szdqkrgjguhfmaynooba:OptikKhayra2026@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
});

async function main() {
  // Check if raihan exists
  const existing = await prisma.user.findFirst({
    where: { name: { contains: 'raihan', mode: 'insensitive' } }
  });
  
  if (existing) {
    console.log("Raihan still exists!", existing);
    return;
  }
  
  console.log("Creating raihan...");
  
  const targetDate = new Date("2026-05-15T08:00:00.000Z"); // May 15, 2026
  
  const user = await prisma.user.create({
    data: {
      name: "Raihan",
      email: "raihan@gmail.com",
      role: "customer",
      createdAt: targetDate,
      updatedAt: targetDate,
      profile: {
        create: {
          phone: "081234567890",
          createdAt: targetDate,
          updatedAt: targetDate
        }
      },
      bookings: {
        create: {
          bookingDate: targetDate,
          serviceType: "Periksa Mata",
          estimatedServiceTime: targetDate,
          status: "completed",
          createdAt: targetDate,
          updatedAt: targetDate
        }
      }
    }
  });
  
  console.log("Created user:", user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
