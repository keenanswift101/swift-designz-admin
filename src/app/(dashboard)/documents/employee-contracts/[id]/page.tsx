import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import DocumentViewer from "@/components/documents/DocumentViewer";
import type { EmployeeContractRecord } from "@/types/employee-contract";
import type { UserRole } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ViewEmployeeContractPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (profile?.role as UserRole) ?? null;
  const isAdmin = role === "admin";

  const { data: contract } = await supabase.from("employee_contracts").select("*").eq("id", id).single();
  if (!contract) redirect("/documents/employee-contracts");

  const r = contract as EmployeeContractRecord;

  return (
    <>
      <PageHeader
        title={r.name}
        description={`${r.content.jobTitle || "Employment Contract"} · ${r.content.employeeName || ""}`}
      />
      <DocumentViewer
        slug={id}
        label={r.content.documentTitle || r.name}
        hasPdf
        pdfPreviewUrl={`/api/docs/employee-contracts/${id}`}
        downloadUrl={`/api/docs/employee-contracts/${id}`}
        editUrl={isAdmin ? `/documents/employee-contracts/${id}/edit` : undefined}
      />
    </>
  );
}
