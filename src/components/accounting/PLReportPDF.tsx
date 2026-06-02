import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf", fontWeight: 700 },
  ],
});

const teal = "#30B0B0";
const surface = "#f5f5f5";
const border = "#e0e0e0";
const red = "#DC2626";

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", padding: 40, fontFamily: "Inter", fontSize: 9, color: "#333" },

  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 36, height: 36 },
  brandName: { fontSize: 11, fontWeight: 700, color: teal, letterSpacing: 1, textTransform: "uppercase" as const },
  brandSub: { fontSize: 7, color: "#208080", letterSpacing: 1, marginTop: 2, textTransform: "uppercase" as const },
  docTitle: { textAlign: "right" as const },
  docLabel: { fontSize: 14, fontWeight: 700, color: "#111", textTransform: "uppercase" as const, letterSpacing: 1 },
  docMeta: { fontSize: 8, color: "#777", marginTop: 2 },
  docMetaVal: { fontWeight: 600, color: "#333" },

  divider: { borderBottomWidth: 1, borderColor: border, marginBottom: 16 },

  periodBanner: { backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 4, padding: "8 12", marginBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  periodLabel: { fontSize: 8, color: "#888", textTransform: "uppercase" as const, letterSpacing: 1 },
  periodVal: { fontSize: 9, fontWeight: 600, color: "#333" },

  section: { marginBottom: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1.5, borderColor: teal, paddingBottom: 5, marginBottom: 6 },
  sectionTitle: { fontSize: 8, fontWeight: 700, color: teal, textTransform: "uppercase" as const, letterSpacing: 2 },
  sectionTotal: { fontSize: 8, fontWeight: 700, color: teal, textTransform: "uppercase" as const, letterSpacing: 1 },

  lineRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, paddingHorizontal: 4 },
  lineRowAlt: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, paddingHorizontal: 4, backgroundColor: "#fafafa" },
  lineLabel: { fontSize: 8.5, color: "#444" },
  lineAmount: { fontSize: 8.5, color: "#333", fontWeight: 600 },
  lineAmountZero: { fontSize: 8.5, color: "#bbb" },

  subtotalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderColor: "#ccc", paddingTop: 5, paddingHorizontal: 4, marginTop: 2 },
  subtotalLabel: { fontSize: 8.5, fontWeight: 700, color: "#111" },
  subtotalAmount: { fontSize: 8.5, fontWeight: 700, color: "#111" },

  netRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#111", borderRadius: 4, padding: "10 12", marginTop: 8 },
  netLabel: { fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase" as const, letterSpacing: 1 },
  netAmountProfit: { fontSize: 14, fontWeight: 700, color: teal },
  netAmountLoss: { fontSize: 14, fontWeight: 700, color: "#f87171" },

  marginRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: 8 },
  marginLabel: { fontSize: 8, color: "#888" },
  marginVal: { fontSize: 8, fontWeight: 700, color: "#555" },

  notesBox: { backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 4, padding: 10, marginTop: 16 },
  notesLabel: { fontSize: 7, fontWeight: 700, color: "#888", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 4 },
  notesText: { fontSize: 8, color: "#666", lineHeight: 1.5 },

  footer: { position: "absolute", bottom: 28, left: 40, right: 40, borderTopWidth: 1, borderColor: "#ddd", paddingTop: 7, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#aaa" },
});

const INCOME_LABELS: Record<string, string> = {
  web_dev: "Web Development",
  ecommerce: "eCommerce",
  investment: "Investment Income",
};

const EXPENSE_LABELS: Record<string, string> = {
  hosting: "Hosting & Infrastructure",
  subscriptions: "Subscriptions & Tools",
  professional_services: "Professional Services",
  marketing: "Marketing & Advertising",
  office: "Office & Admin",
  salaries: "Salaries & Wages",
  equipment: "Equipment",
  other: "Other",
};

export interface PLReportData {
  periodLabel: string;
  periodFrom: string;
  periodTo: string;
  generatedAt: string;
  companyName: string;
  companyAddress: string | null;
  companyVat: string | null;
  companyEmail: string | null;
  logoSrc: string | null;
  income: { category: string; amount: number }[];
  expenses: { category: string; amount: number }[];
}

function fmt(cents: number): string {
  return "N$ " + (cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PLReportPDF({
  periodLabel,
  periodFrom,
  periodTo,
  generatedAt,
  companyName,
  companyAddress,
  companyVat,
  companyEmail,
  logoSrc,
  income,
  expenses,
}: PLReportData) {
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;
  const isProfit = netProfit >= 0;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {logoSrc && <Image src={logoSrc} style={s.logo} />}
            <View>
              <Text style={s.brandName}>{companyName}</Text>
              <Text style={s.brandSub}>swiftdesignz.co.za</Text>
            </View>
          </View>
          <View style={s.docTitle}>
            <Text style={s.docLabel}>Profit & Loss Statement</Text>
            <Text style={s.docMeta}>Period: <Text style={s.docMetaVal}>{periodFrom} to {periodTo}</Text></Text>
            <Text style={s.docMeta}>Generated: <Text style={s.docMetaVal}>{generatedAt}</Text></Text>
            {companyVat && <Text style={s.docMeta}>TIN: <Text style={s.docMetaVal}>{companyVat}</Text></Text>}
          </View>
        </View>

        <View style={s.divider} />

        {/* Period banner */}
        <View style={s.periodBanner}>
          <View>
            <Text style={s.periodLabel}>Reporting Period</Text>
            <Text style={s.periodVal}>{periodLabel}</Text>
          </View>
          {companyAddress && (
            <View style={{ alignItems: "flex-end" as const }}>
              <Text style={s.periodLabel}>Address</Text>
              <Text style={s.periodVal}>{companyAddress}</Text>
            </View>
          )}
        </View>

        {/* INCOME */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Income</Text>
            <Text style={s.sectionTotal}>Amount</Text>
          </View>
          {income.length === 0 ? (
            <View style={s.lineRow}><Text style={s.lineAmountZero}>No income recorded in this period.</Text></View>
          ) : (
            income.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? s.lineRow : s.lineRowAlt}>
                <Text style={s.lineLabel}>{INCOME_LABELS[row.category] ?? row.category}</Text>
                <Text style={row.amount > 0 ? s.lineAmount : s.lineAmountZero}>{fmt(row.amount)}</Text>
              </View>
            ))
          )}
          <View style={s.subtotalRow}>
            <Text style={s.subtotalLabel}>Total Income</Text>
            <Text style={s.subtotalAmount}>{fmt(totalIncome)}</Text>
          </View>
        </View>

        {/* EXPENSES */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: red }]}>Operating Expenses</Text>
            <Text style={[s.sectionTotal, { color: red }]}>Amount</Text>
          </View>
          {expenses.length === 0 ? (
            <View style={s.lineRow}><Text style={s.lineAmountZero}>No expenses recorded in this period.</Text></View>
          ) : (
            expenses.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? s.lineRow : s.lineRowAlt}>
                <Text style={s.lineLabel}>{EXPENSE_LABELS[row.category] ?? row.category}</Text>
                <Text style={row.amount > 0 ? s.lineAmount : s.lineAmountZero}>{fmt(row.amount)}</Text>
              </View>
            ))
          )}
          <View style={s.subtotalRow}>
            <Text style={s.subtotalLabel}>Total Expenses</Text>
            <Text style={s.subtotalAmount}>{fmt(totalExpenses)}</Text>
          </View>
        </View>

        {/* NET PROFIT / LOSS */}
        <View style={s.netRow}>
          <Text style={s.netLabel}>{isProfit ? "Net Profit" : "Net Loss"}</Text>
          <Text style={isProfit ? s.netAmountProfit : s.netAmountLoss}>
            {isProfit ? "" : "(−) "}{fmt(Math.abs(netProfit))}
          </Text>
        </View>

        <View style={s.marginRow}>
          <Text style={s.marginLabel}>Net Profit Margin</Text>
          <Text style={s.marginVal}>{margin}%</Text>
          <Text style={s.marginLabel}>Total Income</Text>
          <Text style={s.marginVal}>{fmt(totalIncome)}</Text>
          <Text style={s.marginLabel}>Total Expenses</Text>
          <Text style={s.marginVal}>{fmt(totalExpenses)}</Text>
        </View>

        {/* Notes */}
        <View style={s.notesBox}>
          <Text style={s.notesLabel}>Notes</Text>
          <Text style={s.notesText}>
            This statement is prepared from income and expense entries recorded in the Swift Designz Admin Portal.
            All amounts are in Namibian Dollars (N$). Figures are unaudited unless confirmed by the accounting officer.
            Accounting Officer: Rachel N. Kashala (SAIBA 4132).
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{companyName} · Profit & Loss Statement</Text>
          <Text style={s.footerText}>{companyEmail ?? "info@swiftdesignz.co.za"} · Generated {generatedAt}</Text>
        </View>

      </Page>
    </Document>
  );
}
