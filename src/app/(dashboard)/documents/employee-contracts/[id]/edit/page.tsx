import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import EmployeeContractEditor from "@/components/documents/EmployeeContractEditor";
import type { EmployeeContractRecord, EmployeeRef } from "@/types/employee-contract";
import type { UserRole } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeeContractPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((profile?.role as UserRole) !== "admin") redirect("/documents/employee-contracts");

  const [{ data: contract }, { data: empRows }] = await Promise.all([
    supabase.from("employee_contracts").select("*").eq("id", id).single(),
    supabase.from("employees").select("id, name, email, phone, role, department").eq("status", "active").order("name"),
  ]);

  if (!contract) redirect("/documents/employee-contracts");

  const r = contract as EmployeeContractRecord;
  const employees = (empRows ?? []) as EmployeeRef[];

  return (
    <>
      <PageHeader
        title={`Edit — ${r.name}`}
        description="Changes apply immediately to all future PDF generations for this contract."
      />
      <EmployeeContractEditor
        contractId={r.id}
        initialName={r.name}
        initialContent={r.content}
        employees={employees}
      />
    </>
  );
}
