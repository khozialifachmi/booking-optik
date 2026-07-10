import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
const prisma = new PrismaClient();

async function main() {
  const dateBase = "2026-05-15";
  const bookingDate = new Date(`${dateBase}T00:00:00.000Z`);
  const startTime = new Date(`${dateBase}T15:20:00+07:00`);

  // We need to find Tari's booking ID
  const tariBooking = await prisma.booking.findFirst({
    where: { 
      bookingDate: bookingDate,
      user: { name: 'Tari' }
    }
  });

  const tariCashflow = await prisma.cashflow.findFirst({
    where: { 
      date: bookingDate,
      description: { contains: 'Tari' }
    }
  });

  if (!tariCashflow) {
    await prisma.cashflow.create({
      data: {
        type: "income",
        amount: 15000,
        description: `Pendaftaran Pemeriksaan Mata - Tari`,
        date: bookingDate,
        notes: `Otomatis dari verifikasi booking ID: ${tariBooking?.id || randomUUID()}`,
        createdAt: startTime,
        updatedAt: startTime
      }
    });
    console.log("Successfully created Tari's cashflow on May 15.");
  } else {
    console.log("Tari's cashflow already exists on May 15.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
