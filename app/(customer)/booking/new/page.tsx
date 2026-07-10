import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/booking-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getQueueSettingsAction } from "@/actions/booking-actions";

export const metadata: Metadata = {
  title: "Daftar Pemeriksaan — Optik Khayra",
  description: "Buat pendaftaran pemeriksaan mata baru",
};

export default async function NewBookingPage() {
  const [session, settingsRes] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getQueueSettingsAction()
  ]);
  
  if (!session?.user?.id) {
    return redirect("/login");
  }

  const settings = settingsRes.success ? settingsRes.data : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Daftar Pemeriksaan
        </h1>
        <p className="text-muted-foreground">
          Silakan lengkapi data di bawah ini untuk mendapatkan nomor antrian pemeriksaan mata.
        </p>
      </div>

      <BookingForm settings={settings} />
    </div>
  );
}
