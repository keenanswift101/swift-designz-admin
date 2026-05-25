import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { Plus, Eye, Pencil, FileText } from "lucide-react";
import type { RetainerRecord } from "@/types/estore-retainer";
import type { UserRole } from "@/types/database";
import DeleteRetainerButton from "@/components/documents/DeleteRetainerButton";

export default async function RetainersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (profile?.role as UserRole) ?? null;
  const isAdmin = role === "admin";

  const { data: retainers } = await supabase
    .from("retainers")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (retainers ?? []) as RetainerRecord[];

  return (
    <>
      <PageHeader
        title="Retainer Contracts"
        description="Build and manage retainer agreements for any service type"
        actions={isAdmin ? (
          <Link
            href="/documents/retainers/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Retainer
          </Link>
        ) : undefined}
      />

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <FileText className="h-12 w-12 text-gray-600" />
          <p className="text-sm text-gray-500">No retainers yet.</p>
          {isAdmin && (
            <Link href="/documents/retainers/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors">
              <Plus className="h-4 w-4" /> Create your first retainer
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((r) => (
            <div key={r.id} className="glass-card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{r.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{r.content.documentTitle || "—"}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-teal bg-teal/10 border border-teal/20 px-2 py-0.5 rounded-full">
                  {r.content.monthlyRate}/mo
                </span>
              </div>

              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {r.content.introText || "No description."}
              </p>

              <div className="flex items-center gap-2 pt-1 border-t border-border/50 mt-auto">
                <p className="text-xs text-gray-600 flex-1">
                  {new Date(r.updated_at).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
                <Link href={`/documents/retainers/${r.id}`}
                  className="p-1.5 rounded-md text-gray-500 hover:text-teal hover:bg-teal/10 transition-colors"
                  title="View PDF">
                  <Eye className="h-4 w-4" />
                </Link>
                {isAdmin && (
                  <>
                    <Link href={`/documents/retainers/${r.id}/edit`}
                      className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteRetainerButton id={r.id} name={r.name} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
