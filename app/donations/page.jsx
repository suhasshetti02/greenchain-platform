"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Button from "@/components/Button";
import SkeletonList from "@/components/SkeletonList";
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
        setDonations(response.donations || []);
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
            Donations
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Active food donations
          </h1>
          <p className="text-sm text-slate-500">
            Coordinate pickups and match with partner requests.
          </p>
        </div>
        {user?.role === "donor" ? (
          <Button as={Link} href="/donations/create">
            New donation
          </Button>
        ) : (
          <Button as={Link} href="/dashboard/receiver">
            View dashboard
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {["all", "available", "claimed", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              statusFilter === status
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {status === "all" ? "All" : status}
          </button>
        ))}
        {user?.role === "donor" && (
          <button
            onClick={() => setScope(scope === "all" ? "mine" : "all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              scope === "mine"
                ? "bg-emerald-500 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {scope === "mine" ? "Showing my donations" : "Show only my donations"}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
          {error}
        </div>
      )}

      <div
        className="grid gap-4"
        aria-busy={loading}
        aria-live="polite"
      >
        {!loading && hasDonations ? (
          donations.map((donation) => (
            <article
              key={donation.id}
              className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[auto,1fr]"
            >
              {donation.image_url ? (
                <Image
                  src={donation.image_url}
                  alt={`${donation.title} donation preview`}
                  width={160}
                  height={120}
                  sizes="(min-width: 640px) 160px, 100vw"
                  className="h-28 w-full rounded-2xl object-cover sm:h-full sm:w-40"
                />
              ) : (
                <div className="h-28 w-full rounded-2xl bg-slate-200 sm:h-full sm:w-40 dark:bg-slate-700" />
              )}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {donation.category}
                    </p>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {donation.title}
                    </h2>
                    <p className="text-sm text-slate-500">{donation.location}</p>
                  </div>
                  <StatusBadge status={statusMap[donation.status] || "operational"} />
                </div>
                <dl className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <dt className="text-slate-500">Quantity</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {donation.quantity_lbs} {donation.unit}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Expires</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {new Date(donation.expiry_date).toLocaleString()}
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-3">
                  <Button as={Link} href={`/donations/${donation.id}`} size="sm">
                    View details
                  </Button>
                  {donation.status === "available" && (
                    <Button
                      as={Link}
                      href={`/donations/${donation.id}`}
                      size="sm"
                      variant="ghost"
                    >
                      Claim donation
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : loading ? (
          <SkeletonList count={3} />
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-slate-500 dark:text-slate-400">
              No donations available yet. Be the first to create one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

