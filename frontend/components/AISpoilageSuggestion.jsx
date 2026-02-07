"use client";

import { useState } from "react";
import { Sparkles, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Button from "@/components/Button";
import api from "@/lib/api";

// ... (imports remain same)

/**
 * AI-Powered Food Spoilage Time Suggestion
 * Provides advisory spoilage estimates using Gemini AI
 * 
 * @param {string} foodType - Category of food (e.g. "Cooked")
 * @param {string} storage - Storage condition (e.g. "Refrigerated")
 * @param {string} title - Title of the donation for context
 * @param {function} onSuggestionAccept - Callback with (hours: number)
 */
export default function AISpoilageSuggestion({ foodType, storage, title, quantity, preparedAt, onSuggestionAccept }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState(null);

  const handleGetSuggestion = async () => {
    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const response = await api.ai.getSpoilageSuggestion({
        food_type: foodType,
        storage: storage,
        title: title || '',
        quantity: quantity || '',
        prepared_time: preparedAt ? new Date(preparedAt).toISOString() : new Date().toISOString(),
      });

      if (response.success) {
        setSuggestion(response.suggestion);
      } else {
        setError(response.error || "AI suggestion unavailable");
      }
    } catch (err) {
      setError("AI service unavailable. Please set expiry manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (suggestion && onSuggestionAccept) {
      onSuggestionAccept(suggestion.suggested_hours);
    }
  };

  const getRiskBadge = (riskLevel) => {
    const badges = {
      low: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Low Risk" },
      medium: { color: "bg-amber-100 text-amber-700", icon: Clock, label: "Medium Risk" },
      high: { color: "bg-rose-100 text-rose-700", icon: AlertCircle, label: "High Risk" },
    };

    const badge = badges[riskLevel] || badges.medium;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon className="h-3.5 w-3.5" />
        {badge.label.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 rounded-lg bg-indigo-100 p-2.5">
          <Sparkles className="h-5 w-5 text-indigo-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              AI Spoilage Estimator
            </h3>
            {suggestion && getRiskBadge(suggestion.risk_level)}
          </div>
          
          <p className="mt-1 text-xs text-slate-500">
            Get a smart suggestion based on food safety guidelines.
          </p>

          {!suggestion && !error && (
            <Button
              onClick={handleGetSuggestion}
              disabled={loading || !foodType || !storage}
              size="sm"
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md shadow-indigo-200"
            >
              {loading ? "Analyzing..." : "Get AI Suggestion"}
            </Button>
          )}

          {error && (
            <div className="mt-3 rounded-lg bg-rose-50 border border-rose-100 p-3">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertCircle className="h-4 w-4" />
                <p className="text-xs font-medium">{error}</p>
              </div>
              <Button
                onClick={handleGetSuggestion}
                disabled={loading}
                size="sm"
                variant="ghost"
                className="mt-2 text-rose-600 hover:text-rose-800 hover:bg-rose-100 h-8 px-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {suggestion && (
            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="rounded-lg bg-white border border-indigo-50 p-4 shadow-sm">
                <p className="text-sm text-slate-900 font-medium mb-1">
                  Suggested pickup within: <span className="text-indigo-700 font-bold">{suggestion.suggested_hours} hours</span>
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {suggestion.explanation}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleAccept} 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-sm"
                >
                  Accept Suggestion
                </Button>
                <Button
                  onClick={() => setSuggestion(null)}
                  size="sm"
                  variant="ghost"
                  className="text-slate-500 hover:text-slate-700"
                >
                  Modify Manually
                </Button>
              </div>
              
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                 <AlertCircle className="h-3 w-3" />
                 <span>Advisory only. You are responsible for final safety checks.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
