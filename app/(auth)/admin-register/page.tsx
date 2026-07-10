import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Admin Register — EyeCheck",
  description: "Daftar sebagai Administrator Optik Khayra.",
};

export default function AdminRegisterPage() {
  return (
    <Card className="border-primary/50 shadow-xl shadow-primary/10">
      <CardHeader className="space-y-1 text-center bg-primary/5 rounded-t-xl pb-6">
        <div className="mx-auto bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center rounded-full mb-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <CardTitle className="text-2xl font-bold">Pendaftaran Admin</CardTitle>
        <CardDescription className="text-primary/80 font-medium">
          Buat akun baru untuk Staff & Administrator
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <RegisterForm redirectUrl="/admin-login" role="admin" hideLoginLink={true} />
        <div className="mt-4 text-center text-sm text-muted-foreground">
           Sudah punya akun admin? <a href="/admin-login" className="text-primary hover:underline font-medium">Masuk di sini</a>
        </div>
      </CardContent>
    </Card>
  );
}
