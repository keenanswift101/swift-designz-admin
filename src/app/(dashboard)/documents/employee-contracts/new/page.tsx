import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import EmployeeContractEditor from "@/components/documents/EmployeeContractEditor";
import { DEFAULT_TEMP_CONTRACT } from "@/types/employee-contract";
import type { EmployeeRef } from "@/types/employee-contract";
import type { UserRole } from "@/types/database";

export default async function NewEmployeeContractPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((profile?.role as UserRole) !== "admin") redirect("/documents/employee-contracts");

  const { data: empRows } = await supabase
    .from("employees")
    .select("id, name, email, phone, role, department")
    .eq("status", "active")
    .order("name");

  const employees = (empRows ?? []) as EmployeeRef[];

  return (
    <>
      <PageHeader
        title="New Employment Contract"
        description="Fill in the employee and contract details to generate a PDF contract"
      />
      <EmployeeContractEditor initialContent={DEFAULT_TEMP_CONTRACT} employees={employees} />
    </>
  );
}
