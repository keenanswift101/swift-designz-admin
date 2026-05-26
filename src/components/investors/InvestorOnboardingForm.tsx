"use client";

import { useActionState } from "react";

interface InvestorOnboardingFormProps {
  action: (formData: FormData) => Promise<{ error: string } | undefined>;
}

export default function InvestorOnboardingForm({ action }: InvestorOnboardingFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      const result = await action(formData);
      return result ?? undefined;
    },
    undefined,
  );

  return (
    <form action={formAction} className="glass-card p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Investor Onboarding</h1>
        <p className="text-sm text-gray-400 mt-1.5">
          Before entering the portal, please review and accept the required legal documents.
        </p>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{state.error}</div>
      )}

      <div className="space-y-3">
        <a
          href="/docs/investor-terms-and-conditions.html"
          target="_blank"
          rel="noreferrer"
          className="block p-3 rounded-lg border border-border bg-card hover:border-teal text-sm text-foreground/60 hover:text-teal transition-colors"
        >
          Read Investor Terms and Conditions
        </a>
        <a
          href="/docs/investor-nda.html"
          target="_blank"
          rel="noreferrer"
          className="block p-3 rounded-lg border border-border bg-card hover:border-teal text-sm text-foreground/60 hover:text-teal transition-colors"
        >
          Read Investor Non-Disclosure Agreement (NDA)
        </a>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm text-foreground/60">
          <input
            type="checkbox"
            name="accept_terms"
            required
            className="mt-0.5 h-4 w-4 rounded border-border bg-card text-teal focus:ring-teal"
          />
          <span>I have read and accept the Investor Terms and Conditions.</span>
        </label>

        <label className="flex items-start gap-3 text-sm text-foreground/60">
          <input
            type="checkbox"
            name="accept_nda"
            required
            className="mt-0.5 h-4 w-4 rounded border-border bg-card text-teal focus:ring-teal"
          />
          <span>I have read and accept the Investor Non-Disclosure Agreement (NDA).</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto px-5 py-2.5 bg-teal hover:bg-teal-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {pending ? "Saving..." : "Accept and Continue"}
      </button>
    </form>
  );
}
