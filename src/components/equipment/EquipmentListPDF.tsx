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
const dark = "#111111";

const s = StyleSheet.create({
  page: { backgroundColor: bg, padding: 40, fontFamily: "Inter", fontSize: 9, color: "#333" },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderColor: teal },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 36, height: 36 },
  brandName: { fontSize: 15, fontWeight: 700, letterSpacing: 3, color: teal, textTransform: "uppercase" as const },
  brandMeta: { fontSize: 7.5, color: "#666", marginTop: 2 },
  docTitle: { textAlign: "right" as const },
  docLabel: { fontSize: 17, fontWeight: 700, color: dark, letterSpacing: 2, textTransform: "uppercase" as const },
  docSub: { fontSize: 8, color: teal, marginTop: 3, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const },
  docDate: { fontSize: 8, color: "#777", marginTop: 4 },

  // Summary bar
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryBox: { flex: 1, backgroundColor: surface, borderRadius: 5, padding: 10, borderWidth: 1, borderColor: border },
  summaryLabel: { fontSize: 7, color: "#888", textTransform: "uppercase" as const, letterSpacing: 1.5, marginBottom: 4 },
  summaryVal: { fontSize: 13, fontWeight: 700, color: dark },
  summaryValTeal: { fontSize: 13, fontWeight: 700, color: teal },

  // Category heading
  catHeading: { flexDirection: "row", alignItems: "center", marginBottom: 6, marginTop: 16 },
  catLabel: { fontSize: 8, fontWeight: 700, color: teal, textTransform: "uppercase" as const, letterSpacing: 2 },
  catCount: { fontSize: 7.5, color: "#999", marginLeft: 6 },

  // Table
  tableHead: { flexDirection: "row", backgroundColor: "#ececec", paddingVertical: 5, paddingHorizontal: 6, borderRadius: 3 },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 1, borderColor: "#eeeeee" },
  tableRowAlt: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 1, borderColor: "#eeeeee", backgroundColor: "#fafafa" },

  // Columns
  colNum: { width: 22, fontSize: 7.5, color: "#aaa", textAlign: "right" as const, paddingRight: 6 },
  colName: { flex: 1 },
  colCond: { width: 52, fontSize: 8, textAlign: "center" as const },
  colDate: { width: 58, fontSize: 8, textAlign: "center" as const },
  colPrice: { width: 68, fontSize: 8, textAlign: "right" as const },
  colValue: { width: 68, fontSize: 8, fontWeight: 600, textAlign: "right" as const },

  headText: { fontSize: 7, fontWeight: 700, color: "#777", textTransform: "uppercase" as const, letterSpacing: 1 },
  itemName: { fontSize: 8.5, fontWeight: 600, color: dark },
  itemMeta: { fontSize: 7, color: "#888", marginTop: 1.5 },
  itemSerial: { fontSize: 6.5, color: "#aaa", marginTop: 1 },

  // Condition badges
  condNew: { color: "#166534", backgroundColor: "#dcfce7", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, fontSize: 7, fontWeight: 700, textAlign: "center" as const },
  condGood: { color: "#1e40af", backgroundColor: "#dbeafe", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, fontSize: 7, fontWeight: 700, textAlign: "center" as const },
  condFair: { color: "#92400e", backgroundColor: "#fef3c7", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, fontSize: 7, fontWeight: 700, textAlign: "center" as const },
  condPoor: { color: "#991b1b", backgroundColor: "#fee2e2", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, fontSize: 7, fontWeight: 700, textAlign: "center" as const },

  // Totals
  totalSection: { marginTop: 20, borderTopWidth: 2, borderColor: border, paddingTop: 10 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  totalLabel: { fontSize: 8.5, color: "#777", marginRight: 16, width: 140, textAlign: "right" as const },
  totalVal: { fontSize: 8.5, fontWeight: 600, color: dark, width: 80, textAlign: "right" as const },
  grandLabel: { fontSize: 10, fontWeight: 700, color: dark, marginRight: 16, width: 140, textAlign: "right" as const },
  grandVal: { fontSize: 10, fontWeight: 700, color: teal, width: 80, textAlign: "right" as const },

  // Declaration
  declaration: { marginTop: 28, backgroundColor: surface, borderRadius: 5, padding: 12, borderWidth: 1, borderColor: border },
  declLabel: { fontSize: 7, fontWeight: 700, color: teal, textTransform: "uppercase" as const, letterSpacing: 2, marginBottom: 6 },
  declText: { fontSize: 7.5, color: "#555", lineHeight: 1.5 },
  sigRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  sigBlock: { width: "45%" },
  sigLine: { borderBottomWidth: 1, borderColor: "#aaa", marginBottom: 4 },
  sigLabel: { fontSize: 7, color: "#888" },

  // Footer
  footer: { position: "absolute", bottom: 28, left: 40, right: 40, borderTopWidth: 1, borderColor: border, paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footerLeft: { fontSize: 7, color: "#aaa" },
  footerRight: { fontSize: 7, color: teal },
});

function fmt(cents: number | null | undefined): string {
  if (!cents) return "N$ 0.00";
  const n = cents / 100;
  return "N$ " + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day} ${months[parseInt(m) - 1]} ${y}`;
}

function CondBadge({ cond }: { cond: string | null }) {
  const label = (cond ?? "—").charAt(0).toUpperCase() + (cond ?? "").slice(1);
  const style =
    cond === "new" ? s.condNew :
    cond === "good" ? s.condGood :
    cond === "fair" ? s.condFair :
    s.condPoor;
  return <Text style={style}>{label}</Text>;
}

export interface EquipmentPDFItem {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  condition: string | null;
  purchased_at: string | null;
  purchase_price: number | null;
  current_value: number | null;
  status: string;
  notes: string | null;
}

interface Props {
  items: EquipmentPDFItem[];
  logoSrc?: string | null;
  generatedDate: string;
}

const CATEGORY_ORDER = ["computing", "peripherals", "mobile", "networking", "software_licence", "office", "other"];
const CATEGORY_LABELS: Record<string, string> = {
  computing: "Computing",
  peripherals: "Peripherals",
  mobile: "Mobile Devices",
  networking: "Networking",
  software_licence: "Software Licences",
  office: "Office Equipment",
  other: "Other",
};

export default function EquipmentListPDF({ items, logoSrc, generatedDate }: Props) {
  const active = items.filter((i) => i.status === "active");
  const totalCurrent = active.reduce((s, i) => s + (i.current_value ?? 0), 0);
  const totalPurchase = active.reduce((s, i) => s + (i.purchase_price ?? 0), 0);

  // Pre-compute global index for each item before render (avoids mutation inside JSX)
  let counter = 0;
  const byCategory = CATEGORY_ORDER
    .map((cat) => ({
      cat,
      rows: active
        .filter((i) => i.category === cat)
        .map((item) => ({ ...item, globalIdx: ++counter })),
    }))
    .filter(({ rows }) => rows.length > 0);

  return (
    <Document title="Equipment Asset Register — Swift Designz Investments CC">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header} fixed>
          <View style={s.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {logoSrc && <Image src={logoSrc} style={s.logo} />}
            <View>
              <Text style={s.brandName}>Swift Designz</Text>
              <Text style={s.brandMeta}>Swift Designz Investments CC  |  CC/2026/05589</Text>
              <Text style={s.brandMeta}>TIN: 16271273  |  Windhoek, Namibia</Text>
            </View>
          </View>
          <View style={s.docTitle}>
            <Text style={s.docLabel}>Equipment Register</Text>
            <Text style={s.docSub}>Insurance Asset Schedule</Text>
            <Text style={s.docDate}>Generated: {generatedDate}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={s.summaryRow}>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Total Items</Text>
            <Text style={s.summaryVal}>{active.length}</Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Original Purchase Value</Text>
            <Text style={s.summaryVal}>{fmt(totalPurchase)}</Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Current Asset Value</Text>
            <Text style={s.summaryValTeal}>{fmt(totalCurrent)}</Text>
          </View>
        </View>

        {/* Equipment by category */}
        {byCategory.map(({ cat, rows }) => {
          const catTotal = rows.reduce((s, i) => s + (i.current_value ?? 0), 0);
          return (
            <View key={cat}>
              {/* Category heading */}
              <View style={s.catHeading}>
                <Text style={s.catLabel}>{CATEGORY_LABELS[cat] ?? cat}</Text>
                <Text style={s.catCount}>({rows.length} items  —  {fmt(catTotal)})</Text>
              </View>

              {/* Table head */}
              <View style={s.tableHead}>
                <Text style={[s.colNum, s.headText]}>#</Text>
                <Text style={[s.colName, s.headText]}>Item</Text>
                <Text style={[s.colCond, s.headText]}>Condition</Text>
                <Text style={[s.colDate, s.headText]}>Purchased</Text>
                <Text style={[s.colPrice, s.headText]}>Orig. Price</Text>
                <Text style={[s.colValue, s.headText]}>Current Value</Text>
              </View>

              {/* Rows */}
              {rows.map((item, i) => {
                const brandModel = [item.brand, item.model].filter(Boolean).join(" ");
                return (
                  <View key={item.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                    <Text style={s.colNum}>{item.globalIdx}</Text>
                    <View style={s.colName}>
                      <Text style={s.itemName}>{item.name}</Text>
                      {brandModel ? <Text style={s.itemMeta}>{brandModel}</Text> : null}
                      {item.serial_number ? <Text style={s.itemSerial}>S/N: {item.serial_number}</Text> : null}
                    </View>
                    <View style={s.colCond}>
                      <CondBadge cond={item.condition} />
                    </View>
                    <Text style={s.colDate}>{fmtDate(item.purchased_at)}</Text>
                    <Text style={s.colPrice}>{fmt(item.purchase_price)}</Text>
                    <Text style={[s.colValue, { color: teal }]}>{fmt(item.current_value)}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Totals */}
        <View style={s.totalSection} wrap={false}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total Items Registered</Text>
            <Text style={s.totalVal}>{active.length}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total Original Purchase Value</Text>
            <Text style={s.totalVal}>{fmt(totalPurchase)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.grandLabel}>Total Current Asset Value</Text>
            <Text style={s.grandVal}>{fmt(totalCurrent)}</Text>
          </View>
        </View>

        {/* Declaration */}
        <View style={s.declaration} wrap={false}>
          <Text style={s.declLabel}>Declaration</Text>
          <Text style={s.declText}>
            I, the undersigned, declare that the above equipment asset register is a true and accurate record of assets owned by Swift Designz Investments CC (CC/2026/05589) as at {generatedDate}. All values stated represent the estimated current market value of each item at the time of this declaration. This document is issued for insurance purposes.
          </Text>
          <View style={s.sigRow}>
            <View style={s.sigBlock}>
              <View style={s.sigLine}><Text> </Text></View>
              <Text style={s.sigLabel}>Signature</Text>
            </View>
            <View style={s.sigBlock}>
              <View style={s.sigLine}><Text> </Text></View>
              <Text style={s.sigLabel}>Date</Text>
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 8, color: "#555" }}>Keenan Husselmann  —  Member / Managing Member</Text>
            <Text style={{ fontSize: 7.5, color: "#888", marginTop: 2 }}>Swift Designz Investments CC  |  info@swiftdesignz.co.za  |  +264 81 853 6789</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>Swift Designz Investments CC  |  CC/2026/05589  |  TIN 16271273  |  Windhoek, Namibia</Text>
          <Text style={s.footerRight} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
