"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveMedicalRecordAction(data: {
  bookingId: string;
  userId: string;
  rightSph: string;
  rightCyl: string;
  rightAxis: string;
  leftSph: string;
  leftCyl: string;
  leftAxis: string;
  notes: string;
}) {
  try {
    const record = await prisma.medicalRecord.upsert({
      where: { bookingId: data.bookingId },
      update: {
        rightSph: data.rightSph,
        rightCyl: data.rightCyl,
        rightAxis: data.rightAxis,
        leftSph: data.leftSph,
        leftCyl: data.leftCyl,
        leftAxis: data.leftAxis,
        notes: data.notes,
      },
      create: {
        bookingId: data.bookingId,
        userId: data.userId,
        rightSph: data.rightSph,
        rightCyl: data.rightCyl,
        rightAxis: data.rightAxis,
        leftSph: data.leftSph,
        leftCyl: data.leftCyl,
        leftAxis: data.leftAxis,
        notes: data.notes,
      },
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    
    return { success: true, data: record };
  } catch (error: any) {
    console.error("Save Medical Record Error:", error);
    return { success: false, error: error.message || "Gagal menyimpan rekam medis." };
  }
}

export async function getUserMedicalRecordsAction(userId: string) {
  try {
    const records = await prisma.medicalRecord.findMany({
      where: { userId },
      select: {
        id: true,
        bookingId: true,
        notes: true,
        createdAt: true,
        booking: {
          select: {
            id: true,
            queueNumber: true,
            serviceType: true,
            bookingDate: true,
            // paymentProof SENGAJA tidak diambil — field Base64 besar, tidak dipakai di UI
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: records };
  } catch (error: any) {
    console.error("Get Medical Records Error:", error);
    return { success: false, error: error.message };
  }
}
