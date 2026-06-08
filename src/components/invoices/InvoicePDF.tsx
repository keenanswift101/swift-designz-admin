import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf", fontWeight: 700 },
  ],
});

const teal = "#30B0B0";
const bg = "#ffffff";
const surface = "#f5f5f5";
const border = "#e0e0e0";

const s = StyleSheet.create({
  page: { backgroundColor: bg, padding: 40, fontFamily: "Inter", fontSize: 9, color: "#333" },
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 40, height: 40 },
  brand: {},
  brandName: { fontSize: 16, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const },
  brandSub: { fontSize: 8, color: "#208080", letterSpacing: 2, marginTop: 2, textTransform: "uppercase" as const },
  docTitle: { textAlign: "right" as const },
  docLabel: { fontSize: 18, fontWeight: 700, color: "#111", letterSpacing: 2, textTransform: "uppercase" as const },
  docMeta: { fontSize: 8, color: "#777", marginTop: 4 },
  docMetaVal: { color: "#333", fontWeight: 600 },
  // Parties
  parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  party: { width: "48%" },
  partyLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const, marginBottom: 6 },
  partyName: { fontSize: 11, fontWeight: 700, color: "#111", marginBottom: 2 },
  partyLine: { fontSize: 8, color: "#555", marginBottom: 1.5 },
  // Table
  table: { marginBottom: 20 },
  tableHead: { flexDirection: "row", backgroundColor: surface, borderBottomWidth: 1, borderColor: border, paddingVertical: 6, paddingHorizontal: 8 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: border, paddingVertical: 6, paddingHorizontal: 8 },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: "center" as const },
  colRate: { width: 70, textAlign: "right" as const },
  colAmt: { width: 80, textAlign: "right" as const },
  headText: { fontSize: 7, fontWeight: 700, letterSpacing: 2, color: "#777", textTransform: "uppercase" as const },
  cellText: { fontSize: 9, color: "#333" },
  cellBold: { fontSize: 9, fontWeight: 600, color: "#111" },
  // Totals
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  totalLabel: { fontSize: 9, color: "#777", marginRight: 20, width: 100, textAlign: "right" as const },
  totalVal: { fontSize: 9, color: "#111", fontWeight: 700, width: 80, textAlign: "right" as const },
  totalTeal: { fontSize: 12, color: "#111", fontWeight: 700, width: 80, textAlign: "right" as const },
  // Status badge
  statusRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8, marginBottom: 20 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 4, fontSize: 8, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const },
  // Payment plan
  planBox: { backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 6, padding: 12, marginBottom: 16 },
  planLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, marginBottom: 6, textTransform: "uppercase" as const },
  planText: { fontSize: 8, color: "#333", marginBottom: 2 },
  planScheduleHead: { flexDirection: "row", marginTop: 6, paddingBottom: 4, borderBottomWidth: 1, borderColor: border },
  planScheduleRow: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 1, borderColor: "#eee" },
  planCol: { width: "33%", fontSize: 8 },
  planColHead: { width: "33%", fontSize: 7, fontWeight: 700, color: "#777", textTransform: "uppercase" as const, letterSpacing: 1 },
  // Payment history
  historyBox: { backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 6, padding: 12, marginBottom: 16 },
  historyHead: { flexDirection: "row", marginBottom: 4, paddingBottom: 4, borderBottomWidth: 1, borderColor: border },
  historyRow: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 1, borderColor: "#eee" },
  histCol1: { width: "25%", fontSize: 8 },
  histCol2: { width: "25%", fontSize: 8 },
  histCol3: { width: "25%", fontSize: 8 },
  histCol4: { width: "25%", fontSize: 8, textAlign: "right" as const },
  histColHead: { fontSize: 7, fontWeight: 700, color: "#777", textTransform: "uppercase" as const, letterSpacing: 1 },
  // Banking
  bankingBox: { backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 6, padding: 12, marginBottom: 16 },
  bankingLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, marginBottom: 8, textTransform: "uppercase" as const },
  bankingSubLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 2, color: "#444", marginBottom: 6, marginTop: 8, textTransform: "uppercase" as const },
  bankingGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const },
  bankingItem: { width: "50%", marginBottom: 5 },
  bankingKey: { fontSize: 7, letterSpacing: 1, textTransform: "uppercase" as const, color: "#888" },
  bankingVal: { fontSize: 8, fontWeight: 600, color: "#111" },
  bankingDivider: { borderBottomWidth: 1, borderColor: border, marginVertical: 8 },
  bankingRef: { marginTop: 8, fontSize: 7, color: "#555" },
  // Notes
  notesBox: { backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 6, padding: 12, marginBottom: 20 },
  notesLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, marginBottom: 4, textTransform: "uppercase" as const },
  notesText: { fontSize: 8, color: "#555", lineHeight: 1.6 },
  // Footer
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderColor: border, paddingTop: 10, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#999" },
  footerTeal: { fontSize: 7, color: teal },
});

interface PaymentRecord {
  amount: number;
  method: string;
  reference: string | null;
  paid_at: string;
}

export interface InvoicePDFProps {
  docType: "invoice" | "quotation";
  invoiceNumber: string;
  status: string;
  dueDate: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string | null;
  clientPhone?: string | null;
  projectName?: string | null;
  items: { description: string; quantity: number; unit_rate: number; amount: number }[];
  total: number;
  discountAmount?: number;
  paidAmount: number;
  notes?: string | null;
  paymentPlanEnabled?: boolean;
  installmentCount?: number | null;
  installmentInterval?: string | null;
  paymentPlanType?: string | null;
  paymentPlanSchedule?: { label: string; amount: number }[] | null;
  payments?: PaymentRecord[];
  logoSrc?: string | null;
}

function formatR(cents: number) {
  const r = cents / 100;
  return `R${r.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function badgeColor(status: string) {
  switch (status) {
    case "paid": return { backgroundColor: "#dcfce7", color: "#166534" };
    case "partial": return { backgroundColor: "#fef3c7", color: "#92400e" };
    case "overdue": return { backgroundColor: "#fee2e2", color: "#991b1b" };
    case "sent": return { backgroundColor: "#dbeafe", color: "#1e40af" };
    case "cancelled": return { backgroundColor: "#f3f4f6", color: "#6b7280" };
    default: return { backgroundColor: surface, color: "#333" };
  }
}

function generatePaymentSchedule(
  total: number,
  paidAmount: number,
  installmentCount: number,
  interval: string,
  dueDate: string,
) {
  const outstanding = total - paidAmount;
  const perInstallment = Math.ceil(outstanding / installmentCount);
  const schedule: { number: number; date: string; amount: number }[] = [];
  const startDate = new Date(dueDate);

  for (let i = 0; i < installmentCount; i++) {
    const date = new Date(startDate);
    if (interval === "monthly") date.setMonth(date.getMonth() + i);
    else if (interval === "bi-weekly") date.setDate(date.getDate() + i * 14);
    else if (interval === "weekly") date.setDate(date.getDate() + i * 7);

    const isLast = i === installmentCount - 1;
    const amount = isLast ? outstanding - perInstallment * (installmentCount - 1) : perInstallment;

    schedule.push({ number: i + 1, date: date.toISOString(), amount: Math.max(0, amount) });
  }
  return schedule;
}

export default function InvoicePDF({
  docType,
  invoiceNumber,
  status,
  dueDate,
  createdAt,
  clientName,
  clientEmail,
  clientCompany,
  clientPhone,
  projectName,
  items,
  total,
  discountAmount = 0,
  paidAmount,
  notes,
  paymentPlanEnabled,
  installmentCount,
  installmentInterval,
  paymentPlanType,
  paymentPlanSchedule,
  payments,
  logoSrc,
}: InvoicePDFProps) {
  const outstanding = total - paidAmount;
  const isQuotation = docType === "quotation";
  const docLabel = isQuotation ? "Quotation" : "Invoice";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {logoSrc && <Image src={logoSrc} style={s.logo} />}
            <View style={s.brand}>
              <Text style={s.brandName}>Swift Designz</Text>
              <Text style={s.brandSub}>swiftdesignz.co.za</Text>
            </View>
          </View>
          <View style={s.docTitle}>
            <Text style={s.docLabel}>{docLabel}</Text>
            <Text style={s.docMeta}>
              <Text style={s.docMetaVal}>{invoiceNumber}</Text>
            </Text>
            <Text style={s.docMeta}>
              Issued: <Text style={s.docMetaVal}>{fmtDate(createdAt)}</Text>
            </Text>
            <Text style={s.docMeta}>
              {isQuotation ? "Valid Until" : "Due"}: <Text style={s.docMetaVal}>{fmtDate(dueDate)}</Text>
            </Text>
          </View>
        </View>

        {/* Parties */}
        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.partyLabel}>{isQuotation ? "Prepared For" : "Bill To"}</Text>
            <Text style={s.partyName}>{clientName}</Text>
            {clientCompany && <Text style={s.partyLine}>{clientCompany}</Text>}
            <Text style={s.partyLine}>{clientEmail}</Text>
            {clientPhone && <Text style={s.partyLine}>{clientPhone}</Text>}
          </View>
          <View style={s.party}>
            <Text style={s.partyLabel}>From</Text>
            <Text style={s.partyName}>Swift Designz Investments CC</Text>
            <Text style={s.partyLine}>CC/2026/05589</Text>
            <Text style={s.partyLine}>info@swiftdesignz.co.za</Text>
            <Text style={s.partyLine}>+264 81 853 6789</Text>
            <Text style={s.partyLine}>Windhoek, Namibia</Text>
          </View>
        </View>

        {/* Project ref */}
        {projectName && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const, marginBottom: 2 }}>Project</Text>
            <Text style={{ fontSize: 9, color: "#333" }}>{projectName}</Text>
          </View>
        )}

        {/* Items Table */}
        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={[s.headText, s.colDesc]}>Description</Text>
            <Text style={[s.headText, s.colQty]}>Qty</Text>
            <Text style={[s.headText, s.colRate]}>Rate</Text>
            <Text style={[s.headText, s.colAmt]}>Amount</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={[s.cellText, s.colDesc]}>{item.description}</Text>
              <Text style={[s.cellText, s.colQty]}>{item.quantity}</Text>
              <Text style={[s.cellText, s.colRate]}>{formatR(item.unit_rate)}</Text>
              <Text style={[s.cellBold, s.colAmt]}>{formatR(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        {discountAmount > 0 && (
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalVal}>{formatR(total + discountAmount)}</Text>
          </View>
        )}
        {discountAmount > 0 && (
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Discount</Text>
            <Text style={[s.totalVal, { color: "#b91c1c" }]}>-{formatR(discountAmount)}</Text>
          </View>
        )}
        {!discountAmount && (
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalVal}>{formatR(total)}</Text>
          </View>
        )}
        {!isQuotation && paidAmount > 0 && (
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Paid</Text>
            <Text style={[s.totalVal, { color: "#166534" }]}>-{formatR(paidAmount)}</Text>
          </View>
        )}
        <View style={[s.totalRow, { marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderColor: border }]}>
          <Text style={[s.totalLabel, { fontSize: 11 }]}>
            {isQuotation ? "Total" : "Amount Due"}
          </Text>
          <Text style={s.totalTeal}>{formatR(isQuotation ? total : outstanding)}</Text>
        </View>

        {/* Status Badge */}
        <View style={s.statusRow}>
          <Text style={[s.badge, badgeColor(status)]}>{status}</Text>
        </View>

        {/* Payment Plan */}
        {paymentPlanEnabled && (
          <View style={s.planBox}>
            <Text style={s.planLabel}>Payment Plan</Text>
            {paymentPlanType && (
              <Text style={[s.planText, { marginBottom: 4, textTransform: "capitalize" as const }]}>
                {paymentPlanType.replace(/_/g, " ").replace(/\b2\b/, "2-").replace(/\b3\b/, "3-")}
              </Text>
            )}
            {paymentPlanSchedule && paymentPlanSchedule.length > 0 ? (
              <>
                <View style={s.planScheduleHead}>
                  <Text style={[s.planColHead, { flex: 2 }]}>Payment</Text>
                  <Text style={[s.planColHead, s.planCol, { textAlign: "right" as const }]}>Amount</Text>
                </View>
                {paymentPlanSchedule.map((row, i) => (
                  <View key={i} style={s.planScheduleRow}>
                    <Text style={[{ flex: 2, fontSize: 8, color: "#333" }]}>{row.label}</Text>
                    <Text style={[s.planCol, { color: "#111", textAlign: "right" as const, fontWeight: 600 }]}>
                      {formatR(row.amount)}
                    </Text>
                  </View>
                ))}
              </>
            ) : installmentCount && installmentCount > 1 && installmentInterval ? (
              <>
                <Text style={s.planText}>
                  {installmentCount} installments · {installmentInterval}
                </Text>
                <Text style={[s.planText, { color: "#777", marginBottom: 4 }]}>
                  {formatR(Math.ceil((isQuotation ? total : outstanding) / installmentCount))} per installment
                </Text>
                <View style={s.planScheduleHead}>
                  <Text style={[s.planColHead, s.planCol]}>#</Text>
                  <Text style={[s.planColHead, s.planCol]}>Due Date</Text>
                  <Text style={[s.planColHead, s.planCol, { textAlign: "right" as const }]}>Amount</Text>
                </View>
                {generatePaymentSchedule(
                  total,
                  isQuotation ? 0 : paidAmount,
                  installmentCount,
                  installmentInterval,
                  dueDate,
                ).map((row) => (
                  <View key={row.number} style={s.planScheduleRow}>
                    <Text style={[s.planCol, { color: "#333" }]}>{row.number}</Text>
                    <Text style={[s.planCol, { color: "#333" }]}>{fmtDate(row.date)}</Text>
                    <Text style={[s.planCol, { color: "#111", textAlign: "right" as const, fontWeight: 600 }]}>
                      {formatR(row.amount)}
                    </Text>
                  </View>
                ))}
              </>
            ) : null}
          </View>
        )}

        {/* Payment History (invoices only) */}
        {!isQuotation && payments && payments.length > 0 && (
          <View style={s.historyBox}>
            <Text style={s.planLabel}>Payment History</Text>
            <View style={s.historyHead}>
              <Text style={[s.histColHead, s.histCol1]}>Date</Text>
              <Text style={[s.histColHead, s.histCol2]}>Method</Text>
              <Text style={[s.histColHead, s.histCol3]}>Reference</Text>
              <Text style={[s.histColHead, s.histCol4]}>Amount</Text>
            </View>
            {payments.map((pay, i) => (
              <View key={i} style={s.historyRow}>
                <Text style={[s.histCol1, { color: "#333" }]}>{fmtDate(pay.paid_at)}</Text>
                <Text style={[s.histCol2, { color: "#555", textTransform: "capitalize" as const }]}>{pay.method}</Text>
                <Text style={[s.histCol3, { color: "#777" }]}>{pay.reference || "—"}</Text>
                <Text style={[s.histCol4, { color: "#111", fontWeight: 600 }]}>{formatR(pay.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Banking Details (invoices only) */}
        {!isQuotation && (
          <View style={s.bankingBox}>
            <Text style={s.bankingLabel}>Banking Details — EFT Payment</Text>
            <Text style={s.bankingSubLabel}>Bank Windhoek — Maerua Mall (WHK)</Text>
            <View style={s.bankingGrid}>
              <View style={s.bankingItem}>
                <Text style={s.bankingKey}>Account Name</Text>
                <Text style={s.bankingVal}>Swift Designz Investments CC</Text>
              </View>
              <View style={s.bankingItem}>
                <Text style={s.bankingKey}>Bank</Text>
                <Text style={s.bankingVal}>Bank Windhoek Limited</Text>
              </View>
              <View style={s.bankingItem}>
                <Text style={s.bankingKey}>Account Number</Text>
                <Text style={s.bankingVal}>8056219849</Text>
              </View>
              <View style={s.bankingItem}>
                <Text style={s.bankingKey}>Account Type</Text>
                <Text style={s.bankingVal}>Cheque (CHK)</Text>
              </View>
              <View style={s.bankingItem}>
                <Text style={s.bankingKey}>Branch Code</Text>
                <Text style={s.bankingVal}>483-872</Text>
              </View>
              <View style={s.bankingItem}>
                <Text style={s.bankingKey}>Swift Code</Text>
                <Text style={s.bankingVal}>BWLINANX</Text>
              </View>
            </View>
            <Text style={s.bankingRef}>
              Reference: {invoiceNumber} — Always include your invoice number as the payment reference.
            </Text>
            <View style={{ borderTopWidth: 1, borderColor: border, marginTop: 8, paddingTop: 8 }}>
              <Text style={{ fontSize: 7, fontWeight: 700, letterSpacing: 2, color: teal, textTransform: "uppercase" as const, marginBottom: 5 }}>
                Submitting Proof of Payment
              </Text>
              <Text style={{ fontSize: 7.5, color: "#444", lineHeight: 1.7, marginBottom: 2 }}>
                1. Use {invoiceNumber} as your payment reference when making the EFT.
              </Text>
              <Text style={{ fontSize: 7.5, color: "#444", lineHeight: 1.7, marginBottom: 2 }}>
                2. Email your bank-generated proof of payment (PDF) to info@swiftdesignz.co.za
              </Text>
              <Text style={{ fontSize: 7.5, color: "#444", lineHeight: 1.7, marginBottom: 2 }}>
                3. Subject line: Proof of Payment – {invoiceNumber}
              </Text>
              <Text style={{ fontSize: 7.5, color: "#444", lineHeight: 1.7 }}>
                4. Our system will process your proof and send a receipt automatically.
              </Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Swift Designz · admin.swiftdesignz.co.za</Text>
          <Text style={s.footerTeal}>{invoiceNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}
