"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ImageModalProps {
  src: string;
  alt: string;
  children: React.ReactNode;
}

export function ImageModal({ src, alt, children }: ImageModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <div className="cursor-zoom-in contents">
          {children}
        </div>
      </DialogPrimitive.Trigger>
      
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        
        <DialogPrimitive.Content 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
          onClick={() => setOpen(false)}
        >
          <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>
          
          {/* 
            Container Utama: 
            Sekarang TIDAK menghentikan klik (e.stopPropagation dihapus dari sini),
            sehingga area merah Anda akan langsung menutup modal.
          */}
          <div className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center">
            
            {/* 
              GAMBAR:
              Hanya pada elemen ini kita hentikan kliknya agar tidak menutup modal.
            */}
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Tombol X di pojok kanan atas gambar */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all focus:outline-none ring-1 ring-white/20 z-[60]"
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
              <span className="sr-only">Tutup</span>
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
