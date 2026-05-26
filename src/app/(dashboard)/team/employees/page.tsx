import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Users, DollarSign, UserCheck, ArrowUpRight } from "lucide-react";
import type { Employee } from "@/types/database";

const deptConfig: Record<string, { label: string; color: string; bg: string }> = {
  development: { label: "Development", color: "text-teal",       bg: "bg-teal/10" },
  design:      { label: "Design",      color: "text-purple-400", bg: "bg-purple-400/10" },
  marketing:   { label: "Marketing",   color: "text-amber-400",  bg: "bg-amber-400/10" },
  operations:  { label: "Operations",  color: "text-blue-400",   bg: "bg-blue-400/10" },
  other:       { label: "Other",       color: "text-gray-400",   bg: "bg-gray-500/10" },
};

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("employees").select("*").order("name");
  const employees = (data ?? []) as Employee[];

  const active = employees.filter((e) => e.status === "active");
  const monthlyPayroll = active.reduce((s, e) => s + e.salary, 0);
  const annualPayroll = monthlyPayroll * 12;
  const avgSalary = active.length > 0 ? Math.round(monthlyPayroll / active.length) : 0;

  const deptCounts = employees
    .filter((e) => e.status === "active")
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.department] = (acc[e.department] ?? 0) + 1;
      return acc;
    }, {});

  return (
    <>
      <PageHeader
        title="Employees"
        description="Staff directory and salary management"
        backHref="/team"
        actions={
          <Link
            href="/team/employees/new"
            className="px-4 py-2 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add Employee
          </Link>
        }
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Monthly Payroll
            </p>
            <p className="text-5xl font-bold leading-none text-foreground">{formatCurrency(monthlyPayroll)}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-teal font-medium">{active.length} active staff</span>
              <span>&mdash;</span>
              <span className="text-gray-400 font-medium">{formatCurrency(avgSalary)} avg salary</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Annual Payroll</p>
            <p className="text-4xl font-bold text-teal">{formatCurrency(annualPayroll)}</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <Users className="h-5 w-5 text-teal mb-3" />
          <p className="text-2xl font-bold text-foreground">{employees.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Staff</p>
        </div>
        <div className="glass-card p-5">
          <UserCheck className="h-5 w-5 text-green-400 mb-3" />
          <p className="text-2xl font-bold text-green-400">{active.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active</p>
        </div>
        <div className="glass-card p-5">
          <DollarSign className="h-5 w-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(monthlyPayroll)}</p>
          <p className="text-xs text-gray-500 mt-1">Monthly Cost</p>
        </div>
        <div className="glass-card p-5">
          <DollarSign className="h-5 w-5 text-blue-400 mb-3" />
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(annualPayroll)}</p>
          <p className="text-xs text-gray-500 mt-1">Annual Cost</p>
        </div>
      </div>

      {/* Department breakdown */}
      {Object.keys(deptCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(deptCounts).map(([dept, count]) => {
            const cfg = deptConfig[dept] ?? deptConfig.other;
            return (
              <span
                key={dept}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}
              >
                {count} {cfg.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Salary/mo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                    No employees added yet.
                  </td>
                </tr>
              ) : (
                employees.map((emp, i) => {
                  const isInactive = emp.status !== "active";
                  const dept = deptConfig[emp.department] ?? deptConfig.other;
                  return (
                    <tr
                      key={emp.id}
                      className={`border-b border-border/50 hover:bg-card transition-colors group ${
                        isInactive ? "opacity-50" : i % 2 === 1 ? "bg-foreground/3" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/team/employees/${emp.id}`}
                          className="text-sm font-medium text-foreground hover:text-teal transition-colors flex items-center gap-1"
                        >
                          {emp.name}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </Link>
                        {emp.email && (
                          <p className="text-xs text-gray-600 mt-0.5">{emp.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{emp.role}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dept.bg} ${dept.color}`}>
                          {dept.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono font-medium text-foreground text-right whitespace-nowrap">
                        {formatCurrency(emp.salary)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={emp.status} />
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 text-right whitespace-nowrap">
                        {formatDate(emp.start_date)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
