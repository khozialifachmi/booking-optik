"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintReportButton() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-9 gap-2 print:hidden"
      onClick={handlePrint}
    >
      <Printer className="h-4 w-4" />
      <span>Cetak Laporan</span>
    </Button>
  );
}
