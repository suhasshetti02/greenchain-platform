 "use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthContext } from "@/contexts/AuthProvider";

export default function DashboardPage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    router.replace(user.role === "donor" ? "/dashboard/donor" : "/dashboard/receiver");
  }, [isLoading, user, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-sm uppercase tracking-[0.4em] text-emerald-400">
        Loading dashboard
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">
        Preparing your personalized console...
      </h1>
    </div>
  );
}

