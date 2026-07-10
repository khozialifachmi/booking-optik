const { Client } = require("pg");

const host = "aws-0-ap-southeast-1.pooler.supabase.com";
const user = "postgres.szdqkrgjguhfmaynooba";
const password = "OptikKhayra2026";
const database = "postgres";

async function testConnection(label, port) {
  console.log(`\nTesting ${label} on port ${port}... `);
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    const res = await client.query("SELECT NOW() as time");
    console.log(`✅ BERHASIL! Time:`, res.rows[0].time);
    await client.end();
  } catch (err) {
    console.log(`❌ GAGAL: ${err.message}`);
    try { await client.end(); } catch {}
  }
}

async function main() {
  await testConnection("AWS-0 Transaction Pooler", 6543);
  await testConnection("AWS-0 Session Pooler", 5432);
}

main();
