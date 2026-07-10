const { Client } = require("pg");

const projectRef = "szdqkrgjguhfmaynooba";
const password = "OptikKhayra2026";

const configs = [
  {
    label: "IPv4 Transaction Pooler (AWS ap-southeast-1) port 6543",
    connectionString: `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`,
  },
  {
    label: "IPv4 Session Pooler (AWS ap-southeast-1) port 5432",
    connectionString: `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`,
  },
  {
    label: "IPv6 Direct db endpoint port 6543",
    connectionString: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:6543/postgres?sslmode=require`,
  },
  {
    label: "IPv6 Direct db endpoint port 5432",
    connectionString: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`,
  }
];

async function testConnection(label, connectionString) {
  process.stdout.write(`\nTesting ${label}... `);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    const res = await client.query("SELECT NOW() as time");
    console.log(`✅ BERHASIL!`);
    console.log(`URL: ${connectionString}`);
    await client.end();
    return connectionString;
  } catch (err) {
    console.log(`❌ GAGAL: ${err.message.split("\n")[0]}`);
    try { await client.end(); } catch {}
    return null;
  }
}

async function main() {
  for (const cfg of configs) {
    await testConnection(cfg.label, cfg.connectionString);
  }
}

main();
