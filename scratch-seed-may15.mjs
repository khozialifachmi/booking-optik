import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const rawData = [
  { no: 1, name: "Raihan", result: "Minus 3", arrival: "09:00", start: "09:00", completion: "09:20" },
  { no: 2, name: "Oktaviana Silitonga", result: "Minus 2", arrival: "09:05", start: "09:20", completion: "09:40" },
  { no: 3, name: "Candra Widiati", result: "Minus 1", arrival: "09:12", start: "09:40", completion: "10:00" },
  { no: 4, name: "Putri Nur Arfianti", result: "Minus 2,5", arrival: "09:20", start: "10:00", completion: "10:20" },
  { no: 5, name: "Yuli Susi Karmila Sari", result: "Minus 2,5", arrival: "09:32", start: "10:20", completion: "10:40" },
  { no: 6, name: "Eli", result: "Minus 2", arrival: "09.50", start: "10.40", completion: "11.00" },
  { no: 7, name: "Susi", result: "Minus 2", arrival: "10.00", start: "11.00", completion: "11.20" },
  { no: 8, name: "Desi Ikarimawati", result: "Minus 3", arrival: "10.07", start: "11.20", completion: "11.40" },
  { no: 9, name: "May Liana Sari", result: "Minus 2", arrival: "10.40", start: "11.40", completion: "12.00" },
  { no: 10, name: "Sudirman", result: "Minus 3,5", arrival: "11.10", start: "12.00", completion: "12.20" },
  { no: 11, name: "Ossa", result: "Minus 0,5", arrival: "11.50", start: "12.20", completion: "12.40" },
  { no: 12, name: "Irwandi", result: "Minus 0,5", arrival: "12.03", start: "12.40", completion: "13.00" },
  { no: 13, name: "Hudorie", result: "Minus 0,5 Plus 1", arrival: "12.48", start: "13.00", completion: "13.20" },
  { no: 14, name: "Lucky", result: "Minus 3 Plus 1,5", arrival: "13.03", start: "13.20", completion: "13.40" },
  { no: 15, name: "Rahma", result: "Plus 1", arrival: "13.15", start: "13.40", completion: "14.00" },
  { no: 16, name: "Ummayah", result: "Plus 1,75", arrival: "13.55", start: "14.00", completion: "14.20" },
  { no: 17, name: "Seri Jubaedah", result: "Minus 0,5 Plus 1,75", arrival: "14.02", start: "14.20", completion: "14.40" },
  { no: 18, name: "Dimas", result: "Minus 0,5", arrival: "14.28", start: "14.40", completion: "15.00" },
  { no: 19, name: "Sabila", result: "Minus 5", arrival: "14.46", start: "15.00", completion: "15.20" },
  { no: 20, name: "Tari", result: "Minus 2", arrival: "15.02", start: "15.20", completion: "15.40" }
];

function cleanTime(timeStr) {
  return timeStr.replace(".", ":").trim();
}

function parseSph(result) {
  let sph = null;
  const lower = result.toLowerCase();
  if (lower.includes("minus")) {
    const match = lower.match(/minus\s*(\d+([,\.]\d+)?)/);
    if (match) {
      const val = parseFloat(match[1].replace(",", "."));
      sph = `-${val.toFixed(2)}`;
    }
  } else if (lower.includes("plus")) {
    const match = lower.match(/plus\s*(\d+([,\.]\d+)?)/);
    if (match) {
      const val = parseFloat(match[1].replace(",", "."));
      sph = `+${val.toFixed(2)}`;
    }
  }
  return sph;
}

// Bcrypt hash untuk "Password123"
const passwordHash = "$2a$10$Wp6Q11r9PZzF2R4m08W7feZJ9q8h5LhV1O.8hN2N5zF9Q.U7J4k.m";

async function main() {
  console.log("Starting seed script for May 15, 2026...");

  const dateBase = "2026-05-15";
  const bookingDate = new Date(`${dateBase}T00:00:00.000Z`);

  // Hapus data booking lama pada tanggal 15 Mei 2026 agar bersih
  const deletedBookings = await prisma.booking.deleteMany({
    where: { bookingDate: bookingDate }
  });
  console.log(`Deleted ${deletedBookings.count} old bookings on ${dateBase}`);

  // Hapus data cashflow lama pada tanggal 15 Mei 2026 agar bersih
  const deletedCashflows = await prisma.cashflow.deleteMany({
    where: { date: bookingDate }
  });
  console.log(`Deleted ${deletedCashflows.count} old cashflow records on ${dateBase}`);

  // Hapus user lama yang emailnya berakhiran @khayra.com agar bersih dari run sebelumnya
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: { endsWith: '@khayra.com' } }
  });
  console.log(`Deleted ${deletedUsers.count} old users from previous runs`);

  for (const row of rawData) {
    const userId = randomUUID();
    const email = `${row.name.toLowerCase().replace(/\s+/g, '')}@khayra.com`;
    const phone = `081234567${row.no.toString().padStart(3, '0')}`;
    const arrivalTime = new Date(`${dateBase}T${cleanTime(row.arrival)}:00+07:00`);
    const startTime = new Date(`${dateBase}T${cleanTime(row.start)}:00+07:00`);
    const completionTime = new Date(`${dateBase}T${cleanTime(row.completion)}:00+07:00`);

    console.log(`Creating user: ${row.name} (${email})...`);

    // 1. Buat User
    await prisma.user.create({
      data: {
        id: userId,
        name: row.name,
        email: email,
        phone: phone,
        role: "customer",
        createdAt: arrivalTime,
        updatedAt: arrivalTime
      }
    });

    // 2. Buat User Profile
    await prisma.userProfile.create({
      data: {
        userId: userId,
        phone: phone,
        role: "customer",
        createdAt: arrivalTime,
        updatedAt: arrivalTime
      }
    });

    // 3. Buat Account (Autentikasi)
    await prisma.account.create({
      data: {
        userId: userId,
        accountId: email,
        providerId: "credential",
        password: passwordHash,
        createdAt: arrivalTime,
        updatedAt: arrivalTime
      }
    });

    // 4. Buat Booking
    const bookingId = randomUUID();
    const sphValue = parseSph(row.result) || "-1.00";
    const notesStr = `Nama: ${row.name} | HP: ${phone} | Usia: 25 | Kelamin: Laki-laki | Keluhan: Hasil periksa: ${row.result} | Kacamata: Tidak`;

    // Buat status completed untuk 18 antrean pertama, 1 serving, 1 waiting agar mensimulasikan antrean berjalan
    let status = "completed";
    let actualStart = startTime;

    if (row.no === 19) {
      status = "serving"; // Sedang dilayani
      actualStart = startTime;
    } else if (row.no === 20) {
      status = "waiting"; // Masih menunggu
      actualStart = null;
    }

    await prisma.booking.create({
      data: {
        id: bookingId,
        userId: userId,
        bookingDate: bookingDate,
        queueNumber: row.no,
        serviceType: "Pemeriksaan Mata",
        status: status,
        estimatedServiceTime: arrivalTime,
        actualServiceTime: actualStart,
        notes: notesStr,
        sortPriority: row.no,
        createdAt: arrivalTime
      }
    });

    // Gunakan raw SQL untuk memperbarui updatedAt ke Completion Time karena Prisma otomatis mengubah updatedAt ke waktu eksekusi
    if (status === "completed") {
      await prisma.$executeRawUnsafe(
        `UPDATE bookings SET "updatedAt" = $1 WHERE id = $2`,
        completionTime,
        bookingId
      );
    } else if (status === "serving") {
      // Set updatedAt ke waktu mulai dilayani
      await prisma.$executeRawUnsafe(
        `UPDATE bookings SET "updatedAt" = $1 WHERE id = $2`,
        startTime,
        bookingId
      );
    }

    // 5. Buat Rekam Medis (Medical Record)
    if (status === "completed") {
      await prisma.medicalRecord.create({
        data: {
          userId: userId,
          bookingId: bookingId,
          rightSph: sphValue,
          leftSph: sphValue,
          notes: `Hasil periksa: ${row.result}`,
          createdAt: completionTime,
          updatedAt: completionTime
        }
      });
    }

    // 6. Buat Cashflow (Keuangan)
    await prisma.cashflow.create({
      data: {
        type: "income",
        amount: 15000,
        description: `Pendaftaran Pemeriksaan Mata - ${row.name}`,
        date: bookingDate,
        notes: `Otomatis dari verifikasi booking ID: ${bookingId}`,
        createdAt: startTime,
        updatedAt: startTime
      }
    });
  }

  console.log("Finished seeding data successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
