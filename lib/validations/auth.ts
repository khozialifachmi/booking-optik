import { z } from "zod";

// ============================================
// Login Schema
// ============================================
export const loginSchema = z.object({
  email: z
    .string()
    .email("Masukkan email yang valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ============================================
// Register Schema
// ============================================
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(50, "Nama maksimal 50 karakter"),
  email: z
    .string()
    .email("Masukkan email yang valid"),
  phone: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^(08|\+628)\d+$/, "Format nomor telepon Indonesia (08xx / +628xx)"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
  confirmPassword: z
    .string()
    .min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
