"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return <span className="opacity-0">Memuat waktu...</span>;
  }

  const dateStr = time.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Ambil jam, menit, detik dan pisahkan dengan titik
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  return (
    <span className="flex items-center justify-center gap-3">
      <span>{dateStr}</span>
      <span className="font-mono font-bold tracking-wider">{hours}.{minutes}.{seconds} WIB</span>
    </span>
  );
}
