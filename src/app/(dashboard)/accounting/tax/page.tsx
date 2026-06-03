import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";
import PrintAccountantStatementButton from "@/components/statements/PrintAccountantStatementButton";
import type { IncomeEntry, Expense } from "@/types/database";
import { TrendingUp, DollarSign, Calendar, Info } from "lucide-react";

const CORP_TAX_RATE = 0.32;

const QUARTER_LABELS: Record<string, string> = {
  Q1: "Jan – Mar",
  Q2: "Apr – Jun",
  Q3: "Jul – Sep",
  Q4: "Oct – Dec",
};

function getQuarter(dateStr: string): string {
  const m = parseInt(dateStr.slice(5, 7), 10);
  if (m <= 3) return "Q1";
  if (m <= 6) return "Q2";
  if (m <= 9) return "Q3";
  return "Q4";
}

// Namibia provisional tax: 2 payments per year
// 1st provisional: end of August (6 months into tax year)
// 2nd provisional: end of February (end of tax year)
// Financial year: 1 March – 28/29 February
function getProvTaxPeriod(now: Date): { label: string; due: string; half: 1 | 2 } {
  const m = now.getMonth() + 1; // 1-12
  if (m >= 3 && m <= 8) {
    return { label: "1st Provisional", due: "31 Aug", half: 1 };
  }
  return { label: "2nd Provisional", due: "28 Feb", half: 2 };
}

export default async function TaxPage() {
  const supabase = await createClient();
  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const yearEnd = `${now.getFullYear()}-12-31`;

  const [incomeResult, expensesResult] = await Promise.all([
    supabase.from("income_entries").select("amount, date").gte("date", yearStart).lte("date", yearEnd),
    supabase.from("expenses").select("amount, date").gte("date", yearStart).lte("date", yearEnd),
  ]);

  const income = (incomeResult.data ?? []) as Pick<IncomeEntry, "amount" | "date">[];
  const expenses = (expensesResult.data ?? []) as Pick<Expense, "amount" | "date">[];

  const ytdIncome = income.reduce((s, i) => s + i.amount, 0);
  const ytdExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const ytdNet = ytdIncome - ytdExpenses;
  const estimatedTax = ytdNet > 0 ? Math.round(ytdNet * CORP_TAX_RATE) : 0;
  const estimatedNetAfterTax = ytdNet - estimatedTax;

  const provPeriod = getProvTaxPeriod(now);

  // Quarterly breakdown
  const quarters: Record<string, { income: number; expenses: number }> = {
    Q1: { income: 0, expenses: 0 },
    Q2: { income: 0, expenses: 0 },
    Q3: { income: 0, expenses: 0 },
    Q4: { income: 0, expenses: 0 },
  };
  income.forEach((i) => { quarters[getQuarter(i.date)].income += i.amount; });
  expenses.forEach((e) => { quarters[getQuarter(e.date)].expenses += e.amount; });

  return (
    <>
      <PageHeader
        title="Tax Overview"
        description={`Provisional income tax summary — ${now.getFullYear()}`}
        backHref="/accounting"
      />

      {/* Not VAT registered notice */}
      <div className="flex items-start gap-3 glass-card px-5 py-4 mb-6 border-teal/20">
        <Info className="h-4 w-4 text-teal shrink-0 mt-0.5" />
        <p className="text-sm text-gray-400">
          <span className="text-teal font-medium">Not VAT registered.</span>{" "}
          Swift Designz Investments CC is exempt from VAT registration — annual turnover is below the
          N$500,000 NamRA registration threshold. No VAT is charged on invoices or claimed on expenses.
        </p>
      </div>

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Est. Provisional Tax — YTD
            </p>
            <p className={`text-5xl font-bold leading-none ${estimatedTax > 0 ? "text-amber-400" : "text-gray-600"}`}>
              {formatCurrency(estimatedTax)}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-teal font-medium">{formatCurrency(ytdNet)} taxable net</span>
              <span>&mdash;</span>
              <span className="text-gray-400 font-medium">@ 32% NamRA corp rate</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{provPeriod.label} Due</p>
            <p className="text-3xl font-bold text-foreground">{provPeriod.due}</p>
            <p className="text-xs text-gray-600 mt-1">NamRA provisional tax</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <TrendingUp className="h-5 w-5 text-teal mb-3" />
          <p className="text-2xl font-bold text-teal">{formatCurrency(ytdIncome)}</p>
          <p className="text-xs text-gray-500 mt-1">Gross Income YTD</p>
        </div>
        <div className="glass-card p-5">
          <TrendingUp className="h-5 w-5 text-red-400 mb-3" style={{ transform: "scaleY(-1)" }} />
          <p className="text-2xl font-bold text-foreground">{formatCurrency(ytdExpenses)}</p>
          <p className="text-xs text-gray-500 mt-1">Deductible Expenses YTD</p>
        </div>
        <div className="glass-card p-5">
          <DollarSign className={`h-5 w-5 mb-3 ${ytdNet >= 0 ? "text-teal" : "text-red-400"}`} />
          <p className={`text-2xl font-bold ${ytdNet >= 0 ? "text-teal" : "text-red-400"}`}>
            {ytdNet < 0 ? "-" : ""}{formatCurrency(Math.abs(ytdNet))}
          </p>
          <p className="text-xs text-gray-500 mt-1">Taxable Net YTD</p>
        </div>
        <div className="glass-card p-5">
          <Calendar className="h-5 w-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(estimatedTax)}</p>
          <p className="text-xs text-gray-500 mt-1">Provisional Tax Est.</p>
        </div>
      </div>

      {/* Quarterly breakdown */}
      <div className="glass-card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quarterly P&L — {now.getFullYear()}
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            For provisional tax planning · NamRA corporate rate 32%
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Quarter</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Est. (32%)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(quarters).map(([q, { income: inc, expenses: exp }]) => {
                const net = inc - exp;
                const taxEst = net > 0 ? Math.round(net * CORP_TAX_RATE) : 0;
                const hasTxns = inc > 0 || exp > 0;
                return (
                  <tr key={q} className="border-b border-border/50">
                    <td className="px-5 py-3 text-sm">
                      <span className="font-semibold text-foreground">{q}</span>
                      <span className="ml-2 text-xs text-gray-500">{QUARTER_LABELS[q]}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-green-400 text-right">
                      {hasTxns ? formatCurrency(inc) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-red-400 text-right">
                      {hasTxns ? formatCurrency(exp) : "—"}
                    </td>
                    <td className={`px-4 py-3 text-sm font-mono font-semibold text-right ${!hasTxns ? "text-gray-600" : net >= 0 ? "text-teal" : "text-red-400"}`}>
                      {hasTxns ? `${net < 0 ? "-" : ""}${formatCurrency(Math.abs(net))}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm font-mono font-medium text-amber-400 text-right">
                      {taxEst > 0 ? formatCurrency(taxEst) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-card/40">
                <td className="px-5 py-2.5 text-sm font-semibold text-foreground">YTD</td>
                <td className="px-4 py-2.5 text-sm font-mono font-bold text-right text-green-400">{formatCurrency(ytdIncome)}</td>
                <td className="px-4 py-2.5 text-sm font-mono font-bold text-right text-red-400">{formatCurrency(ytdExpenses)}</td>
                <td className={`px-4 py-2.5 text-sm font-mono font-bold text-right ${ytdNet >= 0 ? "text-teal" : "text-red-400"}`}>
                  {ytdNet < 0 ? "-" : ""}{formatCurrency(Math.abs(ytdNet))}
                </td>
                <td className="px-5 py-2.5 text-sm font-mono font-bold text-right text-amber-400">{formatCurrency(estimatedTax)}</td>
              </tr>
              <tr className="bg-card/20">
                <td className="px-5 py-2.5 text-xs text-gray-500" colSpan={3}>Est. net after tax</td>
                <td colSpan={2} className={`px-5 py-2.5 text-sm font-mono font-bold text-right ${estimatedNetAfterTax >= 0 ? "text-teal" : "text-red-400"}`}>
                  {estimatedNetAfterTax < 0 ? "-" : ""}{formatCurrency(Math.abs(estimatedNetAfterTax))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Provisional tax schedule */}
      <div className="glass-card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">NamRA Provisional Tax Schedule</h2>
          <p className="text-xs text-gray-600 mt-1">Financial year: 1 March – 28/29 February</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <tr className={provPeriod.half === 1 ? "bg-teal/5" : ""}>
              <td className="px-5 py-3 text-sm">
                <span className="font-medium text-foreground">1st Provisional</span>
                {provPeriod.half === 1 && <span className="ml-2 text-xs bg-teal/15 text-teal px-1.5 py-0.5 rounded">current</span>}
              </td>
              <td className="px-4 py-3 text-xs text-gray-400">Mar – Aug</td>
              <td className="px-4 py-3 text-xs text-gray-400">31 August</td>
              <td className="px-5 py-3 text-sm font-mono text-amber-400 text-right">{formatCurrency(Math.round(estimatedTax / 2))}</td>
            </tr>
            <tr className={provPeriod.half === 2 ? "bg-teal/5" : ""}>
              <td className="px-5 py-3 text-sm">
                <span className="font-medium text-foreground">2nd Provisional</span>
                {provPeriod.half === 2 && <span className="ml-2 text-xs bg-teal/15 text-teal px-1.5 py-0.5 rounded">current</span>}
              </td>
              <td className="px-4 py-3 text-xs text-gray-400">Sep – Feb</td>
              <td className="px-4 py-3 text-xs text-gray-400">28 February</td>
              <td className="px-5 py-3 text-sm font-mono text-amber-400 text-right">{formatCurrency(estimatedTax - Math.round(estimatedTax / 2))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Monthly Accountant Statement */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">Monthly Accountant Statement</h2>
            <p className="text-sm text-gray-500 max-w-lg">
              Generate a professional monthly P&L statement in PDF format — suitable for your
              accountant or NamRA submission support. Includes income ledger, expense ledger, and
              category breakdowns.
            </p>
          </div>
          <div className="shrink-0">
            <PrintAccountantStatementButton />
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-600 text-center pb-4">
        Swift Designz Investments CC is not VAT registered (turnover below N$500,000 threshold).
        Provisional tax estimated at 32% NamRA corporate rate on taxable net income.
        Consult a registered NamRA tax practitioner for official returns and submissions.
      </p>
    </>
  );
}
