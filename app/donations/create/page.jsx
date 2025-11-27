"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { useAuthContext } from "@/contexts/AuthProvider";
import api from "@/lib/api";

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

  useEffect(() => {
    if (!isEditing) return;

    const fetchDonation = async () => {
      try {
        const data = await api.donations.get(donationId);
        setDefaults({
          title: data.title,
          category: data.category,
          quantity_lbs: data.quantity_lbs,
          unit: data.unit,
          location: data.location,
          expiry_date: toDateTimeLocal(data.expiry_date),
          notes: data.notes || "",
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

  if (!token || user?.role !== "donor") {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
        Only authenticated donors can create donations.
      </div>
    );
  }

  if (initializing) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="h-6 w-1/3 rounded-2xl bg-slate-200" />
        <div className="mt-4 h-64 rounded-3xl bg-slate-100" />
      </div>
    );
  }

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

  return (
    <div className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
          {isEditing ? "Update donation" : "Donation Intake"}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {isEditing ? "Update listing" : "Log surplus food"}
        </h1>
        <p className="text-sm text-slate-500">
          Capture food details and attach a reference photo.
        </p>
      </div>

      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={handleSubmit}
        aria-live="polite"
      >
        <Input
          id="title"
          name="title"
          label="Donation Title"
          required
          defaultValue={defaults?.title}
        />
        <Input
          id="category"
          name="category"
          label="Category"
          placeholder="e.g., Prepared meals"
          required
          defaultValue={defaults?.category}
        />
        <Input
          id="quantity_lbs"
          name="quantity_lbs"
          label="Quantity"
          type="number"
          step="0.1"
          required
          defaultValue={defaults?.quantity_lbs}
        />
        <Input
          id="unit"
          name="unit"
          label="Unit"
          placeholder="lbs"
          required
          defaultValue={defaults?.unit}
        />
        <Input
          id="location"
          name="location"
          label="Pickup Location"
          placeholder="123 Main St, City, State"
          required
          defaultValue={defaults?.location}
        />
        <Input
          id="expiry_date"
          name="expiry_date"
          label="Expiry Date & Time"
          type="datetime-local"
          required
          defaultValue={defaults?.expiry_date}
        />
        <div className="md:col-span-2">
          <Input
            id="notes"
            name="notes"
            label="Notes (optional)"
            placeholder="Any additional details about the donation"
            defaultValue={defaults?.notes}
          />
        </div>
        <div className="md:col-span-2">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="image"
          >
            Reference Photo
          </label>
          <input
            id="image"
            className="mt-2 w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-500 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-white"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
          />
          <p className="mt-2 text-xs text-slate-500">
            Upload a photo so recipients can verify the donation.
          </p>
        </div>
        <div className="md:col-span-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            {preview && (
              <Image
                src={preview}
                alt="Donation preview"
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            )}
            <p className="text-sm text-slate-500">
              {preview ? "Ready to upload" : "No image selected"}
            </p>
          </div>
          <Button type="submit" disabled={status === "submitting"}>
            {status === "submitting"
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Donation"}
          </Button>
        </div>
      </form>

      {error && (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {status === "success" && (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          role="status"
        >
          {isEditing
            ? "Donation updated! Redirecting..."
            : "Donation created successfully! Redirecting..."}
        </div>
      )}
    </div>
  );
}

