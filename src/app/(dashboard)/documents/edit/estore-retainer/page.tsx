import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import EstoreRetainerEditor from "@/components/documents/EstoreRetainerEditor";
import { DEFAULT_ESTORE_RETAINER, type EstoreRetainerContent } from "@/types/estore-retainer";
import type { UserRole } from "@/types/database";

export default async function EditEstoreRetainerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profile?.role as UserRole) !== "admin") redirect("/documents");

  const { data: override } = await supabase
    .from("document_overrides")
    .select("content")
    .eq("slug", "estore-retainer")
    .single();

  const content: EstoreRetainerContent =
    (override?.content as EstoreRetainerContent) ?? DEFAULT_ESTORE_RETAINER;

  return (
    <>
      <PageHeader
        title="Edit eStore Retainer Agreement"
        description="Changes save to the database and apply to all future PDF generations."
      />
      <EstoreRetainerEditor initialContent={content} />
    </>
  );
}
