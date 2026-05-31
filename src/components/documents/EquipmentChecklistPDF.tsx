import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf", fontWeight: 700 },
  ],
});

const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 46,
    paddingTop: 42,
    paddingBottom: 52,
    fontFamily: "Inter",
    fontSize: 9,
    color: "#111111",
  },
  header: { marginBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 700, color: "#111111" },
  headerSub: { fontSize: 8.5, color: "#555555", marginTop: 2 },
  headerMeta: { fontSize: 8, color: "#888888", textAlign: "right" as const },
  headerRule: { borderBottomWidth: 2, borderColor: "#111111", marginBottom: 8 },
  instructionBox: {
    backgroundColor: "#f5f5f5",
    borderLeftWidth: 3,
    borderLeftColor: "#111111",
    padding: 9,
    marginBottom: 12,
  },
  instructionText: { fontSize: 7.8, color: "#333333", lineHeight: 1.65 },
  runHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderColor: "#dddddd",
    paddingBottom: 7,
  },
  runHeadText: { fontSize: 7.5, color: "#aaaaaa" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 46,
    right: 46,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    paddingTop: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: "#aaaaaa" },
  catHeader: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 3, gap: 8 },
  catTitle: { fontSize: 9.5, fontWeight: 700, color: "#111111", letterSpacing: 0.5 },
  catRule: { flex: 1, borderBottomWidth: 1, borderColor: "#cccccc", marginTop: 4 },
  tblHead: {
    flexDirection: "row",
    backgroundColor: "#eeeeee",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#111111",
    alignItems: "center" as const,
  },
  tblRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: "#e8e8e8",
    alignItems: "center" as const,
    minHeight: 26,
  },
  tblRowAlt: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: "#f9f9f9",
    alignItems: "center" as const,
    minHeight: 26,
  },
  tblRowExtra: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: "#e8e8e8",
    alignItems: "center" as const,
    minHeight: 26,
    backgroundColor: "#fcfcfc",
  },
  colTick: { width: 22, alignItems: "center" as const },
  colItem: { flex: 2.4 },
  colImportance: { width: 82 },
  colPrice: { width: 88, textAlign: "right" as const },
  colNotes: { flex: 1.4 },
  tickBox: { width: 12, height: 12, borderWidth: 1, borderColor: "#555555", borderRadius: 1 },
  th: { fontSize: 7, fontWeight: 700, color: "#111111", textTransform: "uppercase" as const, letterSpacing: 0.8 },
  tdItem: { fontSize: 8.5, fontWeight: 700, color: "#111111" },
  tdItemSub: { fontSize: 7.5, color: "#666666", marginTop: 1.5, lineHeight: 1.5 },
  tdText: { fontSize: 8.5, color: "#333333" },
  tdNote: { fontSize: 7.5, color: "#555555", lineHeight: 1.5 },
  tdPrice: { fontSize: 8.5, color: "#111111", fontWeight: 700, textAlign: "right" as const },
  impCritical: { fontSize: 7.5, fontWeight: 700, color: "#111111", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  impRecommended: { fontSize: 7.5, fontWeight: 600, color: "#444444", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  impOptional: { fontSize: 7.5, color: "#888888", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  extrasBanner: { backgroundColor: "#111111", paddingVertical: 6, paddingHorizontal: 10, marginTop: 16, marginBottom: 4 },
  extrasBannerText: { fontSize: 9, fontWeight: 700, color: "#ffffff", letterSpacing: 1, textTransform: "uppercase" as const },
  extrasNote: { fontSize: 8, color: "#555555", marginBottom: 10, lineHeight: 1.6 },
  summaryBox: { borderWidth: 1, borderColor: "#cccccc", padding: 10, marginTop: 14, marginBottom: 4, flexDirection: "row", gap: 16 },
  summaryCol: { flex: 1 },
  summaryLabel: { fontSize: 7, fontWeight: 700, color: "#888888", textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 3 },
  summaryVal: { fontSize: 11, fontWeight: 700, color: "#111111" },
  summaryValSub: { fontSize: 7.5, color: "#555555", marginTop: 1 },
});

type Importance = "CRITICAL" | "RECOMMENDED" | "OPTIONAL";

interface ChecklistItem {
  item: string;
  description: string;
  importance: Importance;
  avgPrice: string;
  notes: string;
  isExtra?: boolean;
}

interface Category {
  title: string;
  items: ChecklistItem[];
}

const EQUIPMENT: Category[] = [
  {
    title: "Mac Setup and Workspace",
    items: [
      {
        item: "iMac 24-inch M4 (10-core CPU and GPU, 24GB, 512GB, Green)",
        description: "Full kit. Includes built-in 24-inch 4.5K Retina display, Magic Keyboard with Touch ID, and Magic Mouse. No separate display, keyboard, or mouse needed.",
        importance: "CRITICAL",
        avgPrice: "N$45,899",
        notes: "Exact price confirmed. Get quote from iStore Windhoek or authorised Apple reseller. This is the complete out-of-box kit.",
      },
      {
        item: "1x External Monitor (27-inch, 4K)",
        description: "Extended display alongside the built-in iMac screen for dual-monitor productivity",
        importance: "RECOMMENDED",
        avgPrice: "N$5,000 - 8,000",
        notes: "LG 27UK850 or Dell UltraSharp 27 4K. The iMac already provides one 24-inch Retina display.",
      },
      {
        item: "External SSD (1TB)",
        description: "Fast portable project backups and file transfer between devices",
        importance: "RECOMMENDED",
        avgPrice: "N$1,500 - 2,200",
        notes: "Samsung T7 or SanDisk Extreme Pro. Keep one copy offsite.",
      },
      {
        item: "USB-C Hub",
        description: "Expands the iMac ports for connecting extra drives and peripherals simultaneously",
        importance: "RECOMMENDED",
        avgPrice: "N$800 - 1,800",
        notes: "iMac has 2x Thunderbolt 4 and 2x USB-3 ports. A hub helps when using SSD, NAS, and other devices at once.",
      },
      {
        item: "Ring Light or Key Light",
        description: "Professional studio lighting for client video calls and content recordings",
        importance: "RECOMMENDED",
        avgPrice: "N$900 - 3,500",
        notes: "Already have webcam and mic. Elgato Key Light Air (~N$2,500) is a desk-friendly option. Standard ring light from Makro from N$900.",
      },
      {
        item: "Drawing Tablet (Wacom Intuos)",
        description: "Precision stylus input for UI/UX design, digital art, and precise mouse control",
        importance: "OPTIONAL",
        avgPrice: "N$3,000 - 7,000",
        notes: "Wacom Intuos Small (~N$3,200) is a good entry point. Medium (~N$4,500) gives more workspace. Available at major tech retailers.",
      },
      {
        item: "Monitor Arm (single, for external monitor)",
        description: "Frees desk space and allows ideal positioning of the external monitor",
        importance: "OPTIONAL",
        avgPrice: "N$800 - 2,000",
        notes: "Ergotron LX single arm is the most popular choice. Note: the iMac itself uses its built-in stand and cannot easily go on a standard arm.",
      },
      {
        item: "Document Shredder",
        description: "Secure disposal of printed client contracts and sensitive paperwork",
        importance: "RECOMMENDED",
        avgPrice: "N$800 - 2,000",
        notes: "Required for POPIA compliance when handling physical client documents. Cross-cut shredder as minimum. Available at Builders Warehouse or Makro.",
      },
      {
        item: "Green Screen and Backdrop Stand",
        description: "Professional virtual background for client calls, video content, and recorded presentations",
        importance: "OPTIONAL",
        avgPrice: "N$700 - 1,800",
        notes: "Collapsible green screen kits with stand are widely available. Works well with the existing webcam and ring light setup.",
      },
    ],
  },
  {
    title: "Mobile Devices",
    items: [
      {
        item: "iPhone 16 (128GB)",
        description: "Business communication, mobile app testing, and on-the-go content creation",
        importance: "CRITICAL",
        avgPrice: "N$18,000 - 23,000",
        notes: "Get quote from MTC or Trustco Mobile. iPhone 16 stays in the same Apple ecosystem as the iMac for seamless handoff and testing.",
      },
      {
        item: "iPad Air M2 or M3 (11-inch)",
        description: "Client presentations, design reviews, and note-taking. Same Apple chip class as iPhone 16.",
        importance: "RECOMMENDED",
        avgPrice: "N$14,000 - 18,000",
        notes: "iPad Air 11-inch M2 is the right tier match. Available from iStore or authorised Apple resellers in Namibia.",
      },
    ],
  },
  {
    title: "Networking",
    items: [
      {
        item: "Wi-Fi 6 Business Router",
        description: "Fast, stable internet for the home office setup",
        importance: "CRITICAL",
        avgPrice: "N$3,000 - 6,500",
        notes: "TP-Link Archer AX73 or ASUS RT-AX88U. Wi-Fi 6 is a significant upgrade over standard routers for a home office.",
      },
      {
        item: "UPS Battery Backup (1000VA)",
        description: "Keeps iMac, router, and NAS powered during load shedding and power fluctuations",
        importance: "CRITICAL",
        avgPrice: "N$2,800 - 5,000",
        notes: "Non-negotiable in Namibia. APC or Mecer are widely available. Size the UPS to cover the iMac (up to 150W), router, and NAS together.",
      },
      {
        item: "NAS Network Storage (2-bay)",
        description: "Centralised local file server with automatic backup for all project files and client assets",
        importance: "RECOMMENDED",
        avgPrice: "N$5,500 - 13,000",
        notes: "Synology DS223 is the best value entry-level NAS. Pair with 2x 4TB WD Red drives for 4TB usable storage in mirrored backup mode.",
      },
    ],
  },
];

const EXTRA_EQUIPMENT: Category[] = [
  {
    title: "Personal Workspace (Not in Loan - Own Cost)",
    items: [
      {
        item: "Ergonomic Chair",
        description: "Lumbar support for long daily sessions at the iMac",
        importance: "RECOMMENDED",
        avgPrice: "N$5,000 - 13,000",
        notes: "Not in the loan since office furniture is excluded. A quality chair is a worthwhile personal purchase for a remote-first role.",
        isExtra: true,
      },
      {
        item: "Desk or Sit-Stand Desk",
        description: "The iMac is a desktop and needs a dedicated workspace",
        importance: "RECOMMENDED",
        avgPrice: "N$4,000 - 16,000",
        notes: "Height-adjustable desks reduce fatigue significantly. Consider this a long-term personal investment. Brands like FlexiSpot are available online.",
        isExtra: true,
      },
      {
        item: "Laptop Stand (for iMac cable management)",
        description: "Keeps the iMac workspace clean and accessible",
        importance: "OPTIONAL",
        avgPrice: "N$300 - 800",
        notes: "Helps with cable routing behind the iMac. Most desk cable management trays work well.",
        isExtra: true,
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────

function Footer({ page }: { page: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Swift Designz Investments CC | Equipment Procurement Checklist 2026</Text>
      <Text style={s.footerText}>{page}</Text>
    </View>
  );
}

function ImportanceLabel({ level }: { level: Importance }) {
  const style = level === "CRITICAL" ? s.impCritical : level === "RECOMMENDED" ? s.impRecommended : s.impOptional;
  return <Text style={style}>{level}</Text>;
}

function ColHeaders() {
  return (
    <View style={s.tblHead}>
      <View style={s.colTick}><Text style={s.th}>Got</Text></View>
      <View style={s.colItem}><Text style={s.th}>Item</Text></View>
      <View style={s.colImportance}><Text style={s.th}>Importance</Text></View>
      <View style={s.colPrice}><Text style={[s.th, { textAlign: "right" as const }]}>Avg Price (N$)</Text></View>
      <View style={s.colNotes}><Text style={s.th}>Notes / Suggested Brand</Text></View>
    </View>
  );
}

function CategoryBlock({ cat, isExtra }: { cat: Category; isExtra?: boolean }) {
  return (
    <View>
      <View style={s.catHeader}>
        <Text style={s.catTitle}>{cat.title}</Text>
        <View style={s.catRule} />
      </View>
      {cat.items.map((item, i) => (
        <View key={item.item} style={i % 2 === 0 ? (isExtra ? s.tblRowExtra : s.tblRow) : s.tblRowAlt}>
          <View style={s.colTick}><View style={s.tickBox} /></View>
          <View style={s.colItem}>
            <Text style={s.tdItem}>{item.item}</Text>
            <Text style={s.tdItemSub}>{item.description}</Text>
          </View>
          <View style={s.colImportance}><ImportanceLabel level={item.importance} /></View>
          <View style={s.colPrice}><Text style={s.tdPrice}>{item.avgPrice}</Text></View>
          <View style={s.colNotes}><Text style={s.tdNote}>{item.notes}</Text></View>
        </View>
      ))}
    </View>
  );
}

// ── PAGES ─────────────────────────────────────────────────────

function Page1() {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.headerTitle}>Equipment Procurement Checklist</Text>
            <Text style={s.headerSub}>Swift Designz Investments CC | NYDF Loan Application 2026</Text>
          </View>
          <View>
            <Text style={s.headerMeta}>Prepared: May 2026</Text>
            <Text style={s.headerMeta}>Applicant: Keenan Husselmann</Text>
          </View>
        </View>
        <View style={s.headerRule} />
        <View style={s.instructionBox}>
          <Text style={s.instructionText}>
            Instructions: Use this checklist when collecting supplier quotations. Tick the box on the left once a written quotation has been received for that item. All CRITICAL items must have a quotation attached to the loan application. RECOMMENDED and OPTIONAL items are at your discretion. Prices are Namibian market estimates and will vary by supplier.{"\n\n"}
            Equipment policy: The iMac is the company{"'"}s primary workstation purchased from the loan. Employees provide their own personal devices. The company covers team software licences only (Google Workspace, shared project tools). Personal hardware is each employee{"'"}s own responsibility.{"\n\n"}
            Importance: CRITICAL = cannot operate without this | RECOMMENDED = strong productivity or compliance impact | OPTIONAL = useful but can be deferred
          </Text>
        </View>
        <ColHeaders />
      </View>

      {EQUIPMENT.slice(0, 1).map((cat) => (
        <CategoryBlock key={cat.title} cat={cat} />
      ))}

      <Footer page="Page 1 of 3" />
    </Page>
  );
}

function Page2() {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.runHead} fixed>
        <Text style={s.runHeadText}>Swift Designz Investments CC | Equipment Checklist 2026</Text>
        <Text style={s.runHeadText}>Mobile and Networking</Text>
      </View>

      <ColHeaders />

      {EQUIPMENT.slice(1).map((cat) => (
        <CategoryBlock key={cat.title} cat={cat} />
      ))}

      <View style={s.summaryBox}>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Critical Items Only (minimum budget)</Text>
          <Text style={s.summaryVal}>N$75,000 - 90,000</Text>
          <Text style={s.summaryValSub}>iMac + iPhone 16 + UPS + router. Bare minimum to operate.</Text>
        </View>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Full Core List (mid-range estimates)</Text>
          <Text style={s.summaryVal}>N$112,000</Text>
          <Text style={s.summaryValSub}>All loan-funded items at mid-range. Keyboard and mouse are included with the iMac.</Text>
        </View>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Full Core List (top-end estimates)</Text>
          <Text style={s.summaryVal}>N$160,000+</Text>
          <Text style={s.summaryValSub}>iMac + iPad Pro + premium monitor + high-end networking</Text>
        </View>
      </View>

      <Footer page="Page 2 of 3" />
    </Page>
  );
}

function Page3() {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.runHead} fixed>
        <Text style={s.runHeadText}>Swift Designz Investments CC | Equipment Checklist 2026</Text>
        <Text style={s.runHeadText}>Personal Workspace</Text>
      </View>

      <View style={s.extrasBanner}>
        <Text style={s.extrasBannerText}>Personal Workspace (Not in Loan)</Text>
      </View>
      <Text style={s.extrasNote}>
        The items below are not included in the loan budget of N$524,930 and are personal purchases at your own cost. Office furniture is excluded from the loan because the business operates remotely with no company premises. These are recommended personal investments for a productive home office setup.
      </Text>

      <ColHeaders />

      {EXTRA_EQUIPMENT.map((cat) => (
        <CategoryBlock key={cat.title} cat={cat} isExtra />
      ))}

      <View style={s.summaryBox}>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Loan Budget (all core hardware)</Text>
          <Text style={s.summaryVal}>N$524,930</Text>
          <Text style={s.summaryValSub}>iMac full kit + workspace + mobile + networking + reserve + working capital</Text>
        </View>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Personal Workspace (own cost)</Text>
          <Text style={s.summaryVal}>N$9,000 - 30,000</Text>
          <Text style={s.summaryValSub}>Chair + desk. Not in loan. Personal investment in your home office.</Text>
        </View>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>NYDF Loan Tier</Text>
          <Text style={s.summaryVal}>Entrepreneurial</Text>
          <Text style={s.summaryValSub}>N$200,000 to N$1,000,000 tier. This application is well within range.</Text>
        </View>
      </View>

      <Footer page="Page 3 of 3" />
    </Page>
  );
}

export default function EquipmentChecklistPDF() {
  return (
    <Document
      title="Swift Designz Investments CC - Equipment Procurement Checklist 2026"
      author="Keenan Husselmann"
      subject="NYDF Loan Application Equipment List"
    >
      <Page1 />
      <Page2 />
      <Page3 />
    </Document>
  );
}
