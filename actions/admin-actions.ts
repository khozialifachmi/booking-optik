"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateQueueSettingsAction(data: {
    avgServiceDuration: number;
    openTime: string;
    closeTime: string;
    maxBookingsPerDay: number;
}) {
    // Di aplikasi nyata, periksa if user isAdmin di sini.
    try {
        const now = new Date();
        const shiftedNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const todayDateUTC = new Date(Date.UTC(
            shiftedNow.getUTCFullYear(),
            shiftedNow.getUTCMonth(),
            shiftedNow.getUTCDate(),
            0, 0, 0, 0
        ));

        // Cari atau buat setting terbaru
        const currentSetting = await prisma.queueSettings.findFirst({
            orderBy: { effectiveDate: 'desc' }
        });

        if (currentSetting && currentSetting.effectiveDate.getTime() === todayDateUTC.getTime()) {
            // Update pengaturan hari ini
            await prisma.queueSettings.update({
                where: { id: currentSetting.id },
                data: {
                    avgServiceDuration: data.avgServiceDuration,
                    openTime: data.openTime,
                    closeTime: data.closeTime,
                    maxBookingsPerDay: data.maxBookingsPerDay,
                }
            });
        } else {
            // Buat record baru untuk berlaku mulai hari ini
            await prisma.queueSettings.create({
                data: {
                    avgServiceDuration: data.avgServiceDuration,
                    openTime: data.openTime,
                    closeTime: data.closeTime,
                    maxBookingsPerDay: data.maxBookingsPerDay,
                    effectiveDate: todayDateUTC
                }
            });
        }

        revalidatePath("/admin/settings");
        return { success: true };

    } catch (e: any) {
        console.error("Failed to update settings", e);
        return { success: false, error: e.message };
    }
}

export async function updateBookingStatusAction(bookingId: string, newStatus: string) {
    try {
        const validStatuses = ["waiting", "calling", "serving", "completed", "cancelled", "missed"];
        if (!validStatuses.includes(newStatus)) {
            throw new Error("Status tidak valid");
        }

        const data: any = { status: newStatus };
        
        if (newStatus === "serving" || newStatus === "calling") {
            const currentBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
            if (currentBooking) {
                // Selalu perbarui actualServiceTime saat dipanggil atau dilayani untuk reset est realtime
                data.actualServiceTime = new Date();
                
                // Tambahkan pemicu suara jika statusnya adalah 'calling'
                if (newStatus === "calling") {
                    data.callCount = { increment: 1 };
                }
            }
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: data
        });

        revalidatePath("/admin/dashboard");
        revalidatePath("/dashboard");
        revalidatePath("/queue-display");

        return { success: true, data: updatedBooking };
    } catch (error: any) {
        console.error("Update Booking Status Error:", error);
        return { success: false, error: error.message || "Gagal memperbarui status." };
    }
}

export async function callNextQueueAction() {
    try {
        const now = new Date();
        const shiftedNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const targetDateUTC = new Date(Date.UTC(
            shiftedNow.getUTCFullYear(),
            shiftedNow.getUTCMonth(),
            shiftedNow.getUTCDate(),
            0, 0, 0, 0
        ));

        // Cari antrian waiting berikutnya (Urutkan berdasarkan prioritas antrian - FCFS)
        const nextWaiting = await prisma.booking.findFirst({
            where: { bookingDate: targetDateUTC, status: "waiting" },
            orderBy: [
                { sortPriority: 'asc' },
                { createdAt: 'asc' }
            ]
        });

        if (!nextWaiting) {
            return { success: true, message: "Tidak ada antrian menunggu." };
        }

        // Panggil antrian (waiting -> calling) dan tambah callCount
        await prisma.booking.update({
            where: { id: nextWaiting.id },
            data: { 
                status: "calling",
                callCount: { increment: 1 }
            }
        });

        revalidatePath("/admin/dashboard");
        revalidatePath("/dashboard");
        revalidatePath("/queue-display");

        return { success: true, message: `Memanggil antrian A-${nextWaiting.queueNumber}` };
    } catch (error: any) {
        console.error("Call Next Queue Error:", error);
        return { success: false, error: error.message || "Gagal memanggil antrian." };
    }
}

export async function toggleBookingStatusAction(bookingId: string, currentStatus: string) {
    let nextStatus = "calling";
    if (currentStatus === "waiting") nextStatus = "calling";
    if (currentStatus === "calling") nextStatus = "serving";
    if (currentStatus === "serving") nextStatus = "completed";
    
    if (currentStatus === "completed" || currentStatus === "cancelled") return;

    return await updateBookingStatusAction(bookingId, nextStatus);
}

export async function cancelBookingAction(bookingId: string) {
    return await updateBookingStatusAction(bookingId, "cancelled");
}

export async function verifyPaymentAction(bookingId: string) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            throw new Error("Booking tidak ditemukan.");
        }

        if (booking.status !== "unverified") {
            throw new Error("Pendaftaran ini sudah dikonfirmasi sebelumnya.");
        }

        // 1. Hitung nomor antrian murni berdasarkan urutan pendaftaran (Rank of createdAt)
        // Cari semua booking hari tersebut yang TIDAK batal, urutkan berdasarkan pendaftaran
        const allBookingsForDay = await prisma.booking.findMany({
            where: {
                bookingDate: booking.bookingDate,
                status: { not: "cancelled" }
            },
            orderBy: [
                { createdAt: 'asc' },
                { id: 'asc' }
            ],
            select: { id: true }
        });

        // Temukan posisi saya di dalam daftar tersebut (Index + 1)
        const myIndex = allBookingsForDay.findIndex(b => b.id === bookingId);
        const nextQueue = myIndex !== -1 ? myIndex + 1 : allBookingsForDay.length;

        // Ambil nama pelanggan dari notes untuk deskripsi cashflow
        let customerName = "Pelanggan";
        if (booking.notes && booking.notes.startsWith("Nama: ")) {
            customerName = booking.notes.split(" | ")[0].replace("Nama: ", "");
        } else {
            const user = await prisma.user.findUnique({
                where: { id: booking.userId },
                select: { name: true }
            });
            if (user) {
                customerName = user.name;
            }
        }

        // Dapatkan tanggal hari ini dalam format WIB Jakarta untuk pencatatan Cashflow
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Jakarta",
            year: "numeric",
            month: "numeric",
            day: "numeric",
        });
        const parts = formatter.formatToParts(now);
        const y = parseInt(parts.find(p => p.type === "year")!.value, 10);
        const m = parseInt(parts.find(p => p.type === "month")!.value, 10) - 1;
        const d = parseInt(parts.find(p => p.type === "day")!.value, 10);
        const todayJakarta = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));

        // Lakukan pembaruan booking dan pembuatan cashflow dalam satu transaksi atomik
        await prisma.$transaction([
            prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: "waiting",
                    queueNumber: nextQueue,
                    sortPriority: nextQueue
                }
            }),
            prisma.cashflow.create({
                data: {
                    type: "income",
                    amount: 15000,
                    description: `Pendaftaran Pemeriksaan Mata - ${customerName}`,
                    date: todayJakarta,
                    notes: `Otomatis dari verifikasi booking ID: ${bookingId}`
                }
            })
        ]);

        revalidatePath("/admin/dashboard");
        revalidatePath("/dashboard");
        revalidatePath("/booking");
        revalidatePath("/admin/cashflow");

        return { success: true, message: "Pembayaran diverifikasi. Nomor antrian diberikan." };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}



export async function recallBookingAction(queueNumber: number) {
    // Tambah callCount agar memicu suara di sisi pasien
    await prisma.booking.updateMany({
        where: { queueNumber: queueNumber, status: "calling" },
        data: { callCount: { increment: 1 } }
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/queue-display");
    return { success: true, message: `Memanggil ulang antrian A-${queueNumber}` };
}

export async function markAsMissedAction(bookingId: string) {
    try {
        const now = new Date();
        const shiftedNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const targetDateUTC = new Date(Date.UTC(
            shiftedNow.getUTCFullYear(),
            shiftedNow.getUTCMonth(),
            shiftedNow.getUTCDate(),
            0, 0, 0, 0
        ));

        // Cari antrian terakhir yang selesai/sedang dilayani untuk patokan
        const lastServed = await prisma.booking.findFirst({
            where: { bookingDate: targetDateUTC, status: { in: ["serving", "completed"] } },
            orderBy: { queueNumber: 'desc' }
        });

        const currentQueueMarker = lastServed ? lastServed.queueNumber : 0;

        // Cari 5 antrian waiting berikutnya (yang punya prioritas lebih tinggi dari sekarang)
        const currentWaiting = await prisma.booking.findMany({
            where: { 
                bookingDate: targetDateUTC, 
                status: "waiting",
                id: { not: bookingId }
            },
            orderBy: { sortPriority: 'asc' },
            take: 5
        });

        let newPriority: number;
        if (currentWaiting.length >= 5) {
            // Jika ada 5 orang atau lebih, taruh di belakang orang ke-5
            const person5 = currentWaiting[4];
            newPriority = (person5.sortPriority || 0) + 0.1;
        } else if (currentWaiting.length > 0) {
            // Jika kurang dari 5 orang, taruh di paling akhir
            const lastPerson = currentWaiting[currentWaiting.length - 1];
            newPriority = (lastPerson.sortPriority || 0) + 0.1;
        } else {
            // Jika tidak ada antrian sama sekali
            newPriority = (lastServed?.sortPriority || 0) + 1;
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: { 
                status: "missed",
                sortPriority: newPriority,
                skippedAtQueue: currentQueueMarker
            }
        });

        revalidatePath("/admin/dashboard");
        return { success: true, message: "Antrian ditandai terlewat." };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function recallFromMissedAction(bookingId: string) {
    try {
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) throw new Error("Antrian tidak ditemukan.");

        // Langsung panggil (missed -> calling) dan tambah callCount agar bunyi
        await prisma.booking.update({
            where: { id: bookingId },
            data: { 
                status: "calling",
                callCount: { increment: 1 }
            }
        });

        revalidatePath("/admin/dashboard");
        revalidatePath("/queue-display");
        return { success: true, message: `Memanggil kembali antrian A-${booking.queueNumber}` };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateEstimatedTimeAction(bookingId: string, newTime: string) {
    try {
        console.log(`Updating booking ${bookingId} to time ${newTime}`);
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) throw new Error("Antrian tidak ditemukan.");

        // Pastikan parsing waktu benar (HH:mm)
        const [hours, minutes] = newTime.split(":").map(Number);
        
        // Gunakan bookingDate asli agar tidak berpindah hari
        const updatedTime = new Date(booking.bookingDate);
        updatedTime.setHours(hours, minutes, 0, 0);

        // 1. Update waktu booking yang dipilih
        await prisma.booking.update({
            where: { id: bookingId },
            data: { estimatedServiceTime: updatedTime }
        });

        // 2. Cascade Update: Ambil semua antrian WAITING setelah ini di hari yang sama
        // Urutkan berdasarkan sortPriority agar berurutan
        const settings = await prisma.queueSettings.findFirst({
            where: { effectiveDate: { lte: booking.bookingDate } },
            orderBy: { effectiveDate: 'desc' }
        });
        const avgDuration = settings?.avgServiceDuration || 20;

        const subsequentBookings = await prisma.booking.findMany({
            where: {
                bookingDate: booking.bookingDate,
                status: "waiting",
                sortPriority: { gt: booking.sortPriority || 0 }
            },
            orderBy: { sortPriority: 'asc' }
        });

        // Loop dan update satu per satu secara berurutan
        let currentRefTime = new Date(updatedTime);
        for (const sub of subsequentBookings) {
            currentRefTime = new Date(currentRefTime.getTime() + avgDuration * 60000);
            await prisma.booking.update({
                where: { id: sub.id },
                data: { estimatedServiceTime: currentRefTime }
            });
        }

        // Revalidasi semua halaman terkait agar perubahan langsung muncul
        revalidatePath("/admin/dashboard");
        revalidatePath("/dashboard");
        revalidatePath("/queue-display");
        
        return { success: true };
    } catch (error: any) {
        console.error("Error updating estimated time:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteBookingAction(bookingId: string) {
    try {
        await prisma.booking.delete({
            where: { id: bookingId }
        });
        revalidatePath("/admin/bookings");
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/fcfs");
        revalidatePath("/admin/customers");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCustomerAction(name: string, phone: string) {
    try {
        // Cari semua booking yang memiliki notes dengan nama dan nomor HP tersebut
        const bookings = await prisma.booking.findMany({
            select: { id: true, notes: true }
        });

        const targetBookingIds = bookings
            .filter(b => {
                if (!b.notes) return false;
                const hasName = b.notes.includes(`Nama: ${name}`) || b.notes.includes(`Nama:  ${name}`);
                const hasPhone = b.notes.includes(`HP: ${phone}`) || b.notes.includes(`HP:  ${phone}`);
                return hasName && hasPhone;
            })
            .map(b => b.id);

        if (targetBookingIds.length > 0) {
            await prisma.booking.deleteMany({
                where: {
                    id: { in: targetBookingIds }
                }
            });
        }

        revalidatePath("/admin/customers");
        revalidatePath("/admin/bookings");
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/fcfs");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAccountAction(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        
        revalidatePath("/admin/accounts");
        revalidatePath("/admin/customers");
        revalidatePath("/admin/bookings");
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/fcfs");
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
