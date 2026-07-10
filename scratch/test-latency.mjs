import { PrismaClient } from "@prisma/client";

const projectRef = "szdqkrgjguhfmaynooba";
const password = "OptikKhayra2026";

const configs = [
  {
    name: "Current Env DATABASE_URL (aws-1 pooler port 6543 with pgbouncer)",
    url: `postgresql://postgres.${projectRef}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&statement_timeout=0&connect_timeout=30&pool_timeout=30`,
  },
  {
    name: "Current Env DIRECT_URL (aws-1 pooler port 5432)",
    url: `postgresql://postgres.${projectRef}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require&statement_timeout=0&connect_timeout=30`,
  },
  {
    name: "Pooler aws-1 port 6543 with pgbouncer & connection_limit=3",
    url: `postgresql://postgres.${projectRef}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=3`,
  },
  {
    name: "Pooler aws-1 port 6543 with pgbouncer & connection_limit=1",
    url: `postgresql://postgres.${projectRef}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1`,
  },
  {
    name: "Pooler aws-1 port 5432 with connection_limit=3",
    url: `postgresql://postgres.${projectRef}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require&connection_limit=3`,
  },
  {
    name: "Pooler aws-1 port 5432 with connection_limit=10",
    url: `postgresql://postgres.${projectRef}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require&connection_limit=10`,
  }
];

async function testConfig(name, url) {
  console.log(`\n----------------------------------------\nTesting: ${name}`);
  const startTime = Date.now();
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

  try {
    const connectStart = Date.now();
    await prisma.$connect();
    const connectEnd = Date.now();
    console.log(`- Connection handshake: ${connectEnd - connectStart}ms`);

    const queryStart = Date.now();
    const res = await prisma.$queryRawUnsafe("SELECT 1 as val");
    const queryEnd = Date.now();
    console.log(`- Query execution: ${queryEnd - queryStart}ms`);
    console.log(`- Success! Total time: ${Date.now() - startTime}ms`);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log(`- FAILED in ${Date.now() - startTime}ms`);
    console.log(`- Error: ${error.message.split("\n")[0]}`);
    try {
      await prisma.$disconnect();
    } catch {}
    return false;
  }
}

async function main() {
  for (const config of configs) {
    await testConfig(config.name, config.url);
  }
}

main();
