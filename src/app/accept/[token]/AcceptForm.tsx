"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

interface AcceptFormProps {
  token: string;
  clientName: string;
}

export default function AcceptForm({ token, clientName }: AcceptFormProps) {
  const [name, setName] = useState(clientName);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (!name.trim()) {
      setError("Please enter your full name to accept this quotation.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/accept/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setAccepted(true);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (accepted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="h-16 w-16 rounded-full bg-teal/20 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-teal" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold text-foreground">Quotation Accepted</p>
          <p className="text-sm text-gray-400">
            Thank you, <strong className="text-foreground">{name}</strong>. We&apos;ll be in touch shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <p className="text-sm text-gray-400">
        By accepting this quotation you confirm you have read and agree to the terms set out above.
      </p>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Your full name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal/50"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-teal hover:bg-teal/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg px-4 py-3 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Accept Quotation"
        )}
      </button>
    </div>
  );
}
