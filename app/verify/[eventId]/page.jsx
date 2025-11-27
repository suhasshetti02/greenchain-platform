"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import api from "@/lib/api";

export default function VerifyPage({ params }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await api.verify.get(params.eventId);
        setEvent(data);
        setVerified(data.verified || false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.eventId]);

  const handleVerify = async () => {
    setVerifying(true);
    setError(null);
    try {
      const dataHash = `0x${Math.random().toString(16).slice(2)}`;
      const response = await api.verify.verify(
        params.eventId,
        dataHash,
        "Verified on-site"
      );
      setMessage(response.message);
      setVerified(true);
      setEvent({ ...event, verified: true, txHash: response.txHash });
    } catch (err) {
      setError(err.message || "Unable to verify");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="h-10 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  if (!event) return notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
            Verify Event
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {event.donation?.title || "Donation"}
          </h1>
          <p className="text-sm text-slate-500">
            {event.eventType === "delivery" ? "Delivery" : "Pickup"} •{" "}
            {new Date(event.scheduledFor).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={verified ? "operational" : "delayed"} />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Verification Code
        </p>
        <p className="mt-3 text-3xl font-semibold tracking-[0.2em] text-slate-900 dark:text-white">
          {event.eventId}
        </p>
        <p className="mt-2 text-slate-500">
          {event.donation?.category || "Food donation"}
        </p>
      </div>

      {event.donation && (
        <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Quantity
            </p>
            <p className="mt-2 font-semibold text-slate-900 dark:text-white">
            {event.donation.quantity_lbs} {event.donation.unit || "lbs"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Status
            </p>
            <p className="mt-2 font-semibold text-slate-900 dark:text-white">
              {event.donation.status}
            </p>
          </div>
        </div>
      )}

      {event.txHash && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm dark:border-emerald-800/50 dark:bg-emerald-900/20">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-400">
            Transaction Hash
          </p>
          <p className="mt-2 break-all font-mono text-emerald-900 dark:text-emerald-200">
            {event.txHash}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="w-full"
          variant={verified ? "secondary" : "primary"}
          disabled={verifying || verified}
          onClick={handleVerify}
        >
          {verifying
            ? "Verifying..."
            : verified
              ? "Event Verified"
              : "Confirm Verification"}
        </Button>
      </div>

      {message && (
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="text-sm font-medium text-rose-500 dark:text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

