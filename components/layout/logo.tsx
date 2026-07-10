"use client";

import { Eye } from "lucide-react";

export function Logo({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textClasses = {
    sm: "text-lg",
    default: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md" />
        <div className={`relative flex items-center justify-center rounded-xl bg-primary text-primary-foreground ${sizeClasses[size]}`}>
          <Eye className={size === "lg" ? "h-7 w-7" : size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"} />
        </div>
      </div>
      <span className={`font-heading font-bold tracking-tight text-foreground ${textClasses[size]}`}>
        Eye<span className="text-primary">Check</span>
      </span>
    </div>
  );
}
