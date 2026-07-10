"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Swal from "sweetalert2";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
        Swal.fire("Error", "Token reset tidak ditemukan atau sudah kedaluwarsa.", "error");
        return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token: token,
      });

      if (error) {
          throw new Error(error.message || "Gagal mengatur ulang password");
      }

      await Swal.fire({
          title: "Berhasil!",
          text: "Password Anda telah berhasil diperbarui. Silakan login kembali.",
          icon: "success",
          confirmButtonColor: "#10b981"
      });
      
      router.push("/login");
    } catch (err: any) {
      Swal.fire({
          title: "Gagal",
          text: err.message,
          icon: "error",
          confirmButtonColor: "#ef4444"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
      return (
          <div className="text-center p-8 space-y-4">
              <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
              <h2 className="text-xl font-bold">Link Tidak Valid</h2>
              <p className="text-muted-foreground text-sm">Link reset password Anda sudah kedaluwarsa atau tidak valid. Silakan minta link baru.</p>
              <Button onClick={() => router.push("/forgot-password")}>Minta Link Baru</Button>
          </div>
      );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password Baru</Label>
        <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="pl-10 h-11"
              disabled={loading}
            />
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
        <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="pl-10 h-11"
              disabled={loading}
            />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary h-11"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memperbarui...
          </>
        ) : (
          "Simpan Password Baru"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white overflow-hidden animate-in fade-in duration-500">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="pt-8">
          <CardTitle className="text-2xl font-black">Reset Password</CardTitle>
          <CardDescription>
            Silakan masukkan password baru Anda di bawah ini.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Suspense fallback={<div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
