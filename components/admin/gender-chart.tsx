"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Sparkles } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface GenderChartProps {
  maleCount: number;
  femaleCount: number;
}

export function GenderChart({ maleCount, femaleCount }: GenderChartProps) {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      setIsDark(true);
    } else if (theme === "light") {
      setIsDark(false);
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, [theme]);

  const total = maleCount + femaleCount;
  const malePercent = total > 0 ? Math.round((maleCount / total) * 100) : 50;
  const femalePercent = total > 0 ? Math.round((femaleCount / total) * 100) : 50;

  // Donut SVG parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const maleStrokeOffset = circumference - (malePercent / 100) * circumference;

  return (
    <Card className="border-border/50 shadow-md bg-white dark:bg-card overflow-hidden col-span-1 lg:col-span-1">
      <CardHeader className="pb-4">
        <CardTitle className="text-md font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Users className="h-4 w-4 text-primary animate-pulse" />
          Demografi Pendaftar
        </CardTitle>
        <CardDescription>Perbandingan Laki-laki & Perempuan</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-2 pb-6">
        {total === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground w-full">
            <Sparkles className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Belum ada pelanggan terdaftar</p>
            <p className="text-[10px] text-slate-400 mt-0.5">di periode filter saat ini</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-6">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background Ring - represents Females (rose color) */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="stroke-rose-400"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Active Ring - represents Males (emerald/teal color) */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="stroke-emerald-500 transition-all duration-500 ease-in-out"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={maleStrokeOffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Central Text */}
              <div className="absolute text-center">
                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{total}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pelanggan</p>
              </div>
            </div>

            {/* Labels and stats */}
            <div className="w-full space-y-3">
              {/* Male stats */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Laki-laki</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{maleCount} orang</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">{malePercent}%</span>
                </div>
              </div>

              {/* Female stats */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400 block" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Perempuan</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{femaleCount} orang</span>
                  <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 block">{femalePercent}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
