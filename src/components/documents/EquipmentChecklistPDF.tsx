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

  // Header
  header: { marginBottom: 20 },
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
    marginBottom: 16,
  },
  instructionText: { fontSize: 8, color: "#333333", lineHeight: 1.65 },

  // Running header on subsequent pages
  runHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    borderBottomWidth: 1,
    borderColor: "#dddddd",
    paddingBottom: 7,
  },
  runHeadText: { fontSize: 7.5, color: "#aaaaaa" },

  // Footer
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

  // Category header
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
    gap: 8,
  },
  catTitle: { fontSize: 10, fontWeight: 700, color: "#111111", letterSpacing: 0.5 },
  catRule: { flex: 1, borderBottomWidth: 1, borderColor: "#cccccc", marginTop: 4 },

  // Table
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

  // Columns
  colTick: { width: 22, alignItems: "center" as const },
  colItem: { flex: 2.4 },
  colImportance: { width: 82 },
  colPrice: { width: 88, textAlign: "right" as const },
  colNotes: { flex: 1.4 },

  // Tick box (printable empty square)
  tickBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: "#555555",
    borderRadius: 1,
  },

  // Text styles
  th: { fontSize: 7, fontWeight: 700, color: "#111111", textTransform: "uppercase" as const, letterSpacing: 0.8 },
  tdItem: { fontSize: 8.5, fontWeight: 700, color: "#111111" },
  tdItemSub: { fontSize: 7.5, color: "#666666", marginTop: 1.5, lineHeight: 1.5 },
  tdText: { fontSize: 8.5, color: "#333333" },
  tdNote: { fontSize: 7.5, color: "#555555", lineHeight: 1.5 },
  tdPrice: { fontSize: 8.5, color: "#111111", fontWeight: 700, textAlign: "right" as const },

  // Importance badge styles (text only, B&W)
  impCritical: { fontSize: 7.5, fontWeight: 700, color: "#111111", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  impRecommended: { fontSize: 7.5, fontWeight: 600, color: "#444444", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  impOptional: { fontSize: 7.5, color: "#888888", textTransform: "uppercase" as const, letterSpacing: 0.5 },

  // Suggested extras section marker
  extrasBanner: {
    backgroundColor: "#111111",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 18,
    marginBottom: 4,
  },
  extrasBannerText: { fontSize: 9, fontWeight: 700, color: "#ffffff", letterSpacing: 1, textTransform: "uppercase" as const },
  extrasNote: { fontSize: 8, color: "#555555", marginBottom: 10, lineHeight: 1.6 },

  // Summary box
  summaryBox: {
    borderWidth: 1,
    borderColor: "#cccccc",
    padding: 10,
    marginTop: 14,
    marginBottom: 4,
    flexDirection: "row",
    gap: 20,
  },
  summaryCol: { flex: 1 },
  summaryLabel: { fontSize: 7, fontWeight: 700, color: "#888888", textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 3 },
  summaryVal: { fontSize: 11, fontWeight: 700, color: "#111111" },
  summaryValSub: { fontSize: 7.5, color: "#555555", marginTop: 1 },
});

// ── Data ──────────────────────────────────────────────────────

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
    title: "Computing Hardware",
    items: [
      {
        item: "Mac Studio (M4, 16GB RAM)",
        description: "Primary workstation for all development, design, and video work",
        importance: "CRITICAL",
        avgPrice: "N$38,000 - 55,000",
        notes: "Mac Studio does NOT include keyboard or mouse. Get a quote from iStore Windhoek or an authorised Apple reseller. Note: Mac Studio M4 base is approximately N$38,000-42,000 locally.",
      },
      {
        item: "USB-C Docking Station",
        description: "Single-cable hub to connect monitors, drives, and peripherals to the Mac Studio",
        importance: "CRITICAL",
        avgPrice: "N$1,200 - 2,200",
        notes: "Ensure it supports Thunderbolt 4 for full Mac Studio bandwidth. CalDigit TS4 is highly rated.",
      },
      {
        item: "External Monitors x2 (27-inch, 4K)",
        description: "Dual display setup for productivity, design, and code review",
        importance: "CRITICAL",
        avgPrice: "N$5,000 - 9,000 each",
        notes: "LG 27UK850 or Dell UltraSharp 27 4K. Mac Studio drives 2 monitors natively.",
      },
      {
        item: "External SSD (1TB)",
        description: "Fast portable backup and project file storage",
        importance: "RECOMMENDED",
        avgPrice: "N$1,500 - 2,200",
        notes: "Samsung T7 or SanDisk Extreme Pro. Keep one copy offsite.",
      },
    ],
  },
  {
    title: "Mobile Devices",
    items: [
      {
        item: "iPhone 16 (128GB)",
        description: "Business communication, mobile app testing, and content creation",
        importance: "CRITICAL",
        avgPrice: "N$18,000 - 23,000",
        notes: "Get a quote from Trustco Mobile or MTC. iPhone 16 is best for app testing across iOS and for professional content.",
      },
      {
        item: "iPad Air M2 or M3 (11-inch)",
        description: "Client presentations, design reviews, and note-taking. Same product class as the iPhone 16.",
        importance: "RECOMMENDED",
        avgPrice: "N$14,000 - 18,000",
        notes: "iPad Air 11-inch M2 is the right tier to match iPhone 16. Available at iStore or authorised Apple resellers.",
      },
    ],
  },
  {
    title: "Networking",
    items: [
      {
        item: "Wi-Fi 6 Business Router",
        description: "Fast, stable internet for the home office or shared workspace",
        importance: "CRITICAL",
        avgPrice: "N$3,000 - 6,500",
        notes: "TP-Link Archer AX73 or ASUS RT-AX88U",
      },
      {
        item: "UPS Battery Backup (1000VA)",
        description: "Protects equipment and maintains uptime during power cuts",
        importance: "CRITICAL",
        avgPrice: "N$2,800 - 5,000",
        notes: "Non-negotiable in Namibia. APC or Mecer are widely available",
      },
      {
        item: "NAS Network Storage",
        description: "Centralised local file server and automatic team backup",
        importance: "RECOMMENDED",
        avgPrice: "N$5,500 - 13,000",
        notes: "Synology DS223 (2-bay) is a solid starting point",
      },
    ],
  },
];

const EXTRA_EQUIPMENT: Category[] = [
  {
    title: "Mac Studio Peripherals (Required - Not Included in Box)",
    items: [
      {
        item: "Apple Magic Keyboard with Touch ID",
        description: "Mac Studio does not come with a keyboard. This is required to use the machine.",
        importance: "CRITICAL",
        avgPrice: "N$2,500 - 3,800",
        notes: "Get the version with Touch ID for secure login. Available from iStore or Apple authorised resellers.",
        isExtra: true,
      },
      {
        item: "Apple Magic Mouse or Magic Trackpad",
        description: "Mac Studio does not come with a mouse. Required for basic operation.",
        importance: "CRITICAL",
        avgPrice: "N$2,800 - 4,500",
        notes: "Magic Trackpad is recommended for design work. Magic Mouse for general use. Both are excellent on Mac.",
        isExtra: true,
      },
      {
        item: "Ring Light or Key Light",
        description: "Professional lighting for video calls and content recording. You have the webcam - good lighting completes the setup.",
        importance: "RECOMMENDED",
        avgPrice: "N$900 - 3,500",
        notes: "Elgato Key Light Air (~N$2,500) is the best desk option. Basic ring lights from N$900 at Makro or online.",
        isExtra: true,
      },
      {
        item: "Drawing Tablet (Wacom Intuos)",
        description: "Precision input for UI/UX design and digital illustrations",
        importance: "OPTIONAL",
        avgPrice: "N$3,000 - 7,000",
        notes: "Worth adding if doing heavy design work. Wacom Intuos Small is N$3,000-3,500 at most tech retailers.",
        isExtra: true,
      },
    ],
  },
  {
    title: "Workspace Add-ons",
    items: [
      {
        item: "Dual Monitor Arm",
        description: "Holds both external monitors on a single arm, freeing desk space and allowing ideal screen positioning",
        importance: "OPTIONAL",
        avgPrice: "N$800 - 2,000",
        notes: "Ergotron LX Dual Stacking Arm is the most popular. Requires monitors with VESA mount holes.",
        isExtra: true,
      },
      {
        item: "Document Shredder",
        description: "Secure disposal of client contracts and sensitive paperwork",
        importance: "RECOMMENDED",
        avgPrice: "N$800 - 2,000",
        notes: "Required for POPIA compliance when handling physical client documents. Cross-cut shredder minimum.",
        isExtra: true,
      },
      {
        item: "Green Screen and Backdrop Stand",
        description: "Professional virtual background for video calls, client recordings, and content creation",
        importance: "OPTIONAL",
        avgPrice: "N$700 - 1,800",
        notes: "Collapsible green screen kits are widely available online. Works well with the existing webcam and ring light setup.",
        isExtra: true,
      },
    ],
  },
  {
    title: "Content and Presentation Equipment",
    items: [
      {
        item: "Green Screen and Backdrop Stand",
        description: "Professional virtual background for video content and calls",
        importance: "OPTIONAL",
        avgPrice: "N$700 - 1,500",
        notes: "Useful for content creation and branded client recordings",
        isExtra: true,
      },
      {
        item: "Wireless Presentation Clicker",
        description: "For client presentations and workshops",
        importance: "OPTIONAL",
        avgPrice: "N$350 - 800",
        notes: "Logitech Spotlight or R400. Small cost, high impact in meetings",
        isExtra: true,
      },
      {
        item: "Portable Projector or Portable Monitor",
        description: "For face-to-face client meetings and presentations",
        importance: "OPTIONAL",
        avgPrice: "N$3,500 - 8,000",
        notes: "Only needed if you plan to do on-site client sessions",
        isExtra: true,
      },
    ],
  },
  {
    title: "Redundancy and Backup Equipment",
    items: [
      {
        item: "Second UPS Battery Backup",
        description: "Backup power for networking equipment separate from workstation",
        importance: "RECOMMENDED",
        avgPrice: "N$2,000 - 3,500",
        notes: "Keep the router and NAS on a separate UPS from your workstation",
        isExtra: true,
      },
      {
        item: "Portable External Hard Drive (Offsite Backup)",
        description: "Physical offsite backup taken home weekly for disaster recovery",
        importance: "RECOMMENDED",
        avgPrice: "N$1,200 - 2,000",
        notes: "Keep one at home and one at the office. Rotate weekly",
        isExtra: true,
      },
      {
        item: "Spare Laptop Charger",
        description: "Backup charger for the primary development laptop",
        importance: "RECOMMENDED",
        avgPrice: "N$400 - 900",
        notes: "Charger failure is a common and avoidable disruption",
        isExtra: true,
      },
    ],
  },
  {
    title: "Productivity and Comfort",
    items: [
      {
        item: "Laptop Cooling Pad",
        description: "Prevents thermal throttling during heavy development tasks",
        importance: "OPTIONAL",
        avgPrice: "N$400 - 900",
        notes: "Important if running heavy builds or AI models locally",
        isExtra: true,
      },
      {
        item: "Wrist Rest Set (keyboard and mouse)",
        description: "Reduces repetitive strain injury risk over time",
        importance: "OPTIONAL",
        avgPrice: "N$250 - 600",
        notes: "Cheap and effective long-term health investment",
        isExtra: true,
      },
      {
        item: "Monitor Arm (dual)",
        description: "Frees up desk space and allows ideal monitor positioning",
        importance: "OPTIONAL",
        avgPrice: "N$800 - 2,000",
        notes: "Dual monitor arm for the two external monitors",
        isExtra: true,
      },
      {
        item: "Document Shredder",
        description: "Secure disposal of client contracts and sensitive paperwork",
        importance: "RECOMMENDED",
        avgPrice: "N$800 - 2,000",
        notes: "POPIA compliance for client document handling",
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
  const style =
    level === "CRITICAL"
      ? s.impCritical
      : level === "RECOMMENDED"
      ? s.impRecommended
      : s.impOptional;
  return <Text style={style}>{level}</Text>;
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
          <View style={s.colTick}>
            <View style={s.tickBox} />
          </View>
          <View style={s.colItem}>
            <Text style={s.tdItem}>{item.item}</Text>
            <Text style={s.tdItemSub}>{item.description}</Text>
          </View>
          <View style={s.colImportance}>
            <ImportanceLabel level={item.importance} />
          </View>
          <View style={s.colPrice}>
            <Text style={s.tdPrice}>{item.avgPrice}</Text>
          </View>
          <View style={s.colNotes}>
            <Text style={s.tdNote}>{item.notes}</Text>
          </View>
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
            Instructions: Use this checklist when collecting supplier quotations. Tick the box on the left once a written quotation has been received. All items marked CRITICAL must have a quotation attached to the loan application. Prices are average Namibian market estimates and will vary by supplier.{"\n\n"}
            Equipment policy: Employees are required to provide their own devices (laptop, phone, accessories). The company covers team software licences only (Google Workspace, project management tools, and shared platforms). Personal hardware is each employee{"'"}s own responsibility.{"\n\n"}
            Importance key: CRITICAL = cannot operate without this | RECOMMENDED = significant impact on productivity or quality | OPTIONAL = useful but can be deferred
          </Text>
        </View>

        {/* Column headers */}
        <View style={s.tblHead}>
          <View style={s.colTick}>
            <Text style={s.th}>Got</Text>
          </View>
          <View style={s.colItem}>
            <Text style={s.th}>Item</Text>
          </View>
          <View style={s.colImportance}>
            <Text style={s.th}>Importance</Text>
          </View>
          <View style={s.colPrice}>
            <Text style={[s.th, { textAlign: "right" as const }]}>Avg Price (N$)</Text>
          </View>
          <View style={s.colNotes}>
            <Text style={s.th}>Notes / Suggested Brand</Text>
          </View>
        </View>
      </View>

      {EQUIPMENT.slice(0, 2).map((cat) => (
        <CategoryBlock key={cat.title} cat={cat} />
      ))}

      <Footer page="Page 1 of 4" />
    </Page>
  );
}

function Page2() {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.runHead} fixed>
        <Text style={s.runHeadText}>Swift Designz Investments CC | Equipment Checklist 2026</Text>
        <Text style={s.runHeadText}>Core Equipment (continued)</Text>
      </View>

      {/* Re-print column headers */}
      <View style={s.tblHead}>
        <View style={s.colTick}>
          <Text style={s.th}>Got</Text>
        </View>
        <View style={s.colItem}>
          <Text style={s.th}>Item</Text>
        </View>
        <View style={s.colImportance}>
          <Text style={s.th}>Importance</Text>
        </View>
        <View style={s.colPrice}>
          <Text style={[s.th, { textAlign: "right" as const }]}>Avg Price (N$)</Text>
        </View>
        <View style={s.colNotes}>
          <Text style={s.th}>Notes / Suggested Brand</Text>
        </View>
      </View>

      {EQUIPMENT.slice(2, 5).map((cat) => (
        <CategoryBlock key={cat.title} cat={cat} />
      ))}

      <Footer page="Page 2 of 4" />
    </Page>
  );
}

function Page3() {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.runHead} fixed>
        <Text style={s.runHeadText}>Swift Designz Investments CC | Equipment Checklist 2026</Text>
        <Text style={s.runHeadText}>Core Equipment (continued)</Text>
      </View>

      <View style={s.tblHead}>
        <View style={s.colTick}>
          <Text style={s.th}>Got</Text>
        </View>
        <View style={s.colItem}>
          <Text style={s.th}>Item</Text>
        </View>
        <View style={s.colImportance}>
          <Text style={s.th}>Importance</Text>
        </View>
        <View style={s.colPrice}>
          <Text style={[s.th, { textAlign: "right" as const }]}>Avg Price (N$)</Text>
        </View>
        <View style={s.colNotes}>
          <Text style={s.th}>Notes / Suggested Brand</Text>
        </View>
      </View>

      {EQUIPMENT.slice(5).map((cat) => (
        <CategoryBlock key={cat.title} cat={cat} />
      ))}

      {/* Core equipment summary */}
      <View style={s.summaryBox}>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Critical Items Only (min. budget)</Text>
          <Text style={s.summaryVal}>N$55,000 - 72,000</Text>
          <Text style={s.summaryValSub}>Mac Studio base + 2 monitors + iPhone 16 + UPS + router</Text>
        </View>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Full Core List (mid-range estimates)</Text>
          <Text style={s.summaryVal}>N$103,650</Text>
          <Text style={s.summaryValSub}>All hardware at mid-range. Software and Mac peripherals are separate from this loan.</Text>
        </View>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Full Core List (top-end estimates)</Text>
          <Text style={s.summaryVal}>N$145,000+</Text>
          <Text style={s.summaryValSub}>Mac Studio Pro + iPad Pro + top-spec monitors + high-end networking</Text>
        </View>
      </View>

      <Footer page="Page 3 of 4" />
    </Page>
  );
}

function Page4() {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.runHead} fixed>
        <Text style={s.runHeadText}>Swift Designz Investments CC | Equipment Checklist 2026</Text>
        <Text style={s.runHeadText}>Suggested Additional Equipment</Text>
      </View>

      <View style={s.extrasBanner}>
        <Text style={s.extrasBannerText}>Suggested Additional Equipment</Text>
      </View>
      <Text style={s.extrasNote}>
        The items below are not included in the loan budget of N$538,430 but are worth considering. Software licences and office furniture are covered separately by the director. Review this list and decide which items to add before finalising your quotations. Adding team laptops is the most critical consideration if your staff do not have their own devices.
      </Text>

      <View style={s.tblHead}>
        <View style={s.colTick}>
          <Text style={s.th}>Got</Text>
        </View>
        <View style={s.colItem}>
          <Text style={s.th}>Item</Text>
        </View>
        <View style={s.colImportance}>
          <Text style={s.th}>Importance</Text>
        </View>
        <View style={s.colPrice}>
          <Text style={[s.th, { textAlign: "right" as const }]}>Avg Price (N$)</Text>
        </View>
        <View style={s.colNotes}>
          <Text style={s.th}>Notes / Suggested Brand</Text>
        </View>
      </View>

      {EXTRA_EQUIPMENT.map((cat) => (
        <CategoryBlock key={cat.title} cat={cat} isExtra />
      ))}

      {/* Extras summary */}
      <View style={s.summaryBox}>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Team Laptops (5 staff, mid-range)</Text>
          <Text style={s.summaryVal}>~N$60,000</Text>
          <Text style={s.summaryValSub}>If team members do not have their own devices</Text>
        </View>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Full Extras List (mid-range)</Text>
          <Text style={s.summaryVal}>~N$85,000</Text>
          <Text style={s.summaryValSub}>Including team devices, redundancy, and productivity items</Text>
        </View>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Revised Loan if Mac Peripherals + Team Support Added</Text>
          <Text style={s.summaryVal}>~N$525,000</Text>
          <Text style={s.summaryValSub}>Still within the N$1,000,000 NYDF entrepreneurial tier</Text>
        </View>
      </View>

      <Footer page="Page 4 of 4" />
    </Page>
  );
}

// ── DOCUMENT ──────────────────────────────────────────────────

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
      <Page4 />
    </Document>
  );
}
