"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { deleteBookingAction } from "@/actions/admin-actions";

interface DeleteBookingButtonProps {
  bookingId: string;
  name: string;
}

export function DeleteBookingButton({ bookingId, name }: DeleteBookingButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const result = await Swal.fire({
      title: "Hapus Antrian/Booking?",
      text: `Apakah Anda yakin ingin menghapus antrian untuk "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setLoading(true);
      const res = await deleteBookingAction(bookingId);
      setLoading(false);

      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Terhapus",
          text: "Antrian berhasil dihapus.",
          timer: 1500,
          showConfirmButton: false,
        });
        router.refresh();
      } else {
        Swal.fire("Gagal", res.error || "Terjadi kesalahan saat menghapus antrian.", "error");
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
      title="Hapus Antrian/Booking"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
