"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const filterOptions = [
  { label: "Hari Ini", value: "0" },
  { label: "1 Hari Lalu", value: "1" },
  { label: "3 Hari Lalu", value: "3" },
  { label: "7 Hari Lalu (Seminggu)", value: "7" },
  { label: "14 Hari Lalu (2 Minggu)", value: "14" },
  { label: "1 Bulan Lalu", value: "30" },
  { label: "2 Bulan Lalu", value: "60" },
  { label: "3 Bulan Lalu", value: "90" },
  { label: "Semua Riwayat", value: "all" },
];

export function DateFilter({ defaultValue = "0" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentValue = searchParams.get("days") || defaultValue;

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) {
      params.delete("days");
    } else {
      params.set("days", value);
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Filter Waktu:</span>
      <Select value={currentValue} onValueChange={handleValueChange} disabled={isPending}>
        <SelectTrigger className="w-[180px] h-9 bg-background/50 relative">
          {isPending ? (
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs">Memuat...</span>
            </div>
          ) : (
            <SelectValue placeholder="Pilih Waktu" />
          )}
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
