const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPutra() {
    try {
        const bookings = await prisma.booking.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        for (const b of bookings) {
            const name = b.notes && b.notes.includes('Nama: ') ? b.notes.split(' | ')[0].replace('Nama: ', '') : (b.user ? b.user.name : '');
            if (name.toLowerCase().includes('putra')) {
                console.log("DB RAW createdAt:", b.createdAt.toISOString());
                console.log("DB RAW est:", b.estimatedServiceTime.toISOString());
            }
        }
    } finally {
        await prisma.$disconnect();
    }
}
checkPutra();
