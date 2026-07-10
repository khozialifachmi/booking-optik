"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export function RefreshDashboard({ interval = 30000 }: { interval?: number }) {
  const router = useRouter();
  const isRefreshingRef = useRef(false);
  const failCountRef = useRef(0);
  const MAX_FAILURES = 3;

  const safeRefresh = useCallback(() => {
    // Jangan refresh jika:
    // 1. Tab tidak aktif/fokus
    // 2. Sedang dalam proses refresh sebelumnya
    // 3. Sudah gagal terlalu banyak kali berturut-turut
    if (
      document.visibilityState !== "visible" ||
      isRefreshingRef.current ||
      failCountRef.current >= MAX_FAILURES
    ) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      router.refresh();
      // Reset fail count saat berhasil
      failCountRef.current = 0;
    } catch {
      failCountRef.current += 1;
      console.warn(
        `[RefreshDashboard] Refresh gagal (${failCountRef.current}/${MAX_FAILURES})`
      );
    } finally {
      // Beri jeda sebelum membolehkan refresh berikutnya
      // Ini mencegah overlap jika refresh memakan waktu lama
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 3000);
    }
  }, [router]);

  useEffect(() => {
    const timer = setInterval(safeRefresh, interval);

    // Reset fail counter ketika tab kembali fokus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        failCountRef.current = 0;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [safeRefresh, interval]);

  return null;
}
