const { PrismaClient } = require("@prisma/client");

const projectRef = "szdqkrgjguhfmaynooba";
const password = "OptikKhayra2026";

const configs = [
  {
    label: "IPv4 Transaction Pooler (AWS ap-southeast-1) port 6543",
    connectionString: `postgresql://postgres:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`,
  },
  {
    label: "IPv4 Session Pooler (AWS ap-southeast-1) port 5432",
    connectionString: `postgresql://postgres:${password}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`,
  },
  {
    label: "IPv6 Direct db endpoint port 6543",
    connectionString: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:6543/postgres?pgbouncer=true&sslmode=require`,
  },
  {
    label: "IPv6 Direct db endpoint port 5432",
    connectionString: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`,
  }
];

async function testConnection(label, connectionString) {
  process.stdout.write(`\nTesting ${label}... `);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString
      }
    }
  });
  
  try {
    const res = await prisma.$queryRawUnsafe("SELECT NOW() as time");
    console.log(`✅ BERHASIL!`);
    console.log(`URL: ${connectionString}`);
    await prisma.$disconnect();
    return connectionString;
  } catch (err) {
    console.log(`❌ GAGAL:`, err);
    try { await prisma.$disconnect(); } catch {}
    return null;
  }
}

async function main() {
  let success = null;
  for (const cfg of configs) {
    success = await testConnection(cfg.label, cfg.connectionString);
    if (success) break;
  }
  if (!success) {
    console.log("\nALL CONNECTIONS FAILED. Network might be completely down.");
  }
}

main();
