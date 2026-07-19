import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getProfileAction } from "@/actions/profile-actions";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profil Admin | Optik Khayra",
  description: "Kelola informasi profil administrator Optik Khayra.",
};

export default async function AdminProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const profileResult = await getProfileAction();

  if (!profileResult.success || !profileResult.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Gagal memuat data profil admin. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <Link href="/admin/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit -ml-2 text-muted-foreground hover:text-primary transition-colors")}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali ke Panel Admin
        </Link>
        <div className="flex items-end justify-between">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Administrator Panel</span>
                </div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">Profil Admin</h1>
                <p className="text-muted-foreground">Identitas resmi Anda sebagai pengelola sistem Optik Khayra.</p>
            </div>
            <div className="hidden md:block">
                <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">Status Keamanan</p>
                    <p className="text-sm font-bold text-primary/80 leading-none">Admin Terverifikasi</p>
                </div>
            </div>
        </div>
      </div>

      <ProfileForm initialData={profileResult.user} isAdmin={true} />
      
      <div className="bg-amber-500/10 rounded-3xl p-8 border border-amber-500/20 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400">Catatan Keamanan Admin</h3>
              <p className="text-amber-800/70 dark:text-amber-200/80 text-sm leading-relaxed">
                  Sebagai admin, identitas Anda akan tercatat dalam setiap log sistem (seperti konfirmasi pendaftaran atau perubahan rekam medis). Pastikan data profil Anda sudah sesuai untuk keperluan audit internal.
              </p>
              <ul className="text-xs text-amber-800/60 dark:text-amber-200/70 space-y-1 pt-2">
                  <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Perubahan nama akan memengaruhi tampilan struk konfirmasi.
                  </li>
                  <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Nomor telepon digunakan untuk pemberitahuan darurat sistem.
                  </li>
              </ul>
          </div>
      </div>
    </div>
  );
}
