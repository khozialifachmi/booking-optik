"use client"

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Save, 
  Loader2, 
  Camera,
  CheckCircle2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { updateProfileAction } from "@/actions/profile-actions";
import Swal from "sweetalert2";

const profileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().min(10, "Nomor telepon tidak valid"),
  address: z.string().optional(),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    phone?: string | null;
    image?: string | null;
    emailChangeCount?: number;
    profile?: {
      address?: string | null;
    } | null;
  };
  isAdmin?: boolean;
}

export function ProfileForm({ initialData, isAdmin = false }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialData.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone || "",
      address: initialData.profile?.address || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("Ukuran terlalu besar!", "Maksimal ukuran foto adalah 2MB", "warning");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    try {
      const result = await updateProfileAction({
        name: data.name,
        phone: data.phone,
        address: data.address,
        email: data.email,
        image: previewImage || undefined,
      });

      if (result.success) {
        Swal.fire({
          title: "Berhasil!",
          text: "Profil Anda telah diperbarui.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
        router.refresh();
      } else {
        Swal.fire({
          title: "Gagal!",
          text: result.error || "Gagal memperbarui profil",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan sistem",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const isEmailEditable = (initialData.emailChangeCount || 0) < 1;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
            <div className="absolute -bottom-12 left-8">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg transition-transform group-hover:scale-105 group-active:scale-95">
                        <AvatarImage src={previewImage || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                            {initialData.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-all hover:scale-110 active:scale-90 cursor-pointer z-10"
                      title="Ganti Foto"
                    >
                        <Camera className="h-4 w-4 text-primary" />
                    </button>
                </div>
                
                {/* Tombol Hapus Foto */}
                {previewImage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(null);
                    }}
                    className="absolute -right-24 bottom-2 flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-full bg-red-50 group-hover:bg-red-100 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </div>
                    Hapus Foto
                  </button>
                )}
            </div>
        </div>

        <CardHeader className="pt-16 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                {initialData.name}
                {isAdmin && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Official</span>}
              </CardTitle>
              <CardDescription>
                Kelola informasi pribadi Anda untuk layanan Optik Khayra yang lebih personal.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Separator className="mx-6 w-auto opacity-50" />

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary/60" /> Nama Lengkap
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nama sesuai KTP"
                className="bg-white/50 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary/60" /> Email (Akun)
              </Label>
              <Input
                id="email"
                {...register("email")}
                disabled={!isEmailEditable}
                className={!isEmailEditable ? "bg-gray-50/50 border-gray-100 text-gray-500 cursor-not-allowed opacity-70" : "bg-white/50 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"}
              />
              {!isEmailEditable ? (
                <p className="text-[10px] text-muted-foreground italic mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" /> Email sudah pernah diganti dan tidak dapat diubah lagi.
                </p>
              ) : (
                <p className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Peringatan: Email hanya dapat diganti 1 kali saja.
                </p>
              )}
            </div>

            {/* Nomor Telepon */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary/60" /> Nomor WhatsApp
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Contoh: 08123456789"
                className="bg-white/50 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            {/* Alamat Lengkap */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary/60" /> Alamat Lengkap
              </Label>
              <textarea
                id="address"
                {...register("address")}
                placeholder="Masukkan alamat domisili Anda..."
                rows={3}
                className="flex w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50/30 border-t border-gray-100 p-6 flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={loading}
            className="hover:bg-white hover:text-primary transition-all"
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            disabled={loading || (!isDirty && previewImage === initialData.image)}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
