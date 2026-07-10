"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingFormSchema, type BookingFormValues } from "@/lib/validations/booking";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarPlus, User, ClipboardList, Info, AlertCircle, Clock } from "lucide-react";
import Swal from "sweetalert2";
import { createBookingAction, getBookedTimeSlotsAction, getProspectiveTimeAction } from "@/actions/booking-actions";

export function BookingForm({ settings }: { settings: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [prospectiveTime, setProspectiveTime] = useState<string | null>(null);


  useEffect(() => {
    // Set jam pendaftaran seketika
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    mode: "onChange",
  });

  const selectedDate = watch("tanggalBooking");

  useEffect(() => {
    async function fetchProspective() {
      if (selectedDate) {
        const res = await getProspectiveTimeAction(selectedDate);
        if (res.success) {
          setProspectiveTime(res.time ?? null);
          // Set juga ke form value agar terkirim sebagai estimasi awal
          setValue("waktuBooking", res.time ?? "");
        }
      } else {
        setProspectiveTime(null);
      }
    }
    fetchProspective();
  }, [selectedDate, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi Ukuran File (Maksimal 1MB)
      if (file.size > 1024 * 1024) {
        Swal.fire({
          title: "File Terlalu Besar",
          text: "Ukuran bukti transfer maksimal adalah 1MB. Silakan gunakan foto yang lebih kecil atau kompres terlebih dahulu.",
          icon: "error"
        });
        e.target.value = ""; // Kosongkan input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Kompresi Gambar sebelum disimpan ke State
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Ubah ke Base64 dengan kualitas 0.7 (Kompresi Tinggi)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setValue("paymentProof", compressedBase64, { shouldValidate: true });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // No longer fetching booked slots as it's FCFS now

  const previewQueueNumber = "Otomatis";
  const dummyEstimasi = "Sesuai Urutan";

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);

    // Kirim data ke Backend (Server Action)
    const result = await createBookingAction(data);

    setIsSubmitting(false);

    if (!result.success) {
      Swal.fire({
        title: "Pendaftaran Gagal",
        text: result.error,
        icon: "error"
      });
      return;
    }

    Swal.fire({
      title: "Pendaftaran Berhasil!",
      html: `
        <div class="text-left mt-4 text-sm space-y-2">
          <p><strong>Nama:</strong> ${data.namaLengkap}</p>
          <p><strong>Layanan:</strong> ${data.jenisLayanan}</p>
          <p><strong>Tanggal:</strong> ${result.data?.tanggal}</p>
          <p class="text-purple-600 font-bold">Status: Tunggu Sampai Admin Konfirmasi Pendaftaran</p>
          <p class="text-xs text-muted-foreground italic">Nomor antrian akan muncul di Dashboard setelah Admin mengonfirmasi bukti transfer Anda.</p>
          <hr style="margin: 10px 0; border-top: 1px solid #e5e7eb;" />
          <p style="color: #ea580c; font-weight: 500; font-size: 1.1em;">Biaya Pemeriksaan: Rp 15.000</p>
        </div>
      `,
      icon: "success",
      confirmButtonText: "Ke Dashboard & Cetak Struk",
      confirmButtonColor: "var(--color-primary)",
      customClass: {
        confirmButton: "rounded-lg px-4 py-2 font-medium"
      }
    }).then(() => {
      window.location.href = "/dashboard";
    });
  };

  const baseInputClass = "flex w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="gap-8 grid lg:grid-cols-3 items-start">
      {/* Kolom Kiri: Form Input */}
      <div className="lg:col-span-2 space-y-6">

        {/* Data Pengunjung */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Data Pengunjung
            </CardTitle>
            <CardDescription>
              Pastikan data diri sesuai untuk keperluan administrasi Optik Khayra.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="namaLengkap">Nama Lengkap <span className="text-destructive">*</span></Label>
              <Input id="namaLengkap" placeholder="Masukkan nama lengkap" {...register("namaLengkap")} aria-invalid={!!errors.namaLengkap} />
              {errors.namaLengkap && <p className="text-xs text-destructive">{errors.namaLengkap.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="noHandphone">Nomor Handphone <span className="text-destructive">*</span></Label>
              <Input id="noHandphone" placeholder="Contoh: 08123456789" {...register("noHandphone")} aria-invalid={!!errors.noHandphone} />
              {errors.noHandphone && <p className="text-xs text-destructive">{errors.noHandphone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="usia">Usia (Tahun) <span className="text-destructive">*</span></Label>
              <Input id="usia" type="number" min="1" placeholder="Usia pasien" {...register("usia")} aria-invalid={!!errors.usia} />
              {errors.usia && <p className="text-xs text-destructive">{errors.usia.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenisKelamin">Jenis Kelamin <span className="text-destructive">*</span></Label>
              <select
                id="jenisKelamin"
                {...register("jenisKelamin")}
                className={baseInputClass}
                defaultValue=""
              >
                <option value="" disabled>Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              {errors.jenisKelamin && <p className="text-xs text-destructive">{errors.jenisKelamin.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Data Pemeriksaan */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Rincian Pemeriksaan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jenisLayanan">Jenis Layanan <span className="text-destructive">*</span></Label>
                <div className="flex flex-col gap-2 mt-1">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground opacity-80">
                    <input type="radio" value="Pemeriksaan mata" {...register("jenisLayanan")} checked readOnly className="accent-primary w-4 h-4" />
                    Pemeriksaan mata
                  </label>
                </div>
                {errors.jenisLayanan && <p className="text-xs text-destructive">{errors.jenisLayanan.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggalBooking">Tanggal Pemeriksaan <span className="text-destructive">*</span></Label>
                {(() => {
                  // Dapatkan tanggal hari ini dalam format YYYY-MM-DD sesuai zona waktu lokal
                  const now = new Date();
                  const formatter = new Intl.DateTimeFormat('sv-SE', { 
                    timeZone: 'Asia/Jakarta', 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                  });
                  const todayStr = formatter.format(now);
                  
                  // Ambil jam & menit lokal untuk cek jam tutup
                  const localTime = now.toLocaleTimeString('id-ID', { 
                    timeZone: 'Asia/Jakarta', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  });
                  const [currentH, currentM] = localTime.split(":").map(Number);
                  const [closeH, closeM] = (settings?.closeTime || "17:00").split(":").map(Number);
                  
                  const isClosedToday = (currentH > closeH) || (currentH === closeH && currentM >= closeM);
                  
                  let minDate = todayStr;
                  if (isClosedToday) {
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    minDate = formatter.format(tomorrow);
                  }

                  return (
                    <Input 
                      type="date" 
                      id="tanggalBooking" 
                      {...register("tanggalBooking")} 
                      min={minDate}
                    />
                  );
                })()}
                {errors.tanggalBooking && <p className="text-xs text-destructive">{errors.tanggalBooking.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Jam Operasional Optik Khayra</Label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Clock className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <p className="font-bold text-primary">
                      {settings ? `${settings.openTime} - ${settings.closeTime} WIB` : "08:00 - 17:00 WIB"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Pemeriksaan mengikuti urutan antrian masuk (FCFS).</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keluhanMata">Keluhan Mata <span className="text-destructive">*</span></Label>
              <textarea
                id="keluhanMata"
                placeholder="Contoh: Mata sering kabur saat membaca jarak jauh, terasa pusing di malam hari."
                {...register("keluhanMata")}
                className={`${baseInputClass} min-h-[100px] resize-none`}
              />
              {errors.keluhanMata && <p className="text-xs text-destructive">{errors.keluhanMata.message}</p>}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pernahPeriksa">Apakah pernah periksa sebelumnya? <span className="text-destructive">*</span></Label>
                <select id="pernahPeriksa" {...register("pernahPeriksa")} className={baseInputClass} defaultValue="">
                  <option value="" disabled>Pilih Status</option>
                  <option value="Sudah">Sudah pernah</option>
                  <option value="Belum">Belum sama sekali</option>
                </select>
                {errors.pernahPeriksa && <p className="text-xs text-destructive">{errors.pernahPeriksa.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="riwayatKacamata">Riwayat Penggunaan Kacamata <span className="text-destructive">*</span></Label>
                <Input id="riwayatKacamata" placeholder="Misal: Minus 2 kiri kanan (Ketik '-' jika tidak ada)" {...register("riwayatKacamata")} aria-invalid={!!errors.riwayatKacamata} />
                {errors.riwayatKacamata && <p className="text-xs text-destructive">{errors.riwayatKacamata.message}</p>}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed">
              <div className="flex items-center gap-2 text-amber-600">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Pembayaran Transfer (Pemeriksaan: Rp 15.000)</span>
              </div>
              <p className="text-xs text-muted-foreground">Silakan transfer ke rekening: <strong>BCA 7391653694 a/n Nira Ramadhanti</strong>. Unggah bukti transfer di bawah ini.</p>

              <div className="space-y-2">
                <Label htmlFor="paymentProof">Unggah Bukti Transfer <span className="text-destructive">*</span></Label>
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    id="paymentProof"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  {watch("paymentProof") && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
                      <img src={watch("paymentProof")} alt="Preview" className="object-cover w-full h-full" />
                    </div>
                  )}
                </div>
                {errors.paymentProof && <p className="text-xs text-destructive">{errors.paymentProof.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kolom Kanan: Summary Antrian (Sticky) */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Informasi Antrian</CardTitle>
            <CardDescription>
              Detail sistem yang tercatat otomatis untuk Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="text-sm font-medium text-muted-foreground">Nomor Antrian</span>
              <span className="text-xl font-bold text-primary">{watch("tanggalBooking") ? "Otomatis" : "-"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="text-sm font-medium text-muted-foreground">Jam Pendaftaran</span>
              <span className="text-right font-medium">{currentTime || "-"} WIB</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="text-sm font-medium text-muted-foreground">Status Pelayanan</span>
              <span className="text-right font-medium text-primary">FCFS (First In First Served)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Biaya Pemeriksaan</span>
              <span className="text-right font-bold text-amber-600 dark:text-amber-500">Rp 15.000</span>
            </div>

            {!watch("tanggalBooking") && (
              <div className="flex items-start gap-2 rounded-lg bg-orange-500/10 p-3 text-sm text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Pilih tanggal pemeriksaan untuk mendapatkan nomor antrian.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full gap-2 text-base font-semibold"
          disabled={!isValid || isSubmitting}
        >
          <CalendarPlus className="h-4 w-4" />
          {isSubmitting ? "Memproses..." : "Daftar (Rp 15.000)"}
        </Button>
      </div>
    </form>
  );
}
