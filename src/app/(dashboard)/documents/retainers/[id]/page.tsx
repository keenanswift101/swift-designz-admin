import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DocumentViewer from "@/components/documents/DocumentViewer";
import type { RetainerRecord } from "@/types/estore-retainer";
import type { UserRole } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RetainerViewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (profile?.role as UserRole) ?? null;

  const { data: retainer } = await supabase.from("retainers").select("*").eq("id", id).single();
  if (!retainer) redirect("/documents/retainers");

  const r = retainer as RetainerRecord;
  const isAdmin = role === "admin";

  return (
    <DocumentViewer
      slug={id}
      label={r.content.documentTitle || r.name}
      hasPdf
      pdfPreviewUrl={`/api/docs/retainers/${id}`}
      editUrl={isAdmin ? `/documents/retainers/${id}/edit` : undefined}
    />
  );
}
