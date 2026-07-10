"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateQueueSettingsAction } from "@/actions/admin-actions";
import Swal from "sweetalert2";
import { Save } from "lucide-react";

export function SettingsForm({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      avgServiceDuration: Number(formData.get("avgServiceDuration")),
      openTime: formData.get("openTime") as string,
      closeTime: formData.get("closeTime") as string,
      maxBookingsPerDay: Number(formData.get("maxBookingsPerDay")),
    };

    const result = await updateQueueSettingsAction(data);

    setIsLoading(false);

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pengaturan antrian berhasil diperbarui!",
        confirmButtonColor: "#2563eb"
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: result.error || "Terjadi kesalahan.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="openTime">Jam Buka Optik</Label>
          <Input 
            id="openTime" 
            name="openTime" 
            type="time" 
            defaultValue={initialData?.openTime || "09:00"} 
            required 
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="closeTime">Jam Tutup Optik</Label>
          <Input 
            id="closeTime" 
            name="closeTime" 
            type="time" 
            defaultValue={initialData?.closeTime || "21:00"} 
            required 
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avgServiceDuration">Rata-rata Durasi Layanan (Menit)</Label>
          <Input 
            id="avgServiceDuration" 
            name="avgServiceDuration" 
            type="number" 
            min="5" 
            max="120" 
            defaultValue={initialData?.avgServiceDuration || 20} 
            required 
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">Digunakan untuk menghitung estimasi antrian.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxBookingsPerDay">Maksimal Antrian per Hari</Label>
          <Input 
            id="maxBookingsPerDay" 
            name="maxBookingsPerDay" 
            type="number" 
            min="1" 
            defaultValue={initialData?.maxBookingsPerDay || 50} 
            required 
            className="h-12"
          />
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isLoading} className="gap-2 px-8">
          <Save className="h-4 w-4" />
          {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
