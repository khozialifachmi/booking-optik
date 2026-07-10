const { Client } = require("pg");

const connectionString = "postgresql://postgres.szdqkrgjguhfmaynooba:OptikKhayra2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require";

async function main() {
  console.log("Connecting with pg...");
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log("Connected!");
    await client.end();
  } catch (err) {
    console.error("PG Connection Error:", err);
  }
}

main();
