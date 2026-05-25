import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { Plus, Eye, Pencil, FileText } from "lucide-react";
import type { EmployeeContractRecord, ContractType } from "@/types/employee-contract";
import type { UserRole } from "@/types/database";
import DeleteEmployeeContractButton from "@/components/documents/DeleteEmployeeContractButton";
import { CONTRACT_TYPE_LABELS } from "@/types/employee-contract";

const TYPE_COLORS: Record<ContractType, string> = {
  temp:          "bg-amber-500/10 text-amber-400 border-amber-500/20",
  fixed:         "bg-blue-500/10 text-blue-400 border-blue-500/20",
  intern:        "bg-purple-500/10 text-purple-400 border-purple-500/20",
  probono:       "bg-green-500/10 text-green-400 border-green-500/20",
  outsourcing:   "bg-orange-500/10 text-orange-400 border-orange-500/20",
  subcontractor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default async function EmployeeContractsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (profile?.role as UserRole) ?? null;
  const isAdmin = role === "admin";

  const { data: contracts } = await supabase
    .from("employee_contracts")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (contracts ?? []) as EmployeeContractRecord[];

  return (
    <>
      <PageHeader
        title="Employment Contracts"
        description="Build and manage contracts for temporary, fixed-term, intern, and outsourced staff"
        actions={isAdmin ? (
          <Link
            href="/documents/employee-contracts/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Contract
          </Link>
        ) : undefined}
      />

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <FileText className="h-12 w-12 text-gray-600" />
          <p className="text-sm text-gray-500">No contracts yet.</p>
          {isAdmin && (
            <Link href="/documents/employee-contracts/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors">
              <Plus className="h-4 w-4" /> Create your first contract
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
                  <p className="text-xs text-gray-500 truncate">{r.content.employeeName || "No employee set"}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold border px-2 py-0.5 rounded-full ${TYPE_COLORS[r.contract_type] ?? TYPE_COLORS.temp}`}>
                  {CONTRACT_TYPE_LABELS[r.contract_type] ?? r.contract_type}
                </span>
              </div>

              {(r.content.startDate || r.content.endDate) && (
                <p className="text-xs text-gray-500">
                  {r.content.startDate && <span>{r.content.startDate}</span>}
                  {r.content.startDate && r.content.endDate && <span className="text-gray-600"> → </span>}
                  {r.content.endDate && <span>{r.content.endDate}</span>}
                </p>
              )}

              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {r.content.jobTitle ? `${r.content.jobTitle}${r.content.department ? ` · ${r.content.department}` : ""}` : "No position set."}
              </p>

              <div className="flex items-center gap-2 pt-1 border-t border-border/50 mt-auto">
                <p className="text-xs text-gray-600 flex-1">
                  {new Date(r.updated_at).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
                <Link href={`/documents/employee-contracts/${r.id}`}
                  className="p-1.5 rounded-md text-gray-500 hover:text-teal hover:bg-teal/10 transition-colors"
                  title="View PDF">
                  <Eye className="h-4 w-4" />
                </Link>
                {isAdmin && (
                  <>
                    <Link href={`/documents/employee-contracts/${r.id}/edit`}
                      className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteEmployeeContractButton id={r.id} name={r.name} />
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
