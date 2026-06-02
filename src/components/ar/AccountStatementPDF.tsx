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
const amber = "#D97706";
const surface = "#f5f5f5";
const border = "#e0e0e0";

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", padding: 40, fontFamily: "Inter", fontSize: 9, color: "#333" },

  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 36, height: 36 },
  brandName: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: teal, textTransform: "uppercase" as const },
  brandSub: { fontSize: 7, color: "#208080", letterSpacing: 1, marginTop: 2, textTransform: "uppercase" as const },
  docTitle: { textAlign: "right" as const },
  docLabel: { fontSize: 16, fontWeight: 700, color: "#111", letterSpacing: 1, textTransform: "uppercase" as const },
  docMeta: { fontSize: 8, color: "#777", marginTop: 3 },
  docMetaVal: { color: "#333", fontWeight: 600 },

  divider: { borderBottomWidth: 1, borderColor: border, marginBottom: 18 },

  parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  party: { width: "48%" },
  partyLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const, marginBottom: 5 },
  partyName: { fontSize: 11, fontWeight: 700, color: "#111", marginBottom: 2 },
  partyLine: { fontSize: 8, color: "#555", marginBottom: 1.5 },

  summaryBox: { flexDirection: "row", backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 4, padding: 14, marginBottom: 20, gap: 0 },
  summaryCell: { flex: 1, alignItems: "center" as const },
  summaryCellBorder: { flex: 1, alignItems: "center" as const, borderLeftWidth: 1, borderColor: border },
  summaryLabel: { fontSize: 7, color: "#888", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 4 },
  summaryVal: { fontSize: 13, fontWeight: 700, color: "#111" },
  summaryValTeal: { fontSize: 13, fontWeight: 700, color: teal },
  summaryValAmber: { fontSize: 13, fontWeight: 700, color: amber },
  summarySubNote: { fontSize: 7, color: "#999", marginTop: 3, textAlign: "center" as const },

  sectionLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const, marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderColor: border },
  sectionLabelAmber: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: amber, textTransform: "uppercase" as const, marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderColor: "#f0d090" },
  table: { marginBottom: 20 },
  tableHead: { flexDirection: "row", backgroundColor: surface, borderBottomWidth: 1, borderColor: border, paddingVertical: 5, paddingHorizontal: 8 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: border, paddingVertical: 5, paddingHorizontal: 8 },
  tableFooter: { flexDirection: "row", backgroundColor: surface, borderTopWidth: 1.5, borderColor: "#999", paddingVertical: 6, paddingHorizontal: 8 },
  headText: { fontSize: 7, fontWeight: 700, letterSpacing: 1, color: "#777", textTransform: "uppercase" as const },
  cellText: { fontSize: 8, color: "#333" },
  cellBold: { fontSize: 8, fontWeight: 700, color: "#111" },
  cellAmber: { fontSize: 8, fontWeight: 700, color: amber },
  cellTeal: { fontSize: 8, fontWeight: 700, color: teal },
  cellGray: { fontSize: 8, color: "#aaa" },

  // column widths — 5-col table (invoice/issued/due/status/amount/paid/outstanding)
  colInvoice: { width: "18%" },
  colDate: { width: "14%" },
  colDue: { width: "14%" },
  colStatus: { width: "14%" },
  colAmt: { width: "15%", textAlign: "right" as const },
  colPaid: { width: "14%", textAlign: "right" as const },
  colOutstanding: { flex: 1, textAlign: "right" as const },

  // scheduled installments table columns
  colSchedLabel: { flex: 1 },
  colSchedPlan: { width: "22%" },
  colSchedDue: { width: "20%" },
  colSchedAmt: { width: "18%", textAlign: "right" as const },

  notesBox: { backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 4, padding: 12, marginBottom: 16 },
  notesLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const, marginBottom: 5 },
  notesText: { fontSize: 8, color: "#555", lineHeight: 1.5 },

  alertBox: { backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#f0d090", borderRadius: 4, padding: 10, marginBottom: 16 },
  alertText: { fontSize: 8, color: "#92400e", lineHeight: 1.5 },

  termsBox: { marginBottom: 16 },
  termsLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: "#888", textTransform: "uppercase" as const, marginBottom: 4 },
  termsText: { fontSize: 7.5, color: "#888", lineHeight: 1.5 },

  footer: { position: "absolute", bottom: 28, left: 40, right: 40, borderTopWidth: 1, borderColor: "#ddd", paddingTop: 7, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#aaa" },
  footerRight: { fontSize: 7, color: "#aaa", textAlign: "right" as const },
});

export interface AccountStatementInvoiceRow {
  invoice_number: string;
  created_at: string;
  due_date?: string | null;
  status: string;
  amount: number;
  paid_amount: number;
}

export interface AccountStatementScheduledRow {
  label: string;
  amount: number;
  due_date: string | null;
  plan_type: string | null;
}

export interface AccountStatementPDFProps {
  statementNumber: string;
  periodType: string;
  periodFrom: string;
  periodTo: string;
  triggerType: string;
  openingBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  closingBalance: number;
  scheduledInstallments?: AccountStatementScheduledRow[];
  clientName: string;
  clientCompany: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  companyName: string;
  companyAddress: string | null;
  companyPhone: string | null;
  companyEmail: string | null;
  companyVat: string | null;
  broughtForward: AccountStatementInvoiceRow[];
  invoicesInPeriod: AccountStatementInvoiceRow[];
  notes: string | null;
  generatedAt: string;
  logoSrc: string | null;
}

function fmt(cents: number): string {
  return "R " + (cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

function planLabel(type: string | null): string {
  if (!type) return "Payment Plan";
  const map: Record<string, string> = {
    full_pay: "Full Payment",
    standard: "Standard (50/50)",
    "2_month_flex": "2-Month Flex",
    "3_month_ease": "3-Month Ease",
  };
  return map[type] ?? type.replace(/_/g, " ");
}

export default function AccountStatementPDF({
  statementNumber,
  periodFrom,
  periodTo,
  openingBalance,
  totalInvoiced,
  totalPaid,
  closingBalance,
  scheduledInstallments = [],
  clientName,
  clientCompany,
  clientEmail,
  clientPhone,
  companyName,
  companyAddress,
  companyPhone,
  companyEmail,
  companyVat,
  broughtForward,
  invoicesInPeriod,
  notes,
  generatedAt,
  logoSrc,
}: AccountStatementPDFProps) {
  const bfTotal = broughtForward.reduce((s, i) => s + Math.max(0, i.amount - i.paid_amount), 0);
  const ipBilled = invoicesInPeriod.reduce((s, i) => s + i.amount, 0);
  const ipPaid = invoicesInPeriod.reduce((s, i) => s + i.paid_amount, 0);
  const ipOutstanding = invoicesInPeriod.reduce((s, i) => s + Math.max(0, i.amount - i.paid_amount), 0);
  const scheduledTotal = scheduledInstallments.reduce((s, i) => s + i.amount, 0);
  const hasScheduled = scheduledInstallments.length > 0;
  const effectiveOutstanding = closingBalance + scheduledTotal;

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
            <Text style={s.docLabel}>Account Statement</Text>
            <Text style={s.docMeta}><Text style={s.docMetaVal}>{statementNumber}</Text></Text>
            <Text style={s.docMeta}>Period: <Text style={s.docMetaVal}>{fmtDate(periodFrom)} — {fmtDate(periodTo)}</Text></Text>
            <Text style={s.docMeta}>Generated: <Text style={s.docMetaVal}>{generatedAt}</Text></Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Parties */}
        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.partyLabel}>From</Text>
            <Text style={s.partyName}>{companyName}</Text>
            {companyAddress && <Text style={s.partyLine}>{companyAddress}</Text>}
            {companyPhone && <Text style={s.partyLine}>{companyPhone}</Text>}
            {companyEmail && <Text style={s.partyLine}>{companyEmail}</Text>}
            {companyVat && <Text style={s.partyLine}>Tax No: {companyVat}</Text>}
          </View>
          <View style={s.party}>
            <Text style={s.partyLabel}>Client</Text>
            <Text style={s.partyName}>{clientName}</Text>
            {clientCompany && <Text style={s.partyLine}>{clientCompany}</Text>}
            {clientEmail && <Text style={s.partyLine}>{clientEmail}</Text>}
            {clientPhone && <Text style={s.partyLine}>{clientPhone}</Text>}
          </View>
        </View>

        {/* Financial summary */}
        <View style={s.summaryBox}>
          <View style={s.summaryCell}>
            <Text style={s.summaryLabel}>Opening Balance</Text>
            <Text style={openingBalance > 0 ? s.summaryValAmber : s.summaryVal}>{fmt(openingBalance)}</Text>
          </View>
          <View style={s.summaryCellBorder}>
            <Text style={s.summaryLabel}>{hasScheduled ? "Total Contracted" : "Total Invoiced"}</Text>
            <Text style={s.summaryVal}>{fmt(hasScheduled ? totalInvoiced + scheduledTotal : totalInvoiced)}</Text>
            {hasScheduled && (
              <Text style={s.summarySubNote}>{fmt(totalInvoiced)} billed + {fmt(scheduledTotal)} scheduled</Text>
            )}
          </View>
          <View style={s.summaryCellBorder}>
            <Text style={s.summaryLabel}>Total Paid</Text>
            <Text style={s.summaryValTeal}>{fmt(totalPaid)}</Text>
          </View>
          <View style={s.summaryCellBorder}>
            <Text style={s.summaryLabel}>{hasScheduled ? "Total Outstanding" : "Closing Balance"}</Text>
            <Text style={effectiveOutstanding > 0 ? s.summaryValAmber : s.summaryValTeal}>{fmt(effectiveOutstanding)}</Text>
            {hasScheduled && closingBalance > 0 && (
              <Text style={s.summarySubNote}>{fmt(closingBalance)} overdue + {fmt(scheduledTotal)} upcoming</Text>
            )}
          </View>
        </View>

        {/* Brought forward */}
        {broughtForward.length > 0 && (
          <View style={s.table} wrap={false}>
            <Text style={s.sectionLabel}>Outstanding Brought Forward</Text>
            <View style={s.tableHead}>
              <Text style={[s.headText, s.colInvoice]}>Invoice</Text>
              <Text style={[s.headText, s.colDate]}>Issued</Text>
              <Text style={[s.headText, s.colDue]}>Due</Text>
              <Text style={[s.headText, s.colStatus]}>Status</Text>
              <Text style={[s.headText, s.colAmt]}>Amount</Text>
              <Text style={[s.headText, s.colOutstanding]}>Outstanding</Text>
            </View>
            {broughtForward.map((inv, i) => (
              <View key={i} style={s.tableRow} wrap={false}>
                <Text style={[s.cellBold, s.colInvoice]}>{inv.invoice_number}</Text>
                <Text style={[s.cellText, s.colDate]}>{fmtDate(inv.created_at)}</Text>
                <Text style={[s.cellText, s.colDue]}>{fmtDate(inv.due_date)}</Text>
                <Text style={[s.cellText, s.colStatus]}>{capitalize(inv.status)}</Text>
                <Text style={[s.cellText, s.colAmt]}>{fmt(inv.amount)}</Text>
                <Text style={[s.cellAmber, s.colOutstanding]}>{fmt(Math.max(0, inv.amount - inv.paid_amount))}</Text>
              </View>
            ))}
            <View style={s.tableFooter}>
              <Text style={[s.cellBold, { flex: 1 }]}>Opening Balance</Text>
              <Text style={[s.cellAmber, s.colOutstanding]}>{fmt(bfTotal)}</Text>
            </View>
          </View>
        )}

        {/* Invoices in period */}
        <View style={s.table}>
          <Text style={s.sectionLabel}>Invoices in Period</Text>
          {invoicesInPeriod.length === 0 ? (
            <Text style={{ fontSize: 8, color: "#888", paddingVertical: 8 }}>No invoices raised in this period.</Text>
          ) : (
            <>
              <View style={s.tableHead}>
                <Text style={[s.headText, s.colInvoice]}>Invoice</Text>
                <Text style={[s.headText, s.colDate]}>Issued</Text>
                <Text style={[s.headText, s.colDue]}>Due</Text>
                <Text style={[s.headText, s.colStatus]}>Status</Text>
                <Text style={[s.headText, s.colAmt]}>Amount</Text>
                <Text style={[s.headText, s.colPaid]}>Paid</Text>
                <Text style={[s.headText, s.colOutstanding]}>Outstanding</Text>
              </View>
              {invoicesInPeriod.map((inv, i) => {
                const outstanding = Math.max(0, inv.amount - inv.paid_amount);
                return (
                  <View key={i} style={s.tableRow} wrap={false}>
                    <Text style={[s.cellBold, s.colInvoice]}>{inv.invoice_number}</Text>
                    <Text style={[s.cellText, s.colDate]}>{fmtDate(inv.created_at)}</Text>
                    <Text style={[s.cellText, s.colDue]}>{fmtDate(inv.due_date)}</Text>
                    <Text style={[s.cellText, s.colStatus]}>{capitalize(inv.status)}</Text>
                    <Text style={[s.cellText, s.colAmt]}>{fmt(inv.amount)}</Text>
                    <Text style={[s.cellTeal, s.colPaid]}>{fmt(inv.paid_amount)}</Text>
                    <Text style={[outstanding > 0 ? s.cellAmber : s.cellGray, s.colOutstanding]}>
                      {outstanding > 0 ? fmt(outstanding) : "—"}
                    </Text>
                  </View>
                );
              })}
              <View style={s.tableFooter}>
                <Text style={[s.cellBold, { flex: 1 }]}>Totals</Text>
                <Text style={[s.cellBold, s.colAmt]}>{fmt(ipBilled)}</Text>
                <Text style={[s.cellTeal, s.colPaid]}>{fmt(ipPaid)}</Text>
                <Text style={[ipOutstanding > 0 ? s.cellAmber : s.cellGray, s.colOutstanding]}>
                  {ipOutstanding > 0 ? fmt(ipOutstanding) : "—"}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Scheduled installments */}
        {hasScheduled && (
          <View style={s.table} wrap={false}>
            <Text style={s.sectionLabelAmber}>Scheduled Installments — Not Yet Invoiced</Text>
            <View style={s.tableHead}>
              <Text style={[s.headText, s.colSchedLabel]}>Installment</Text>
              <Text style={[s.headText, s.colSchedPlan]}>Plan Type</Text>
              <Text style={[s.headText, s.colSchedDue]}>Due Date</Text>
              <Text style={[s.headText, s.colSchedAmt]}>Amount</Text>
            </View>
            {scheduledInstallments.map((entry, i) => (
              <View key={i} style={s.tableRow} wrap={false}>
                <Text style={[s.cellText, s.colSchedLabel]}>{entry.label}</Text>
                <Text style={[s.cellText, s.colSchedPlan]}>{planLabel(entry.plan_type)}</Text>
                <Text style={[s.cellText, s.colSchedDue]}>{fmtDate(entry.due_date)}</Text>
                <Text style={[s.cellAmber, s.colSchedAmt]}>{fmt(entry.amount)}</Text>
              </View>
            ))}
            <View style={s.tableFooter}>
              <Text style={[s.cellBold, { flex: 1 }]}>Total Scheduled</Text>
              <Text style={[s.cellAmber, s.colSchedAmt]}>{fmt(scheduledTotal)}</Text>
            </View>
          </View>
        )}

        {/* Active plan notice */}
        {hasScheduled && (
          <View style={s.alertBox}>
            <Text style={s.alertText}>
              This account has an active payment plan. The scheduled installments above are contractual obligations that will be invoiced on their respective due dates. The closing balance of {fmt(effectiveOutstanding)} reflects the full amount outstanding including scheduled future payments.
            </Text>
          </View>
        )}

        {/* Notes */}
        {notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* Payment terms */}
        <View style={s.termsBox}>
          <Text style={s.termsLabel}>Statement Terms</Text>
          <Text style={s.termsText}>
            This statement reflects all invoicing and payment activity for the period shown. Outstanding balances are payable immediately unless subject to an active payment plan. For queries regarding this statement, please contact us at {companyEmail ?? "info@swiftdesignz.co.za"}.
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{companyName} · {statementNumber}</Text>
          <Text style={s.footerRight}>Generated {generatedAt} · {companyEmail ?? "info@swiftdesignz.co.za"}</Text>
        </View>

      </Page>
    </Document>
  );
}
