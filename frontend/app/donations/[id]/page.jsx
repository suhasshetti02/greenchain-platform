"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Package,
  User,
  Clock,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Info,
  X,
  ZoomIn
} from "lucide-react";
import { createPortal } from "react-dom";

import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import { useAuthContext } from "@/contexts/AuthProvider";
import api from "@/lib/api";

const statusMap = {
  available: "available",
  claimed: "claimed",
  in_transit: "operational",
  completed: "completed",
  expired: "expired",
};

export default function DonationDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuthContext();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        const data = await api.donations.get(id);
        setDonation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  const handleClaim = async () => {
    try {
      setClaiming(true);
      setError(null);
      await api.donations.claim(id);
      setClaimed(true);
      setDonation({ ...donation, status: "claimed" });
      // Redirect to donations list after a short delay
      setTimeout(() => {
        router.push("/donations");
      }, 2000);
    } catch (err) {
      setError(err.message || "Unable to claim donation");
    } finally {
      setClaiming(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this donation listing? This cannot be undone.")) return;
    try {
      setRemoving(true);
      await api.donations.remove(id);
      router.push("/donations");
    } catch (err) {
      setError(err.message || "Unable to delete donation");
    } finally {
      setRemoving(false);
    }
  };

  const handleEdit = () => {
    router.push(`/donations/create?donationId=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="h-8 w-32 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-96 w-full rounded-3xl bg-gray-200 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
            <div className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
            <div className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!donation) return notFound();

  const canClaim = donation.status === "available" && user && user.role === "receiver";
  // Only allow editing/deleting if the donation is still available
  const canManage = user && user.role === "donor" && donation.donor?.id === user.id && donation.status === "available";

  return (
    <>
      {isImageExpanded && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsImageExpanded(false)}
        >
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsImageExpanded(false); }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-white/10 rounded-full p-2 z-[10000]"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="relative h-full w-full max-w-5xl max-h-[90vh] flex items-center justify-center p-4">
            <Image
              src={donation.image_url}
              alt={donation.title}
              fill
              className="object-contain rounded-lg"
              sizes="100vw"
              priority
            />
          </div>
        </div>,
        document.body
      )}

    <main className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6">
      <article className="mx-auto max-w-5xl space-y-8">

        {/* Navigation & Header */}
        <div className="space-y-6">
          <Link
            href="/donations"
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <div className="rounded-full bg-white p-1.5 shadow-sm ring-1 ring-gray-200 transition-all group-hover:ring-emerald-200 group-hover:bg-emerald-50">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Back to Donations
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-600/10">
                  {donation.category}
                </span>
                <StatusBadge status={statusMap[donation.status] || "operational"} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {donation.title}
              </h1>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="font-medium">{donation.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div 
          className={`relative overflow-hidden rounded-3xl bg-gray-100 shadow-sm ring-1 ring-gray-900/5 aspect-[21/9] ${donation.image_url ? 'cursor-zoom-in group/image' : ''}`}
          onClick={() => {
            if (donation.image_url) setIsImageExpanded(true);
          }}
        >
          {donation.image_url ? (
            <>
              <Image
                src={donation.image_url}
                alt={donation.title}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
               {/* Zoom Hint Overlay */}
               <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors duration-300">
                  <div className="opacity-0 hover:opacity-100 bg-black/50 text-white rounded-full p-3 transition-opacity duration-300 transform scale-75 hover:scale-100 backdrop-blur-sm">
                      <ZoomIn className="h-6 w-6" />
                  </div>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 bg-slate-50">
              <Package className="h-16 w-16 opacity-20" />
              <p className="mt-4 text-sm font-medium">No image provided</p>
            </div>
          )}
        </div>

        {/* AI Analysis Section */}
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm ring-1 ring-emerald-900/5">
          <div className="flex items-start gap-4">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                </div>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">AI Spoilage Prediction</p>
                            <h2 className="text-lg font-bold text-slate-900">
                                {donation.risk_score != null 
                                    ? `Risk Score: ${Math.min(100, Math.round(donation.risk_score * 100))}%`
                                    : "Analysis Pending"}
                            </h2>
                        </div>
                        {donation.risk_score != null && (
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                                donation.risk_score > 0.8 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                donation.risk_score > 0.5 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                                Priority: {donation.priority_score > 75 ? "CRITICAL" : donation.priority_score > 50 ? "HIGH" : "NORMAL"}
                            </div>
                        )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        Our AI model analyzes food type, storage conditions ({donation.storage || "standard"}), and preparation time to estimate spoilage risk. 
                        {donation.risk_score > 0.5 
                            ? " This item has a high probability of spoiling soon. Immediate pickup is recommended to ensure freshness."
                            : " This item is predicted to remain fresh for the standard duration."}
                    </p>
                </div>
            </div>
        </div>

        {/* Info Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={Package}
            label="Quantity"
            value={`${donation.quantity_lbs} ${donation.unit}`}
            subtext="Total Weight"
          />
          <InfoCard
            icon={Clock}
            label="Expires On"
            value={new Date(donation.expiry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            subtext={new Date(donation.expiry_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            highlight={new Date(donation.expiry_date) < new Date()}
          />
          <InfoCard
            icon={User}
            label="Donor"
            value={donation.donor?.name || "Anonymous"}
            subtext="Verified Partner"
          />
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-gray-900/5 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Info className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              {donation.notes || "No additional notes provided for this donation."}
            </p>
          </div>
        </div>

        {/* Action Area */}
        <div className="sticky bottom-6 z-10 rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-xl shadow-gray-200/50 backdrop-blur-md md:static md:bg-white md:shadow-none md:border-none md:p-0">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Status Messages */}
            <div className="flex-1">
              {error && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}
              {claimed && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  <CheckCircle className="h-4 w-4" /> Successfully claimed!
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              {canClaim && !claimed && (
                <Button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full md:w-auto min-w-[160px] shadow-lg shadow-emerald-500/20"
                >
                  {claiming ? "Processing..." : "Claim Donation"}
                </Button>
              )}

              {canManage && (
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-sm rounded-lg transition-all"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                  <div className="h-4 w-px bg-gray-300" />
                  <button
                    onClick={handleDelete}
                    disabled={removing}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-white hover:text-rose-700 hover:shadow-sm rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" /> {removing ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </article>
    </main>
    </>
  );
}

// --- Helper Component ---
function InfoCard({ icon: Icon, label, value, subtext, highlight }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <div className={`rounded-lg p-2 ${highlight ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div>
        <div className={`text-xl font-bold ${highlight ? 'text-rose-600' : 'text-slate-900'}`}>{value}</div>
        <div className="text-sm font-medium text-slate-500 mt-1">{subtext}</div>
      </div>
    </div>
  );
}