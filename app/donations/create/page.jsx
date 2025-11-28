"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, Calendar } from "lucide-react";
import Button from "@/components/Button";
// Removed external Input to fix the dark styling issue
import { useAuthContext } from "@/contexts/AuthProvider";
import api from "@/lib/api";

// --- Icons ---
const IconInfo = () => (
  <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconLogistics = () => (
  <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconMedia = () => (
  <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconUpload = () => (
  <svg className="h-8 w-8 text-teal-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);
const IconCheck = () => (
  <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconAlert = () => (
  <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// --- Internal Modern Components ---
// Replacing external Input to guarantee the clean look
const FormInput = ({ label, id, className, ...props }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
      {label}
    </label>
    <input
      id={id}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all duration-200"
      {...props}
    />
  </div>
);

const FormTextarea = ({ label, id, className, ...props }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
      {label}
    </label>
    <textarea
      id={id}
      rows={3}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 resize-none"
      {...props}
    />
  </div>
);

// --- Helpers ---
function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().slice(0, 16);
}

export default function CreateDonationPage() {
  const searchParams = useSearchParams();
  const donationId = searchParams.get("donationId");
  const isEditing = Boolean(donationId);

  const router = useRouter();
  const { user, token } = useAuthContext();
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [defaults, setDefaults] = useState(null);
  const [initializing, setInitializing] = useState(isEditing);

  // Availability duration state
  const [selectedDuration, setSelectedDuration] = useState(4); // Default 4 hours
  const [useCustomExpiry, setUseCustomExpiry] = useState(false);
  const [customExpiry, setCustomExpiry] = useState("");

  // Local state for live preview
  const [formValues, setFormValues] = useState({
    title: "",
    quantity_lbs: "",
    unit: "",
    location: "",
  });

  useEffect(() => {
    if (!isEditing) return;

    const fetchDonation = async () => {
      try {
        const data = await api.donations.get(donationId);
        const fetchedDefaults = {
          title: data.title,
          category: data.category,
          quantity_lbs: data.quantity_lbs,
          unit: data.unit,
          location: data.location,
          expiry_date: toDateTimeLocal(data.expiry_date),
          notes: data.notes || "",
        };
        setDefaults(fetchedDefaults);
        setCustomExpiry(toDateTimeLocal(data.expiry_date));
        setUseCustomExpiry(true); // When editing, use custom expiry
        setFormValues({
          title: data.title,
          quantity_lbs: data.quantity_lbs,
          unit: data.unit,
          location: data.location,
        });

        if (data.image_url) {
          setPreview(data.image_url);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setInitializing(false);
      }
    };

    fetchDonation();
  }, [isEditing, donationId]);

  const handlePreviewChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const formData = new FormData(event.currentTarget);

    // Calculate expiry_date based on duration or custom expiry
    let expiryDate;
    if (useCustomExpiry && customExpiry) {
      expiryDate = new Date(customExpiry).toISOString();
    } else {
      // Calculate expiry from current time + selected duration
      const now = new Date();
      expiryDate = new Date(now.getTime() + selectedDuration * 60 * 60 * 1000).toISOString();
    }

    // Set expiry_date in FormData
    formData.set("expiry_date", expiryDate);

    try {
      if (isEditing) {
        await api.donations.update(donationId, formData);
      } else {
        await api.donations.create(formData);
      }
      setStatus("success");
      setTimeout(() => {
        router.push("/donations");
      }, 1000);
    } catch (err) {
      setError(err.message || "Unable to save donation");
      setStatus("error");
    }
  };

  if (!token || user?.role !== "donor") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 bg-gray-50">
        <div className="flex max-w-md items-center gap-4 rounded-2xl border border-rose-100 bg-white p-8 text-rose-800 shadow-xl ring-1 ring-black/5">
          <div className="rounded-full bg-rose-50 p-3 ring-1 ring-rose-100">
            <IconAlert />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Access Denied</h3>
            <p className="text-sm text-gray-500 mt-1">Only authenticated donors can create donations.</p>
          </div>
        </div>
      </div>
    );
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Header Skeleton */}
          <div className="mb-10 animate-pulse">
            <div className="h-6 w-32 rounded-full bg-gray-200 mb-4" />
            <div className="h-10 w-96 rounded-lg bg-gray-200 mb-3" />
            <div className="h-6 w-64 rounded-lg bg-gray-200" />
          </div>

          {/* Form Skeleton */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6 animate-pulse">
              {/* Form Sections */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
                  <div className="h-6 w-40 rounded-lg bg-gray-200 mb-6" />
                  <div className="space-y-4">
                    <div className="h-12 rounded-xl bg-gray-100" />
                    <div className="h-12 rounded-xl bg-gray-100" />
                    {i === 2 && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-12 rounded-xl bg-gray-100" />
                          <div className="h-12 rounded-xl bg-gray-100" />
                        </div>
                        <div className="h-24 rounded-xl bg-gray-100" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-8 animate-pulse">
              <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
                <div className="h-6 w-32 rounded-lg bg-gray-200 mb-4" />
                <div className="h-64 rounded-2xl bg-gray-100" />
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
                <div className="h-40 rounded-xl bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-teal-50 to-transparent rounded-full blur-3xl opacity-60 -z-10" />

      <div className="mx-auto max-w-6xl z-10 relative">
        
        {/* Header */}
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${isEditing ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                {isEditing ? "Editing Mode" : "New Donation"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600">
                {isEditing ? "Update Listing" : "Log Surplus Food"}
              </span>
            </h1>
            <p className="mt-3 text-gray-500 max-w-2xl text-lg leading-relaxed">
              Provide details so verified NGOs can claim and distribute your food efficiently.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 items-start">
          
          {/* --- LEFT COLUMN: Form --- */}
          <div className="lg:col-span-2">
            <form
              id="donation-form"
              onSubmit={handleSubmit}
              className="relative space-y-8 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-gray-200 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {/* Submission Overlay */}
              {status === "submitting" && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-white/95 backdrop-blur-md transition-all duration-300">
                  <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-teal-600" />
                    </div>
                  </div>
                  <p className="mt-6 font-semibold text-teal-800 text-lg">Saving your donation...</p>
                  <p className="mt-2 text-sm text-gray-500">Please wait while we process your listing</p>
                </div>
              )}

              {/* Disable form inputs during submission */}
              {status === "submitting" && (
                <div className="absolute inset-0 z-10 cursor-not-allowed" />
              )}

              {/* Group 1: Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="p-1.5 bg-teal-50 rounded-lg">
                    <IconInfo />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
                </div>
                
                <div className="grid gap-6">
                  <FormInput
                    id="title"
                    name="title"
                    label="Donation Title"
                    required
                    defaultValue={defaults?.title}
                    onChange={handlePreviewChange}
                    placeholder="e.g. 50 Boxed Veg Meals"
                  />
                  
                  <div>
                    <FormInput
                      id="category"
                      name="category"
                      label="Category"
                      placeholder="e.g., Prepared meals, Produce, Bakery"
                      required
                      defaultValue={defaults?.category}
                    />
                    <p className="mt-2 text-xs text-gray-400 font-medium ml-1">
                      Tip: Categorizing correctly helps NGOs filter faster.
                    </p>
                  </div>
                </div>
              </div>

              {/* Group 2: Logistics */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="p-1.5 bg-teal-50 rounded-lg">
                    <IconLogistics />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Logistics</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <FormInput
                      id="quantity_lbs"
                      name="quantity_lbs"
                      label="Quantity"
                      type="number"
                      step="0.1"
                      required
                      defaultValue={defaults?.quantity_lbs}
                      onChange={handlePreviewChange}
                      placeholder="0.0"
                    />
                  </div>
                  
                  <div>
                    <FormInput
                      id="unit"
                      name="unit"
                      label="Unit"
                      placeholder="e.g. lbs, boxes, crates"
                      required
                      defaultValue={defaults?.unit}
                      onChange={handlePreviewChange}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <FormInput
                      id="location"
                      name="location"
                      label="Pickup Location"
                      placeholder="123 Main St, City, State"
                      required
                      defaultValue={defaults?.location}
                      onChange={handlePreviewChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
                      Availability Duration
                    </label>
                    
                    {!useCustomExpiry ? (
                      <>
                        {/* Quick Duration Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          {[2, 4, 6, 12].map((hours) => (
                            <button
                              key={hours}
                              type="button"
                              onClick={() => setSelectedDuration(hours)}
                              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                                selectedDuration === hours
                                  ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:bg-teal-50/50"
                              }`}
                            >
                              <Clock className={`h-5 w-5 ${selectedDuration === hours ? "text-teal-600" : "text-gray-400"}`} />
                              <span>{hours}h</span>
                            </button>
                          ))}
                        </div>

                        {/* Custom Expiry Toggle */}
                        <button
                          type="button"
                          onClick={() => setUseCustomExpiry(true)}
                          className="mb-4 flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                        >
                          <Calendar className="h-4 w-4" />
                          Set custom expiry date & time
                        </button>

                        {/* Calculated Expiry Display */}
                        <div className="rounded-lg bg-teal-50 border border-teal-200 p-3 mb-3">
                          <p className="text-xs font-medium text-teal-800 mb-1">
                            This donation will expire on:
                          </p>
                          <p className="text-sm font-semibold text-teal-900">
                            {new Date(Date.now() + selectedDuration * 60 * 60 * 1000).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Custom Expiry Input */}
                        <div className="mb-3">
                          <FormInput
                            id="custom_expiry"
                            name="custom_expiry"
                            label="Custom Expiry Date & Time"
                            type="datetime-local"
                            required={useCustomExpiry}
                            value={customExpiry}
                            onChange={(e) => setCustomExpiry(e.target.value)}
                            min={toDateTimeLocal(new Date())}
                          />
                        </div>

                        {/* Back to Quick Duration */}
                        <button
                          type="button"
                          onClick={() => {
                            setUseCustomExpiry(false);
                            setCustomExpiry("");
                          }}
                          className="mb-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
                        >
                          <Clock className="h-4 w-4" />
                          Use quick duration instead
                        </button>
                      </>
                    )}

                    {/* Hidden input for form submission (will be set in handleSubmit) */}
                    <input type="hidden" name="expiry_date" />

                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-xs text-orange-800 font-medium">
                       <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                       <span>After this time, your donation will automatically expire and will no longer be shown to NGOs.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Notes */}
              <div className="space-y-6 pt-4">
                 <FormTextarea
                  id="notes"
                  name="notes"
                  label="Additional Notes (Optional)"
                  placeholder="Gate codes, special handling instructions, allergens..."
                  defaultValue={defaults?.notes}
                />
              </div>

              {/* Action Area */}
              <div className="pt-8 border-t border-gray-100 flex items-center justify-end">
                 <Button 
                   type="submit" 
                   disabled={status === "submitting"} 
                   className="w-full md:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] py-3.5 px-8 text-base font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                 >
                   {status === "submitting" ? (
                     <span className="flex items-center gap-2">
                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                       {isEditing ? "Saving Changes..." : "Publishing..."}
                     </span>
                   ) : (
                     isEditing ? "Save Changes" : "Create Donation Listing"
                   )}
                 </Button>
              </div>

              {/* Messages */}
              {error && (
                <div className="animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 rounded-2xl bg-rose-50 p-5 text-rose-900 border border-rose-100">
                  <IconAlert />
                  <div>
                    <p className="font-bold">Something went wrong</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {status === "success" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 flex items-start gap-3 rounded-2xl bg-emerald-50 p-5 text-emerald-900 border border-emerald-100">
                  <IconCheck />
                  <div>
                    <p className="font-bold">Success!</p>
                    <p className="text-sm mt-1">Your donation has been listed. Redirecting to dashboard...</p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* --- RIGHT COLUMN: Preview & Media --- */}
          <div className="lg:col-span-1 space-y-8 sticky top-8">
            
            {/* 1. Upload Card */}
            <div className="rounded-3xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden">
               <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                 <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <IconMedia />
                 </div>
                 <h3 className="font-bold text-gray-900">Reference Photo</h3>
               </div>
               
               <div className="p-6">
                  <label 
                    htmlFor="image" 
                    className={`group relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ease-out
                      ${preview 
                        ? 'border-teal-500 bg-teal-50/20 scale-[1.01]' 
                        : 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50/30 hover:scale-[1.01]'
                      }`}
                  >
                    {preview ? (
                      <div className="relative h-full w-full p-2">
                        <Image
                          src={preview}
                          alt="Preview"
                          width={400}
                          height={300}
                          className="h-56 w-full rounded-xl object-cover shadow-sm"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl m-2 backdrop-blur-sm">
                          <p className="font-bold text-white flex items-center gap-2">
                            <IconUpload /> Replace
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center p-6 text-center transition-transform group-hover:scale-105">
                        <div className="rounded-full bg-teal-50 p-4 mb-3 text-teal-600 ring-4 ring-teal-50">
                          <IconUpload />
                        </div>
                        <p className="text-sm font-bold text-gray-700">Click to upload photo</p>
                        <p className="mt-1 text-xs text-gray-400">Supports JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="mt-4 text-center text-xs text-gray-400">
                    📸 Real photos build trust and speed up the claiming process.
                  </p>
               </div>
            </div>

            {/* 2. Live Preview Context */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between px-2 mb-3">
                 <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Mobile Preview</span>
                 <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              </div>

              {/* Mock App Card */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transform transition-all hover:shadow-md">
                 <div className="relative h-40 w-full bg-gray-100">
                    {preview ? (
                      <Image src={preview} alt="Card Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <span className="text-xs font-medium">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase text-teal-700 shadow-sm backdrop-blur-md">
                      Available
                    </div>
                 </div>
                 
                 <div className="p-4">
                    <div className="flex justify-between items-start">
                       <div>
                         <h4 className="font-bold text-gray-900 text-lg line-clamp-1">
                           {formValues.title || defaults?.title || "Untitled Donation"}
                         </h4>
                         <p className="text-sm text-gray-500 font-medium">
                           {formValues.quantity_lbs || defaults?.quantity_lbs || "0"} {formValues.unit || defaults?.unit || "units"}
                         </p>
                       </div>
                       <div className="rounded-lg bg-teal-50 p-2 text-teal-700">
                          <IconLogistics />
                       </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
                       <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       <span className="truncate max-w-[200px]">{formValues.location || defaults?.location || "No location set"}</span>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}