"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, ChevronLeft, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { checkEmailExistsAction, directResetPasswordAction } from "@/actions/reset-password-actions";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const result = await checkEmailExistsAction(email);
      if (result.success) {
        setStep(2);
      } else {
        Swal.fire({
          title: "Email Tidak Ditemukan",
          text: "Pastikan email yang Anda masukkan sudah benar dan terdaftar.",
          icon: "warning",
          confirmButtonColor: "#f59e0b"
        });
      }
    } catch (err) {
        Swal.fire("Error", "Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire("Error", "Konfirmasi password tidak cocok!", "error");
      return;
    }
    if (newPassword.length < 8) {
      Swal.fire("Error", "Password minimal 8 karakter!", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await directResetPasswordAction(email, newPassword);
      if (result.success) {
        await Swal.fire({
          title: "Password Berhasil Diganti!",
          text: "Silakan gunakan password baru Anda untuk login.",
          icon: "success",
          confirmButtonColor: "#10b981"
        });
        router.push("/login");
      } else {
        throw new Error(result.error || "Gagal mengganti password");
      }
    } catch (err: any) {
      Swal.fire("Gagal", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh flex items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="h-2 bg-primary w-full" />
        
        <CardHeader className="space-y-1 pt-8">
          <Link href="/login" className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors mb-4 w-fit">
            <ChevronLeft className="h-3 w-3 mr-1" /> Kembali ke Login
          </Link>
          <CardTitle className="text-2xl font-black tracking-tight text-gray-900">
            {step === 1 ? "Lupa Password?" : "Atur Password Baru"}
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? "Masukkan email Anda untuk memulihkan akses akun." 
              : `Email ditemukan! Silakan masukkan password baru untuk ${email}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {step === 1 ? (
            <form onSubmit={handleCheckEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4 text-primary/60" /> Alamat Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/50 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all h-11"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all h-11"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Lanjutkan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="space-y-2">
                <Label htmlFor="newPass" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <KeyRound className="h-4 w-4 text-primary/60" /> Password Baru
                </Label>
                <div className="relative">
                  <Input
                    id="newPass"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white/50 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPass" className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <Lock className="h-4 w-4 text-primary/60" /> Konfirmasi Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPass"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/50 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 transition-all h-11"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Simpan Password Baru"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="bg-gray-50/50 border-t border-gray-100 py-6">
          <p className="text-center text-xs text-muted-foreground w-full">
            Fitur pemulihan akun instan Optik Khayra
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
