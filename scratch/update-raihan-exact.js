const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres.szdqkrgjguhfmaynooba:OptikKhayra2026@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
});

async function main() {
  const raihan = await prisma.user.findFirst({
    where: { name: { contains: 'raihan', mode: 'insensitive' } },
    include: { bookings: true }
  });
  
  if (!raihan) {
    console.log("Raihan not found!");
    return;
  }
  
  const targetDateStr = "2026-05-15T02:00:00.000Z"; // 09:00 WIB
  const targetDate = new Date(targetDateStr);
  const midnightDate = new Date("2026-05-15T00:00:00.000Z");
  
  // Update the user's phone in profile (just in case)
  await prisma.userProfile.updateMany({
    where: { userId: raihan.id },
    data: { phone: "089537931336" }
  });
  
  const notesString = "HP: 089537931336 | Usia: 29 | Kelamin: Laki-laki | Keluhan: Minus 3 | Kacamata: Tidak";
  
  // Update his booking
  if (raihan.bookings.length > 0) {
    const booking = raihan.bookings[0];
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        bookingDate: midnightDate,
        queueNumber: 1,
        estimatedServiceTime: targetDate,
        createdAt: targetDate,
        updatedAt: targetDate,
        actualServiceTime: targetDate,
        status: "completed",
        notes: notesString
      }
    });
    console.log("Updated Raihan's booking.");
  } else {
    await prisma.booking.create({
      data: {
        userId: raihan.id,
        bookingDate: midnightDate,
        queueNumber: 1,
        serviceType: "Pemeriksaan Mata",
        estimatedServiceTime: targetDate,
        createdAt: targetDate,
        updatedAt: targetDate,
        actualServiceTime: targetDate,
        status: "completed",
        notes: notesString
      }
    });
    console.log("Created Raihan's booking.");
  }
  
  console.log("Done updating Raihan.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
