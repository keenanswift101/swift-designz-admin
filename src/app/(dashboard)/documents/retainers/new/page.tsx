import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import RetainerEditor from "@/components/documents/RetainerEditor";
import { BLANK_RETAINER, ESTORE_RETAINER_TEMPLATE } from "@/types/estore-retainer";
import type { RetainerClient } from "@/types/estore-retainer";
import type { UserRole } from "@/types/database";

interface Props {
  searchParams: Promise<{ from?: string }>;
}

export default async function NewRetainerPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((profile?.role as UserRole) !== "admin") redirect("/documents/retainers");

  const { from } = await searchParams;
  const initialContent = from === "estore" ? ESTORE_RETAINER_TEMPLATE : BLANK_RETAINER;

  const { data: clientRows } = await supabase.from("clients").select("id, name, email, phone, company").order("name");
  const clients = (clientRows ?? []) as RetainerClient[];

  return (
    <>
      <PageHeader
        title="New Retainer"
        description="Choose a starting point or build from scratch"
      />

      {/* Starting point picker */}
      {!from && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="/documents/retainers/new?from=blank"
            className="glass-card p-6 flex flex-col gap-2 hover:border-teal/50 transition-colors">
            <h3 className="text-sm font-semibold text-foreground">Start from scratch</h3>
            <p className="text-xs text-gray-500">Empty template — fill in everything yourself.</p>
          </Link>
          <Link href="/documents/retainers/new?from=estore"
            className="glass-card p-6 flex flex-col gap-2 hover:border-teal/50 transition-colors">
            <h3 className="text-sm font-semibold text-foreground">Use eStore template</h3>
            <p className="text-xs text-gray-500">Pre-filled with eStore retainer content — edit as needed.</p>
          </Link>
        </div>
      )}

      {(from === "blank" || from === "estore") && (
        <RetainerEditor initialContent={initialContent} clients={clients} />
      )}
    </>
  );
}
