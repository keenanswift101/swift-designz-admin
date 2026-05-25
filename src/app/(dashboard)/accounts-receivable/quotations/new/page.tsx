import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import QuotationEditor from "@/components/ar/QuotationEditor";
import type { UserRole } from "@/types/database";

export default async function NewQuotationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((profile?.role as UserRole) !== "admin") redirect("/accounts-receivable/quotations");

  const [{ data: clientRows }, { data: projectRows }] = await Promise.all([
    supabase.from("clients").select("id, name, email, phone, company").order("name"),
    supabase.from("projects").select("id, name, client_id").order("name"),
  ]);

  return (
    <>
      <PageHeader
        title="New Quotation"
        description="Create a quotation to send to a client for approval"
      />
      <QuotationEditor
        clients={clientRows ?? []}
        projects={projectRows ?? []}
      />
    </>
  );
}
