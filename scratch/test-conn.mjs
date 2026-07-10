// Tes berbagai format connection string Supabase
import { Client } from "pg";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env
const envPath = resolve(process.cwd(), ".env");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim().replace(/\r$/, "");
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  let val = trimmed.slice(idx + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  env[key] = val;
}

const projectRef = "szdqkrgjguhfmaynooba";
const password = "@OptikKhayra2026"; // password asli dengan @
const encodedPassword = "%40OptikKhayra2026"; // URL encoded

console.log("===== DIAGNOSA KONEKSI SUPABASE =====\n");

// Format-format yang akan dicoba
const configs = [
  {
    label: "1️⃣  Transaction Pooler (port 6543) — username: postgres.{ref}",
    connectionString: `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`,
  },
  {
    label: "2️⃣  Transaction Pooler (port 6543) — username: postgres",
    connectionString: `postgresql://postgres:${encodedPassword}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`,
  },
  {
    label: "3️⃣  Session Pooler (port 5432) — username: postgres.{ref}",
    connectionString: `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`,
  },
  {
    label: "4️⃣  Direct (port 5432) — username: postgres",
    connectionString: `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`,
  },
  {
    label: "5️⃣  Password tanpa encode (langsung @) — Transaction Pooler",
    connectionString: `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`,
  },
];

async function testConnection(label, connectionString) {
  process.stdout.write(`\n${label}\n   Testing... `);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    await client.connect();
    const res = await client.query("SELECT NOW() as time, current_user as usr");
    console.log(`✅ BERHASIL! user=${res.rows[0].usr}`);
    console.log(`   ✓ URL yang benar: ${connectionString.replace(/:([^:@]+)@/, ":***@")}`);
    await client.end();
    return connectionString;
  } catch (err) {
    console.log(`❌ GAGAL: ${err.message.split("\n")[0]}`);
    try { await client.end(); } catch {}
    return null;
  }
}

let workingUrl = null;
for (const cfg of configs) {
  const result = await testConnection(cfg.label, cfg.connectionString);
  if (result && !workingUrl) {
    workingUrl = result;
    break; // stop at first working one
  }
}

if (workingUrl) {
  console.log("\n\n🎉 KONEKSI BERHASIL!");
  console.log("Gunakan URL ini di .env Anda:");
  console.log("DATABASE_URL=\"" + workingUrl + "&pgbouncer=true\"");
  console.log("DIRECT_URL=\"" + workingUrl + "\"");
} else {
  console.log("\n\n❌ SEMUA FORMAT GAGAL.");
  console.log("\n💡 Kemungkinan penyebab:");
  console.log("   1. Password yang Anda set di Supabase bukan @OptikKhayra2026");
  console.log("   2. Project Supabase sedang di-pause");
  console.log("   3. Firewall/ISP memblokir port 5432 dan 6543");
  console.log("\nSilakan buka Supabase Dashboard dan:");
  console.log("   → Settings → Database → copy connection string langsung dari sana");
}
