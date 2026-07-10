"use server"

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getProfileAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                profile: true
            }
        });

        return { success: true, user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateProfileAction(formData: {
    name?: string;
    phone?: string;
    address?: string;
    image?: string;
    email?: string;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) return { success: false, error: "User not found" };

        const updateData: any = {
            name: formData.name,
            phone: formData.phone,
            image: formData.image
        };

        // Logika Ganti Email 1x
        if (formData.email && formData.email !== user.email) {
            if (user.emailChangeCount >= 1) {
                return { success: false, error: "Email hanya dapat diganti satu kali." };
            }
            updateData.email = formData.email;
            updateData.emailChangeCount = { increment: 1 };
        }

        // Update User model
        await prisma.user.update({
            where: { id: session.user.id },
            data: updateData
        });

        // Update or Create UserProfile
        if (formData.address || formData.phone) {
            await prisma.userProfile.upsert({
                where: { userId: session.user.id },
                update: {
                    address: formData.address,
                    phone: formData.phone || ""
                },
                create: {
                    userId: session.user.id,
                    address: formData.address || "",
                    phone: formData.phone || ""
                }
            });
        }

        revalidatePath("/dashboard/profile");
        revalidatePath("/admin/profile");
        revalidatePath("/dashboard");

        return { success: true, message: "Profil berhasil diperbarui" };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
