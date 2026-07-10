import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk — EyeCheck",
  description: "Masuk ke akun EyeCheck untuk booking pemeriksaan mata.",
};

export default function LoginPage() {
  return (
    <Card className="border-border/50 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Selamat Datang</CardTitle>
        <CardDescription>
          Masuk ke akun Anda untuk melanjutkan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
