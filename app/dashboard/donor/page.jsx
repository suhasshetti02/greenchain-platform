'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  Package,
  PlusCircle,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

import Button from '@/components/Button';
import SkeletonList from '@/components/SkeletonList';
import StatusBadge from '@/components/StatusBadge';
import { useAuthContext } from '@/contexts/AuthProvider';
import api from '@/lib/api';

function formatDate(date) {
  return new Date(date).toLocaleString();
}

function formatRelative(date) {
  const delta = Date.now() - new Date(date).getTime();
  const minutes = Math.round(delta / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function getDashboardPath(role) {
  return role === 'donor' ? '/dashboard/donor' : '/dashboard/receiver';
}

export default function DonorDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const [donationPayload, statsPayload] = await Promise.all([
        api.donations.listMine(),
        api.donations.stats(),
      ]);
      setDonations(donationPayload.donations || []);
      setStats(statsPayload);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'donor') {
      router.replace(getDashboardPath(user.role));
      return;
    }
    loadDashboard();
  }, [user, isLoading, router, loadDashboard]);

  const upcoming = useMemo(() => {
    return donations
      .filter((item) => {
        const hours =
          (new Date(item.expiry_date).getTime() - Date.now()) / 1000 / 60 / 60;
        return hours <= 24 && item.status === 'available';
      })
      .slice(0, 3);
  }, [donations]);

  const statusBreakdown = useMemo(() => {
    const base = {
      available: 0,
      claimed: 0,
      in_transit: 0,
      completed: 0,
    };
    donations.forEach((donation) => {
      base[donation.status] = (base[donation.status] || 0) + 1;
    });
    return base;
  }, [donations]);

  const claimActivity = useMemo(() => {
    return donations
      .flatMap((donation) =>
        (donation.claims || []).map((claim) => ({
          id: `${donation.id}-${claim.id}`,
          donationTitle: donation.title,
          status: claim.status,
          claimedAt: claim.claimed_at,
          receiver: claim.receiver?.name,
        })),
      )
      .sort(
        (a, b) =>
          new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime(),
      )
      .slice(0, 4);
  }, [donations]);

  const aiHint = useMemo(() => {
    if (!donations.length) {
      return {
        title: 'Ready when you are',
        body: 'Create your first donation to unlock pickup tracking, verification events, and real-time NGO requests.',
      };
    }

    if (upcoming.length > 0) {
      return {
        title: 'Expiring soon',
        body: `We found ${upcoming.length} donation${
          upcoming.length > 1 ? 's' : ''
        } expiring within 24 hours. Prioritize pickup or send a reminder to receivers.`,
      };
    }

    if ((stats?.byStatus?.completed || 0) > (stats?.total || 0) * 0.5) {
      return {
        title: 'Great completion rate',
        body: 'Most donations are making it to the community. Consider scheduling recurring pickups to keep the momentum.',
      };
    }

    return {
      title: 'Keep donors engaged',
      body: 'Add fresh photos or location notes to increase claim speed and help volunteers identify pickup zones faster.',
    };
  }, [donations.length, stats, upcoming.length]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  if (!user) {
    return (
      <div className="space-y-4">
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
            Donor Console
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Manage your surplus food
          </h1>
          <p className="text-sm text-slate-500">
            Track listings, pickup readiness, and delivery outcomes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button as={Link} href="/donations/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Donation
          </Button>
          <Button as={Link} variant="ghost" href="/donations">
            View All
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Listings"
          value={stats?.total ?? donations.length}
          icon={<Package className="h-4 w-4" />}
          accent="bg-emerald-50 text-emerald-600"
          helper="Across all time"
        />
        <StatCard
          label="Available Now"
          value={stats?.byStatus?.available ?? statusBreakdown.available}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="bg-amber-50 text-amber-600"
          helper={
            upcoming.length
              ? `${upcoming.length} expiring within 24h`
              : 'All donations are on schedule'
          }
        />
        <StatCard
          label="Completed"
          value={stats?.byStatus?.completed ?? statusBreakdown.completed}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="bg-slate-50 text-slate-600"
          helper="Delivered & verified"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Status snapshot
              </h2>
              <p className="text-sm text-slate-500">
                Live view of donation lifecycle.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {Object.entries(statusBreakdown).map(([status, value]) => (
              <SnapshotBar
                key={status}
                status={status}
                value={value}
                total={stats?.total ?? donations.length}
              />
            ))}
          </div>
        </article>
        <article className="rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-600">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-500">
                Smart assistant
              </p>
              <h3 className="mt-2 text-lg font-semibold text-emerald-900">
                {aiHint.title}
              </h3>
              <p className="mt-2 text-sm text-emerald-800">{aiHint.body}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => router.push('/donations/create')}>
              New listing
            </Button>
            <Button size="sm" variant="ghost" onClick={() => router.push('/donations')}>
              Manage donations
            </Button>
          </div>
        </article>
      </section>

      {upcoming.length > 0 && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-500">
                Prioritize pickups
              </p>
              <p className="text-sm text-amber-700">
                These donations expire within the next 24 hours.
              </p>
            </div>
            <ShieldCheck className="h-5 w-5 text-amber-500" />
          </div>
          <ul className="mt-3 divide-y divide-amber-100">
            {upcoming.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 py-2"
              >
                <div>
                  <p className="font-medium text-amber-900">{item.title}</p>
                  <p className="text-sm text-amber-600">
                    {new Date(item.expiry_date).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/donations/${item.id}`)}
                >
                  View
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent donations
              </h2>
              <p className="text-sm text-slate-500">
                Monitor current listings and their status.
              </p>
            </div>
          </div>
          {loading ? (
            <div className="mt-6">
              <SkeletonList count={4} />
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          ) : donations.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
              You have not created any donations yet. Start by creating your first
              listing.
            </div>
          ) : (
            <div className="mt-6 divide-y divide-slate-100">
              {donations.map((donation) => (
                <article
                  key={donation.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                      {donation.category}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {donation.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {donation.quantity_lbs} {donation.unit} • Expires{' '}
                      {formatDate(donation.expiry_date)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={
                        donation.status === 'available'
                          ? 'operational'
                          : donation.status === 'claimed'
                            ? 'delayed'
                            : 'operational'
                      }
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/donations/${donation.id}`)}
                    >
                      Manage
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Claim activity
              </h2>
              <p className="text-sm text-slate-500">
                Latest NGO interactions and pickups.
              </p>
            </div>
          </div>
          {claimActivity.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              No claims yet. When NGOs claim your donations you’ll see the timeline here.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {claimActivity.map((activity) => (
                <li key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.donationTitle}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activity.receiver || 'Receiver'} • {activity.status}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatRelative(activity.claimedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, accent, helper }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-semibold ${accent}`}>
        {icon}
        {label}
      </div>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
      {helper && <p className="mt-1 text-sm text-slate-500">{helper}</p>}
    </div>
  );
}

function SnapshotBar({ status, value, total }) {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100);
  const statusLabel = {
    available: 'Available',
    claimed: 'Claimed',
    in_transit: 'In transit',
    completed: 'Completed',
  }[status];

  const barColor = {
    available: 'bg-emerald-200',
    claimed: 'bg-amber-200',
    in_transit: 'bg-blue-200',
    completed: 'bg-slate-200',
  }[status];

  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>{statusLabel}</span>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">{percent}% of total listings</p>
    </div>
  );
}

function FilterTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
        active
          ? 'bg-gray-900 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function DonationRow({ item }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'claimed':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'picked':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="group md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
      <div className="col-span-4 flex items-start gap-4 mb-2 md:mb-0">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl shrink-0">
          {item.category === 'Bakery'
            ? '🍞'
            : item.category === 'Cooked'
              ? '🍲'
              : item.category === 'Produce'
                ? '🍎'
                : '📦'}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{item.title}</h4>
          <p className="text-xs text-gray-500">
            {item.category} • Posted {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="col-span-2 text-sm font-medium text-gray-700 mb-2 md:mb-0 flex items-center gap-2 md:block">
        <span className="md:hidden text-gray-500 font-normal">Qty:</span>
        {item.quantity} {item.unit}
      </div>

      <div className="col-span-2 mb-2 md:mb-0">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(item.status)} capitalize`}>
          {item.status}
        </span>
      </div>

      <div className="col-span-3 text-sm text-gray-500 flex items-center gap-1 mb-2 md:mb-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l3 3" />
        </svg>
        Expires {new Date(item.expiryDate || item.expiry_date).toLocaleDateString()}
      </div>

      <div className="col-span-1 text-right flex justify-end">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}

