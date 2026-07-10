// Script untuk membuat user langsung ke database (bypass register form)
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

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("⏳ Menghubungkan ke database...");
    
    const email = "admin@eyecheck.com";
    // Better Auth menggunakan hash, tapi kita coba buat user dasar dulu
    // Password 'admin12345' — Better Auth biasanya butuh hash di tabel account
    
    console.log(`⏳ Mengecek user ${email}...`);
    const existing = await prisma.user.findUnique({ where: { email } });
    
    if (existing) {
      console.log("✅ User sudah ada. Menghapus untuk reset...");
      await prisma.user.delete({ where: { email } });
    }

    console.log("⏳ Membuat user baru...");
    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: "Admin Utama",
        role: "admin",
        emailVerified: true,
      }
    });

    console.log("✅ User berhasil dibuat!");
    console.log("💡 Silakan coba LOGIN kembali di website dengan email tersebut.");
    console.log("   Jika masih 'Password Salah', silakan daftar (Register) ulang di web");
    console.log("   dengan email tersebut, karena sekarang koneksi database sudah normal.");

  } catch (err) {
    console.error("❌ GAGAL:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
