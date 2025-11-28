"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Filter,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Truck,
} from "lucide-react";

import Button from "@/components/Button";
import ProfileCard from "@/components/ProfileCard";
import SkeletonList from "@/components/SkeletonList";
import StatusBadge from "@/components/StatusBadge";
import { useAuthContext } from "@/contexts/AuthProvider";
import api from "@/lib/api";

const tabs = [
  { id: "available", label: "Available Donations" },
  { id: "claims", label: "My Claims" },
  { id: "logistics", label: "Logistics" },
];

function getDashboardPath(role) {
  return role === "donor" ? "/dashboard/donor" : "/dashboard/receiver";
}

export default function ReceiverDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuthContext();

  const [available, setAvailable] = useState([]);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "available",
  );
  const [loading, setLoading] = useState({ available: true, claims: true });
  const [error, setError] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "receiver") {
      router.replace(getDashboardPath(user.role));
      return;
    }

    const fetchData = async () => {
      try {
        setError("");
        setLoading({ available: true, claims: true });
        const [availablePayload, claimsPayload, statsPayload] =
          await Promise.all([
            api.donations.listAvailable(),
            api.claims.mine(),
            api.donations.stats(),
          ]);
        setAvailable(availablePayload.donations || []);
        setClaims(claimsPayload.claims || []);
        setStats(statsPayload);
      } catch (err) {
        setError(err.message || "Unable to load NGO dashboard");
      } finally {
        setLoading({ available: false, claims: false });
      }
    };

    fetchData();
  }, [user, isLoading, router]);

  const handleClaim = async (id) => {
    try {
      setClaimingId(id);
      await api.donations.claim(id);
      const [availablePayload, claimsPayload] = await Promise.all([
        api.donations.listAvailable(),
        api.claims.mine(),
      ]);
      setAvailable(availablePayload.donations || []);
      setClaims(claimsPayload.claims || []);
    } catch (err) {
      setError(err.message || "Unable to claim donation");
    } finally {
      setClaimingId(null);
    }
  };

  const handleUpdateClaim = async (id, status) => {
    try {
      await api.claims.updateStatus(id, status);
      const claimsPayload = await api.claims.mine();
      setClaims(claimsPayload.claims || []);
    } catch (err) {
      setError(err.message || "Unable to update claim");
    }
  };

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const activeClaims = useMemo(
    () => claims.filter((claim) => claim.status !== "completed"),
    [claims],
  );

  const filteredAvailable = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return available.filter((donation) => {
      const matchesPriority =
        priorityFilter === "all" || donation.priority === priorityFilter;
      const matchesTerm =
        !term ||
        donation.title.toLowerCase().includes(term) ||
        donation.location.toLowerCase().includes(term) ||
        donation.donor?.name?.toLowerCase().includes(term);
      return matchesPriority && matchesTerm;
    });
  }, [available, searchTerm, priorityFilter]);

  if (!user) {
    return (
      <div className="space-y-4">
        <SkeletonList count={3} />
      </div>
    );
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    const query = params.toString();
    router.replace(
      query ? `/dashboard/receiver?${query}` : "/dashboard/receiver",
      { scroll: false },
    );
  };

  const isFiltered =
    searchTerm.trim().length > 0 || priorityFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <ProfileCard 
        stats={{
          available: stats?.available ?? available.length,
          activeClaims: activeClaims.length,
        }}
      />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
            NGO Console
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Coordinate pickups & deliveries
          </h1>
          <p className="text-sm text-slate-500">
            Browse available donations and manage your logistics.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Upcoming pickup
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {activeClaims[0]?.donation?.title || "None scheduled"}
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MiniStat
          label="Available donations"
          value={stats?.available ?? available.length}
          helper={`${stats?.expiringSoon ?? 0} expiring within 24h`}
        />
        <MiniStat label="Active claims" value={activeClaims.length} helper="In pickup pipeline" />
        <MiniStat
          label="Completed"
          value={claims.filter((c) => c.status === "completed").length}
          helper="Deliveries verified"
        />
      </section>

      <section className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-white p-2 text-emerald-600 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
              Smart insight
            </p>
            <p className="text-sm text-emerald-800">
              {stats?.expiringSoon
                ? `${stats.expiringSoon} pickups should be scheduled within the next 24 hours.`
                : "All pickups are tracking well. Keep an eye on the logistics tab for updates."}
            </p>
          </div>
        </div>
      </section>

      <nav className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {activeTab === "available" && (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, donor, or location"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                {["all", "critical", "high", "normal"].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setPriorityFilter(priority)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                      priorityFilter === priority
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {priority === "all"
                      ? "All"
                      : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <AvailableList
            donations={filteredAvailable}
            loading={loading.available}
            onClaim={handleClaim}
            claimingId={claimingId}
            emptyLabel={
              isFiltered
                ? "No donations match your current filters."
                : "No donations available right now. Check back soon!"
            }
          />
        </>
      )}

      {activeTab === "claims" && (
        <ClaimsList claims={claims} loading={loading.claims} />
      )}

      {activeTab === "logistics" && (
        <LogisticsList claims={activeClaims} onUpdate={handleUpdateClaim} />
      )}
    </div>
  );
}

function MiniStat({ label, value, helper }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      {helper && <p className="text-sm text-slate-500">{helper}</p>}
    </div>
  );
}

function AvailableList({ donations, loading, onClaim, claimingId, emptyLabel }) {
  if (loading) {
    return <SkeletonList count={4} />;
  }

  if (!donations.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
        {emptyLabel || "No donations available right now. Check back soon!"}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {donations.map((donation) => (
        <article
          key={donation.id}
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {donation.category}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                {donation.title}
              </h3>
              <p className="text-sm text-slate-500">{donation.donor?.name}</p>
            </div>
            <StatusBadge
              status={
                donation.priority === "critical" ? "delayed" : "operational"
              }
            />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Quantity</dt>
              <dd className="font-semibold text-slate-900">
                {donation.quantity_lbs} {donation.unit}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd className="font-semibold text-slate-900">
                {donation.location}
              </dd>
            </div>
          </dl>
          <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
            {donation.priorityHint}
          </p>
          <Button
            className="mt-4 w-full"
            disabled={claimingId === donation.id}
            onClick={() => onClaim(donation.id)}
          >
            {claimingId === donation.id ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              "Claim Donation"
            )}
          </Button>
        </article>
      ))}
    </div>
  );
}

function ClaimsList({ claims, loading }) {
  if (loading) {
    return <SkeletonList count={4} />;
  }

  if (!claims.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
        You have not claimed any donations yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 sm:grid sm:grid-cols-4">
        <div>Donation</div>
        <div>Location</div>
        <div>Status</div>
        <div>Claimed</div>
      </div>
      <div className="divide-y divide-slate-100">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="grid gap-3 px-6 py-4 text-sm sm:grid-cols-4"
          >
            <div>
              <p className="font-semibold text-slate-900">
                {claim.donation?.title}
              </p>
              <p className="text-slate-500">{claim.donation?.category}</p>
            </div>
            <div className="text-slate-500">{claim.donation?.location}</div>
            <div>
              <StatusBadge
                status={
                  claim.status === "completed"
                    ? "operational"
                    : claim.status === "pending"
                      ? "delayed"
                      : "operational"
                }
              />
            </div>
            <div className="text-slate-500">
              {new Date(claim.claimed_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogisticsList({ claims, onUpdate }) {
  if (!claims.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
        No active logistics tasks. Claim a donation to start coordinating.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <article
          key={claim.id}
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {claim.donation?.category}
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                {claim.donation?.title}
              </h3>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {claim.donation?.location}
              </p>
            </div>
            <StatusBadge
              status={
                claim.status === "pending"
                  ? "delayed"
                  : claim.status === "accepted"
                    ? "operational"
                    : "operational"
              }
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
            <Truck className="h-4 w-4" />
            {claim.status === "pending"
              ? "Assign a volunteer and mark as picked up when en route."
              : "Confirm once the delivery is completed."}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {claim.status === "pending" && (
              <Button
                size="sm"
                onClick={() => onUpdate(claim.id, "accepted")}
              >
                Mark as picked up
              </Button>
            )}
            {claim.status !== "completed" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUpdate(claim.id, "completed")}
              >
                Mark as delivered
              </Button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}


