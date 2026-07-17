"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface CashflowItem {
  id: string;
  type: string;
  amount: number;
  date: Date;
  createdAt: Date;
}

interface CashflowChartProps {
  items: CashflowItem[];
  days: string;
}

export function CashflowChart({ items, days }: CashflowChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
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

  const getJakartaParts = (d: Date) => {
    const shifted = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth(),
      date: shifted.getUTCDate(),
      hours: shifted.getUTCHours(),
      minutes: shifted.getUTCMinutes(),
      day: shifted.getUTCDay(),
      time: shifted.getTime(),
    };
  };

  const { chartData, filterLabel } = useMemo(() => {
    const dataList: { label: string; income: number; expense: number; key: number }[] = [];
    let label = "Hari Ini";
    const now = new Date();

    if (days === "0" || days === "1") {
      label = days === "0" ? "Hari Ini" : "Kemarin";
      let targetDay = new Date(now);
      if (days === "0" && items.length > 0) {
        targetDay = new Date(items[0].createdAt);
      } else if (days === "1") {
        targetDay.setDate(targetDay.getDate() - 1);
      }
      
      const targetParts = getJakartaParts(targetDay);
      
      // Bucket by every 2 hours from 08:00 to 20:00
      const hours = [8, 10, 12, 14, 16, 18, 20];
      hours.forEach((h, idx) => {
        let inc = 0, exp = 0;
        items.forEach((item) => {
          const p = getJakartaParts(new Date(item.createdAt));
          if (p.year === targetParts.year && p.month === targetParts.month && p.date === targetParts.date) {
            // Include in bucket if hour is between h and h+2
            if (p.hours >= h && p.hours < h + 2) {
              if (item.type === "income") inc += item.amount;
              else exp += item.amount;
            }
          }
        });
        dataList.push({ label: `${h.toString().padStart(2, "0")}:00`, income: inc, expense: exp, key: idx });
      });

    } else if (days === "3" || days === "7" || days === "14") {
      const count = parseInt(days);
      label = `${count} Hari Terakhir`;
      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const tp = getJakartaParts(d);
        
        let inc = 0, exp = 0;
        items.forEach((item) => {
          const ip = getJakartaParts(new Date(item.createdAt));
          if (ip.year === tp.year && ip.month === tp.month && ip.date === tp.date) {
            if (item.type === "income") inc += item.amount;
            else exp += item.amount;
          }
        });
        dataList.push({ label: `${dayNames[tp.day]} ${tp.date}/${tp.month + 1}`, income: inc, expense: exp, key: i });
      }
    } else if (days === "30" || days === "60" || days === "90") {
      const limitDays = parseInt(days);
      label = limitDays === 30 ? "1 Bulan Terakhir" : `${limitDays / 30} Bulan Terakhir`;
      const numWeeks = Math.floor(limitDays / 7);
      
      for (let w = numWeeks - 1; w >= 0; w--) {
        let inc = 0, exp = 0;
        items.forEach((item) => {
          const diff = Math.floor((now.getTime() - new Date(item.createdAt).getTime()) / 86400000);
          if (diff >= w * 7 && diff < (w + 1) * 7) {
            if (item.type === "income") inc += item.amount;
            else exp += item.amount;
          }
        });
        dataList.push({ label: `Mgg ${numWeeks - w}`, income: inc, expense: exp, key: w });
      }
    } else {
      label = "Semua Riwayat";
      const mn = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const tp = getJakartaParts(d);
        let inc = 0, exp = 0;
        items.forEach((item) => {
          const ip = getJakartaParts(new Date(item.createdAt));
          if (ip.year === tp.year && ip.month === tp.month) {
            if (item.type === "income") inc += item.amount;
            else exp += item.amount;
          }
        });
        dataList.push({ label: `${mn[tp.month]} ${tp.year.toString().slice(-2)}`, income: inc, expense: exp, key: i });
      }
    }

    return { chartData: dataList, filterLabel: label };
  }, [items, days]);

  const maxVal = useMemo(() => {
    const allVals = chartData.flatMap((d) => [d.income, d.expense]);
    const max = Math.max(...allVals, 100000);
    return max * 1.2;
  }, [chartData]);

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
    if (value >= 1_000) return `Rp ${Math.round(value / 1_000)}rb`;
    return `Rp ${value}`;
  };

  // SVG dimensions
  const width = 840;
  const height = 340;
  const paddingLeft = 80;
  const paddingRight = 30;
  const paddingTop = 40;
  const paddingBottom = 60;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const barGroupWidth = chartWidth / Math.max(chartData.length, 1);
  const barWidth = Math.min(barGroupWidth * 0.35, 24);
  const barGap = 4;

  return (
    <Card className="border-border/60 shadow-lg bg-white dark:bg-card overflow-hidden col-span-1 lg:col-span-3 rounded-2xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 space-y-4 sm:space-y-0 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
            <div className="bg-indigo-100 dark:bg-indigo-950/50 p-2 rounded-xl">
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Ringkasan Keuangan
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{filterLabel}</CardDescription>
        </div>
        <div className="flex items-center gap-5 text-sm font-semibold bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-sm block" />
            <span className="text-slate-600 dark:text-slate-300">Pemasukan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-sm block" />
            <span className="text-slate-600 dark:text-slate-300">Pengeluaran</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8 pb-4 relative">
        <div className="relative select-none w-full overflow-x-auto overflow-y-visible scrollbar-hide">
          <div className="min-w-[600px]">
            {/* Tooltip */}
            {hoveredIdx !== null && chartData[hoveredIdx] && (
              <div
                style={{
                  left: `${(paddingLeft + hoveredIdx * barGroupWidth + barGroupWidth / 2) / width * 100}%`,
                  transform: "translateX(-50%)",
                }}
                className="absolute top-0 bg-slate-900 text-white rounded-xl p-4 shadow-xl text-sm z-30 w-56 border border-slate-800 pointer-events-none transition-all duration-200 ease-out"
              >
                <p className="font-semibold border-b border-slate-700/80 pb-2 mb-3 text-slate-300 text-center">
                  {chartData[hoveredIdx].label}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Pemasukan
                  </span>
                  <span className="font-bold text-emerald-50">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(chartData[hoveredIdx].income)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span> Pengeluaran
                  </span>
                  <span className="font-bold text-rose-50">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(chartData[hoveredIdx].expense)}
                  </span>
                </div>
              </div>
            )}

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible font-sans">
              <defs>
                <linearGradient id="bar-inc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="bar-exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>

              {/* Y-Axis gridlines + labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = paddingTop + chartHeight * (1 - ratio);
                return (
                  <g key={`grid-${idx}`}>
                    <line
                      x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y}
                      stroke={isDark ? (ratio === 0 ? "#475569" : "#334155") : (ratio === 0 ? "#cbd5e1" : "#f1f5f9")}
                      strokeWidth={ratio === 0 ? "2" : "1"}
                    />
                    <text
                      x={paddingLeft - 16} y={y + 4}
                      textAnchor="end" fontSize="12" fontWeight="500"
                      fill={isDark ? "#94a3b8" : "#64748b"}
                    >
                      {formatCurrencyCompact(maxVal * ratio)}
                    </text>
                  </g>
                );
              })}

              {/* Data Bars */}
              {chartData.map((d, idx) => {
                const isHovered = hoveredIdx === idx;
                const baseX = paddingLeft + idx * barGroupWidth + barGroupWidth / 2;
                
                const incHeight = (d.income / maxVal) * chartHeight;
                const expHeight = (d.expense / maxVal) * chartHeight;
                
                const incY = paddingTop + chartHeight - incHeight;
                const expY = paddingTop + chartHeight - expHeight;

                const incX = baseX - barWidth - (barGap / 2);
                const expX = baseX + (barGap / 2);

                return (
                  <g key={`bar-${idx}`}>
                    {/* Hover Background */}
                    <rect
                      x={paddingLeft + idx * barGroupWidth}
                      y={paddingTop - 10}
                      width={barGroupWidth}
                      height={chartHeight + 20}
                      fill={isHovered ? (isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc") : "transparent"}
                      rx="8"
                      className="transition-colors duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />

                    {/* Income Bar */}
                    {d.income > 0 && (
                      <rect
                        x={incX} y={incY}
                        width={barWidth} height={Math.max(incHeight, 4)}
                        fill="url(#bar-inc)"
                        rx="4"
                        className="transition-all duration-300 ease-out"
                        style={{ filter: isHovered ? "brightness(1.1)" : "none" }}
                        pointerEvents="none"
                      />
                    )}

                    {/* Expense Bar */}
                    {d.expense > 0 && (
                      <rect
                        x={expX} y={expY}
                        width={barWidth} height={Math.max(expHeight, 4)}
                        fill="url(#bar-exp)"
                        rx="4"
                        className="transition-all duration-300 ease-out"
                        style={{ filter: isHovered ? "brightness(1.1)" : "none" }}
                        pointerEvents="none"
                      />
                    )}

                    {/* Empty placeholder if no data */}
                    {d.income === 0 && d.expense === 0 && (
                      <rect
                        x={baseX - 4} y={paddingTop + chartHeight - 4}
                        width={8} height={4}
                        fill={isDark ? "#334155" : "#e2e8f0"} rx="2" pointerEvents="none"
                      />
                    )}

                    {/* X-axis label */}
                    <text
                      x={baseX} y={paddingTop + chartHeight + 28}
                      textAnchor="middle" fontSize="12"
                      fontWeight={isHovered ? "700" : "500"}
                      fill={isHovered ? (isDark ? "#f1f5f9" : "#334155") : "#94a3b8"}
                      className="transition-colors duration-200 pointer-events-none"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
