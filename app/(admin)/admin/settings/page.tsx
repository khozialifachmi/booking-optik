import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";
export const metadata: Metadata = {
  title: "Pengaturan — EyeCheck",
  description: "Pengaturan sistem dan operasional Optik Khayra",
};

export default async function AdminSettingsPage() {
  const currentSetting = await prisma.queueSettings.findFirst({
    orderBy: { effectiveDate: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pengaturan Operasional</h1>
        <p className="text-muted-foreground">Sesuaikan jam kerja dan parameter antrian sesuai dengan jam operasional optik.</p>
      </div>

      <Card className="border-border/50 max-w-3xl">
        <CardHeader>
          <CardTitle className="text-xl">Parameter Antrian & Jam Buka</CardTitle>
          <CardDescription>
            Pengaturan ini akan mempengaruhi estimasi waktu panggil pada pelanggan yang mendaftar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm initialData={currentSetting} />
        </CardContent>
      </Card>
    </div>
  );
}
