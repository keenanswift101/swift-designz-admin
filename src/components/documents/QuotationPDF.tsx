import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";

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
  page: { backgroundColor: bg, paddingTop: 36, paddingBottom: 52, paddingHorizontal: 40, fontFamily: "Inter", fontSize: 9, color: "#333" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, paddingBottom: 14, borderBottomWidth: 2, borderColor: teal },
  brandName: { fontSize: 15, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const },
  brandSub: { fontSize: 7, color: "#208080", letterSpacing: 2, marginTop: 2, textTransform: "uppercase" as const },
  docRight: { textAlign: "right" as const },
  docLabel: { fontSize: 18, fontWeight: 700, color: "#111", letterSpacing: 1, textTransform: "uppercase" as const },
  docNum: { fontSize: 9, color: "#555", marginTop: 3, fontWeight: 600 },
  docMeta: { fontSize: 7.5, color: "#888", marginTop: 2 },
  docMetaVal: { color: "#444", fontWeight: 600 },

  parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, gap: 12 },
  party: { flex: 1, backgroundColor: surface, padding: 10, borderRadius: 4 },
  partyLabel: { fontSize: 6.5, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const, marginBottom: 5 },
  partyName: { fontSize: 10, fontWeight: 700, color: "#111", marginBottom: 2 },
  partySub: { fontSize: 7.5, color: "#555", marginBottom: 1.5 },

  tableBox: { marginBottom: 0, borderWidth: 1, borderColor: border, borderRadius: 4, overflow: "hidden" },
  tableHead: { flexDirection: "row", backgroundColor: "#e8f7f7", paddingVertical: 5, paddingHorizontal: 8 },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderColor: border, paddingVertical: 5, paddingHorizontal: 8 },
  tableRowAlt: { flexDirection: "row", borderTopWidth: 1, borderColor: border, paddingVertical: 5, paddingHorizontal: 8, backgroundColor: "#fafafa" },
  thText: { fontSize: 6.5, fontWeight: 700, color: teal, letterSpacing: 0.8, textTransform: "uppercase" as const },
  tdText: { fontSize: 8, color: "#333" },
  tdMuted: { fontSize: 8, color: "#777" },
  tdBold: { fontSize: 8, color: "#111", fontWeight: 700 },
  tdTeal: { fontSize: 9, color: teal, fontWeight: 700 },

  colDesc: { flex: 1 },
  colQty: { width: 36, textAlign: "center" as const },
  colRate: { width: 72, textAlign: "right" as const },
  colAmt: { width: 72, textAlign: "right" as const },

  totalsBox: { borderTopWidth: 0, borderWidth: 1, borderColor: border, borderRadius: 4, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTopColor: "transparent", padding: 10, backgroundColor: surface },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  totalsLabel: { fontSize: 8, color: "#666" },
  totalsValue: { fontSize: 8, color: "#444", fontWeight: 600 },
  totalFinalLabel: { fontSize: 10, fontWeight: 700, color: "#111" },
  totalFinalValue: { fontSize: 12, fontWeight: 700, color: teal },
  totalDivider: { borderTopWidth: 1, borderColor: border, marginVertical: 5 },

  sectionTitle: { fontSize: 7.5, fontWeight: 700, color: teal, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 4, marginTop: 12 },
  sectionBody: { fontSize: 7.5, color: "#444", lineHeight: 1.6 },

  planBox: { backgroundColor: "#e8f7f7", borderLeftWidth: 3, borderColor: teal, padding: 8, borderRadius: 2, marginTop: 10 },
  planRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  planLabel: { fontSize: 7.5, color: "#444" },
  planAmt: { fontSize: 7.5, fontWeight: 600, color: "#222" },

  footer: { position: "absolute", bottom: 22, left: 40, right: 40, borderTopWidth: 1, borderColor: border, paddingTop: 7, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 6.5, color: "#999" },
  footerTeal: { fontSize: 6.5, color: teal },
});

function fmtR(cents: number) {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

const PAYMENT_PLAN_LABELS: Record<string, string> = {
  standard: "Standard (50% upfront / 50% on completion)",
  full_pay: "Full Payment Upfront",
  "2_month_flex": "2 Month Flex (2 equal monthly payments)",
  "3_month_ease": "3 Month Ease (3 equal monthly payments)",
  custom: "Custom Payment Schedule",
};

export interface QuotationPDFProps {
  quoteNumber: string;
  clientName: string;
  clientEmail?: string | null;
  clientCompany?: string | null;
  clientPhone?: string | null;
  projectName?: string | null;
  lineItems: { description: string; quantity: number; unit_rate: number; amount: number }[];
  subtotal: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  total: number;
  notes?: string | null;
  terms?: string | null;
  paymentPlanEnabled: boolean;
  paymentPlanType?: string | null;
  paymentPlanSchedule?: { label: string; amount_cents: number; due_date?: string }[] | null;
  createdAt: string;
  expiresAt?: string | null;
}

export default function QuotationPDF({
  quoteNumber,
  clientName,
  clientEmail,
  clientCompany,
  clientPhone,
  projectName,
  lineItems,
  subtotal,
  discountType,
  discountValue,
  discountAmount,
  total,
  notes,
  terms,
  paymentPlanEnabled,
  paymentPlanType,
  paymentPlanSchedule,
  createdAt,
  expiresAt,
}: QuotationPDFProps) {
  return (
    <Document title={`Quotation ${quoteNumber} — Swift Designz`} author="Swift Designz">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brandName}>Swift Designz</Text>
            <Text style={s.brandSub}>swiftdesignz.co.za</Text>
          </View>
          <View style={s.docRight}>
            <Text style={s.docLabel}>Quotation</Text>
            <Text style={s.docNum}>{quoteNumber}</Text>
            <Text style={s.docMeta}>
              <Text style={s.docMetaVal}>Issued: </Text>{fmtDate(createdAt)}
            </Text>
            {expiresAt && (
              <Text style={s.docMeta}>
                <Text style={s.docMetaVal}>Expires: </Text>{fmtDate(expiresAt)}
              </Text>
            )}
          </View>
        </View>

        {/* Parties */}
        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.partyLabel}>Billed To</Text>
            <Text style={s.partyName}>{clientName}</Text>
            {clientCompany && <Text style={s.partySub}>{clientCompany}</Text>}
            {clientEmail && <Text style={s.partySub}>{clientEmail}</Text>}
            {clientPhone && <Text style={s.partySub}>{clientPhone}</Text>}
            {projectName && <Text style={[s.partySub, { marginTop: 4, color: teal }]}>Project: {projectName}</Text>}
          </View>
          <View style={s.party}>
            <Text style={s.partyLabel}>From</Text>
            <Text style={s.partyName}>Swift Designz</Text>
            <Text style={s.partySub}>keenan@swiftdesignz.co.za</Text>
            <Text style={s.partySub}>+27 72 345 6789</Text>
            <Text style={s.partySub}>Cape Town, South Africa</Text>
          </View>
        </View>

        {/* Line items table */}
        <View style={s.tableBox}>
          <View style={s.tableHead}>
            <Text style={[s.thText, s.colDesc]}>Description</Text>
            <Text style={[s.thText, s.colQty]}>Qty</Text>
            <Text style={[s.thText, s.colRate]}>Rate</Text>
            <Text style={[s.thText, s.colAmt]}>Amount</Text>
          </View>
          {lineItems.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={[s.tdText, s.colDesc]}>{item.description}</Text>
              <Text style={[s.tdMuted, s.colQty]}>{item.quantity}</Text>
              <Text style={[s.tdMuted, s.colRate]}>{fmtR(item.unit_rate)}</Text>
              <Text style={[s.tdBold, s.colAmt]}>{fmtR(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={s.totalsBox}>
          {discountAmount > 0 && (
            <>
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>Subtotal</Text>
                <Text style={s.totalsValue}>{fmtR(subtotal)}</Text>
              </View>
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>
                  Discount {discountType === "percentage" ? `(${discountValue}%)` : "(fixed)"}
                </Text>
                <Text style={[s.totalsValue, { color: "#cc6600" }]}>-{fmtR(discountAmount)}</Text>
              </View>
              <View style={s.totalDivider} />
            </>
          )}
          <View style={s.totalsRow}>
            <Text style={s.totalFinalLabel}>Total</Text>
            <Text style={s.totalFinalValue}>{fmtR(total)}</Text>
          </View>
        </View>

        {/* Payment plan */}
        {paymentPlanEnabled && (
          <View style={s.planBox}>
            <Text style={[s.sectionTitle, { marginTop: 0 }]}>Payment Plan</Text>
            <Text style={[s.sectionBody, { marginBottom: 4 }]}>
              {PAYMENT_PLAN_LABELS[paymentPlanType ?? ""] ?? paymentPlanType ?? "Custom"}
            </Text>
            {paymentPlanSchedule && paymentPlanSchedule.length > 0 && paymentPlanSchedule.map((inst, i) => (
              <View key={i} style={s.planRow}>
                <Text style={s.planLabel}>{inst.label}{inst.due_date ? ` — due ${fmtDate(inst.due_date)}` : ""}</Text>
                <Text style={s.planAmt}>{fmtR(inst.amount_cents)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {notes && (
          <>
            <Text style={s.sectionTitle}>Notes</Text>
            <Text style={s.sectionBody}>{notes}</Text>
          </>
        )}

        {/* Terms */}
        {terms && (
          <>
            <Text style={s.sectionTitle}>Terms &amp; Conditions</Text>
            <Text style={s.sectionBody}>{terms}</Text>
          </>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Swift Designz · swiftdesignz.co.za · keenan@swiftdesignz.co.za</Text>
          <Text style={s.footerTeal}>{quoteNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}
