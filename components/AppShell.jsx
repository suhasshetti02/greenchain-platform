"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import Button from "@/components/Button";
import { useAuthContext } from "@/contexts/AuthProvider";

const HIDDEN_ROUTES = ["/", "/login", "/register"];

function getSidebarItems(user) {
  if (!user) {
    return [
      { label: "Home", href: "/" },
      { label: "Donations", href: "/donations" },
      { label: "Login", href: "/login" },
    ];
  }

  if (user.role === "donor") {
    return [
      { label: "Dashboard", href: "/dashboard/donor" },
      { label: "All Donations", href: "/donations" },
      { label: "Create Donation", href: "/donations/create" },
    ];
  }

  return [
    { label: "Dashboard", href: "/dashboard/receiver" },
    { label: "Browse Donations", href: "/donations" },
    { label: "My Claims", href: "/dashboard/receiver?tab=claims" },
  ];
}

export default function AppShell({ children }) {
  const { user, logout, isLoading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  if (HIDDEN_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  const sidebarItems = useMemo(() => getSidebarItems(user), [user]);
  const title = user
    ? `Hello ${user.name.split(" ")[0] || user.name}`
    : "GreenChain Platform";
  const subtitle = user
    ? user.role === "donor"
      ? "Share surplus food and monitor pickups"
      : "Claim donations and coordinate logistics"
    : "Connect donors with NGOs to reduce food waste";

  const actions = user ? (
    <div className="flex flex-wrap gap-2">
      {user.role === "donor" && (
        <Button size="sm" onClick={() => router.push("/donations/create")}>
          New Donation
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={logout}>
        Logout
      </Button>
    </div>
  ) : (
    <Button size="sm" onClick={() => router.push("/login")}>
      Login
    </Button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 lg:flex-row">
        <main className="flex-1 rounded-3xl bg-white/70 p-4 shadow-sm backdrop-blur lg:p-6">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-10 w-1/3 rounded-2xl bg-slate-200" />
              <div className="h-64 rounded-3xl bg-slate-100" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}


