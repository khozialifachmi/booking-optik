const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPutra() {
    try {
        const bookings = await prisma.booking.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        let targetBooking = null;
        for (const b of bookings) {
            const name = b.notes && b.notes.includes('Nama: ') ? b.notes.split(' | ')[0].replace('Nama: ', '') : (b.user ? b.user.name : '');
            if (name.toLowerCase().includes('putra')) {
                targetBooking = b;
                break;
            }
        }

        if (!targetBooking) {
            console.log("Booking for putra not found");
            return;
        }

        // We want local time 18:14, so we just set hours in local time.
        // Node.js will automatically convert this to the correct UTC timestamp.
        const newCreatedAt = new Date();
        newCreatedAt.setHours(18, 14, 0, 0);

        const newEst = new Date();
        newEst.setHours(18, 34, 0, 0);

        await prisma.booking.update({
            where: { id: targetBooking.id },
            data: {
                createdAt: newCreatedAt,
                estimatedServiceTime: newEst
            }
        });

        console.log("Updated successfully!");
        console.log("DB RAW createdAt:", newCreatedAt.toISOString());
        console.log("DB RAW est:", newEst.toISOString());
    } finally {
        await prisma.$disconnect();
    }
}
fixPutra();
