"use client";

import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2 } from "lucide-react";
import { callNextQueueAction } from "@/actions/admin-actions";
import { useState } from "react";
import Swal from "sweetalert2";

export function CallNextQueueButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCallNext = async () => {
    setIsLoading(true);
    try {
      const result = await callNextQueueAction();
      if (result.success) {
        if (result.message === "Tidak ada antrian menunggu.") {
          Swal.fire({
            title: "Antrian Kosong",
            text: "Saat ini tidak ada pelanggan yang sedang menunggu giliran.",
            icon: "info",
            confirmButtonColor: "#3b82f6" // blue-500
          });
        } else {
          Swal.fire({
            title: "Panggilan Berhasil",
            text: result.message,
            icon: "success",
            confirmButtonColor: "#10b981" // emerald-500
          });
        }
      } else {
        Swal.fire({
          title: "Terjadi Kesalahan",
          text: result.error || "Gagal memanggil antrian.",
          icon: "error"
        });
      }
    } catch (e) {
      Swal.fire({
        title: "Terjadi Kesalahan",
        text: "Gagal terhubung ke server.",
        icon: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCallNext} 
      disabled={isLoading}
      className="gap-2 w-full sm:w-auto shadow-md"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <PlayCircle className="h-4 w-4" />
      )}
      Panggil Berikutnya
    </Button>
  );
}
