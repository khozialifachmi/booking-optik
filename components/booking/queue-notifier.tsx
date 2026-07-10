"use client";

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { BellRing, Check, X } from "lucide-react";
import { updateUserResponseAction } from "@/actions/booking-actions";

interface QueueNotifierProps {
  status: string;
  queueNumber: number | null;
  bookingId: string;
  callCount: number;
  userResponse?: string | null;
}

export function QueueNotifier({ status, queueNumber, bookingId, callCount, userResponse }: QueueNotifierProps) {
  const [hasResponded, setHasResponded] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevCallCountRef = useRef(callCount);
  const prevStatusRef = useRef<string | null>(null); // Inisialisasi null agar jika pertama load sedang calling, notif langsung muncul

  // Inisialisasi audio & Unlocker
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audioRef.current.load();
    }
    
    const unlockAudio = () => {
      if (audioRef.current && !audioUnlocked) {
        audioRef.current.play().then(() => {
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
          setAudioUnlocked(true);
          window.removeEventListener("click", unlockAudio);
          window.removeEventListener("touchstart", unlockAudio);
        }).catch(() => {});
      }
    };
    
    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, [audioUnlocked]);

  useEffect(() => {
    // 1. Notif Panggilan / Re-call
    const isFirstCall = prevStatusRef.current !== "calling" && status === "calling";
    const isRecall = status === "calling" && callCount > prevCallCountRef.current;
    const hasNotResponded = userResponse !== "present" && userResponse !== "absent";

    if ((isFirstCall || isRecall) && hasNotResponded && !hasResponded) {
      setHasResponded(false);
      playAlarm();
      showNotification();
    }

    // 2. Notif Konfirmasi (Unverified -> Waiting)
    const isConfirmed = prevStatusRef.current === "unverified" && status === "waiting";
    if (isConfirmed) {
      playSuccessSound();
      Swal.fire({
        title: "Pendaftaran Dikonfirmasi!",
        text: "Pendaftaran Anda telah diverifikasi admin. Silakan cetak nomor antrian Anda.",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
    }

    if (status !== "calling" && status !== "waiting") {
      stopAlarm();
      if (prevStatusRef.current === "calling") {
        Swal.close();
      }
    }

    prevCallCountRef.current = callCount;
    prevStatusRef.current = status;
  }, [status, callCount, userResponse, hasResponded]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);

  const playAlarm = () => {
    if (isPlayingRef.current) return;
    
    // Kembali ke suara Bell Ring sebelumnya
    const alarmUrl = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
    
    if (!audioRef.current) {
      audioRef.current = new Audio(alarmUrl);
    } else {
      audioRef.current.src = alarmUrl;
    }
    
    isPlayingRef.current = true;

    // Jika audio belum unlock, tampilkan banner
    if (!audioUnlocked) {
      Swal.fire({
        title: "Suara Terblokir",
        text: "Klik di mana saja untuk mengaktifkan suara alarm panggilan.",
        icon: "warning",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 3000
      });
    }

    const playSequence = () => {
      if (!isPlayingRef.current) return;
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Jika gagal, coba lagi nanti
        });
      }
      
      // Jeda antar bunyi (3.5 detik) agar tidak terlalu bising
      timerRef.current = setTimeout(playSequence, 3500); 
    };

    playSequence();
  };

  const playSuccessSound = () => {
    const successAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3");
    successAudio.play().catch(() => {});
  };

  const stopAlarm = () => {
    isPlayingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleResponse = async (response: "present" | "absent") => {
    stopAlarm();
    setHasResponded(true);
    await updateUserResponseAction(bookingId, response);
    
    Swal.fire({
      title: response === "present" ? "Terima Kasih!" : "Konfirmasi Terkirim",
      text: response === "present" 
        ? "Silakan segera menuju ruang periksa. Admin telah diberitahu bahwa Anda hadir."
        : "Terima kasih atas informasinya. Admin telah diberitahu bahwa Anda berhalangan.",
      icon: response === "present" ? "success" : "info",
      timer: 3000,
      showConfirmButton: false
    });
  };

  const showNotification = () => {
    Swal.fire({
      title: "GILIRAN ANDA!",
      html: `
        <div class="flex flex-col items-center gap-4 py-4">
          <div class="h-24 w-24 rounded-full bg-rose-100 flex items-center justify-center animate-bounce">
            <svg class="h-12 w-12 text-rose-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </div>
          <div class="text-center">
            <p class="text-lg font-medium text-muted-foreground">Nomor Antrian Anda:</p>
            <h2 class="text-6xl font-black text-rose-600 mt-1">A-${queueNumber?.toString().padStart(2, "0")}</h2>
          </div>
          <p class="text-muted-foreground text-sm font-medium">Silakan konfirmasi kehadiran Anda:</p>
        </div>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
      footer: `
        <div class="flex gap-4 w-full px-4 pb-4">
          <button id="btn-hadir" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-lg flex items-center justify-center gap-2">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> HADIR
          </button>
          <button id="btn-absent" class="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all active:scale-95 text-lg flex items-center justify-center gap-2">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> TIDAK
          </button>
        </div>
      `,
      didOpen: () => {
        document.getElementById("btn-hadir")?.addEventListener("click", () => {
          handleResponse("present");
          Swal.close();
        });
        document.getElementById("btn-absent")?.addEventListener("click", () => {
          handleResponse("absent");
          Swal.close();
        });
      }
    });
  };

  if (status === "unverified") return null;

  return (
    <>
      {!audioUnlocked && status === "calling" && (
        <div className="fixed bottom-4 left-4 z-[9999] animate-bounce">
          <button 
            onClick={() => setAudioUnlocked(true)}
            className="bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 text-sm"
          >
            <BellRing className="h-4 w-4" />
            Aktifkan Suara Panggilan
          </button>
        </div>
      )}
    </>
  );
}
