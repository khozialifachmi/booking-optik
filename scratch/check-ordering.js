const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres.szdqkrgjguhfmaynooba:OptikKhayra2026@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
});

async function main() {
  const others = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'asc' },
    include: { user: true }
  });
  console.log("Others:", others.map(o => ({
    name: o.user.name, 
    createdAt: o.createdAt, 
    estimated: o.estimatedServiceTime,
    q: o.queueNumber
  })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
