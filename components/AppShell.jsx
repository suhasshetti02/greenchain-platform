"use client";

import { useAuthContext } from "@/contexts/AuthProvider";

export default function AppShell({ children }) {
  const { isLoading } = useAuthContext();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-10 w-1/3 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}


