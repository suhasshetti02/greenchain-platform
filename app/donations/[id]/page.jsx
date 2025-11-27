"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";

import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import { useAuthContext } from "@/contexts/AuthProvider";
import api from "@/lib/api";

const statusMap = {
  available: "operational",
  claimed: "delayed",
  in_transit: "operational",
  completed: "completed",
};

export default function DonationDetailPage({ params }) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        const data = await api.donations.get(params.id);
        setDonation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [params.id]);

  const handleClaim = async () => {
    try {
      setClaiming(true);
      await api.donations.claim(params.id);
      setClaimed(true);
      setDonation({ ...donation, status: "claimed" });
    } catch (err) {
      setError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  const handleDelete = async () => {
    try {
      setRemoving(true);
      await api.donations.remove(params.id);
      router.push("/donations");
    } catch (err) {
      setError(err.message || "Unable to delete donation");
    } finally {
      setRemoving(false);
    }
  };

  const handleEdit = () => {
    router.push(`/donations/create?donationId=${params.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="h-10 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-64 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  if (!donation) return notFound();

  const canClaim =
    donation.status === "available" && user && user.role === "receiver";
  const canManage =
    user && user.role === "donor" && donation.donor?.id === user.id;

  return (
    <article className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {donation.category}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {donation.title}
          </h1>
          <p className="text-sm text-slate-500">{donation.location}</p>
        </div>
        <StatusBadge status={statusMap[donation.status] || "operational"} />
      </div>

      {donation.image_url ? (
        <Image
          src={donation.image_url}
          alt={`${donation.title} donation preview`}
          width={960}
          height={420}
          sizes="100vw"
          className="h-64 w-full rounded-3xl object-cover"
          priority
        />
      ) : (
        <div className="h-64 w-full rounded-3xl bg-slate-200 dark:bg-slate-700" />
      )}

      <dl
        className="grid gap-6 rounded-3xl border border-slate-100 bg-slate-50 p-6 text-sm dark:border-slate-800 dark:bg-slate-900/60 md:grid-cols-4"
        aria-live="polite"
      >
        <div>
          <dt className="uppercase tracking-[0.3em] text-slate-400">Quantity</dt>
          <dd className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
            {donation.quantity_lbs} {donation.unit}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.3em] text-slate-400">Expires</dt>
          <dd className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
            {new Date(donation.expiry_date).toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.3em] text-slate-400">Status</dt>
          <dd className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
            {donation.status}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.3em] text-slate-400">Donor</dt>
          <dd className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
            {donation.donor?.name || "Unknown"}
          </dd>
        </div>
      </dl>

      {donation.notes && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-sm font-medium text-slate-900 dark:text-white">Notes</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{donation.notes}</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
          {error}
        </div>
      )}

      {claimed && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
          Thank you! You have successfully claimed this donation.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canClaim && !claimed && (
          <Button onClick={handleClaim} disabled={claiming}>
            {claiming ? "Claiming..." : "Claim Donation"}
          </Button>
        )}
        {canManage && (
          <>
            <Button variant="ghost" onClick={handleEdit}>
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={removing}
              className="text-rose-600 hover:text-rose-700"
            >
              {removing ? "Removing..." : "Delete"}
            </Button>
          </>
        )}
        <Button as={Link} href="/donations" variant="ghost">
          Back to list
        </Button>
      </div>
    </article>
  );
}

