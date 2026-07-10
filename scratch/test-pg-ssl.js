const { Client } = require("pg");

const configs = [
  {
    label: "AWS-0 Transaction Pooler (port 6543)",
    connectionString: `postgresql://postgres.szdqkrgjguhfmaynooba:OptikKhayra2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  },
  {
    label: "AWS-0 Session Pooler (port 5432)",
    connectionString: `postgresql://postgres.szdqkrgjguhfmaynooba:OptikKhayra2026@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  },
  {
    label: "AWS-1 Transaction Pooler (port 6543)",
    connectionString: `postgresql://postgres.szdqkrgjguhfmaynooba:OptikKhayra2026@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  },
  {
    label: "AWS-1 Session Pooler (port 5432)",
    connectionString: `postgresql://postgres.szdqkrgjguhfmaynooba:OptikKhayra2026@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`,
  }
];

async function testConnection(label, connectionString) {
  console.log(`\nTesting ${label}... `);
  const client = new Client({
    connectionString,
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
  for (const cfg of configs) {
    await testConnection(cfg.label, cfg.connectionString);
  }
}

main();
