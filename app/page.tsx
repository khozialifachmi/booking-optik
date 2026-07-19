import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import {
  Eye,
  Clock,
  CalendarCheck,
  Users,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { ImageModal } from "@/components/landing/ImageModal";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo size="sm" />
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Fitur</Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">Cara Kerja</Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">Tentang Kami</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Masuk
            </Link>
            <Link href="/register" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[600px] w-[600px] rounded-full bg-primary/8 blur-3xl" />
          </div>
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
            <div className="h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Booking Pemeriksaan Mata{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Tanpa Antri
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Daftar antrian online, lihat estimasi waktu kedatangan, dan pantau
              posisi antrian Anda secara real-time. Hemat waktu, tidak perlu
              menunggu lama di tempat.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/booking/new" className={cn(buttonVariants({ variant: "default", size: "lg" }), "gap-2 text-base w-full sm:w-auto")}>
                Daftar Pemeriksaan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/queue-display"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 text-base w-full sm:w-auto")}
              >
                <Eye className="h-4 w-4" />
                Lihat Antrian
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      {/* Features anchor */}
      <div id="features" />
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Kenapa Booking Online?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Fitur-fitur yang membuat pengalaman Anda lebih nyaman
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: CalendarCheck,
                title: "Booking Mudah",
                description:
                  "Daftar antrian kapan saja dari mana saja. Pilih tanggal dan layanan, langsung dapat nomor antrian.",
              },
              {
                icon: Clock,
                title: "Estimasi Waktu Akurat",
                description:
                  "Sistem menghitung estimasi waktu layanan berdasarkan posisi antrian. Datang tepat waktu.",
              },
              {
                icon: Users,
                title: "Antrian Real-time",
                description:
                  "Pantau posisi antrian secara langsung. Tahu kapan giliran Anda tanpa menunggu di tempat.",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="group relative border-border/50 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      
      {/* How it works anchor */}
      <div id="how-it-works" />
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Cara Kerja
            </h2>
            <p className="mt-3 text-muted-foreground">
              3 langkah mudah untuk booking pemeriksaan mata
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Daftar & Login",
                description:
                  "Buat akun dengan email dan nomor telepon Anda.",
              },
              {
                step: "02",
                title: "Pilih Tanggal & Layanan",
                description:
                  "Pilih tanggal pemeriksaan dan jenis layanan yang dibutuhkan.",
              },
              {
                step: "03",
                title: "Dapatkan Nomor Antrian",
                description:
                  "Sistem otomatis memberikan nomor antrian dan estimasi waktu layanan.",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                {/* Connector line */}
                {index < 2 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/20 to-primary/5 md:block" />
                )}
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us (Tentang Kami) */}
      <section id="about" className="py-20 bg-muted/30 border-t">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Tentang Kami</h2>
                <div className="mt-2 h-1.5 w-20 rounded-full bg-primary" />
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                EyeCheck hadir untuk memberikan pelayanan pemeriksaan mata profesional dengan sentuhan teknologi modern. Kami berkomitmen untuk membantu masyarakat mendapatkan penglihatan yang lebih baik melalui layanan yang cepat, akurat, dan transparan.
              </p>
              
              <div className="grid gap-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Lokasi Kami</h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      Jl. Karang Satria No.122A, RT.005/RW.007, Duren Jaya, Kec. Bekasi Tim., Kota Bks, Jawa Barat 17111
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Hubungi Kami</h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      0819-3282-4055
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-muted-foreground text-sm mt-1">
                      optikkhayra@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-primary/20 to-primary/0 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-border/50 bg-muted shadow-2xl">
                 {/* Klik Gambar untuk melihat foto asli lewat Modal */}
                 <ImageModal 
                   src="/tentang-kami/Screenshot 2026-04-09 030723.png" 
                   alt="Foto Depan Optik Khayra"
                 >
                   <div className="absolute inset-0 bg-[url('/tentang-kami/Screenshot%202026-04-09%20030723.png')] bg-cover bg-center grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
                 </ImageModal>
                 
                 <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                 
                 <div className="absolute bottom-6 left-6 right-6">
                    {/* Hanya label ini yang menuju Maps */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Optik+Khayra+Jl.+Karang+Satria+No.122A+Bekasi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl bg-background/90 backdrop-blur px-4 py-3 shadow-lg border border-border/50 hover:border-primary/50 hover:bg-background transition-all"
                    >
                        <p className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Kunjungi Optik Kami di Bekasi
                        </p>
                    </a>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Siap Booking Pemeriksaan Mata?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Daftar sekarang dan nikmati kemudahan booking online.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/booking/new" className={cn(buttonVariants({ variant: "default", size: "lg" }), "gap-2 text-base w-full sm:w-auto")}>
              <CheckCircle2 className="h-4 w-4" />
              Booking Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">
              &copy; 2026 Optik Khayra. Hak cipta
              dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
