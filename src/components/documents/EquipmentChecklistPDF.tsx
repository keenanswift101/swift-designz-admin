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
        item: "Development Laptop",
        description: "Primary workstation for all development and design",
        importance: "CRITICAL",
        avgPrice: "N$30,000 - 40,000",
        notes: "HP ProBook, Lenovo ThinkPad, or Dell XPS recommended",
      },
      {
        item: "Desktop Workstation",
        description: "High-performance machine for rendering, compilation, heavy tasks",
        importance: "RECOMMENDED",
        avgPrice: "N$22,000 - 30,000",
        notes: "Can be deferred if laptop covers initial workload",
      },
      {
        item: "External Monitor x2",
        description: "Extended display setup for productivity and design work",
        importance: "RECOMMENDED",
        avgPrice: "N$4,000 - 7,000 each",
        notes: "27-inch IPS panel is the sweet spot",
      },
      {
        item: "External SSD (1-2 TB)",
        description: "Fast portable backup and project file storage",
        importance: "RECOMMENDED",
        avgPrice: "N$1,500 - 2,200",
        notes: "Samsung T7 or SanDisk Extreme",
      },
      {
        item: "USB-C Docking Station",
        description: "Single-cable connection for all peripherals to laptop",
        importance: "RECOMMENDED",
        avgPrice: "N$1,200 - 2,000",
        notes: "Essential if using laptop as daily driver with monitors",
      },
    ],
  },
  {
    title: "Peripherals",
    items: [
      {
        item: "Mechanical Keyboard",
        description: "Ergonomic and responsive typing for long coding sessions",
        importance: "RECOMMENDED",
        avgPrice: "N$1,800 - 3,500",
        notes: "Keychron K series is good value",
      },
      {
        item: "Ergonomic Mouse",
        description: "Reduces wrist strain during extended daily use",
        importance: "RECOMMENDED",
        avgPrice: "N$600 - 2,500",
        notes: "Logitech MX Master 3 recommended",
      },
      {
        item: "Webcam (1080p or above)",
        description: "Professional-quality video for client calls and recordings",
        importance: "CRITICAL",
        avgPrice: "N$1,500 - 2,800",
        notes: "Logitech C920 is the standard choice",
      },
      {
        item: "USB Microphone or Headset",
        description: "Clear audio for calls, recordings, and remote meetings",
        importance: "CRITICAL",
        avgPrice: "N$800 - 4,000",
        notes: "Blue Yeti (desk mic) or Logitech H390 (headset)",
      },
      {
        item: "Drawing Tablet (Wacom)",
        description: "Precision input for UI/UX design and digital artwork",
        importance: "RECOMMENDED",
        avgPrice: "N$3,000 - 7,000",
        notes: "Wacom Intuos is sufficient for most design work",
      },
    ],
  },
  {
    title: "Mobile Devices",
    items: [
      {
        item: "Business Smartphone",
        description: "Client communication, mobile testing, and on-the-go work",
        importance: "RECOMMENDED",
        avgPrice: "N$8,000 - 20,000",
        notes: "Samsung Galaxy A series is good value in Namibia",
      },
      {
        item: "Tablet or iPad",
        description: "Design reviews, presentations, and note-taking with clients",
        importance: "OPTIONAL",
        avgPrice: "N$10,000 - 22,000",
        notes: "iPad 10th gen is the most practical option",
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
  {
    title: "Software Licences (Annual)",
    items: [
      {
        item: "Adobe Creative Cloud (All Apps)",
        description: "Photoshop, Illustrator, Premiere, XD, and full design suite",
        importance: "CRITICAL",
        avgPrice: "N$11,000 - 15,000/yr",
        notes: "Single-seat licence. Get a quote from Adobe for NAD pricing",
      },
      {
        item: "Figma (Professional seat)",
        description: "UI/UX design, prototyping, and client handoff tool",
        importance: "CRITICAL",
        avgPrice: "N$5,000 - 7,000/yr",
        notes: "Figma is billed in USD. Budget for exchange rate movement",
      },
      {
        item: "Microsoft 365 Business Standard",
        description: "Outlook, Word, Excel, Teams, SharePoint for the full team",
        importance: "CRITICAL",
        avgPrice: "N$4,000 - 7,500/yr",
        notes: "Covers up to 6 users. Get a local reseller quote",
      },
      {
        item: "GitHub Copilot and Pro",
        description: "Code hosting, CI/CD pipelines, and AI coding assistant",
        importance: "RECOMMENDED",
        avgPrice: "N$4,000 - 5,000/yr",
        notes: "Billed in USD. Essential for development productivity",
      },
      {
        item: "Project Management Tool",
        description: "Task tracking, sprint boards, and client project visibility",
        importance: "RECOMMENDED",
        avgPrice: "N$0 - 5,000/yr",
        notes: "Linear (free tier is strong) or Asana. Start free, upgrade as needed",
      },
      {
        item: "Antivirus and Security Suite",
        description: "Business endpoint protection across all team devices",
        importance: "CRITICAL",
        avgPrice: "N$1,500 - 3,000/yr",
        notes: "ESET or Kaspersky Business. Get a multi-device licence",
      },
      {
        item: "Cloud Backup Service",
        description: "Off-site automated backup of all work in progress",
        importance: "RECOMMENDED",
        avgPrice: "N$800 - 2,000/yr",
        notes: "Backblaze B2 or Google Workspace with Drive",
      },
      {
        item: "Password Manager (Team)",
        description: "Secure shared credential management for all team accounts",
        importance: "RECOMMENDED",
        avgPrice: "N$700 - 1,500/yr",
        notes: "1Password Teams or Bitwarden Business",
      },
    ],
  },
  {
    title: "Office and Workspace",
    items: [
      {
        item: "Sit-Stand Desk",
        description: "Ergonomic workspace that supports long daily work sessions",
        importance: "RECOMMENDED",
        avgPrice: "N$7,000 - 16,000",
        notes: "A height-adjustable desk significantly reduces fatigue",
      },
      {
        item: "Ergonomic Chair",
        description: "Lumbar support for 8+ hours of seated work",
        importance: "CRITICAL",
        avgPrice: "N$5,000 - 13,000",
        notes: "Do not cut corners on this. A bad chair causes real injury",
      },
      {
        item: "Printer and Scanner",
        description: "For contracts, invoices, and physical document handling",
        importance: "RECOMMENDED",
        avgPrice: "N$2,500 - 5,500",
        notes: "HP LaserJet or Brother multifunction units are reliable",
      },
      {
        item: "Ring Light and Studio Lighting",
        description: "Professional appearance in video calls and content recordings",
        importance: "RECOMMENDED",
        avgPrice: "N$900 - 2,500",
        notes: "Makes a visible difference in client-facing video quality",
      },
      {
        item: "Whiteboard (large)",
        description: "Visual planning, architecture diagrams, and brainstorming",
        importance: "RECOMMENDED",
        avgPrice: "N$400 - 1,800",
        notes: "Magnetic whiteboards double as notice boards",
      },
      {
        item: "Surge Protector and Power Strip",
        description: "Protected multi-outlet power for the full desk setup",
        importance: "CRITICAL",
        avgPrice: "N$350 - 700",
        notes: "Required at every workstation. Buy one per desk minimum",
      },
    ],
  },
];

const EXTRA_EQUIPMENT: Category[] = [
  {
    title: "Team Equipment (Suggested Additions)",
    items: [
      {
        item: "Budget Laptops for Team Members (x5)",
        description: "One device per remote staff member for independent working",
        importance: "CRITICAL",
        avgPrice: "N$10,000 - 14,000 each",
        notes: "Lenovo IdeaPad or HP 250 series. Budget N$60,000 for all 5",
        isExtra: true,
      },
      {
        item: "Headset for each team member (x5)",
        description: "Clear audio for daily remote standups and client calls",
        importance: "RECOMMENDED",
        avgPrice: "N$400 - 900 each",
        notes: "Logitech H390 USB headsets. Total budget around N$3,500",
        isExtra: true,
      },
      {
        item: "Webcam for each team member (x5)",
        description: "Professional video presence on all team calls",
        importance: "RECOMMENDED",
        avgPrice: "N$800 - 1,500 each",
        notes: "Basic Logitech C270 is sufficient for team members",
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
            Instructions: Use this checklist when collecting supplier quotations. Tick the box on the left once a written quotation has been received for that item. All items marked CRITICAL must have a quotation attached to the loan application. Items marked RECOMMENDED and OPTIONAL can be included or excluded based on your final budget. Prices are average Namibian market estimates and will vary by supplier.{"\n\n"}
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
          <Text style={s.summaryVal}>N$80,000 - 110,000</Text>
          <Text style={s.summaryValSub}>Laptop, webcam, mic, UPS x2, router, chair, antivirus, surge protectors, M365</Text>
        </View>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Full Core List (mid-range estimates)</Text>
          <Text style={s.summaryVal}>N$178,800</Text>
          <Text style={s.summaryValSub}>All items in this section at mid-range pricing</Text>
        </View>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>Full Core List (top-end estimates)</Text>
          <Text style={s.summaryVal}>N$240,000+</Text>
          <Text style={s.summaryValSub}>All items at high-end specifications</Text>
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
        The items below are not included in the original loan budget of N$539,480 but are strongly recommended for a 6-person remote agency. Review this list and decide which items to include before finalising your quotations and submitting your application. Adding team laptops in particular will likely be necessary if your staff do not have their own devices.
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
          <Text style={s.summaryLabel}>Revised Loan if Extras Added</Text>
          <Text style={s.summaryVal}>~N$620,000</Text>
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
