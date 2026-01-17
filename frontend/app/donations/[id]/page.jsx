"use client";

import { use, useEffect, useState } from "react";
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
  Trash2,
  Edit,
  Info
} from "lucide-react";

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
  const { id } = use(params);
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
  const canManage = user && user.role === "donor" && donation.donor?.id === user.id;

  return (
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
        <div className="relative overflow-hidden rounded-3xl bg-gray-100 shadow-sm ring-1 ring-gray-900/5 aspect-[21/9]">
          {donation.image_url ? (
            <Image
              src={donation.image_url}
              alt={donation.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
             <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 bg-slate-50">
               <Package className="h-16 w-16 opacity-20" />
               <p className="mt-4 text-sm font-medium">No image provided</p>
             </div>
          )}
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