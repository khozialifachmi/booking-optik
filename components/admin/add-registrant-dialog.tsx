"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import Swal from "sweetalert2";
import { createBookingAction } from "@/actions/booking-actions";

export function AddRegistrantDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const namaLengkap = formData.get("namaLengkap") as string;
    const noHandphone = formData.get("noHandphone") as string;
    const usia = parseInt(formData.get("usia") as string) || 0;
    const jenisKelamin = formData.get("jenisKelamin") as "Laki-laki" | "Perempuan";
    const keluhanMata = formData.get("keluhanMata") as string;
    const riwayatKacamata = (formData.get("riwayatKacamata") as string) || "-";
    const pernahPeriksa = formData.get("pernahPeriksa") as "Sudah" | "Belum";
    const tanggalBooking = formData.get("tanggalBooking") as string;

    // Validation
    if (!namaLengkap || namaLengkap.length < 3) {
      Swal.fire("Gagal", "Nama lengkap minimal 3 karakter.", "error");
      setLoading(false);
      return;
    }
    if (!noHandphone || noHandphone.length < 10 || !/^[0-9]+$/.test(noHandphone)) {
      Swal.fire("Gagal", "Nomor handphone tidak valid (hanya masukkan angka, minimal 10 digit).", "error");
      setLoading(false);
      return;
    }
    if (usia <= 0) {
      Swal.fire("Gagal", "Usia harus lebih dari 0.", "error");
      setLoading(false);
      return;
    }
    if (!keluhanMata || keluhanMata.length < 5) {
      Swal.fire("Gagal", "Deskripsikan keluhan dengan jelas (minimal 5 karakter).", "error");
      setLoading(false);
      return;
    }
    if (!tanggalBooking) {
      Swal.fire("Gagal", "Tanggal booking wajib diisi.", "error");
      setLoading(false);
      return;
    }

    const payload = {
      namaLengkap,
      noHandphone,
      usia,
      jenisKelamin,
      keluhanMata,
      riwayatKacamata,
      pernahPeriksa,
      tanggalBooking,
      jenisLayanan: "Pemeriksaan mata" as const,
      // 1x1 pixel base64 png as dummy payment proof for admin manual registrants
      paymentProof: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    };

    const res = await createBookingAction(payload);
    setLoading(false);

    if (res.success) {
      setOpen(false);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pendaftar baru berhasil ditambahkan.",
        timer: 1500,
        showConfirmButton: false,
      });
      router.refresh();
    } else {
      Swal.fire("Gagal", res.error || "Terjadi kesalahan.", "error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pendaftar Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Tambah Pendaftar Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="namaLengkap">Nama Lengkap</Label>
              <Input id="namaLengkap" name="namaLengkap" placeholder="Budi Santoso" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noHandphone">Nomor HP</Label>
              <Input id="noHandphone" name="noHandphone" placeholder="081234567890" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usia">Usia (Tahun)</Label>
              <Input id="usia" name="usia" type="number" placeholder="25" required min="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
              <Select name="jenisKelamin" defaultValue="Laki-laki" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pernahPeriksa">Pernah Periksa</Label>
              <Select name="pernahPeriksa" defaultValue="Belum" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Belum">Belum Pernah</SelectItem>
                  <SelectItem value="Sudah">Sudah Pernah</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggalBooking">Tanggal Booking</Label>
              <Input
                id="tanggalBooking"
                name="tanggalBooking"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riwayatKacamata">Riwayat Kacamata (Ketik '-' jika tidak ada)</Label>
            <Input id="riwayatKacamata" name="riwayatKacamata" placeholder="minus 1.5, atau '-'" defaultValue="-" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keluhanMata">Keluhan Mata</Label>
            <Textarea
              id="keluhanMata"
              name="keluhanMata"
              placeholder="Jelaskan keluhan mata pelanggan (minimal 5 karakter)..."
              required
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Daftarkan Pelanggan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
