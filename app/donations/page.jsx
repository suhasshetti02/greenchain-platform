"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, 
  Calendar, 
  Package, 
  Filter, 
  Plus, 
  ArrowRight,
  LayoutGrid,
  Search,
  Clock
} from "lucide-react";

import Button from "@/components/Button";
import SkeletonList from "@/components/SkeletonList";
// Assuming StatusBadge accepts a 'status' prop and handles colors internally.
// If not, I've added a fallback inline style for the badge below.
import StatusBadge from "@/components/StatusBadge"; 
import { useAuthContext } from "@/contexts/AuthProvider";
import api from "@/lib/api";

const statusMap = {
  available: "operational",
  claimed: "delayed",
  in_transit: "operational",
  completed: "completed",
};

export default function DonationsPage() {
  const { user } = useAuthContext();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [scope, setScope] = useState("all");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        let response;
        if (scope === "mine") {
          response = await api.donations.listMine();
        } else {
          const params =
            statusFilter === "all" ? {} : { status: statusFilter };
          response = await api.donations.list(params);
        }
        
        // Filter out expired donations on client side as safety measure
        const now = new Date();
        const filtered = (response.donations || []).filter((donation) => {
          if (donation.status === "expired") return false;
          if (donation.status === "available") {
            const expiryDate = new Date(donation.expiry_date);
            return expiryDate > now;
          }
          return true;
        });
        
        setDonations(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [statusFilter, scope]);

  const hasDonations = donations.length > 0;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Live Feed
              </p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Active Donations
            </h1>
            <p className="text-slate-500 max-w-lg">
              Browse available food listings, coordinate pickups, and track delivery status in real-time.
            </p>
          </div>
          
          <div className="flex shrink-0 gap-3">
             {user?.role === "donor" ? (
              <Button as={Link} href="/donations/create" className="shadow-lg shadow-emerald-500/20">
                <Plus className="mr-2 h-4 w-4" />
                New Donation
              </Button>
            ) : (
              <Button as={Link} href="/dashboard/receiver" variant="outline">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="sticky top-0 z-10 -mx-6 bg-gray-50/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60 border-b border-gray-200/50 md:static md:mx-0 md:bg-transparent md:border-none md:p-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            
            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200 no-scrollbar">
              {["all", "available", "claimed", "completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`relative flex items-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    statusFilter === status
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-gray-50 hover:text-slate-900"
                  }`}
                >
                  {status === "all" ? "All Listings" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Scope Filter */}
            {user?.role === "donor" && (
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                  <span className="text-xs uppercase tracking-wide text-slate-400">View:</span>
                  <button
                    onClick={() => setScope(scope === "all" ? "mine" : "all")}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors ${
                      scope === "mine"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-white text-slate-600 hover:border-gray-300"
                    }`}
                  >
                    {scope === "mine" ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        My Donations Only
                      </>
                    ) : (
                      "All Donations"
                    )}
                  </button>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 flex items-center gap-3 text-rose-700">
             <div className="rounded-full bg-rose-100 p-1">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Content Grid */}
        <div
          className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
          aria-busy={loading}
          aria-live="polite"
        >
          {!loading && hasDonations ? (
            donations.map((donation) => (
              <DonationCard key={donation.id} donation={donation} />
            ))
          ) : loading ? (
             // Custom Skeleton Grid for better loading state
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 w-full animate-pulse rounded-3xl bg-gray-200" />
            ))
          ) : (
            // Empty State
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 py-20 text-center">
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <Package className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No donations found</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">
                {statusFilter !== 'all' 
                  ? `No donations match the "${statusFilter}" filter.` 
                  : "There are currently no active donations available."}
              </p>
              {user?.role === "donor" && (
                <Button as={Link} href="/donations/create" variant="ghost" className="mt-6 text-emerald-600 hover:text-emerald-700">
                  Create your first donation
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-Component: Donation Card ---
function DonationCard({ donation }) {
  const isAvailable = donation.status === "available";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50">
      
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {donation.image_url ? (
          <Image
            src={donation.image_url}
            alt={donation.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <Package className="h-10 w-10" />
          </div>
        )}
        
        {/* Status Badge Overlay */}
        <div className="absolute top-4 right-4 shadow-sm">
          <StatusBadge status={statusMap[donation.status] || "operational"} />
        </div>
        
        {/* Category Pill Overlay */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-700 backdrop-blur-md">
            {donation.category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4">
          <h2 className="line-clamp-1 text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
            {donation.title}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{donation.location}</span>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quantity</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Package className="h-4 w-4 text-emerald-500" />
              {donation.quantity_lbs} {donation.unit}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expires</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Clock className={`h-4 w-4 ${new Date(donation.expiry_date) < new Date() ? 'text-rose-500' : 'text-amber-500'}`} />
              {new Date(donation.expiry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <Button 
            as={Link} 
            href={`/donations/${donation.id}`} 
            className="flex-1 bg-slate-900 hover:bg-slate-800"
          >
            Details
          </Button>
          
          {isAvailable && (
            <Link
              href={`/donations/${donation.id}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-slate-400 transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
              title="Quick Claim"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}