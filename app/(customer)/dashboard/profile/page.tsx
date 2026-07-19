import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getProfileAction } from "@/actions/profile-actions";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profil Saya | Optik Khayra",
  description: "Kelola informasi profil dan data pribadi Anda di Optik Khayra.",
};

export default async function CustomerProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const profileResult = await getProfileAction();

  if (!profileResult.success || !profileResult.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Gagal memuat data profil. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit -ml-2 text-muted-foreground hover:text-primary transition-colors")}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali ke Dashboard
        </Link>
        <div className="flex items-end justify-between">
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">Profil Anda</h1>
                <p className="text-muted-foreground mt-1">Sesuaikan informasi diri Anda agar proses booking lebih cepat.</p>
            </div>
            <div className="hidden md:block">
                <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">Terakhir Diperbarui</p>
                    <p className="text-sm font-bold text-primary/80 leading-none">
                        {new Date(profileResult.user.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                    </p>
                </div>
            </div>
        </div>
      </div>

      <ProfileForm initialData={profileResult.user} />
      
      <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/30 transition-all duration-1000" />
          <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-bold italic tracking-wide">"Kesehatan mata adalah investasi masa depan."</h3>
              <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                  Data Anda tersimpan dengan aman di sistem kami. Kami menggunakan informasi ini hanya untuk mempermudah proses pendaftaran dan rekam medis di Optik Khayra.
              </p>
              <div className="pt-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <span className="text-primary font-black text-xl">OK</span>
                  </div>
                  <div>
                      <p className="font-bold text-sm">Tim Layanan Pelanggan</p>
                      <p className="text-xs text-gray-500">Optik Khayra Indonesia</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
