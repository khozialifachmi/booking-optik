// Test koneksi database dan cek semua tabel
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env manual
const envPath = resolve(process.cwd(), ".env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  let val = trimmed.slice(idx + 1).trim().replace(/\r$/, "");
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  process.env[key] = val;
}

console.log("\n===== TEST KONEKSI DATABASE =====");
console.log("DATABASE_URL:", process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ":***@"));
console.log("");

const prisma = new PrismaClient({
  log: ["error"],
});

async function main() {
  try {
    console.log("⏳ Mencoba koneksi ke Supabase...");
    
    // Test 1: raw query
    const result = await prisma.$queryRaw`SELECT NOW() as time, current_database() as db`;
    console.log("✅ Koneksi berhasil!");
    console.log("   DB:", result[0].db, "| Waktu server:", result[0].time);
    
    // Test 2: cek tabel users
    console.log("\n⏳ Cek tabel users...");
    const userCount = await prisma.user.count();
    console.log(`✅ Tabel users OK — ${userCount} user terdaftar`);
    
    // Test 3: cek tabel sessions
    console.log("⏳ Cek tabel sessions...");
    const sessionCount = await prisma.session.count();
    console.log(`✅ Tabel sessions OK — ${sessionCount} session aktif`);
    
    // Test 4: cek tabel accounts
    console.log("⏳ Cek tabel accounts...");
    const accountCount = await prisma.account.count();
    console.log(`✅ Tabel accounts OK — ${accountCount} akun`);
    
    // Test 5: cek tabel bookings
    console.log("⏳ Cek tabel bookings...");
    const bookingCount = await prisma.booking.count();
    console.log(`✅ Tabel bookings OK — ${bookingCount} booking`);

    // Test 6: cek tabel queue_settings
    console.log("⏳ Cek tabel queue_settings...");
    const settingsCount = await prisma.queueSettings.count();
    console.log(`✅ Tabel queue_settings OK — ${settingsCount} record`);
    
    // Test 7: list semua user
    if (userCount > 0) {
      console.log("\n===== DAFTAR USER =====");
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, createdAt: true }
      });
      users.forEach(u => {
        console.log(`  [${u.role}] ${u.name} <${u.email}> — dibuat: ${u.createdAt.toLocaleDateString("id-ID")}`);
      });
    }
    
    console.log("\n✅ SEMUA TEST LULUS — Database sehat!");
    
  } catch (err) {
    console.error("\n❌ KONEKSI GAGAL!");
    console.error("Error:", err.message);
    if (err.code) console.error("Error Code:", err.code);
    if (err.meta) console.error("Meta:", err.meta);
    
    // Bantu diagnosa
    if (err.message?.includes("password authentication failed")) {
      console.error("\n💡 SOLUSI: Password database salah. Cek kembali password di Supabase Dashboard → Settings → Database");
    } else if (err.message?.includes("Tenant or user not found")) {
      console.error("\n💡 SOLUSI: Project Supabase mungkin di-pause. Buka supabase.com/dashboard dan aktifkan kembali.");
    } else if (err.message?.includes("ECONNREFUSED") || err.message?.includes("timeout")) {
      console.error("\n💡 SOLUSI: Port 6543 mungkin diblokir firewall/ISP. Coba gunakan port 5432 atau VPN.");
    } else if (err.message?.includes("does not exist")) {
      console.error("\n💡 SOLUSI: Tabel belum ada. Jalankan: pnpm prisma db push");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
