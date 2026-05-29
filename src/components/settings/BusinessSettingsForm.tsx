"use client";

import { useActionState, useEffect } from "react";
import type { BusinessSettings } from "@/types/database";
import { useToast } from "@/components/ui/ToastProvider";

interface BusinessSettingsFormProps {
  settings: BusinessSettings;
  action: (formData: FormData) => Promise<{ error: string } | undefined>;
}

export default function BusinessSettingsForm({ settings, action }: BusinessSettingsFormProps) {
  const toast = useToast();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      const result = await action(formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Settings saved!");
      return result;
    },
    undefined,
  );
  useEffect(() => { if (pending) toast.loading("Saving settings..."); }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Company Info */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Company Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company_name" className="block text-xs text-gray-500 mb-1">Company Name</label>
            <input id="company_name" name="company_name" type="text" defaultValue={settings.company_name}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
          <div>
            <label htmlFor="tagline" className="block text-xs text-gray-500 mb-1">Tagline</label>
            <input id="tagline" name="tagline" type="text" defaultValue={settings.tagline || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs text-gray-500 mb-1">Email</label>
            <input id="email" name="email" type="email" defaultValue={settings.email || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-xs text-gray-500 mb-1">Phone</label>
            <input id="phone" name="phone" type="text" defaultValue={settings.phone || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="website" className="block text-xs text-gray-500 mb-1">Website</label>
            <input id="website" name="website" type="url" defaultValue={settings.website || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-xs text-gray-500 mb-1">Street Address</label>
            <input id="address" name="address" type="text" defaultValue={settings.address || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
          <div>
            <label htmlFor="city" className="block text-xs text-gray-500 mb-1">City</label>
            <input id="city" name="city" type="text" defaultValue={settings.city || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
          <div>
            <label htmlFor="country" className="block text-xs text-gray-500 mb-1">Country</label>
            <input id="country" name="country" type="text" defaultValue={settings.country || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
        </div>
      </div>

      {/* Registration */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Registration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vat_number" className="block text-xs text-gray-500 mb-1">NamRA Tax No (TIN)</label>
            <input id="vat_number" name="vat_number" type="text" defaultValue={settings.vat_number || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
          <div>
            <label htmlFor="registration_number" className="block text-xs text-gray-500 mb-1">CC Registration No</label>
            <input id="registration_number" name="registration_number" type="text" defaultValue={settings.registration_number || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
          <div>
            <label htmlFor="registration_date" className="block text-xs text-gray-500 mb-1">Registration Date</label>
            <input id="registration_date" name="registration_date" type="date" defaultValue={settings.registration_date || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="directors" className="block text-xs text-gray-500 mb-1">Directors / Members</label>
            <textarea id="directors" name="directors" rows={2} defaultValue={settings.directors || ""}
              placeholder="e.g. Jane Smith, John Doe"
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal resize-none" />
            <p className="text-xs text-gray-600 mt-1">Comma-separated names of company directors or members</p>
          </div>
        </div>
      </div>

      {/* Banking */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Banking Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="bank_name" className="block text-xs text-gray-500 mb-1">Bank Name</label>
            <input id="bank_name" name="bank_name" type="text" defaultValue={settings.bank_name || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
          <div>
            <label htmlFor="bank_account_number" className="block text-xs text-gray-500 mb-1">Account Number</label>
            <input id="bank_account_number" name="bank_account_number" type="text" defaultValue={settings.bank_account_number || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
          <div>
            <label htmlFor="bank_branch_code" className="block text-xs text-gray-500 mb-1">Branch Code</label>
            <input id="bank_branch_code" name="bank_branch_code" type="text" defaultValue={settings.bank_branch_code || ""}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-teal" />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-teal hover:bg-teal-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {pending ? "Saving..." : "Save Business Settings"}
        </button>
      </div>
    </form>
  );
}
