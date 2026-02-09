"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocation, calculateDistance } from "@/hooks/useLocation";
import { useEffect, useState, forwardRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Package, Clock, ArrowRight } from "lucide-react";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";

const statusMap = {
  available: "available",
  claimed: "claimed",
  in_transit: "operational",
  completed: "completed",
  expired: "expired",
};

const DonationCard = forwardRef(function DonationCard({ 
  donation, 
  userLocation, 
  onManualLocate, 
  onClaim, 
  claiming = false,
  isClaimed = false,
  index = 0 
}, ref) {
  const isAvailable = donation.status === "available";
  const [distance, setDistance] = useState(null);

  // Auto-calculate distance if user location is available
  useEffect(() => {
    if (userLocation && donation.latitude && donation.longitude) {
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        donation.latitude,
        donation.longitude
      );
      setDistance(dist);
    }
  }, [userLocation, donation]);

  // AI Risk Logic
  const riskScore = (donation.risk_score !== null && donation.risk_score !== undefined) ? Math.round(donation.risk_score * 100) : null;
  let riskColor = "bg-slate-100 text-slate-700";
  let riskLabel = "Unknown";
  let riskBorder = "border-slate-200";

  if (riskScore !== null) {
      if (riskScore > 80) {
          riskColor = "bg-rose-50 text-rose-700";
          riskBorder = "border-rose-200";
          riskLabel = "Critical Risk";
      } else if (riskScore > 50) {
          riskColor = "bg-amber-50 text-amber-700";
          riskBorder = "border-amber-200";
          riskLabel = "High Risk";
      } else if (riskScore > 20) {
          riskColor = "bg-yellow-50 text-yellow-700";
          riskBorder = "border-yellow-200";
          riskLabel = "Medium Risk";
      } else {
          riskColor = "bg-emerald-50 text-emerald-700";
          riskBorder = "border-emerald-200";
          riskLabel = "Low Risk";
      }
  }

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:shadow-gray-200/50"
    >
      
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
        <div className="absolute top-4 right-4 shadow-sm z-10">
          <StatusBadge status={isClaimed ? "claimed" : (statusMap[donation.status] || "operational")} />
        </div>
        
        {/* Category Pill Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-700 backdrop-blur-md">
            {donation.category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4">
            <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                    {riskScore !== null && (
                        <span className={`inline-flex items-center rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${riskColor} ${riskBorder}`}>
                            AI: {riskLabel} ({riskScore}%)
                        </span>
                    )}
                </div>
                {/* Distance Badge */}
                {distance && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                      <MapPin size={10} /> {distance} km
                    </span>
                )}
            </div>
            
          <h2 className="line-clamp-1 text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
            {donation.title}
          </h2>
          <div className="mt-2 flex items-center justify-between gap-2 text-sm text-slate-500">
            <div className="flex items-center gap-2 truncate">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{donation.location}</span>
            </div>
            
            {!distance && donation.latitude && onManualLocate && (
               <button onClick={onManualLocate} className="text-xs text-emerald-600 font-bold hover:underline">
                 Calc Dist
               </button>
            )}
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
          {/* Pickup Window Line */}
          {donation.pickup_window_start && (
             <div className="col-span-2 flex flex-col gap-1 mt-2 p-2 bg-gray-50 rounded-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup Window</span>
                <div className="text-xs font-medium text-slate-700">
                   {new Date(donation.pickup_window_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(donation.pickup_window_end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
             </div>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-3">
          {onClaim && (
            <Button 
                onClick={() => onClaim(donation.id)}
                disabled={isClaimed || claiming}
                variant={isClaimed ? "secondary" : "default"}
                className="w-full justify-center"
            >
                {claiming ? "Processing..." : isClaimed ? "Waiting for Confirmation" : "Claim Donation"}
            </Button>
          )}

          <div className="flex gap-3">
            <Button 
                as={Link} 
                href={`/donations/${donation.id}`} 
                variant="outline"
                className="flex-1 justify-center"
            >
                View Details
            </Button>
            
            {/* Show quick arrow only if not using onClaim or if available */}
            {!onClaim && isAvailable && (
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
      </div>
    </motion.article>
  );
});

export default DonationCard;
