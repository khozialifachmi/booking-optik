"use client";

import { Button } from "@/components/ui/button";
import { markAsMissedAction } from "@/actions/admin-actions";
import Swal from "sweetalert2";
import { useState } from "react";
import { UserMinus } from "lucide-react";

export function SkipButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  const handleSkip = async () => {
    const confirm = await Swal.fire({
      title: "Pasien Tidak Ada?",
      text: "Antrian akan ditandai terlewat dan harus menunggu 5 antrian berikutnya untuk dipanggil lagi.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Lewati",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e11d48",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const res = await markAsMissedAction(bookingId);
      if (res.success) {
        Swal.fire({
          title: "Berhasil",
          text: res.message,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-rose-600 hover:bg-rose-50 border-rose-200 h-8 gap-1.5"
      onClick={handleSkip}
      disabled={loading}
    >
      <UserMinus className="h-3.5 w-3.5" />
      <span>Lewati</span>
    </Button>
  );
}
