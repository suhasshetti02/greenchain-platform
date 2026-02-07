"use client";

import { useEffect, useState } from "react";
import { MapPin, X } from "lucide-react";
import Button from "./Button";

export default function LocationPermissionModal({ isOpen, onClose, onAllow, onManual }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-200 animate-in zoom-in-95 duration-200">
        
        {/* Header Image/Icon */}
        <div className="bg-emerald-50 p-6 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 ring-8 ring-emerald-50">
               <MapPin className="h-10 w-10" />
            </div>
        </div>

        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">Enable Location Services?</h2>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
             GreenChain uses your location to show donations near you and calculate pickup distances. 
             This helps optimize logistics and reduce food travel time.
          </p>
          <p className="mt-2 text-xs text-gray-400">
              Your exact address is not shared with donors until you claim a donation.
          </p>

          <div className="mt-8 flex flex-col gap-3">
             <Button 
                onClick={onAllow}
                className="w-full justify-center bg-emerald-600 text-white hover:bg-emerald-700 py-3 text-base shadow-lg shadow-emerald-200"
             >
                Allow Location Access
             </Button>
             
             <button 
                onClick={onManual}
                className="w-full py-3 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
            >
                Enter Location Manually
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
