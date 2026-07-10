"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Add a new cashflow entry
export async function addCashflowAction(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const type = formData.get("type") as string;
    const amountStr = formData.get("amount") as string;
    const description = formData.get("description") as string;
    const dateStr = formData.get("date") as string;
    const notes = formData.get("notes") as string || null;

    if (!type || !amountStr || !description || !dateStr) {
      return { success: false, error: "Harap isi semua kolom wajib." };
    }

    // Convert and strip non-numeric from amount
    const cleanAmount = parseInt(amountStr.replace(/[^0-9]/g, ""), 10);
    
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return { success: false, error: "Nominal tidak valid." };
    }

    // Gabungkan tanggal yang dipilih dengan jam, menit, dan detik WIB saat ini
    const selectedDate = new Date(dateStr);
    const now = new Date();
    const shiftedNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const currentWIBHours = shiftedNow.getUTCHours();
    const currentWIBMinutes = shiftedNow.getUTCMinutes();
    const currentWIBSeconds = shiftedNow.getUTCSeconds();

    // Konversi jam WIB kembali ke UTC untuk disimpan di database
    const finalDate = new Date(Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      currentWIBHours - 7,
      currentWIBMinutes,
      currentWIBSeconds
    ));

    await prisma.cashflow.create({
      data: {
        type,
        amount: cleanAmount,
        description,
        date: finalDate,
        notes,
      },
    });

    revalidatePath("/admin/cashflow");
    return { success: true };
  } catch (error: any) {
    console.error("Add Cashflow Error:", error);
    return { success: false, error: "Gagal menyimpan data keuangan." };
  }
}

// Delete a cashflow entry
export async function deleteCashflowAction(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.cashflow.delete({
      where: { id },
    });

    revalidatePath("/admin/cashflow");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Cashflow Error:", error);
    return { success: false, error: "Gagal menghapus data keuangan." };
  }
}
