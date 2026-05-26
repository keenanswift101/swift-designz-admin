import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import DeleteInvestorButton from "@/components/investors/DeleteInvestorButton";
import ContributionForm from "@/components/investors/ContributionForm";
import PrintInvestorStatementButton from "@/components/statements/PrintInvestorStatementButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { Edit, DollarSign, FileText, ExternalLink } from "lucide-react";
import { addContributionAction } from "../actions";
import type { Investor, IncomeEntry, Document as DocType } from "@/types/database";

interface InvestorOnboardingAcceptance {
  termsAcceptedAt: string | null;
  ndaAcceptedAt: string | null;
}

async function getInvestorOnboardingAcceptance(email: string | null): Promise<InvestorOnboardingAcceptance> {
  if (!email) return { termsAcceptedAt: null, ndaAcceptedAt: null };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!profile?.id) {
    return { termsAcceptedAt: null, ndaAcceptedAt: null };
  }

  const { data, error } = await admin.auth.admin.getUserById(profile.id);
  if (error || !data.user) {
    return { termsAcceptedAt: null, ndaAcceptedAt: null };
  }

  const metadata = data.user.user_metadata as Record<string, unknown> | null;
  const termsAcceptedAt = typeof metadata?.investor_terms_accepted_at === "string"
    ? metadata.investor_terms_accepted_at
    : null;
  const ndaAcceptedAt = typeof metadata?.investor_nda_accepted_at === "string"
    ? metadata.investor_nda_accepted_at
    : null;

  return { termsAcceptedAt, ndaAcceptedAt };
}

export default async function InvestorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: investorRaw },
    { data: contributionsRaw },
    { data: documentsRaw },
  ] = await Promise.all([
    supabase.from("investors").select("*").eq("id", id).single(),
    supabase
      .from("income_entries")
      .select("*")
      .eq("source", "investor")
      .eq("investor_id", id)
      .order("date", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("investor_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const investor = investorRaw as Investor | null;
  if (!investor) notFound();

  const contributions = (contributionsRaw || []) as IncomeEntry[];
  const documents = (documentsRaw || []) as DocType[];
  const onboardingAcceptance = await getInvestorOnboardingAcceptance(investor.email);

  const totalContributed = contributions.reduce((s, c) => s + c.amount, 0);
  const acceptedOn = onboardingAcceptance.termsAcceptedAt || onboardingAcceptance.ndaAcceptedAt;

  async function contributionAction(formData: FormData) {
    "use server";
    return addContributionAction(id, formData);
  }

  return (
    <>
      <PageHeader
        title={investor.name}
        description={investor.company || investor.email || "Investor"}
        backHref="/investors"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/investors/${id}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground border border-border hover:border-teal rounded-lg transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>
            <DeleteInvestorButton id={id} />
            <PrintInvestorStatementButton investorId={id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — details + contributions + documents */}
        <div className="lg:col-span-2 space-y-6">

          {/* Investor Details */}
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Investor Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {investor.email && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Email</dt>
                  <dd className="text-sm text-foreground">
                    <a href={`mailto:${investor.email}`} className="hover:text-teal transition-colors">{investor.email}</a>
                  </dd>
                </div>
              )}
              {investor.phone && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Phone</dt>
                  <dd className="text-sm text-foreground">{investor.phone}</dd>
                </div>
              )}
              {investor.company && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Company</dt>
                  <dd className="text-sm text-foreground">{investor.company}</dd>
                </div>
              )}
              {investor.agreement_date && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Agreement Date</dt>
                  <dd className="text-sm text-foreground">{formatDate(investor.agreement_date)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500 mb-1">Status</dt>
                <dd><StatusBadge status={investor.status} /></dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Since</dt>
                <dd className="text-sm text-foreground">{formatDate(investor.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Accepted On</dt>
                <dd className="text-sm text-foreground">
                  {acceptedOn ? formatDate(acceptedOn) : "Not accepted yet"}
                </dd>
              </div>
            </dl>
            {investor.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <dt className="text-xs text-gray-500 mb-1">Notes</dt>
                <dd className="text-sm text-foreground/60 whitespace-pre-wrap">{investor.notes}</dd>
              </div>
            )}
          </div>

          {/* Contributions */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-teal" />
                Contributions
              </h2>
            </div>

            {/* Add Contribution Form */}
            <div className="px-6 py-4 border-b border-border bg-sidebar">
              <ContributionForm action={contributionAction} />
            </div>

            {contributions.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-gray-500">No contributions recorded yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contributions.map((c) => (
                    <tr key={c.id} className="hover:bg-card transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-400">{formatDate(c.date)}</td>
                      <td className="px-6 py-3 text-sm text-foreground">{c.description}</td>
                      <td className="px-6 py-3 text-sm text-green-400 font-medium text-right">{formatCurrency(c.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Documents */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-teal" />
                Documents
              </h2>
            </div>
            {documents.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-gray-500">No documents linked to this investor.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-card transition-colors">
                      <td className="px-6 py-3 text-sm text-foreground">{doc.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-400 capitalize">{doc.type.replace(/_/g, " ")}</td>
                      <td className="px-6 py-3 text-sm text-gray-400">{formatDate(doc.created_at)}</td>
                      <td className="px-6 py-3">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal hover:underline text-sm flex items-center gap-1"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column — financial summary */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Financial Summary</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-gray-500 mb-1">Investment Commitment</dt>
                <dd className="text-lg font-semibold text-foreground">{formatCurrency(investor.investment_amount)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Total Contributed</dt>
                <dd className="text-lg font-semibold text-green-400">{formatCurrency(totalContributed)}</dd>
              </div>
              {investor.investment_amount > 0 && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Remaining</dt>
                  <dd className={`text-lg font-semibold ${investor.investment_amount - totalContributed > 0 ? "text-yellow-400" : "text-green-400"}`}>
                    {formatCurrency(Math.max(0, investor.investment_amount - totalContributed))}
                  </dd>
                </div>
              )}
              {investor.equity_percentage && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Equity Stake</dt>
                  <dd className="text-lg font-semibold text-teal">{investor.equity_percentage}%</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500 mb-1">Contributions</dt>
                <dd className="text-lg font-semibold text-foreground">{contributions.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
