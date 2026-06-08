"use client";

import { useState } from "react";
import { Inbox, Loader2, CheckCircle, AlertTriangle, ChevronDown, MailSearch, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OpenInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  outstanding: number;
  client: string;
}

interface ScanResult {
  emailId: string;
  subject: string;
  from: string;
  receivedAt: string;
  parsed: {
    amountCents: number | null;
    reference: string | null;
    date: string | null;
  };
  matchedInvoice: OpenInvoice | null;
  confidence: "high" | "medium" | "low" | "none";
  allOpenInvoices: OpenInvoice[];
}

const CONFIDENCE_STYLES = {
  high:   "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low:    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  none:   "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const CONFIDENCE_LABELS = {
  high: "High — invoice ref matched",
  medium: "Medium — amount matched",
  low: "Low — approximate match",
  none: "No match found",
};

export default function InboxScanTab() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[] | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Record<string, { type: "success" | "warning" | "error"; text: string }>>({});

  // Per-row overrides (user can change parsed values before approving)
  const [overrides, setOverrides] = useState<Record<string, {
    invoiceId: string;
    amountCents: number;
    paidAt: string;
    reference: string;
  }>>({});

  async function scan() {
    setScanning(true);
    setScanError(null);
    setResults(null);
    setApproved(new Set());
    setSkipped(new Set());
    setMessages({});
    try {
      const res = await fetch("/api/inbox-scan");
      const data = await res.json();
      if (data.error) { setScanError(data.error); return; }
      setResults(data.results ?? []);
      setScannedCount(data.scannedCount ?? 0);

      // Pre-populate overrides from parsed data
      const init: typeof overrides = {};
      for (const r of data.results ?? []) {
        init[r.emailId] = {
          invoiceId: r.matchedInvoice?.id ?? "",
          amountCents: r.parsed.amountCents ?? 0,
          paidAt: r.parsed.date ?? "",
          reference: r.parsed.reference ?? "",
        };
      }
      setOverrides(init);
    } catch (e) {
      setScanError((e as Error).message);
    } finally {
      setScanning(false);
    }
  }

  async function approve(result: ScanResult) {
    const ov = overrides[result.emailId];
    if (!ov.invoiceId) { alert("Please select an invoice before approving."); return; }
    if (!ov.amountCents || ov.amountCents <= 0) { alert("Please enter a valid amount."); return; }
    if (!ov.paidAt) { alert("Please enter the payment date."); return; }

    setApproving(result.emailId);
    try {
      const res = await fetch("/api/inbox-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: ov.invoiceId,
          amountCents: ov.amountCents,
          paidAt: ov.paidAt,
          reference: ov.reference || null,
          emailId: result.emailId,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((m) => ({ ...m, [result.emailId]: { type: "error", text: data.error } }));
      } else {
        setApproved((s) => new Set([...s, result.emailId]));
        setMessages((m) => ({
          ...m,
          [result.emailId]: {
            type: data.warning ? "warning" : "success",
            text: data.warning ?? "Payment recorded and receipt sent.",
          },
        }));
      }
    } catch (e) {
      setMessages((m) => ({ ...m, [result.emailId]: { type: "error", text: (e as Error).message } }));
    } finally {
      setApproving(null);
    }
  }

  function skip(emailId: string) {
    setSkipped((s) => new Set([...s, emailId]));
  }

  function updateOverride(emailId: string, field: string, value: string | number) {
    setOverrides((o) => ({ ...o, [emailId]: { ...o[emailId], [field]: value } }));
  }

  const active = results?.filter((r) => !approved.has(r.emailId) && !skipped.has(r.emailId)) ?? [];
  const done = results?.filter((r) => approved.has(r.emailId) || skipped.has(r.emailId)) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-teal/10 border border-teal/20">
            <MailSearch className="h-6 w-6 text-teal" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Inbox Payment Scanner</h2>
            <p className="text-sm text-gray-500 mt-1">
              Scans your Gmail inbox for proof-of-payment emails, extracts amounts, and matches them to open invoices.
              You review and approve — the agent records the payment and sends the receipt automatically.
            </p>
            <p className="text-xs text-amber-400 mt-2">
              Emails from today are excluded. Only invoices with status sent, partial, or overdue are matched.
            </p>
          </div>
        </div>
        <button
          onClick={scan}
          disabled={scanning}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-medium hover:bg-teal/80 transition-colors disabled:opacity-50"
        >
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Inbox className="h-4 w-4" />}
          {scanning ? "Scanning..." : "Scan Inbox"}
        </button>
      </div>

      {scanError && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" />
            {scanError}
          </p>
        </div>
      )}

      {results !== null && (
        <div className="text-xs text-gray-500 px-1">
          Scanned {scannedCount} email{scannedCount !== 1 ? "s" : ""} — {results.length} proof of payment{results.length !== 1 ? "s" : ""} found
          {active.length > 0 && `, ${active.length} pending review`}
        </div>
      )}

      {/* Active results */}
      {active.map((r) => {
        const ov = overrides[r.emailId] ?? {};
        const busy = approving === r.emailId;
        const msg = messages[r.emailId];

        return (
          <div key={r.emailId} className="glass-card overflow-hidden">
            {/* Email header */}
            <div className="px-5 py-4 border-b border-border/50 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{r.subject}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.from} · {r.receivedAt}</p>
              </div>
              <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${CONFIDENCE_STYLES[r.confidence]}`}>
                {CONFIDENCE_LABELS[r.confidence]}
              </span>
            </div>

            {/* Editable fields */}
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Invoice selector */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Invoice</label>
                <div className="relative">
                  <select
                    value={ov.invoiceId ?? ""}
                    onChange={(e) => updateOverride(r.emailId, "invoiceId", e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="w-full appearance-none rounded-lg bg-[#1a1a1a] border border-border px-3 py-2 text-xs text-foreground pr-7"
                  >
                    <option value="">— select invoice —</option>
                    {r.allOpenInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoice_number} · {inv.client} · {formatCurrency(inv.amount - inv.paid_amount)} outstanding
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Amount (N$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ov.amountCents ? (ov.amountCents / 100).toFixed(2) : ""}
                  onChange={(e) => updateOverride(r.emailId, "amountCents", Math.round(parseFloat(e.target.value) * 100) || 0)}
                  placeholder="0.00"
                  className="w-full rounded-lg bg-white/5 border border-border px-3 py-2 text-xs text-foreground"
                />
              </div>

              {/* Payment date */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={ov.paidAt ?? ""}
                  onChange={(e) => updateOverride(r.emailId, "paidAt", e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-border px-3 py-2 text-xs text-foreground"
                />
              </div>

              {/* Reference */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reference</label>
                <input
                  type="text"
                  value={ov.reference ?? ""}
                  onChange={(e) => updateOverride(r.emailId, "reference", e.target.value)}
                  placeholder="Bank ref or invoice no."
                  className="w-full rounded-lg bg-white/5 border border-border px-3 py-2 text-xs text-foreground"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 flex items-center gap-3">
              <button
                onClick={() => approve(r)}
                disabled={busy || !ov.invoiceId || !ov.amountCents || !ov.paidAt}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal text-white text-xs font-medium hover:bg-teal/80 transition-colors disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                Approve &amp; Record
              </button>
              <button
                onClick={() => skip(r.emailId)}
                disabled={busy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-foreground border border-border/50 hover:border-border transition-colors disabled:opacity-50"
              >
                Skip
              </button>
              {msg && (
                <p className={`text-xs flex items-center gap-1.5 ${msg.type === "error" ? "text-red-400" : msg.type === "warning" ? "text-amber-400" : "text-green-400"}`}>
                  {msg.type === "error" ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                  {msg.text}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Done rows */}
      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wider px-1">Completed</p>
          {done.map((r) => {
            const msg = messages[r.emailId];
            const wasApproved = approved.has(r.emailId);
            return (
              <div key={r.emailId} className="glass-card px-5 py-3 flex items-center justify-between opacity-60">
                <div>
                  <p className="text-xs text-foreground truncate max-w-sm">{r.subject}</p>
                  <p className="text-xs text-gray-500">{r.from} · {r.receivedAt}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {wasApproved
                    ? <><CheckCircle className="h-3.5 w-3.5 text-green-400" /><span className="text-green-400">{msg?.text ?? "Recorded"}</span></>
                    : <><AlertTriangle className="h-3.5 w-3.5 text-gray-500" /><span className="text-gray-500">Skipped</span></>
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}

      {results?.length === 0 && (
        <div className="glass-card p-10 text-center">
          <MailSearch className="h-8 w-8 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No proof of payment emails found in the last 60 days.</p>
          <p className="text-xs text-gray-600 mt-1">Check that clients are emailing proofs to your inbox and that the email contains a PDF attachment.</p>
        </div>
      )}
    </div>
  );
}
