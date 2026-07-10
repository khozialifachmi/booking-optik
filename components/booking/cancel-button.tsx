"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cancelBookingAction } from "@/actions/booking-actions";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { XCircle } from "lucide-react";

interface CancelButtonProps {
  bookingId: string;
}

export function CancelButton({ bookingId }: CancelButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "Batalkan Antrian?",
      text: "Apakah Anda yakin ingin membatalkan pendaftaran pemeriksaan mata ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Batalkan!",
      cancelButtonText: "Kembali",
    });

    if (result.isConfirmed) {
      setIsPending(true);
      try {
        const response = await cancelBookingAction(bookingId);
        if (response.success) {
          await Swal.fire({
            title: "Berhasil!",
            text: "Antrian Anda telah dibatalkan.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          router.refresh();
        } else {
          Swal.fire("Gagal", response.error || "Terjadi kesalahan", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Gagal memproses pembatalan", "error");
      } finally {
        setIsPending(false);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCancel}
      disabled={isPending}
      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 h-8 px-3"
    >
      <XCircle className="h-4 w-4" />
      <span>Batalkan</span>
    </Button>
  );
}
