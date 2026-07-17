import { z } from "zod";

export const bookingFormSchema = z.object({
  // Data Pengunjung
  namaLengkap: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
  noHandphone: z.string().min(10, { message: "Nomor handphone tidak valid" }).regex(/^[0-9]+$/, { message: "Hanya masukkan angka" }),
  usia: z.coerce.number().min(1, { message: "Usia harus lebih dari 0" }),
  jenisKelamin: z.enum(["Laki-laki", "Perempuan"] as const, { message: "Pilih jenis kelamin" }),

  // Data Pemeriksaan
  keluhanMata: z.string().min(5, { message: "Deskripsikan keluhan dengan jelas (minimal 5 karakter)" }),
  jenisLayanan: z.enum(["Pemeriksaan mata"] as const, { message: "Pilih jenis layanan" }),
  tanggalBooking: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Tanggal tidak valid" }),
  waktuBooking: z.string().optional(),
  riwayatKacamata: z.string().min(1, { message: "Isi riwayat kacamata (ketik '-' jika tidak ada)" }),
  pernahPeriksa: z.enum(["Sudah", "Belum"] as const, { message: "Pilih status periksa" }),
  paymentProof: z.string().min(1, { message: "Bukti pembayaran wajib diunggah" }),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
