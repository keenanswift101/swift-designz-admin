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

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", padding: 40, fontFamily: "Inter", fontSize: 9, color: "#333" },

  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 36, height: 36 },
  brandName: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: teal, textTransform: "uppercase" as const },
  brandSub: { fontSize: 7, color: "#208080", letterSpacing: 1, marginTop: 2, textTransform: "uppercase" as const },
  docTitle: { textAlign: "right" as const },
  docLabel: { fontSize: 16, fontWeight: 700, color: "#111", letterSpacing: 1, textTransform: "uppercase" as const },
  docMeta: { fontSize: 8, color: "#777", marginTop: 3 },
  docMetaVal: { color: "#333", fontWeight: 600 },

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
  summaryValAmber: { fontSize: 13, fontWeight: 700, color: "#D97706" },

  sectionLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const, marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderColor: border },
  table: { marginBottom: 20 },
  tableHead: { flexDirection: "row", backgroundColor: surface, borderBottomWidth: 1, borderColor: border, paddingVertical: 5, paddingHorizontal: 8 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: border, paddingVertical: 5, paddingHorizontal: 8 },
  tableFooter: { flexDirection: "row", backgroundColor: surface, borderTopWidth: 1.5, borderColor: "#999", paddingVertical: 6, paddingHorizontal: 8 },
  headText: { fontSize: 7, fontWeight: 700, letterSpacing: 1, color: "#777", textTransform: "uppercase" as const },
  cellText: { fontSize: 8, color: "#333" },
  cellBold: { fontSize: 8, fontWeight: 700, color: "#111" },
  cellAmber: { fontSize: 8, fontWeight: 700, color: "#D97706" },
  cellTeal: { fontSize: 8, fontWeight: 700, color: teal },

  colInvoice: { width: "22%" },
  colDate: { width: "18%" },
  colStatus: { width: "18%" },
  colAmt: { width: "21%", textAlign: "right" as const },
  colOutstanding: { flex: 1, textAlign: "right" as const },

  notesBox: { backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 4, padding: 12, marginBottom: 16 },
  notesLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const, marginBottom: 5 },
  notesText: { fontSize: 8, color: "#555", lineHeight: 1.5 },

  footer: { position: "absolute", bottom: 28, left: 40, right: 40, borderTopWidth: 1, borderColor: "#ddd", paddingTop: 7, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#aaa" },
});

export interface AccountStatementInvoiceRow {
  invoice_number: string;
  created_at: string;
  status: string;
  amount: number;
  paid_amount: number;
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

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

export default function AccountStatementPDF({
  statementNumber,
  periodFrom,
  periodTo,
  openingBalance,
  totalInvoiced,
  totalPaid,
  closingBalance,
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
            <Text style={s.summaryLabel}>Total Invoiced</Text>
            <Text style={s.summaryVal}>{fmt(totalInvoiced)}</Text>
          </View>
          <View style={s.summaryCellBorder}>
            <Text style={s.summaryLabel}>Total Paid</Text>
            <Text style={s.summaryValTeal}>{fmt(totalPaid)}</Text>
          </View>
          <View style={s.summaryCellBorder}>
            <Text style={s.summaryLabel}>Closing Balance</Text>
            <Text style={closingBalance > 0 ? s.summaryValAmber : s.summaryValTeal}>{fmt(closingBalance)}</Text>
          </View>
        </View>

        {/* Brought forward */}
        {broughtForward.length > 0 && (
          <View style={s.table}>
            <Text style={s.sectionLabel}>Outstanding Brought Forward</Text>
            <View style={s.tableHead}>
              <Text style={[s.headText, s.colInvoice]}>Invoice</Text>
              <Text style={[s.headText, s.colDate]}>Date</Text>
              <Text style={[s.headText, s.colStatus]}>Status</Text>
              <Text style={[s.headText, s.colAmt]}>Amount</Text>
              <Text style={[s.headText, s.colOutstanding]}>Outstanding</Text>
            </View>
            {broughtForward.map((inv, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={[s.cellBold, s.colInvoice]}>{inv.invoice_number}</Text>
                <Text style={[s.cellText, s.colDate]}>{fmtDate(inv.created_at)}</Text>
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
                <Text style={[s.headText, s.colDate]}>Date</Text>
                <Text style={[s.headText, s.colStatus]}>Status</Text>
                <Text style={[s.headText, s.colAmt]}>Amount</Text>
                <Text style={[s.headText, s.colOutstanding]}>Paid</Text>
              </View>
              {invoicesInPeriod.map((inv, i) => (
                <View key={i} style={s.tableRow}>
                  <Text style={[s.cellBold, s.colInvoice]}>{inv.invoice_number}</Text>
                  <Text style={[s.cellText, s.colDate]}>{fmtDate(inv.created_at)}</Text>
                  <Text style={[s.cellText, s.colStatus]}>{capitalize(inv.status)}</Text>
                  <Text style={[s.cellText, s.colAmt]}>{fmt(inv.amount)}</Text>
                  <Text style={[s.cellTeal, s.colOutstanding]}>{fmt(inv.paid_amount)}</Text>
                </View>
              ))}
              <View style={s.tableFooter}>
                <Text style={[s.cellBold, { flex: 1 }]}>Totals</Text>
                <Text style={[s.cellBold, s.colAmt]}>{fmt(ipBilled)}</Text>
                <Text style={[s.cellTeal, s.colOutstanding]}>{fmt(ipPaid)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Notes */}
        {notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{companyName} · {statementNumber}</Text>
          <Text style={s.footerText}>Generated {generatedAt}</Text>
        </View>
      </Page>
    </Document>
  );
}
