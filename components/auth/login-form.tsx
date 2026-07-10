"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import Swal from "sweetalert2";
import { authClient } from "@/lib/auth-client";

interface LoginFormProps {
  redirectUrl?: string;
  hideRegisterLink?: boolean;
}

export function LoginForm({ redirectUrl = "/dashboard", hideRegisterLink = false }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
    });

    if (result.error) {
        console.error("Login Error:", result.error);
        Swal.fire({
          icon: "error",
          title: "Gagal Masuk",
          text: result.error.message || "Email atau password salah.",
        });
        return;
    }

    // CEK PERAN (ROLE)
    const userRole = (result.data.user as any).role;
    const isAdminPortal = redirectUrl.includes("/admin");

    if (isAdminPortal && userRole !== "admin") {
        await authClient.signOut(); // Paksa logout karena salah portal
        Swal.fire({
          icon: "error",
          title: "Gagal Masuk",
          text: "Invalid email or password",
          confirmButtonText: "OK",
          confirmButtonColor: "#6366f1"
        });
        return;
    }

    if (!isAdminPortal && userRole === "admin") {
        await authClient.signOut(); // Paksa logout
        Swal.fire({
          icon: "error",
          title: "Gagal Masuk",
          text: "Invalid email or password",
          confirmButtonText: "OK",
          confirmButtonColor: "#6366f1"
        });
        return;
    }

    await Swal.fire({
      icon: "success",
      title: "Berhasil Masuk!",
      text: `Selamat datang kembali, ${result.data.user.name}`,
      timer: 1500,
      showConfirmButton: false,
    });

    router.push(redirectUrl);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
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

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Lupa password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
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
          <LogIn className="h-4 w-4" />
        )}
        {isSubmitting ? "Memproses..." : "Masuk"}
      </Button>

      {/* Register link */}
      {!hideRegisterLink && (
        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Daftar sekarang
          </Link>
        </p>
      )}
    </form>
  );
}
