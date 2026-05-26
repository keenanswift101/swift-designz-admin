import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import LeadTimeline from "@/components/leads/LeadTimeline";
import ConvertToClientButton from "@/components/leads/ConvertToClientButton";
import DeleteLeadButton from "@/components/leads/DeleteLeadButton";
import type { Lead, LeadNote } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: lead },
    { data: notes },
    { data: linkedClient },
  ] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase
      .from("lead_notes")
      .select("*, profiles:author_id(full_name)")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").eq("lead_id", id).maybeSingle(),
  ]);

  if (!lead) notFound();

  const typedLead = lead as Lead;
  const typedNotes = (notes ?? []) as (LeadNote & { profiles: { full_name: string } | null })[];

  const details = [
    { label: "Email", value: typedLead.email },
    { label: "Phone", value: typedLead.phone },
    { label: "Company", value: typedLead.company },
    { label: "Location", value: typedLead.location },
    { label: "Source", value: typedLead.source?.replace(/_/g, " ") },
    { label: "Service", value: typedLead.service },
    { label: "Package", value: typedLead.package },
    { label: "Scope", value: typedLead.scope },
    { label: "Timeline", value: typedLead.timeline },
    { label: "Budget", value: typedLead.budget },
    { label: "Submitted", value: formatDate(typedLead.created_at) },
    { label: "Updated", value: formatDate(typedLead.updated_at) },
  ];

  return (
    <>
      <PageHeader
        title={typedLead.name}
        description="Lead details"
        backHref="/leads"
        actions={
          <div className="flex items-center gap-3">
            {!linkedClient && typedLead.status !== "won" && (
              <ConvertToClientButton leadId={id} />
            )}
            <Link
              href={`/leads/${id}/edit`}
              className="px-4 py-2 bg-border hover:bg-dark-gray text-foreground text-sm font-medium rounded-lg border border-border transition-colors"
            >
              Edit
            </Link>
            <DeleteLeadButton leadId={id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <StatusBadge status={typedLead.status} />
              {linkedClient && (
                <Link
                  href={`/clients/${linkedClient.id}`}
                  className="text-xs text-teal hover:underline"
                >
                  Converted to client: {linkedClient.name}
                </Link>
              )}
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {details.map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
                  <dd className="mt-1 text-sm text-foreground/60">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Message */}
          {typedLead.message && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Message</h3>
              <p className="text-sm text-foreground/60 whitespace-pre-wrap">{typedLead.message}</p>
            </div>
          )}

          {/* Notes (legacy field) */}
          {typedLead.notes && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Notes</h3>
              <p className="text-sm text-foreground/60 whitespace-pre-wrap">{typedLead.notes}</p>
            </div>
          )}
        </div>

        {/* Right column — activity timeline */}
        <div className="lg:col-span-1">
          <LeadTimeline leadId={id} notes={typedNotes} />
        </div>
      </div>
    </>
  );
}
