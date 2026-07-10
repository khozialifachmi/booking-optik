import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/payment-proof/[id]
// Ambil paymentProof on-demand — hanya saat admin klik link, tidak ikut query halaman
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Hanya admin yang boleh akses
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { paymentProof: true },
    });

    if (!booking?.paymentProof) {
      return NextResponse.json({ error: "Bukti tidak ditemukan" }, { status: 404 });
    }

    // Jika Base64 data URL, kembalikan sebagai HTML redirect/display
    const proof = booking.paymentProof;
    if (proof.startsWith("data:image")) {
      // Konversi Base64 ke binary dan kirim sebagai image
      const [meta, base64] = proof.split(",");
      const mimeMatch = meta.match(/data:([^;]+)/);
      const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const buffer = Buffer.from(base64, "base64");

      return new Response(buffer, {
        headers: {
          "Content-Type": mime,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    // Jika URL biasa, redirect
    return NextResponse.redirect(proof);
  } catch (error: any) {
    console.error("Payment proof error:", error);
    return NextResponse.json({ error: "Gagal mengambil bukti" }, { status: 500 });
  }
}
