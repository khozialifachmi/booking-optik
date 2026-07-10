"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { recallBookingAction } from "@/actions/admin-actions";
import Swal from "sweetalert2";
import { useState } from "react";

export function RecallButton({ queueNumber }: { queueNumber: number }) {
  const [loading, setLoading] = useState(false);

  const handleRecall = async () => {
    setLoading(true);
    try {
      const res = await recallBookingAction(queueNumber);
      if (res.success) {
        Swal.fire({
          title: "Panggil Ulang",
          text: res.message,
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5"
      onClick={handleRecall}
      disabled={loading}
    >
      <RotateCcw className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Panggil Ulang</span>
    </Button>
  );
}
