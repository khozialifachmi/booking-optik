// Script Diagnosa Koneksi Otomatis
import { Client } from "pg";

const projectRef = "szdqkrgjguhfmaynooba";
const password = "%40OptikKhayra2026"; // @OptikKhayra2026

const hosts = [
    "aws-0-ap-southeast-1.pooler.supabase.com",
    `db.${projectRef}.supabase.co`
];

const usernames = [
    `postgres.${projectRef}`,
    "postgres",
    projectRef
];

const ports = [6543, 5432];

async function probe() {
    console.log("===== MEMULAI PENCARIAN JALUR DATABASE =====\n");
    
    for (const host of hosts) {
        for (const user of usernames) {
            for (const port of ports) {
                const url = `postgresql://${user}:${password}@${host}:${port}/postgres?sslmode=require`;
                process.stdout.write(`Testing: ${user} @ ${host}:${port} ... `);
                
                const client = new Client({
                    connectionString: url,
                    connectionTimeoutMillis: 5000,
                    ssl: { rejectUnauthorized: false }
                });

                try {
                    await client.connect();
                    console.log("✅ BERHASIL!!!");
                    console.log("\n>>> URL YANG BEKERJA ADALAH:");
                    console.log(url);
                    await client.end();
                    return url;
                } catch (err) {
                    console.log(`❌ (${err.message.split('\n')[0]})`);
                    try { await client.end(); } catch {}
                }
            }
        }
    }
    return null;
}

probe().then(url => {
    if (!url) {
        console.log("\n❌ SEMUA JALUR GAGAL.");
        console.log("Satu-satunya cara adalah copy manual 'Connection String' dari Supabase Dashboard Anda.");
    }
});
