const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres.szdqkrgjguhfmaynooba:OptikKhayra2026@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
});

async function main() {
  await prisma.user.updateMany({
    where: { name: { contains: 'raihan', mode: 'insensitive' } },
    data: { phone: "089537931336" }
  });
  console.log("Updated user phone.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
