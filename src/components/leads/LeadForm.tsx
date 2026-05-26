"use client";

import { useRef, useState } from "react";
import type { Lead, LeadSource, LeadStatus } from "@/types/database";
import { useToast } from "@/components/ui/ToastProvider";

const SOURCES: { value: LeadSource; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "quote_form", label: "Quote Form" },
  { value: "contact_form", label: "Contact Form" },
];

const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

interface Props {
  lead?: Lead;
  action: (formData: FormData) => Promise<{ error: string } | void>;
  submitLabel: string;
}

const inputClass =
  "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5";

export default function LeadForm({ lead, action, submitLabel }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    toast.loading(lead ? "Saving changes..." : "Creating lead...");
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
      setPending(false);
    } else {
      toast.success(lead ? "Lead updated!" : "Lead created!");
    }
  }

  return (
    <form ref={formRef} onSubmit={(e) => { e.preventDefault(); void handleSubmit(new FormData(e.currentTarget)); }} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Core info */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className={labelClass}>Name *</label>
            <input id="name" name="name" type="text" required defaultValue={lead?.name ?? ""} className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Email *</label>
            <input id="email" name="email" type="email" required defaultValue={lead?.email ?? ""} className={inputClass} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>Phone</label>
            <input id="phone" name="phone" type="text" defaultValue={lead?.phone ?? ""} className={inputClass} />
          </div>
          <div>
            <label htmlFor="company" className={labelClass}>Company</label>
            <input id="company" name="company" type="text" defaultValue={lead?.company ?? ""} className={inputClass} />
          </div>
          <div>
            <label htmlFor="location" className={labelClass}>Location</label>
            <input id="location" name="location" type="text" defaultValue={lead?.location ?? ""} className={inputClass} />
          </div>
          <div>
            <label htmlFor="source" className={labelClass}>Source</label>
            <select id="source" name="source" defaultValue={lead?.source ?? "manual"} className={inputClass}>
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status (edit only) */}
      {lead && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Status</h3>
          <div className="max-w-xs">
            <label htmlFor="status" className={labelClass}>Lead Status</label>
            <select id="status" name="status" defaultValue={lead.status} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Project details */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Project Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="service" className={labelClass}>Service</label>
            <input id="service" name="service" type="text" defaultValue={lead?.service ?? ""} placeholder="e.g. Website, E-Commerce, App" className={inputClass} />
          </div>
          <div>
            <label htmlFor="package" className={labelClass}>Package</label>
            <input id="package" name="package" type="text" defaultValue={lead?.package ?? ""} placeholder="e.g. Starter, Professional, Premium" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="scope" className={labelClass}>Scope</label>
            <textarea id="scope" name="scope" rows={3} defaultValue={lead?.scope ?? ""} placeholder="Brief description of what they need" className={inputClass + " resize-none"} />
          </div>
          <div>
            <label htmlFor="timeline" className={labelClass}>Timeline</label>
            <input id="timeline" name="timeline" type="text" defaultValue={lead?.timeline ?? ""} placeholder="e.g. 2 weeks, 1 month" className={inputClass} />
          </div>
          <div>
            <label htmlFor="budget" className={labelClass}>Budget</label>
            <input id="budget" name="budget" type="text" defaultValue={lead?.budget ?? ""} placeholder="e.g. R5,000 - R10,000" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Message & notes */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Additional Info</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="message" className={labelClass}>Message</label>
            <textarea id="message" name="message" rows={4} defaultValue={lead?.message ?? ""} placeholder="Client's original message" className={inputClass + " resize-none"} />
          </div>
          <div>
            <label htmlFor="notes" className={labelClass}>Internal Notes</label>
            <textarea id="notes" name="notes" rows={3} defaultValue={lead?.notes ?? ""} placeholder="Your internal notes about this lead" className={inputClass + " resize-none"} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-teal hover:bg-teal-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        <a
          href={lead ? `/leads/${lead.id}` : "/leads"}
          className="px-6 py-2.5 bg-border hover:bg-dark-gray text-foreground/60 text-sm font-medium rounded-lg border border-border transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
