import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import QuotationEditor from "@/components/ar/QuotationEditor";
import type { UserRole } from "@/types/database";
import type { QuotationWithJoins, QuotationLineItem } from "@/types/accounts-receivable";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditQuotationPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((profile?.role as UserRole) !== "admin") redirect(`/accounts-receivable/quotations/${id}`);

  const [{ data: q }, { data: itemRows }, { data: clientRows }, { data: projectRows }] = await Promise.all([
    supabase.from("quotations")
      .select("*, clients(id, name, email, phone, company), projects(id, name)")
      .eq("id", id)
      .single(),
    supabase.from("quotation_line_items")
      .select("*")
      .eq("quotation_id", id)
      .order("sort_order"),
    supabase.from("clients").select("id, name, email, phone, company").order("name"),
    supabase.from("projects").select("id, name, client_id").order("name"),
  ]);

  if (!q) redirect("/accounts-receivable/quotations");
  if (q.locked) redirect(`/accounts-receivable/quotations/${id}`);

  const quote = q as QuotationWithJoins;
  const items = (itemRows ?? []) as QuotationLineItem[];

  return (
    <>
      <PageHeader
        title={`Edit ${quote.quote_number}`}
        description={`${quote.clients?.name ?? "Unknown client"}`}
      />
      <QuotationEditor
        clients={clientRows ?? []}
        projects={projectRows ?? []}
        existing={{ ...quote, line_items: items }}
      />
    </>
  );
}
