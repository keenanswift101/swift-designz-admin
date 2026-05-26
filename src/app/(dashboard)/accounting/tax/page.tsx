import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";
import PrintAccountantStatementButton from "@/components/statements/PrintAccountantStatementButton";
import type { IncomeEntry, Expense } from "@/types/database";
import { Receipt, TrendingUp, DollarSign, Calendar } from "lucide-react";

const VAT_RATE = 0.15;
const CORP_TAX_RATE = 0.27;

const VAT_PERIOD_LABELS: Record<string, string> = {
  "1": "Jan – Feb",
  "2": "Mar – Apr",
  "3": "May – Jun",
  "4": "Jul – Aug",
  "5": "Sep – Oct",
  "6": "Nov – Dec",
};

const VAT_PERIOD_DUE: Record<string, string> = {
  "1": "25 Mar",
  "2": "25 May",
  "3": "25 Jul",
  "4": "25 Sep",
  "5": "25 Nov",
  "6": "25 Jan",
};

const QUARTER_LABELS: Record<string, string> = {
  Q1: "Jan – Mar",
  Q2: "Apr – Jun",
  Q3: "Jul – Sep",
  Q4: "Oct – Dec",
};

function getVatPeriod(dateStr: string): string {
  const m = parseInt(dateStr.slice(5, 7), 10);
  if (m <= 2) return "1";
  if (m <= 4) return "2";
  if (m <= 6) return "3";
  if (m <= 8) return "4";
  if (m <= 10) return "5";
  return "6";
}

function getQuarter(dateStr: string): string {
  const m = parseInt(dateStr.slice(5, 7), 10);
  if (m <= 3) return "Q1";
  if (m <= 6) return "Q2";
  if (m <= 9) return "Q3";
  return "Q4";
}

export default async function TaxPage() {
  const supabase = await createClient();
  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const yearEnd = `${now.getFullYear()}-12-31`;

  const [incomeResult, expensesResult] = await Promise.all([
    supabase
      .from("income_entries")
      .select("amount, date")
      .gte("date", yearStart)
      .lte("date", yearEnd),
    supabase
      .from("expenses")
      .select("amount, date")
      .gte("date", yearStart)
      .lte("date", yearEnd),
  ]);

  const income = (incomeResult.data ?? []) as Pick<IncomeEntry, "amount" | "date">[];
  const expenses = (expensesResult.data ?? []) as Pick<Expense, "amount" | "date">[];

  // YTD totals
  const ytdIncome = income.reduce((s, i) => s + i.amount, 0);
  const ytdExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const ytdNet = ytdIncome - ytdExpenses;
  const ytdVatOutput = Math.round(ytdIncome * VAT_RATE);
  const ytdVatInput = Math.round(ytdExpenses * VAT_RATE);
  const ytdVatLiability = ytdVatOutput - ytdVatInput;
  const estimatedTax = ytdNet > 0 ? Math.round(ytdNet * CORP_TAX_RATE) : 0;

  const currentVatPeriod = getVatPeriod(now.toISOString().slice(0, 10));

  // VAT by bi-monthly period
  const vatPeriods: Record<string, { income: number; expenses: number }> = {};
  for (let p = 1; p <= 6; p++) vatPeriods[String(p)] = { income: 0, expenses: 0 };
  income.forEach((i) => { vatPeriods[getVatPeriod(i.date)].income += i.amount; });
  expenses.forEach((e) => { vatPeriods[getVatPeriod(e.date)].expenses += e.amount; });

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
        description={`VAT & provisional tax summary — ${now.getFullYear()}`}
        backHref="/accounting"
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Net VAT Liability YTD
            </p>
            <p className={`text-5xl font-bold leading-none ${ytdVatLiability > 0 ? "text-red-400" : "text-teal"}`}>
              {ytdVatLiability < 0 ? "-" : ""}{formatCurrency(Math.abs(ytdVatLiability))}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-gray-400 font-medium">payable to SARS</span>
              <span>&mdash;</span>
              <span className="text-gray-400 font-medium">
                Current period: {VAT_PERIOD_LABELS[currentVatPeriod]} (due {VAT_PERIOD_DUE[currentVatPeriod]})
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Est. Provisional Tax</p>
            <p className="text-4xl font-bold text-amber-400">{formatCurrency(estimatedTax)}</p>
            <p className="text-xs text-gray-600 mt-1">@ 27% corp rate</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <Receipt className="h-5 w-5 text-red-400 mb-3" />
          <p className={`text-2xl font-bold ${ytdVatLiability > 0 ? "text-red-400" : "text-teal"}`}>
            {ytdVatLiability < 0 ? "-" : ""}{formatCurrency(Math.abs(ytdVatLiability))}
          </p>
          <p className="text-xs text-gray-500 mt-1">Net VAT Liability</p>
        </div>
        <div className="glass-card p-5">
          <Calendar className="h-5 w-5 text-blue-400 mb-3" />
          <p className="text-2xl font-bold text-foreground">{VAT_PERIOD_LABELS[currentVatPeriod]}</p>
          <p className="text-xs text-gray-500 mt-1">Due {VAT_PERIOD_DUE[currentVatPeriod]}</p>
        </div>
        <div className="glass-card p-5">
          <TrendingUp className="h-5 w-5 text-teal mb-3" />
          <p className={`text-2xl font-bold ${ytdNet >= 0 ? "text-teal" : "text-red-400"}`}>
            {ytdNet < 0 ? "-" : ""}{formatCurrency(Math.abs(ytdNet))}
          </p>
          <p className="text-xs text-gray-500 mt-1">Net Income YTD</p>
        </div>
        <div className="glass-card p-5">
          <DollarSign className="h-5 w-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(estimatedTax)}</p>
          <p className="text-xs text-gray-500 mt-1">Provisional Tax Est.</p>
        </div>
      </div>

      {/* VAT Summary + Quarterly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* VAT Summary */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              VAT Summary — {now.getFullYear()}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              SARS bi-monthly periods · 15% standard rate (VAT-exclusive basis)
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Output
                </th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Input
                </th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net VAT
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(vatPeriods).map(([period, { income: inc, expenses: exp }]) => {
                const vatOut = Math.round(inc * VAT_RATE);
                const vatIn = Math.round(exp * VAT_RATE);
                const net = vatOut - vatIn;
                const hasTxns = inc > 0 || exp > 0;
                const isCurrent = period === currentVatPeriod;
                return (
                  <tr
                    key={period}
                    className={`border-b border-border/50 ${isCurrent ? "bg-teal/5" : ""}`}
                  >
                    <td className="px-5 py-2.5 text-sm text-foreground/60">
                      {VAT_PERIOD_LABELS[period]}
                      {isCurrent && (
                        <span className="ml-2 text-xs bg-teal/15 text-teal px-1.5 py-0.5 rounded">
                          current
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-sm font-mono text-right text-red-400/80">
                      {hasTxns ? formatCurrency(vatOut) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-sm font-mono text-right text-green-400/80">
                      {hasTxns ? formatCurrency(vatIn) : "—"}
                    </td>
                    <td
                      className={`px-5 py-2.5 text-sm font-mono font-semibold text-right ${
                        !hasTxns
                          ? "text-gray-600"
                          : net > 0
                            ? "text-red-400"
                            : "text-teal"
                      }`}
                    >
                      {hasTxns
                        ? `${net < 0 ? "-" : ""}${formatCurrency(Math.abs(net))}`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-card/40">
                <td className="px-5 py-2.5 text-sm font-semibold text-foreground">YTD Total</td>
                <td className="px-3 py-2.5 text-sm font-mono font-bold text-right text-red-400">
                  {formatCurrency(ytdVatOutput)}
                </td>
                <td className="px-3 py-2.5 text-sm font-mono font-bold text-right text-green-400">
                  {formatCurrency(ytdVatInput)}
                </td>
                <td
                  className={`px-5 py-2.5 text-sm font-mono font-bold text-right ${
                    ytdVatLiability > 0 ? "text-red-400" : "text-teal"
                  }`}
                >
                  {ytdVatLiability < 0 ? "-" : ""}{formatCurrency(Math.abs(ytdVatLiability))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Quarterly Breakdown */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quarterly P&L — {now.getFullYear()}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              For provisional tax planning · Corporate rate 27%
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quarter
                </th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Income
                </th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net
                </th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Est.
                </th>
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
                    <td className="px-3 py-3 text-sm font-mono text-green-400 text-right">
                      {hasTxns ? formatCurrency(inc) : "—"}
                    </td>
                    <td className="px-3 py-3 text-sm font-mono text-red-400 text-right">
                      {hasTxns ? formatCurrency(exp) : "—"}
                    </td>
                    <td
                      className={`px-3 py-3 text-sm font-mono font-semibold text-right ${
                        hasTxns ? (net >= 0 ? "text-teal" : "text-red-400") : "text-gray-600"
                      }`}
                    >
                      {hasTxns
                        ? `${net < 0 ? "-" : ""}${formatCurrency(Math.abs(net))}`
                        : "—"}
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
                <td className="px-3 py-2.5 text-sm font-mono font-bold text-right text-green-400">
                  {formatCurrency(ytdIncome)}
                </td>
                <td className="px-3 py-2.5 text-sm font-mono font-bold text-right text-red-400">
                  {formatCurrency(ytdExpenses)}
                </td>
                <td
                  className={`px-3 py-2.5 text-sm font-mono font-bold text-right ${
                    ytdNet >= 0 ? "text-teal" : "text-red-400"
                  }`}
                >
                  {ytdNet < 0 ? "-" : ""}{formatCurrency(Math.abs(ytdNet))}
                </td>
                <td className="px-5 py-2.5 text-sm font-mono font-bold text-right text-amber-400">
                  {formatCurrency(estimatedTax)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Monthly Accountant Statement */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">
              Monthly Accountant Statement
            </h2>
            <p className="text-sm text-gray-500 max-w-lg">
              Generate a professional monthly P&L statement in PDF format — suitable for your
              accountant, bookkeeper, or SARS submission support. Includes income ledger, expense
              ledger, and category breakdowns.
            </p>
          </div>
          <div className="shrink-0">
            <PrintAccountantStatementButton />
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-600 text-center pb-4">
        All figures are estimates derived from recorded transactions. VAT calculated at 15% SARS
        standard rate on a VAT-exclusive basis. Provisional tax estimated at 27% corporate rate.
        Consult a registered tax practitioner for official returns and submissions.
      </p>
    </>
  );
}
