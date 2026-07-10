"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { bookingFormSchema, type BookingFormValues } from "@/lib/validations/booking";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createBookingAction(data: BookingFormValues) {
  try {
    const parsedData = bookingFormSchema.parse(data);

    // Cari user yang login
    let userId = "dummy-user-id"; 
    const session = await auth.api.getSession({
         headers: await headers()
    });
    if (session) {
        userId = session.user.id;
    }

    // Mencegah Error Foreign Key P2003 jika menggunakan dummy
    if (userId === "dummy-user-id") {
        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                name: "Test User",
                email: "test@example.com",
                emailVerified: true
            }
        });
    }

    // Konversi string ke Date Object
    const targetDate = new Date(parsedData.tanggalBooking);
    targetDate.setHours(0, 0, 0, 0);

    // Dapatkan konfigurasi antrian hari itu
    let settings = await prisma.queueSettings.findFirst({
        where: { effectiveDate: { lte: targetDate } },
        orderBy: { effectiveDate: 'desc' }
    });

    if (!settings) {
        // Fallback default settings jika belum di set admin
        settings = {
            id: 'fallback',
            avgServiceDuration: 20,
            openTime: "08:00",
            closeTime: "17:00",
            maxBookingsPerDay: 100,
            effectiveDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    // 1. Validasi Tanggal Lampau
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
        throw new Error("Tidak dapat mendaftar untuk tanggal yang sudah lewat.");
    }

    // 2. Validasi Jam Operasional (Hanya jika daftar untuk hari ini)
    if (targetDate.getTime() === today.getTime()) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        const [openH, openM] = (settings.openTime || "08:00").split(":").map(Number);
        const [closeH, closeM] = (settings.closeTime || "17:00").split(":").map(Number);
        
        const closeTimeInMinutes = closeH * 60 + closeM;

        // Hanya blokir jika SUDAH LEWAT jam tutup hari ini
        if (currentTimeInMinutes >= closeTimeInMinutes) {
            throw new Error(`Optik Khayra sudah tutup. Pendaftaran untuk hari ini telah berakhir pukul ${settings.closeTime}. Silakan daftar untuk hari esok.`);
        }
    }

    // 3. Hitung estimasi waktu antrian secara realtime stack dari booking sebelumnya
    // Gunakan jam 12:00 UTC agar aman dari pergeseran hari di zona waktu mana pun
    const targetDateUTC = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 12, 0, 0));

    // Dapatkan waktu Jakarta sekarang
    const nowTime = new Date();
    const jakartaTime = new Date(nowTime.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

    // Ambil durasi rata-rata & jam buka dari settings
    const avgDuration = settings?.avgServiceDuration || 20;
    const [h, m] = (settings?.openTime || "08:00").split(":").map(Number);

    // Cari booking terakhir untuk tanggal ini yang tidak dibatalkan
    const lastBooking = await prisma.booking.findFirst({
        where: {
            bookingDate: targetDateUTC,
            status: { not: "cancelled" }
        },
        orderBy: { estimatedServiceTime: 'desc' }
    });

    const openTime = new Date(targetDateUTC);
    openTime.setHours(h, m, 0, 0);

    let baseTime: Date;
    if (lastBooking) {
        baseTime = new Date(lastBooking.estimatedServiceTime);
    } else {
        baseTime = openTime;
    }

    const isToday = jakartaTime.getFullYear() === targetDate.getFullYear() &&
                    jakartaTime.getMonth() === targetDate.getMonth() &&
                    jakartaTime.getDate() === targetDate.getDate();

    if (isToday) {
        // Jika pendaftaran saat ini melewati estimasi terakhir, gunakan jam pendaftaran saat ini
        if (jakartaTime > baseTime) {
            baseTime = jakartaTime;
        }
    }

    const bookingEstimatedTime = new Date(baseTime.getTime() + avgDuration * 60000);

    // Update nomor telepon user di database jika masih kosong
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true }
    });

    if (existingUser && !existingUser.phone && parsedData.noHandphone) {
        await prisma.user.update({
            where: { id: userId },
            data: { phone: parsedData.noHandphone }
        });

        await prisma.userProfile.upsert({
            where: { userId: userId },
            update: { phone: parsedData.noHandphone },
            create: { userId: userId, phone: parsedData.noHandphone }
        });
    }

    // 4. Simpan ke database dengan status unverified
    const booking = await prisma.booking.create({
        data: {
             userId: userId, 
             bookingDate: targetDateUTC,
             queueNumber: null, 
             serviceType: parsedData.jenisLayanan,
             estimatedServiceTime: bookingEstimatedTime,
             status: "unverified", 
             paymentProof: parsedData.paymentProof, // Base64 image
             notes: `Nama: ${parsedData.namaLengkap} | HP: ${parsedData.noHandphone} | Usia: ${parsedData.usia} | Kelamin: ${parsedData.jenisKelamin} | Keluhan: ${parsedData.keluhanMata} | Kacamata: ${parsedData.riwayatKacamata || "-"}`,
        }
    });

    // Validasi Cache
    revalidatePath("/dashboard");
    revalidatePath("/booking");
    
    return { 
        success: true, 
        data: {
            id: booking.id,
            status: "unverified",
            tanggal: targetDate.toLocaleDateString("id-ID")
        } 
    };

  } catch (error: any) {
    console.error("Booking Error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat memproses pendaftaran." };
  }
}

export async function getDashboardBookingsAction() {
    let userId = "dummy-user-id"; 
    const session = await auth.api.getSession({
         headers: await headers()
    });
    if (session) {
        userId = session.user.id;
    } 

    // Ambil semua booking user TANPA paymentProof agar ringan
    const userBookings = await prisma.booking.findMany({
        where: { userId },
        select: {
            id: true,
            queueNumber: true,
            status: true,
            serviceType: true,
            bookingDate: true,
            estimatedServiceTime: true,
            actualServiceTime: true,
            callCount: true,
            notes: true,
            userResponse: true,
            createdAt: true,
            // paymentProof diabaikan di sini agar cepat
        },
        orderBy: [
            { createdAt: 'desc' },
            { bookingDate: 'desc' }
        ]
    });

    // Pisah daftar per status
    const servingList = userBookings.filter(b => b.status === "serving" || b.status === "calling");
    const waitingList = userBookings.filter(b => b.status === "waiting" || b.status === "missed");
    const unverifiedList = userBookings.filter(b => b.status === "unverified");
    const completedList = userBookings.filter(b => b.status === "completed");

    // Hitung estimasi waktu tunggu sementara (prospective)
    let prospectiveTime: string | null = null;

    const cancelledList = userBookings.filter(b => b.status === "cancelled");
    const activeBooking = servingList[0] || waitingList[0] || unverifiedList[0];
    const latestBooking = userBookings[0];
    const nextBooking = activeBooking || (latestBooking && latestBooking.status === "cancelled" ? latestBooking : null);

    return {
        total: userBookings.length,
        waiting: waitingList.length,
        completed: completedList.length,
        prospectiveTime,
        nextBooking, 
        history: userBookings,
    };
}

export async function cancelBookingAction(bookingId: string) {
    try {
        let userId = "dummy-user-id"; 
        const session = await auth.api.getSession({
             headers: await headers()
        });
        if (session) {
            userId = session.user.id;
        }

        // Check if booking exists and belongs to the user
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            throw new Error("Pendaftaran tidak ditemukan.");
        }

        if (booking.userId !== userId) {
            throw new Error("Anda tidak memiliki izin untuk membatalkan pendaftaran ini.");
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "cancelled" }
        });

        revalidatePath("/dashboard");
        revalidatePath("/booking");

        return { success: true, data: updatedBooking };
    } catch (error: any) {
        console.error("Cancel Booking Error:", error);
        return { success: false, error: error.message || "Gagal membatalkan antrian." };
    }
}

export async function updateUserResponseAction(bookingId: string, response: "present" | "absent") {
    try {
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { userResponse: response }
        });

        revalidatePath("/dashboard");
        revalidatePath("/admin/dashboard");
        
        return { success: true, data: updatedBooking };
    } catch (error: any) {
        console.error("Update User Response Error:", error);
        return { success: false, error: error.message || "Gagal mengirim status kehadiran." };
    }
}

export async function getQueueSettingsAction() {
    try {
        // Ambil pengaturan terbaru dengan query yang sangat ringan
        const settings = await prisma.queueSettings.findFirst({
            orderBy: { effectiveDate: 'desc' },
            select: {
                openTime: true,
                closeTime: true,
                avgServiceDuration: true,
                maxBookingsPerDay: true
            }
        });
        return { success: true, data: settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getBookedTimeSlotsAction(dateStr: string) {
    try {
        const targetDate = new Date(dateStr);
        if (isNaN(targetDate.getTime())) return [];
        
        targetDate.setHours(0, 0, 0, 0);

        // We can add a limit per slot here if needed. 
        // For now, let's keep it open as per user request ("beberapa user dapat memilih jam yg sama")
        // Only return "Full" if a slot has reached e.g. 5 people
        const slotLimit = 5; 
        
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
        
        const bookings = await prisma.booking.groupBy({
            by: ['estimatedServiceTime'],
            where: {
                bookingDate: { gte: startOfDay, lte: endOfDay },
                status: { not: "cancelled" }
            },
            _count: true
        });

        const fullSlots = bookings
            .filter(b => b._count >= slotLimit)
            .map(b => b.estimatedServiceTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        
        return fullSlots;
    } catch (error) {
        console.error("Failed to fetch booked slots:", error);
        return [];
    }
}

export async function getLiveQueueStatusAction() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get settings
        let settings = await prisma.queueSettings.findFirst({
            orderBy: { effectiveDate: 'desc' }
        });
        if (!settings) {
            settings = {
                id: "default",
                avgServiceDuration: 20,
                openTime: "08:00",
                closeTime: "17:00",
                maxBookingsPerDay: 100,
                effectiveDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }

        const now = new Date();
        const shiftedNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const todayDateUTC = new Date(Date.UTC(
            shiftedNow.getUTCFullYear(),
            shiftedNow.getUTCMonth(),
            shiftedNow.getUTCDate(),
            0, 0, 0, 0
        ));

        const targetQueryDate = todayDateUTC;

        // Get bookings for today (Optimized: No heavy paymentProof)
        const todayBookings = await prisma.booking.findMany({
            where: {
                bookingDate: targetQueryDate,
                status: { not: "cancelled" }
            },
            select: {
                id: true,
                queueNumber: true,
                status: true,
                serviceType: true,
                bookingDate: true,
                estimatedServiceTime: true,
                actualServiceTime: true,
                callCount: true,
                notes: true,
                updatedAt: true,
                sortPriority: true,
                user: {
                    select: { name: true }
                }
            },
            orderBy: { sortPriority: 'asc' },
        });

        const serving = todayBookings.find(b => b.status === "serving");
        const calling = todayBookings.find(b => b.status === "calling");
        const waiting = todayBookings.filter(b => b.status === "waiting").sort((a, b) => {
            return (a.sortPriority || 0) - (b.sortPriority || 0);
        });
        const completed = todayBookings
            .filter(b => b.status === "completed")
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()); // Terbaru di atas

        const getName = (b: any) => {
            if (b && b.notes && b.notes.startsWith("Nama: ")) {
                return b.notes.split(" | ")[0].replace("Nama: ", "");
            }
            return b ? (b.user?.name || "Pelanggan") : "-";
        };

        // Hitung estimasi dinamis berdasarkan antrian yang sedang aktif (calling/serving)
        const activeBooking = serving || calling;
        const baseTime = activeBooking?.actualServiceTime || new Date();
        const avgDuration = settings.avgServiceDuration;

        return {
            success: true,
            data: {
                currentServing: serving?.queueNumber ?? 0,
                currentServingName: serving ? getName(serving) : "-",
                currentCalling: calling?.queueNumber ?? 0,
                currentCallingName: calling ? getName(calling) : "-",
                currentName: serving ? getName(serving) : (calling ? getName(calling) : (completed.length > 0 ? "Semua Antrian Selesai" : "Belum Ada Antrian")),
                currentEstimatedTime: serving ? serving.estimatedServiceTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
                totalToday: todayBookings.length,
                waitingCount: waiting.length,
                completedCount: completed.length,
                completed: completed.slice(0, 5).map(b => ({
                    id: b.id,
                    queueNumber: b.queueNumber ?? 0,
                    name: getName(b),
                    estimatedTime: b.estimatedServiceTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                })),
                missed: todayBookings.filter(b => b.status === "missed").map(b => ({
                    queueNumber: b.queueNumber ?? 0,
                    name: getName(b)
                })),
                upcoming: waiting.slice(0, 10).map((b, i) => {
                    const timeStr = b.estimatedServiceTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
                    return {
                        id: b.id,
                        queueNumber: b.queueNumber ?? 0,
                        name: getName(b),
                        estimatedTime: timeStr
                    };
                }),
                settings: {
                    avgServiceDuration: settings.avgServiceDuration,
                    openTime: settings.openTime,
                    closeTime: settings.closeTime
                }
            }
        };
    } catch (error: any) {
        console.error("Get Live Queue Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getProspectiveTimeAction(dateString: string) {
    try {
        const bDate = new Date(dateString);
        const targetDateUTC = new Date(Date.UTC(bDate.getFullYear(), bDate.getMonth(), bDate.getDate(), 12, 0, 0));

        const settings = await prisma.queueSettings.findFirst({
            where: { effectiveDate: { lte: targetDateUTC } },
            orderBy: { effectiveDate: 'desc' }
        });

        const avgDuration = settings?.avgServiceDuration || 20;
        const [h, m] = (settings?.openTime || "08:00").split(":").map(Number);

        const lastBooking = await prisma.booking.findFirst({
            where: {
                bookingDate: targetDateUTC,
                status: { not: "cancelled" }
            },
            orderBy: { estimatedServiceTime: 'desc' }
        });

        const openTime = new Date(targetDateUTC);
        openTime.setHours(h, m, 0, 0);

        let baseTime: Date;
        if (lastBooking) {
            baseTime = new Date(lastBooking.estimatedServiceTime);
        } else {
            baseTime = openTime;
        }

        const now = new Date();
        const jakartaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

        const isToday = jakartaTime.getFullYear() === bDate.getFullYear() &&
                        jakartaTime.getMonth() === bDate.getMonth() &&
                        jakartaTime.getDate() === bDate.getDate();

        if (isToday) {
            if (jakartaTime > baseTime) {
                baseTime = jakartaTime;
            }
        }

        const calcDate = new Date(baseTime.getTime() + avgDuration * 60000);
        const timeString = calcDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
        return { success: true, time: timeString };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


