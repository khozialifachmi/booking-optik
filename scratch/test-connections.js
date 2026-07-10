const { PrismaClient } = require("@prisma/client");

const projectRef = "szdqkrgjguhfmaynooba";
const password = "OptikKhayra2026";

const configs = [
  {
    label: "AWS-0 Transaction Pooler (port 6543) with pgBouncer",
    connectionString: `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`,
  },
  {
    label: "AWS-0 Session Pooler (port 5432)",
    connectionString: `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`,
  },
  {
    label: "AWS-1 Transaction Pooler (port 6543) with pgBouncer",
    connectionString: `postgresql://postgres.${projectRef}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`,
  },
  {
    label: "AWS-1 Session Pooler (port 5432)",
    connectionString: `postgresql://postgres.${projectRef}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`,
  }
];

async function testConnection(label, connectionString) {
  console.log(`\nTesting: ${label}...`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString
      }
    }
  });
  
  try {
    const res = await prisma.$queryRawUnsafe("SELECT NOW() as time");
    console.log(`✅ SUCCESS! Time:`, res[0].time);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.log(`❌ FAILED:`, err);
    try { await prisma.$disconnect(); } catch {}
    return false;
  }
}

async function main() {
  for (const cfg of configs) {
    await testConnection(cfg.label, cfg.connectionString);
  }
}

main();
