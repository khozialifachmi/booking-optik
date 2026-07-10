"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope } from "lucide-react";
import { saveMedicalRecordAction } from "@/actions/medical-actions";
import Swal from "sweetalert2";

interface MedicalRecordFormProps {
  bookingId: string;
  userId: string;
  customerName: string;
}

export function MedicalRecordForm({ bookingId, userId, customerName }: MedicalRecordFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      bookingId,
      userId,
      rightSph: formData.get("rightSph") as string,
      rightCyl: formData.get("rightCyl") as string,
      rightAxis: formData.get("rightAxis") as string,
      leftSph: formData.get("leftSph") as string,
      leftCyl: formData.get("leftCyl") as string,
      leftAxis: formData.get("leftAxis") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const res = await saveMedicalRecordAction(data);
      if (res.success) {
        setOpen(false);
        Swal.fire({
          title: "Berhasil",
          text: "Rekam medis telah disimpan.",
          icon: "success",
          timer: 2000,
        });
      } else {
        Swal.fire("Error", res.error || "Gagal menyimpan data", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/10 gap-1.5">
          <Stethoscope className="h-4 w-4" />
          <span>Hasil Periksa</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Hasil Pemeriksaan Mata</DialogTitle>
            <DialogDescription>
              Isi hasil pemeriksaan untuk pelanggan: <strong>{customerName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-primary font-bold">Catatan Hasil Pemeriksaan (Kesimpulan)</Label>
              <textarea 
                id="notes" 
                name="notes" 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Berikan penjelasan yang mudah dimengerti pelanggan. Misal: Mata sebelah kanan dan kiri min 2."
              />
            </div>

            <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Detail Teknis (Opsional)</h4>
              
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-primary">MATA KANAN (OD)</p>
                <div className="grid grid-cols-3 gap-2">
                  <Input id="rightSph" name="rightSph" placeholder="SPH" className="h-8 text-xs" />
                  <Input id="rightCyl" name="rightCyl" placeholder="CYL" className="h-8 text-xs" />
                  <Input id="rightAxis" name="rightAxis" placeholder="AXS" className="h-8 text-xs" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold text-primary">MATA KIRI (OS)</p>
                <div className="grid grid-cols-3 gap-2">
                  <Input id="leftSph" name="leftSph" placeholder="SPH" className="h-8 text-xs" />
                  <Input id="leftCyl" name="leftCyl" placeholder="CYL" className="h-8 text-xs" />
                  <Input id="leftAxis" name="leftAxis" placeholder="AXS" className="h-8 text-xs" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Hasil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
