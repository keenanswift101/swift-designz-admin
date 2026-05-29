import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import type { IncomeEntry, Expense } from "@/types/database";

const TEAL      = "FF30B0B0";
const WHITE     = "FFFFFFFF";
const GREEN_BG  = "FF16a34a";
const RED_BG    = "FFdc2626";
const GREEN_FG  = "FF15803d";
const RED_FG    = "FFb91c1c";
const HEADER_BG = "FF1e293b";
const STRIPE    = "FFf8fafc";
const BORDER_C  = "FFcbd5e1";

const INCOME_CAT_LABELS: Record<string, string> = {
  web_dev: "Web Development",
  ecommerce: "E-Commerce",
  apps: "Apps",
  training: "Training",
  consulting: "Consulting",
  investment: "Investment",
  other: "Other",
};

const EXPENSE_CAT_LABELS: Record<string, string> = {
  hosting: "Hosting",
  software: "Software",
  subscriptions: "Subscriptions",
  hardware: "Hardware",
  marketing: "Marketing",
  transport: "Transport",
  office: "Office",
  professional_services: "Professional Services",
  other: "Other",
};

function centsToRand(cents: number) {
  return cents / 100;
}

function getMonthKey(dateStr: string) {
  return dateStr.slice(0, 7);
}

function getMonthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-ZA", {
    month: "short",
    year: "numeric",
  });
}

function borderAll(ws: ExcelJS.Worksheet, row: number, fromCol: number, toCol: number, style: ExcelJS.BorderStyle = "thin") {
  for (let c = fromCol; c <= toCol; c++) {
    const cell = ws.getCell(row, c);
    cell.border = {
      top: { style, color: { argb: BORDER_C } },
      bottom: { style, color: { argb: BORDER_C } },
      left: { style, color: { argb: BORDER_C } },
      right: { style, color: { argb: BORDER_C } },
    };
  }
}

export async function GET() {
  const supabase = await createClient();
  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;

  const [{ data: incomeData }, { data: expenseData }] = await Promise.all([
    supabase.from("income_entries").select("*").gte("date", yearStart).order("date"),
    supabase.from("expenses").select("*").gte("date", yearStart).order("date"),
  ]);

  const income = (incomeData ?? []) as IncomeEntry[];
  const expenses = (expenseData ?? []) as Expense[];

  // ── Aggregations ──────────────────────────────────────────
  const months = new Set<string>();
  income.forEach((i) => months.add(getMonthKey(i.date)));
  expenses.forEach((e) => months.add(getMonthKey(e.date)));
  const sortedMonths = [...months].sort();

  const incomeByCategory: Record<string, Record<string, number>> = {};
  income.forEach((i) => {
    if (!incomeByCategory[i.category]) incomeByCategory[i.category] = {};
    const mk = getMonthKey(i.date);
    incomeByCategory[i.category][mk] = (incomeByCategory[i.category][mk] ?? 0) + i.amount;
  });

  const expenseByCategory: Record<string, Record<string, number>> = {};
  expenses.forEach((e) => {
    if (!expenseByCategory[e.category]) expenseByCategory[e.category] = {};
    const mk = getMonthKey(e.date);
    expenseByCategory[e.category][mk] = (expenseByCategory[e.category][mk] ?? 0) + e.amount;
  });

  const monthlyIncome: Record<string, number> = {};
  const monthlyExpenses: Record<string, number> = {};
  sortedMonths.forEach((m) => {
    monthlyIncome[m] = Object.values(incomeByCategory).reduce((s, c) => s + (c[m] ?? 0), 0);
    monthlyExpenses[m] = Object.values(expenseByCategory).reduce((s, c) => s + (c[m] ?? 0), 0);
  });

  const ytdIncome = income.reduce((s, i) => s + i.amount, 0);
  const ytdExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const ytdNet = ytdIncome - ytdExpenses;

  // ── Workbook ──────────────────────────────────────────────
  const wb = new ExcelJS.Workbook();
  wb.creator = "Swift Designz Investments CC Admin";
  wb.created = now;
  wb.modified = now;

  // ═══════════════════════════════════════════════════════════
  // SHEET 1 — P&L SUMMARY
  // ═══════════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet("P&L Summary", { properties: { tabColor: { argb: TEAL } } });

  const totalCols = sortedMonths.length + 2; // Category + months + Total

  // Column widths
  ws1.getColumn(1).width = 28;
  for (let i = 2; i <= sortedMonths.length + 1; i++) ws1.getColumn(i).width = 14;
  ws1.getColumn(sortedMonths.length + 2).width = 16;

  // ── Header band ──
  ws1.mergeCells(1, 1, 1, totalCols);
  const title = ws1.getCell(1, 1);
  title.value = "SWIFT DESIGNZ INVESTMENTS CC — PROFIT & LOSS STATEMENT";
  title.font = { name: "Calibri", size: 16, bold: true, color: { argb: WHITE } };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TEAL } };
  title.alignment = { horizontal: "center", vertical: "middle" };
  ws1.getRow(1).height = 32;

  ws1.mergeCells(2, 1, 2, totalCols);
  const sub = ws1.getCell(2, 1);
  sub.value = `Financial Year: January – December ${now.getFullYear()}`;
  sub.font = { name: "Calibri", size: 11, color: { argb: "FF334155" } };
  sub.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFe2e8f0" } };
  sub.alignment = { horizontal: "center" };
  ws1.getRow(2).height = 20;

  ws1.mergeCells(3, 1, 3, totalCols);
  const gen = ws1.getCell(3, 1);
  gen.value = `Generated: ${now.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}`;
  gen.font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF94a3b8" } };
  gen.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8fafc" } };
  gen.alignment = { horizontal: "center" };

  ws1.addRow([]); // spacer

  // ── Column headers ──
  const hdrs = ["Category", ...sortedMonths.map(getMonthLabel), "Total"];
  const hdrRow = ws1.addRow(hdrs);
  hdrRow.eachCell((cell, colNum) => {
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.alignment = { horizontal: colNum === 1 ? "left" : "right", vertical: "middle" };
    cell.border = { bottom: { style: "medium", color: { argb: BORDER_C } } };
  });
  ws1.getRow(hdrRow.number).height = 22;

  const currFmt = '"R"#,##0.00';

  function addSectionHeader(label: string, color: string) {
    const r = ws1.addRow([label]);
    ws1.mergeCells(r.number, 1, r.number, totalCols);
    const cell = ws1.getCell(r.number, 1);
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    cell.alignment = { horizontal: "left", indent: 1 };
    ws1.getRow(r.number).height = 18;
  }

  function addCategoryRow(label: string, vals: Record<string, number>, isStripe: boolean) {
    const rowVals = [label, ...sortedMonths.map((m) => centsToRand(vals[m] ?? 0)), centsToRand(Object.values(vals).reduce((s, v) => s + v, 0))];
    const r = ws1.addRow(rowVals);
    r.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: isStripe ? STRIPE : WHITE } };
      cell.alignment = { horizontal: colNum === 1 ? "left" : "right", indent: colNum === 1 ? 2 : 0 };
      if (colNum > 1) cell.numFmt = currFmt;
    });
    borderAll(ws1, r.number, 1, totalCols);
  }

  function addTotalRow(label: string, monthly: Record<string, number>, ytdVal: number, fgColor: string) {
    const rowVals = [label, ...sortedMonths.map((m) => centsToRand(monthly[m] ?? 0)), centsToRand(ytdVal)];
    const r = ws1.addRow(rowVals);
    r.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: fgColor } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf1f5f9" } };
      cell.alignment = { horizontal: colNum === 1 ? "left" : "right" };
      if (colNum > 1) cell.numFmt = currFmt;
    });
    borderAll(ws1, r.number, 1, totalCols, "medium");
    ws1.getRow(r.number).height = 20;
  }

  // Revenue section
  addSectionHeader("REVENUE", GREEN_BG);
  Object.entries(incomeByCategory).forEach(([cat, vals], i) => {
    addCategoryRow(INCOME_CAT_LABELS[cat] ?? cat, vals, i % 2 === 0);
  });
  addTotalRow("Total Revenue", monthlyIncome, ytdIncome, GREEN_FG);

  ws1.addRow([]); // spacer

  // Expenses section
  addSectionHeader("EXPENSES", RED_BG);
  Object.entries(expenseByCategory).forEach(([cat, vals], i) => {
    addCategoryRow(EXPENSE_CAT_LABELS[cat] ?? cat, vals, i % 2 === 0);
  });
  addTotalRow("Total Expenses", monthlyExpenses, ytdExpenses, RED_FG);

  ws1.addRow([]); // spacer

  // Net Profit row
  const netMonthly: Record<string, number> = {};
  sortedMonths.forEach((m) => { netMonthly[m] = (monthlyIncome[m] ?? 0) - (monthlyExpenses[m] ?? 0); });
  const netRowVals = ["NET PROFIT / LOSS", ...sortedMonths.map((m) => centsToRand(netMonthly[m])), centsToRand(ytdNet)];
  const netRow = ws1.addRow(netRowVals);
  const netColor = ytdNet >= 0 ? GREEN_FG : RED_FG;
  netRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: netColor } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf0fdf4" } };
    cell.alignment = { horizontal: colNum === 1 ? "left" : "right" };
    if (colNum > 1) cell.numFmt = currFmt;
  });
  borderAll(ws1, netRow.number, 1, totalCols, "medium");
  ws1.getRow(netRow.number).height = 24;

  // Net Margin % row
  const marginRowVals = [
    "Net Margin %",
    ...sortedMonths.map((m) => {
      const inc = monthlyIncome[m] ?? 0;
      const net = netMonthly[m] ?? 0;
      return inc > 0 ? net / inc : 0;
    }),
    ytdIncome > 0 ? ytdNet / ytdIncome : 0,
  ];
  const marginRow = ws1.addRow(marginRowVals);
  marginRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
    cell.font = { name: "Calibri", size: 10, color: { argb: "FF475569" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf8fafc" } };
    cell.alignment = { horizontal: colNum === 1 ? "left" : "right" };
    if (colNum > 1) cell.numFmt = "0.0%";
  });
  borderAll(ws1, marginRow.number, 1, totalCols);

  // Freeze panes
  ws1.views = [{ state: "frozen", xSplit: 1, ySplit: 5 }];

  // ═══════════════════════════════════════════════════════════
  // SHEET 2 — INCOME DETAIL
  // ═══════════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet("Income Detail", { properties: { tabColor: { argb: "FF16a34a" } } });

  ws2.getColumn(1).width = 14;
  ws2.getColumn(2).width = 40;
  ws2.getColumn(3).width = 22;
  ws2.getColumn(4).width = 16;

  ws2.mergeCells("A1:D1");
  const ws2Title = ws2.getCell("A1");
  ws2Title.value = "SWIFT DESIGNZ INVESTMENTS CC — INCOME DETAIL";
  ws2Title.font = { name: "Calibri", size: 14, bold: true, color: { argb: WHITE } };
  ws2Title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF16a34a" } };
  ws2Title.alignment = { horizontal: "center", vertical: "middle" };
  ws2.getRow(1).height = 28;

  ws2.mergeCells("A2:D2");
  const ws2Sub = ws2.getCell("A2");
  ws2Sub.value = `Period: January – December ${now.getFullYear()}   |   Generated: ${now.toLocaleDateString("en-ZA")}`;
  ws2Sub.font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF64748b" } };
  ws2Sub.alignment = { horizontal: "center" };
  ws2.addRow([]);

  const incHdr = ws2.addRow(["Date", "Description", "Category", "Amount (ZAR)"]);
  incHdr.eachCell((cell, colNum) => {
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.alignment = { horizontal: colNum === 4 ? "right" : "left" };
  });
  ws2.getRow(incHdr.number).height = 20;

  income.forEach((entry, i) => {
    const r = ws2.addRow([
      new Date(entry.date).toLocaleDateString("en-ZA"),
      entry.description,
      INCOME_CAT_LABELS[entry.category] ?? entry.category,
      centsToRand(entry.amount),
    ]);
    r.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 === 0 ? STRIPE : WHITE } };
      cell.alignment = { horizontal: colNum === 4 ? "right" : "left" };
      if (colNum === 4) cell.numFmt = currFmt;
    });
    borderAll(ws2, r.number, 1, 4);
  });

  const incTotal = ws2.addRow(["", "TOTAL", "", centsToRand(ytdIncome)]);
  incTotal.eachCell({ includeEmpty: true }, (cell, colNum) => {
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: GREEN_FG } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFf0fdf4" } };
    cell.alignment = { horizontal: colNum === 4 ? "right" : "left" };
    if (colNum === 4) cell.numFmt = currFmt;
  });
  borderAll(ws2, incTotal.number, 1, 4, "medium");

  ws2.views = [{ state: "frozen", ySplit: 4 }];

  // ═══════════════════════════════════════════════════════════
  // SHEET 3 — EXPENSE DETAIL
  // ═══════════════════════════════════════════════════════════
  const ws3 = wb.addWorksheet("Expense Detail", { properties: { tabColor: { argb: "FFdc2626" } } });

  ws3.getColumn(1).width = 14;
  ws3.getColumn(2).width = 40;
  ws3.getColumn(3).width = 22;
  ws3.getColumn(4).width = 16;

  ws3.mergeCells("A1:D1");
  const ws3Title = ws3.getCell("A1");
  ws3Title.value = "SWIFT DESIGNZ INVESTMENTS CC — EXPENSE DETAIL";
  ws3Title.font = { name: "Calibri", size: 14, bold: true, color: { argb: WHITE } };
  ws3Title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFdc2626" } };
  ws3Title.alignment = { horizontal: "center", vertical: "middle" };
  ws3.getRow(1).height = 28;

  ws3.mergeCells("A2:D2");
  const ws3Sub = ws3.getCell("A2");
  ws3Sub.value = `Period: January – December ${now.getFullYear()}   |   Generated: ${now.toLocaleDateString("en-ZA")}`;
  ws3Sub.font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF64748b" } };
  ws3Sub.alignment = { horizontal: "center" };
  ws3.addRow([]);

  const expHdr = ws3.addRow(["Date", "Description", "Category", "Amount (ZAR)"]);
  expHdr.eachCell((cell, colNum) => {
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: WHITE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.alignment = { horizontal: colNum === 4 ? "right" : "left" };
  });
  ws3.getRow(expHdr.number).height = 20;

  expenses.forEach((entry, i) => {
    const r = ws3.addRow([
      new Date(entry.date).toLocaleDateString("en-ZA"),
      entry.description,
      EXPENSE_CAT_LABELS[entry.category] ?? entry.category,
      centsToRand(entry.amount),
    ]);
    r.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 === 0 ? STRIPE : WHITE } };
      cell.alignment = { horizontal: colNum === 4 ? "right" : "left" };
      if (colNum === 4) cell.numFmt = currFmt;
    });
    borderAll(ws3, r.number, 1, 4);
  });

  const expTotal = ws3.addRow(["", "TOTAL", "", centsToRand(ytdExpenses)]);
  expTotal.eachCell({ includeEmpty: true }, (cell, colNum) => {
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: RED_FG } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFfef2f2" } };
    cell.alignment = { horizontal: colNum === 4 ? "right" : "left" };
    if (colNum === 4) cell.numFmt = currFmt;
  });
  borderAll(ws3, expTotal.number, 1, 4, "medium");

  ws3.views = [{ state: "frozen", ySplit: 4 }];

  // ── Respond ──────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const filename = `SwiftDesignz-PnL-${now.getFullYear()}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
