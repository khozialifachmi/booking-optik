"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { deleteAccountAction } from "@/actions/admin-actions";

interface DeleteAccountButtonProps {
  userId: string;
  name: string;
  email: string;
}

export function DeleteAccountButton({ userId, name, email }: DeleteAccountButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const result = await Swal.fire({
      title: "Hapus Akun Pengguna?",
      text: `Apakah Anda yakin ingin menghapus akun "${name}" (${email})? Semua data reservasi, riwayat medis, dan sesi terkait akun ini akan ikut terhapus secara permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setLoading(true);
      const res = await deleteAccountAction(userId);
      setLoading(false);

      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Terhapus",
          text: "Akun pengguna berhasil dihapus beserta seluruh datanya.",
          timer: 2000,
          showConfirmButton: false,
        });
        router.refresh();
      } else {
        Swal.fire("Gagal", res.error || "Terjadi kesalahan saat menghapus akun.", "error");
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={loading}
      title="Hapus Akun"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
