"use client";

import { useState, useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const filterOptions = [
  { label: "Hari Ini", value: "0" },
  { label: "1 Hari Lalu", value: "1" },
  { label: "7 Hari Lalu (Seminggu)", value: "7" },
  { label: "1 Bulan Lalu", value: "30" },
  { label: "Semua Riwayat", value: "all" },
];

function DateFilterInner({ defaultValue = "0" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const currentValue = searchParams.get("days") || defaultValue;

  useEffect(() => {
    setIsLoading(false);
  }, [currentValue]);

  const handleValueChange = (value: string) => {
    if (value === currentValue) return;
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) {
      params.delete("days");
    } else {
      params.set("days", value);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Filter Waktu:</span>
      <Select value={currentValue} onValueChange={handleValueChange} disabled={isLoading}>
        <SelectTrigger className="w-[180px] h-9 bg-background/50 relative">
          {isLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              Memuat data...
            </span>
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

export function DateFilter(props: { defaultValue?: string }) {
  return (
    <Suspense fallback={<div className="w-[180px] h-9 bg-muted/20 animate-pulse rounded-lg border" />}>
      <DateFilterInner {...props} />
    </Suspense>
  );
}
