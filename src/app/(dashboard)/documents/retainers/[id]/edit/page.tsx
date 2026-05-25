import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import RetainerEditor from "@/components/documents/RetainerEditor";
import type { RetainerRecord, RetainerClient } from "@/types/estore-retainer";
import type { UserRole } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRetainerPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((profile?.role as UserRole) !== "admin") redirect("/documents/retainers");

  const [{ data: retainer }, { data: clientRows }] = await Promise.all([
    supabase.from("retainers").select("*").eq("id", id).single(),
    supabase.from("clients").select("id, name, email, phone, company").order("name"),
  ]);
  if (!retainer) redirect("/documents/retainers");

  const r = retainer as RetainerRecord;
  const clients = (clientRows ?? []) as RetainerClient[];

  return (
    <>
      <PageHeader
        title={`Edit — ${r.name}`}
        description="Changes apply immediately to all future PDF generations for this retainer."
      />
      <RetainerEditor
        retainerId={r.id}
        initialName={r.name}
        initialContent={r.content}
        clients={clients}
      />
    </>
  );
}
