import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import DeleteEmployeeButton from "@/components/team/DeleteEmployeeButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Edit, TrendingUp } from "lucide-react";
import type { Employee, SalaryHistory } from "@/types/database";

const departmentLabels: Record<string, string> = {
  development: "Development",
  design: "Design",
  marketing: "Marketing",
  operations: "Operations",
  other: "Other",
};

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: empRaw }, { data: historyRaw }] = await Promise.all([
    supabase.from("employees").select("*").eq("id", id).single(),
    supabase
      .from("salary_history")
      .select("*")
      .eq("employee_id", id)
      .order("effective_date", { ascending: false }),
  ]);

  const employee = empRaw as Employee | null;
  if (!employee) notFound();

  const salaryHistory = (historyRaw || []) as SalaryHistory[];

  return (
    <>
      <PageHeader
        title={employee.name}
        description={`${employee.role} — ${departmentLabels[employee.department] || employee.department}`}
        backHref="/team/employees"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/team/employees/${id}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground border border-border hover:border-teal rounded-lg transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>
            <DeleteEmployeeButton id={id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — details + salary history */}
        <div className="lg:col-span-2 space-y-6">

          {/* Employee Details */}
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Employee Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {employee.email && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Email</dt>
                  <dd className="text-sm text-foreground">
                    <a href={`mailto:${employee.email}`} className="hover:text-teal transition-colors">{employee.email}</a>
                  </dd>
                </div>
              )}
              {employee.phone && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Phone</dt>
                  <dd className="text-sm text-foreground">{employee.phone}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500 mb-1">Department</dt>
                <dd className="text-sm text-foreground">{departmentLabels[employee.department] || employee.department}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Role</dt>
                <dd className="text-sm text-foreground">{employee.role}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Start Date</dt>
                <dd className="text-sm text-foreground">{formatDate(employee.start_date)}</dd>
              </div>
              {employee.end_date && (
                <div>
                  <dt className="text-xs text-gray-500 mb-1">End Date</dt>
                  <dd className="text-sm text-foreground">{formatDate(employee.end_date)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500 mb-1">Status</dt>
                <dd><StatusBadge status={employee.status} /></dd>
              </div>
            </dl>
            {employee.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <dt className="text-xs text-gray-500 mb-1">Notes</dt>
                <dd className="text-sm text-foreground/60 whitespace-pre-wrap">{employee.notes}</dd>
              </div>
            )}
          </div>

          {/* Salary History */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-teal" />
                Salary History
              </h2>
            </div>
            {salaryHistory.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-gray-500">No salary history recorded.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {salaryHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-card transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-400">{formatDate(h.effective_date)}</td>
                      <td className="px-6 py-3 text-sm text-foreground font-medium text-right">{formatCurrency(h.amount)}/mo</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{h.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column — summary */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Compensation</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-gray-500 mb-1">Current Salary</dt>
                <dd className="text-lg font-semibold text-foreground">{formatCurrency(employee.salary)}/mo</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Annual</dt>
                <dd className="text-lg font-semibold text-teal">{formatCurrency(employee.salary * 12)}/yr</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Salary Changes</dt>
                <dd className="text-lg font-semibold text-foreground">{salaryHistory.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
