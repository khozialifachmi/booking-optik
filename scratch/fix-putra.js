const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPutra() {
    try {
        // Find the booking for "putra"
        // In the database, the name might be in `notes` or `user.name`.
        // Let's get the latest bookings to inspect
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

        console.log("Found booking:", targetBooking.id, "current createdAt:", targetBooking.createdAt, "est:", targetBooking.estimatedServiceTime);

        // We want createdAt to be 18:14 WIB -> 11:14 UTC today
        const newCreatedAt = new Date();
        newCreatedAt.setUTCHours(11, 14, 0, 0);

        // We want estimatedServiceTime to be 18:34 WIB -> 11:34 UTC today
        const newEst = new Date();
        newEst.setUTCHours(11, 34, 0, 0);

        await prisma.booking.update({
            where: { id: targetBooking.id },
            data: {
                createdAt: newCreatedAt,
                estimatedServiceTime: newEst
            }
        });

        console.log("Updated successfully to createdAt 18:14 WIB and estimatedServiceTime 18:34 WIB.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

fixPutra();
