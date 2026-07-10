"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import { authClient } from "@/lib/auth-client";

interface RegisterFormProps {
  redirectUrl?: string;
  role?: "customer" | "admin";
  hideLoginLink?: boolean;
}

export function RegisterForm({ 
  redirectUrl = "/login", 
  role = "customer",
  hideLoginLink = false
}: RegisterFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        role: role,
    } as any);

    if (result.error) {
        console.error("Full Error Object:", result);
        console.error("Registration Error Details:", result.error);

        Swal.fire({
          icon: "error",
          title: "Gagal Mendaftar",
          text: result.error.message || "Terjadi kesalahan pada server. Pastikan database aktif.",
        });
        return;
    }

    await Swal.fire({
      icon: "success",
      title: "Pendaftaran Berhasil!",
      text: "Akun Anda telah dibuat. Silakan masuk untuk melanjutkan.",
      timer: 3000,
      showConfirmButton: true,
      confirmButtonText: "Ke Halaman Login"
    });

    router.push(redirectUrl);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="register-name">Nama Lengkap</Label>
        <Input
          id="register-name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="register-phone">Nomor Telepon</Label>
        <Input
          id="register-phone"
          type="tel"
          placeholder="08123456789"
          autoComplete="tel"
          {...register("phone")}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 karakter"
            autoComplete="new-password"
            {...register("password")}
            className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="register-confirm">Konfirmasi Password</Label>
        <div className="relative">
          <Input
            id="register-confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="Ulangi password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className={`pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full gap-2"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {isSubmitting ? "Mendaftar..." : "Daftar"}
      </Button>

      {/* Login link */}
      {!hideLoginLink && (
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            href={redirectUrl === "/admin-login" ? "/admin-login" : "/login"}
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Masuk di sini
          </Link>
        </p>
      )}
    </form>
  );
}
