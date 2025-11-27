"use client";

import { cn } from "@/lib/utils";

export default function SkeletonList({
  count = 3,
  className,
  variant = "card",
}) {
  return (
    <div
      className={cn(
        "grid gap-3 animate-pulse",
        variant === "inline" ? "grid-cols-1" : "",
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className={cn(
            "rounded-2xl border border-slate-200/60 bg-white/70 p-4",
            variant === "pill" && "rounded-full",
            "dark:border-slate-800/60 dark:bg-slate-900/60",
          )}
        >
          <div className="h-4 w-1/3 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="mt-3 h-6 w-2/3 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

