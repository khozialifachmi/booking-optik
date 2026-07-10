"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addCashflowAction } from "@/actions/cashflow-actions";
import { Loader2, Plus } from "lucide-react";
import Swal from "sweetalert2";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Simpan Data
    </Button>
  );
}

export function CashflowForm() {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    const res = await addCashflowAction(formData);
    if (res.success) {
      setOpen(false);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data keuangan berhasil ditambahkan.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: res.error,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Catatan Keuangan</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="type">Jenis Transaksi</Label>
            <Select name="type" defaultValue="income" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Pemasukan (Uang Masuk)</SelectItem>
                <SelectItem value="expense">Pengeluaran (Uang Keluar)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Nominal (Rp)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="Contoh: 150000"
              required
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan Singkat</Label>
            <Input
              id="description"
              name="description"
              placeholder="Contoh: DP Kacamata Budi"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Detail tambahan jika ada..."
            />
          </div>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
