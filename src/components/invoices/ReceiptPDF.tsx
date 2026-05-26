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
const green = "#166534";
const greenBg = "#dcfce7";

const s = StyleSheet.create({
  page: { backgroundColor: bg, padding: 40, fontFamily: "Inter", fontSize: 9, color: "#333" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 40, height: 40 },
  brandName: { fontSize: 16, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const },
  brandSub: { fontSize: 8, color: "#208080", letterSpacing: 2, marginTop: 2, textTransform: "uppercase" as const },
  docTitle: { textAlign: "right" as const },
  docLabel: { fontSize: 18, fontWeight: 700, color: "#111", letterSpacing: 2, textTransform: "uppercase" as const },
  docMeta: { fontSize: 8, color: "#777", marginTop: 4 },
  docMetaVal: { color: "#333", fontWeight: 600 },
  // Confirmed banner
  banner: { backgroundColor: greenBg, borderRadius: 6, padding: 14, marginBottom: 24, alignItems: "center" as const },
  bannerText: { fontSize: 14, fontWeight: 700, color: green },
  bannerSub: { fontSize: 9, color: green, marginTop: 4 },
  // Details boxes
  box: { backgroundColor: surface, borderWidth: 1, borderColor: border, borderRadius: 6, padding: 14, marginBottom: 14 },
  boxLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  rowKey: { fontSize: 8, color: "#777" },
  rowVal: { fontSize: 8, fontWeight: 600, color: "#111" },
  rowValGreen: { fontSize: 8, fontWeight: 700, color: green },
  rowValTeal: { fontSize: 8, fontWeight: 700, color: teal },
  divider: { borderBottomWidth: 1, borderColor: border, marginVertical: 8 },
  amountBox: { backgroundColor: greenBg, borderRadius: 6, padding: 14, marginBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" as const },
  amountLabel: { fontSize: 11, fontWeight: 700, color: green },
  amountVal: { fontSize: 20, fontWeight: 700, color: green },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderColor: border, paddingTop: 10, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#999" },
  footerTeal: { fontSize: 7, color: teal },
});

export interface ReceiptPDFProps {
  receiptNumber: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string | null;
  paymentAmount: number;
  paymentMethod: string;
  paymentReference?: string | null;
  paymentDate: string;
  invoiceTotal: number;
  invoicePaidTotal: number;
  logoSrc?: string | null;
}

function formatR(cents: number) {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ReceiptPDF({
  receiptNumber,
  invoiceNumber,
  clientName,
  clientEmail,
  clientCompany,
  paymentAmount,
  paymentMethod,
  paymentReference,
  paymentDate,
  invoiceTotal,
  invoicePaidTotal,
  logoSrc,
}: ReceiptPDFProps) {
  const balance = invoiceTotal - invoicePaidTotal;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.brandRow}>
            {logoSrc && <Image src={logoSrc} style={s.logo} />}
            <View>
              <Text style={s.brandName}>Swift Designz</Text>
              <Text style={s.brandSub}>swiftdesignz.co.za</Text>
            </View>
          </View>
          <View style={s.docTitle}>
            <Text style={s.docLabel}>Receipt</Text>
            <Text style={s.docMeta}><Text style={s.docMetaVal}>{receiptNumber}</Text></Text>
            <Text style={s.docMeta}>Date: <Text style={s.docMetaVal}>{fmtDate(paymentDate)}</Text></Text>
          </View>
        </View>

        {/* Confirmed banner */}
        <View style={s.banner}>
          <Text style={s.bannerText}>Payment Received</Text>
          <Text style={s.bannerSub}>Thank you — your payment has been confirmed.</Text>
        </View>

        {/* Amount box */}
        <View style={s.amountBox}>
          <Text style={s.amountLabel}>Amount Paid</Text>
          <Text style={s.amountVal}>{formatR(paymentAmount)}</Text>
        </View>

        {/* Payment details */}
        <View style={s.box}>
          <Text style={s.boxLabel}>Payment Details</Text>
          <View style={s.row}>
            <Text style={s.rowKey}>Method</Text>
            <Text style={s.rowVal}>{paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowKey}>Date</Text>
            <Text style={s.rowVal}>{fmtDate(paymentDate)}</Text>
          </View>
          {paymentReference && (
            <View style={s.row}>
              <Text style={s.rowKey}>Reference</Text>
              <Text style={s.rowVal}>{paymentReference}</Text>
            </View>
          )}
        </View>

        {/* Invoice summary */}
        <View style={s.box}>
          <Text style={s.boxLabel}>Invoice Summary</Text>
          <View style={s.row}>
            <Text style={s.rowKey}>Invoice</Text>
            <Text style={s.rowVal}>{invoiceNumber}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowKey}>Invoice Total</Text>
            <Text style={s.rowVal}>{formatR(invoiceTotal)}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.rowKey}>This Payment</Text>
            <Text style={s.rowValGreen}>{formatR(paymentAmount)}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowKey}>Balance Remaining</Text>
            <Text style={balance <= 0 ? s.rowValGreen : s.rowValTeal}>{balance <= 0 ? "Paid in Full" : formatR(balance)}</Text>
          </View>
        </View>

        {/* Client */}
        <View style={s.box}>
          <Text style={s.boxLabel}>Received From</Text>
          <View style={s.row}>
            <Text style={s.rowKey}>Name</Text>
            <Text style={s.rowVal}>{clientName}</Text>
          </View>
          {clientCompany && (
            <View style={s.row}>
              <Text style={s.rowKey}>Company</Text>
              <Text style={s.rowVal}>{clientCompany}</Text>
            </View>
          )}
          <View style={s.row}>
            <Text style={s.rowKey}>Email</Text>
            <Text style={s.rowVal}>{clientEmail}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Swift Designz · admin.swiftdesignz.co.za</Text>
          <Text style={s.footerTeal}>{receiptNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}
