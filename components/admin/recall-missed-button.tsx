"use client";

import { Button } from "@/components/ui/button";
import { recallFromMissedAction } from "@/actions/admin-actions";
import Swal from "sweetalert2";
import { useState } from "react";
import { RefreshCcw } from "lucide-react";

export function RecallMissedButton({ bookingId, queueNumber }: { bookingId: string, queueNumber: number }) {
  const [loading, setLoading] = useState(false);

  const handleRecall = async () => {
    setLoading(true);
    try {
      const res = await recallFromMissedAction(bookingId);
      if (res.success) {
        Swal.fire({
          title: "Berhasil Dipanggil",
          text: res.message,
          icon: "success",
          timer: 2000,
        });
      } else {
        Swal.fire({
          title: "Belum Bisa Dipanggil",
          text: res.error,
          icon: "warning",
          confirmButtonColor: "#e11d48",
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
      variant="default"
      size="sm"
      className="bg-rose-600 hover:bg-rose-700 h-8 gap-1.5"
      onClick={handleRecall}
      disabled={loading}
    >
      <RefreshCcw className="h-3.5 w-3.5" />
      <span>Panggil Lagi</span>
    </Button>
  );
}
