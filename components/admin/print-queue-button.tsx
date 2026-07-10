"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintQueueButtonProps {
  queueNumber: number;
  customerName: string;
  serviceType: string;
  bookingTime: string;
  bookingDate: string;
}

export function PrintQueueButton({
  queueNumber,
  customerName,
  serviceType,
  bookingTime,
  bookingDate,
}: PrintQueueButtonProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Antrian ${queueNumber}</title>
          <style>
            @page { size: 80mm 150mm; margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 70mm; 
              margin: 0 auto; 
              padding: 10px;
              text-align: center;
              font-size: 12px;
            }
            .header { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .logo { font-size: 18px; font-weight: bold; }
            .queue-num { font-size: 48px; font-weight: bold; margin: 15px 0; }
            .info { text-align: left; margin: 10px 0; }
            .footer { border-top: 1px dashed #000; padding-top: 10px; margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">OPTIK KHAYRA</div>
            <div>Booking System Antrian</div>
          </div>
          
          <div>NOMOR ANTRIAN</div>
          <div class="queue-num">A-${queueNumber}</div>
          
          <div class="info">
            <div>Nama: ${customerName}</div>
            <div>Waktu Daftar: ${bookingTime}</div>
            <div>Tgl Daftar: ${bookingDate}</div>
            <div>Layanan: ${serviceType}</div>
          </div>
          
          <div class="footer">
            Harap menunggu antrian Anda.<br>
            Terima kasih telah berkunjung.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8 gap-1.5"
      onClick={handlePrint}
    >
      <Printer className="h-4 w-4" />
      <span className="hidden sm:inline">Cetak Struk</span>
    </Button>
  );
}
