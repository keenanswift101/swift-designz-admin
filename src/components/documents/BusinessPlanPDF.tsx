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
    paddingHorizontal: 52,
    paddingTop: 44,
    paddingBottom: 56,
    fontFamily: "Inter",
    fontSize: 9,
    color: "#111111",
  },
  coverPage: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 52,
    paddingTop: 70,
    paddingBottom: 50,
    fontFamily: "Inter",
  },
  coverLogoName: { fontSize: 22, fontWeight: 700, color: "#111111", letterSpacing: 2, marginBottom: 2 },
  coverLogoSub: { fontSize: 9, color: "#555555", letterSpacing: 1, marginBottom: 48 },
  coverRule: { borderBottomWidth: 3, borderColor: "#111111", marginBottom: 32 },
  coverTitle: { fontSize: 38, fontWeight: 700, color: "#111111", marginBottom: 6, lineHeight: 1.15 },
  coverSub: { fontSize: 13, color: "#444444", marginBottom: 52, lineHeight: 1.5 },
  coverDT: { width: 170, fontSize: 8.5, fontWeight: 700, color: "#777777", textTransform: "uppercase" as const, letterSpacing: 0.8 },
  coverDD: { flex: 1, fontSize: 8.5, color: "#111111" },
  coverRule2: { borderBottomWidth: 1, borderColor: "#cccccc", marginTop: 52, marginBottom: 18 },
  coverNote: { fontSize: 7.5, color: "#888888", lineHeight: 1.7 },
  runHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
    borderBottomWidth: 1,
    borderColor: "#dddddd",
    paddingBottom: 8,
  },
  runHeadText: { fontSize: 7.5, color: "#aaaaaa" },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 52,
    right: 52,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    paddingTop: 7,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerL: { fontSize: 7, color: "#aaaaaa" },
  footerR: { fontSize: 7, color: "#aaaaaa" },
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#111111", marginBottom: 5 },
  pageTitleRule: { borderBottomWidth: 2, borderColor: "#111111", marginBottom: 22 },
  h2num: { fontSize: 7, fontWeight: 700, letterSpacing: 2.5, color: "#999999", textTransform: "uppercase" as const, marginBottom: 2 },
  h2: { fontSize: 11.5, fontWeight: 700, color: "#111111", marginBottom: 10 },
  h2wrap: { marginBottom: 16 },
  h3: { fontSize: 9.5, fontWeight: 700, color: "#111111", marginBottom: 6, marginTop: 8 },
  p: { fontSize: 9, color: "#333333", lineHeight: 1.72, marginBottom: 8 },
  bRow: { flexDirection: "row", marginBottom: 3.5, paddingLeft: 2 },
  bDot: { width: 14, fontSize: 9, color: "#111111" },
  bText: { flex: 1, fontSize: 9, color: "#333333", lineHeight: 1.62 },
  kvRow: { flexDirection: "row", marginBottom: 4.5 },
  kvK: { width: 185, fontSize: 9, fontWeight: 700, color: "#111111" },
  kvV: { flex: 1, fontSize: 9, color: "#333333", lineHeight: 1.5 },
  tbl: { marginBottom: 14 },
  tblH: {
    flexDirection: "row",
    backgroundColor: "#eeeeee",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#111111",
  },
  tblR: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: "#e2e2e2",
  },
  tblRA: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: "#e2e2e2",
    backgroundColor: "#f7f7f7",
  },
  tblRTotal: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderTopWidth: 1.5,
    borderColor: "#111111",
    backgroundColor: "#eeeeee",
  },
  th: { fontSize: 7.5, fontWeight: 700, color: "#111111", textTransform: "uppercase" as const, letterSpacing: 0.7 },
  td: { fontSize: 8.5, color: "#333333" },
  tdb: { fontSize: 8.5, color: "#111111", fontWeight: 700 },
  tdr: { fontSize: 8.5, color: "#333333", textAlign: "right" as const },
  tdbr: { fontSize: 8.5, color: "#111111", fontWeight: 700, textAlign: "right" as const },
  box: { backgroundColor: "#f5f5f5", borderLeftWidth: 3, borderLeftColor: "#333333", padding: 11, marginBottom: 13 },
  boxText: { fontSize: 8.5, color: "#333333", lineHeight: 1.68 },
  swotGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
  swotCell: { width: "50%", padding: 10, borderWidth: 1, borderColor: "#cccccc" },
  swotLabel: { fontSize: 8.5, fontWeight: 700, color: "#111111", marginBottom: 6, letterSpacing: 0.5 },
  swotItem: { fontSize: 8.5, color: "#333333", marginBottom: 3, lineHeight: 1.55 },
  orgWrap: { alignItems: "center" as const, marginBottom: 14 },
  orgTopBox: {
    backgroundColor: "#111111",
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: "center" as const,
    width: 260,
  },
  orgTopText: { fontSize: 8, fontWeight: 700, color: "#ffffff", textAlign: "center" as const, letterSpacing: 0.8 },
  orgTopSub: { fontSize: 7.5, color: "#aaaaaa", textAlign: "center" as const, marginTop: 3 },
  orgLine: { width: 2, height: 16, backgroundColor: "#444444", alignSelf: "center" as const },
  orgChildBox: {
    backgroundColor: "#333333",
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center" as const,
    width: 128,
  },
  orgChildText: { fontSize: 7.5, fontWeight: 700, color: "#ffffff", textAlign: "center" as const, letterSpacing: 0.5 },
  orgChildSub: { fontSize: 7, color: "#bbbbbb", textAlign: "center" as const, marginTop: 2 },
  orgChildSal: { fontSize: 7, color: "#888888", textAlign: "center" as const, marginTop: 1 },
  orgStaffBox: {
    backgroundColor: "#f4f4f4",
    borderWidth: 1,
    borderColor: "#cccccc",
    paddingHorizontal: 8,
    paddingVertical: 7,
    alignItems: "center" as const,
    width: 108,
  },
  orgStaffText: { fontSize: 7.5, fontWeight: 700, color: "#111111", textAlign: "center" as const },
  orgStaffSub: { fontSize: 7, color: "#555555", textAlign: "center" as const, marginTop: 2 },
  orgStaffSal: { fontSize: 7, color: "#888888", textAlign: "center" as const, marginTop: 1 },
  div: { borderBottomWidth: 1, borderColor: "#e5e5e5", marginVertical: 12 },
  twoC: { flexDirection: "row", gap: 18, marginBottom: 12 },
  c50: { flex: 1 },
});

// ── Helpers ───────────────────────────────────────────────────

function Footer({ left, right }: { left: string; right: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerL}>{left}</Text>
      <Text style={s.footerR}>{right}</Text>
    </View>
  );
}

function RunHead({ section }: { section: string }) {
  return (
    <View style={s.runHead} fixed>
      <Text style={s.runHeadText}>{fl()}</Text>
      <Text style={s.runHeadText}>{section}</Text>
    </View>
  );
}

function H2({ num, title }: { num: string; title: string }) {
  return (
    <View style={s.h2wrap} wrap={false}>
      <Text style={s.h2num}>{num}</Text>
      <Text style={s.h2}>{title}</Text>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={s.bRow} wrap={false}>
      <Text style={s.bDot}>-</Text>
      <Text style={s.bText}>{text}</Text>
    </View>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <View style={s.kvRow}>
      <Text style={s.kvK}>{k}</Text>
      <Text style={s.kvV}>{v}</Text>
    </View>
  );
}

// ── COVER PAGE ────────────────────────────────────────────────

const LABEL = {
  nydf: {
    sub: "National Youth Development Fund Application\nSubmitted to the Development Bank of Namibia",
    footer: "Swift Designz Investments CC | NYDF Business Plan 2026",
    docTitle: "Swift Designz Investments CC - NYDF Business Plan 2026",
    subject: "National Youth Development Fund Loan Application",
    keywords: "NYDF, DBN, business plan, Swift Designz, Namibia, ICT",
  },
  generic: {
    sub: "Business Loan Application\n2026",
    footer: "Swift Designz Investments CC | Business Plan 2026",
    docTitle: "Swift Designz Investments CC - Business Plan 2026",
    subject: "Business Loan Application",
    keywords: "business plan, Swift Designz, Namibia, ICT, loan",
  },
} as const;

type Variant = keyof typeof LABEL;

// Module-level footer label — set synchronously before render
let _footerLabel: string = LABEL.nydf.footer;
const fl = (): string => _footerLabel;

// ── TABLE OF CONTENTS ────────────────────────────────────────

function TableOfContentsPage() {
  const entries: [string, string][] = [
    ["Cover Letter", "2"],
    ["Executive Summary", "3"],
    ["Section 01 — Company Information", "5"],
    ["  1.1  Business Name", "5"],
    ["  1.2  Business Location", "5"],
    ["  1.3  Description of Business and Services", "5"],
    ["  1.4  Regulatory and Compliance Context", "5"],
    ["  1.5  Sources of Funding", "5"],
    ["Section 02 — Management Plan", "6"],
    ["  2.1  Organisational Structure", "6"],
    ["  2.1.1  Personnel: Year 1 to Year 3", "6"],
    ["  2.1.2  Experience and Technical Ability", "7"],
    ["  2.1.3  Ownership Structure", "7"],
    ["  2.1.4  Strategic Alliances", "7"],
    ["Section 03 — Financial Information", "8"],
    ["  3.1  Implementation Plan", "8"],
    ["  3.2  Pre-Registration Trading History", "8"],
    ["  3.3  Loan Use Breakdown", "9"],
    ["  3.3.1  Key Financial Assumptions", "10"],
    ["  3.3.1a  Revenue Composition", "10"],
    ["  3.3.2  Year 1 Monthly Cash Flow Projection", "11"],
    ["  3.3.3  Income Statement Projection", "12"],
    ["  3.3.3  Income Statement Projection (Year 1)", "12"],
    ["  3.3.4  3-Year Financial Projection Summary", "12"],
    ["  3.3.5  Loan Repayment Projection", "13"],
    ["Section 04 — Marketing Plan", "13"],
    ["  4.1  Industry Analysis", "13"],
    ["  4.1.1  SWOT Analysis", "13"],
    ["  4.1.2  Target Markets and Market Share Estimates", "13"],
    ["  4.1.3  Market Segment Notes", "14"],
    ["  4.1.4  Competition and Competitive Positioning", "14"],
    ["  4.2  Promotion and Advertising Strategy", "14"],
    ["Section 05 — Operations and Technology", "15"],
    ["  5.1  Operations Overview", "15"],
    ["  5.2  Delivery Methodology and Raw Material Costing", "15"],
    ["  5.3  Organisation of Operations and Outputs", "15"],
    ["  5.4  Technology and Equipment", "15"],
    ["Section 06 — Statistics", "16"],
  ];
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Index" />
      <View>
        <Text style={s.pageTitle}>Index</Text>
        <View style={s.pageTitleRule} />
      </View>
      {entries.map(([label, pg]) => (
        <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={{ fontSize: label.startsWith("  ") ? 8 : 9, color: label.startsWith("Section") ? "#111111" : "#444444", fontWeight: label.startsWith("Section") ? 700 : 400 }}>
            {label}
          </Text>
          <Text style={{ fontSize: 8, color: "#888888" }}>{pg}</Text>
        </View>
      ))}
      <Footer left={fl()} right="Index" />
    </Page>
  );
}

// ── COVER PAGE ────────────────────────────────────────────────

function CoverPage({ variant }: { variant: Variant }) {
  return (
    <Page size="A4" style={s.coverPage}>
      <Text style={s.coverLogoName}>SWIFT DESIGNZ INVESTMENTS CC</Text>
      <Text style={s.coverLogoSub}>CC/2026/05589 · Windhoek, Namibia</Text>
      <View style={s.coverRule} />
      <Text style={s.coverTitle}>Business Plan</Text>
      <Text style={s.coverSub}>
        {LABEL[variant].sub}
      </Text>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>Applicant</Text>
        <Text style={s.coverDD}>Keenan Husselmann</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>Date of Birth</Text>
        <Text style={s.coverDD}>21 May 1995 (Age 31)</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>ID Number</Text>
        <Text style={s.coverDD}>95052100450</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>Business Registration</Text>
        <Text style={s.coverDD}>CC/2026/05589, registered 12 May 2026</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>NamRA Tax Income Number</Text>
        <Text style={s.coverDD}>16271273 (ITX 16271273-011)</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>Business Address</Text>
        <Text style={s.coverDD}>Erf 55 Kenneth McArthur Street, Auas Blick, Windhoek</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>Postal Address</Text>
        <Text style={s.coverDD}>P.O. Box 4655, Rehoboth, Namibia</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>Contact</Text>
        <Text style={s.coverDD}>081 388 1111 · info@swiftdesignz.co.za</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>Website</Text>
        <Text style={s.coverDD}>swiftdesignz.co.za</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>Loan Amount Requested</Text>
        <Text style={s.coverDD}>N$550,000</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>Repayment Period</Text>
        <Text style={s.coverDD}>60 months (12 months grace period requested)</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>Date Prepared</Text>
        <Text style={s.coverDD}>May 2026</Text>
      </View>
      <View style={s.coverRule2} />
      <Text style={s.coverNote}>
        {variant === "nydf"
          ? "This business plan has been prepared in support of a loan application under the National Youth Development Fund (NYDF), administered through the Development Bank of Namibia. All financial projections are based on conservative estimates derived from demonstrated pre-registration trading activity. The applicant declares that all information contained herein is true and accurate to the best of their knowledge."
          : "This business plan has been prepared in support of a business loan application. All financial projections are based on conservative estimates derived from demonstrated pre-registration trading activity. The applicant declares that all information contained herein is true and accurate to the best of their knowledge."}
      </Text>
    </Page>
  );
}

// ── COVER LETTER ─────────────────────────────────────────────

const bl = { fontSize: 9, color: "#111111", lineHeight: 1.72, marginBottom: 8 } as const;

function CoverLetterPage({ variant }: { variant: Variant }) {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Cover Letter" />

      <View wrap={false} style={{ marginBottom: 16 }}>
        <Text style={[bl, { fontWeight: 700, marginBottom: 2 }]}>{variant === "nydf" ? "The NYDF Fund Manager" : "The Loans Manager"}</Text>
        <Text style={[bl, { marginBottom: 2 }]}>{variant === "nydf" ? "Development Bank of Namibia" : "[Financial Institution]"}</Text>
        <Text style={[bl, { marginBottom: 2 }]}>{variant === "nydf" ? "PO Box 235, Windhoek" : "Windhoek, Namibia"}</Text>
        <Text style={[bl, { marginBottom: 0 }]}>Namibia</Text>
      </View>

      <Text style={[bl, { fontWeight: 700, marginBottom: 14 }]} wrap={false}>
        RE: {variant === "nydf" ? "NYDF LOAN APPLICATION" : "BUSINESS LOAN APPLICATION"} - SWIFT DESIGNZ INVESTMENTS CC (CC/2026/05589)
      </Text>

      <Text style={[bl, { marginBottom: 14 }]} wrap={false}>Dear Sir / Madam,</Text>

      <Text style={bl} wrap={false}>
        I am Keenan Husselmann, 31, sole director of Swift Designz Investments CC (CC/2026/05589, registered 12 May 2026, Windhoek). I hereby apply for N$550,000 in business loan funding. Swift Designz is a digital technology company building websites, e-commerce stores, apps, and AI solutions for Namibian and South African businesses. Prior to formal registration, I generated N$41,000 in confirmed income over 5 months. Current monthly recurring revenue is N$7,000.
      </Text>
      <Text style={bl} wrap={false}>
        This loan will do three things: get Apple hardware into the business so we can build and test for iOS and macOS users for the first time; fund six staff salaries for 12 months while we grow the client base; and cover professional and legal setup costs for the new CC. We are fully remote, overhead is low, and we are already generating revenue in both Namibia and South Africa.
      </Text>
      <Text style={bl} wrap={false}>
        Six young Namibians will be formally employed, registered with Social Security, and given real career experience in the technology sector. The business is profitable from Month 3 post-funding and generates a full-year operating surplus of N$136,000. This loan is a bridge to a scalable, self-sustaining business — not operating capital for a concept.
      </Text>
      <Text style={bl} wrap={false}>
        I have attached a full business plan and all required supporting documents. I welcome the opportunity to discuss this application further.
      </Text>

      <View wrap={false} style={{ marginTop: 14 }}>
        <Text style={[bl, { marginBottom: 0 }]}>Yours sincerely,</Text>
        <View style={{ marginTop: 30, marginBottom: 6, borderBottomWidth: 1, borderColor: "#cccccc", width: 160 }} />
        <Text style={[bl, { fontWeight: 700, marginBottom: 2 }]}>Keenan Husselmann</Text>
        <Text style={[bl, { marginBottom: 2 }]}>Director, Swift Designz Investments CC</Text>
        <Text style={[bl, { marginBottom: 2 }]}>081 388 1111</Text>
        <Text style={[bl, { marginBottom: 2 }]}>info@swiftdesignz.co.za</Text>
        <Text style={[bl, { marginBottom: 2 }]}>Erf 55 Kenneth McArthur Street, Auas Blick, Windhoek, Namibia</Text>
      </View>

      <Footer left={fl()} right="Cover Letter" />
    </Page>
  );
}

// ── EXECUTIVE SUMMARY + NYDF CRITERIA ────────────────────────

function ExecutiveSummaryPage({ variant }: { variant: Variant }) {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Executive Summary" />
      <View>
        <Text style={s.pageTitle}>Executive Summary</Text>
        <View style={s.pageTitleRule} />
      </View>

      <H2 num="WHO WE ARE" title="About Swift Designz Investments CC" />
      <Text style={s.p} wrap={false}>
        Swift Designz Investments CC is a registered Namibian digital technology company providing website development, e-commerce solutions, custom software applications, AI integration, and technical training to businesses across Namibia and South Africa. The company was formally registered on 12 May 2026 under the Close Corporations Act (CC/2026/05589) and operates fully remotely from Windhoek, Khomas Region.
      </Text>
      <Text style={s.p} wrap={false}>
        Prior to formal registration, the business traded under the Swift Designz brand from January 2026, generating N$41,000 in confirmed income over 5 months. Current monthly recurring revenue is N$7,000 from active retainer contracts, an investor contribution, and ongoing client project deposits. The business serves active paying clients in both Namibia and South Africa, with live e-commerce stores and websites deployed in both markets.
      </Text>

      <View style={s.div} />

      <H2 num="WHY WE NEED THE LOAN" title="Three Reasons for This Application" />
      <Bullet text="To build a team: solo capacity is capped at 10 active clients. Six hires unlock parallel project delivery and allow the director to focus on acquisition while the team handles delivery." />
      <Bullet text="To serve Apple users: currently Windows and Android only. Testing iOS apps requires a real iPhone; submitting to the App Store requires a Mac. The iMac and iPhone in this budget unlock an entirely new service category." />
      <Bullet text="To cover legal and professional setup: N$75,000 reserve for legal fees, accounting, and business insurance — non-optional costs for operating a compliant CC from day one." />

      <View style={s.div} />

      <View wrap={false}>
        <H2 num="IMPACT" title="What This Funding Will Achieve" />
        <Bullet text="6 permanent jobs created, all held by young Namibians aged 22 to 33" />
        <Bullet text="3 of the 6 positions filled by women" />
        <Bullet text="Full cross-platform capability: the business will serve Windows, Android, iOS, and macOS users for the first time" />
        <Bullet text="Revenue growth from N$25,000 at Month 1 (post-funding) to N$60,000 and above by Month 12" />
        <Bullet text="Formal employment and Social Security registration for the full team from day one" />
        <Bullet text="Growth of the existing South Africa client base, bringing foreign revenue into Namibia" />
      </View>

      {variant === "nydf" && <>
        <View wrap={false}>
          <View style={s.div} />
          <H2 num="NYDF CRITERIA" title="How This Application Meets the NYDF Assessment Criteria" />
          <Text style={[s.p, { marginBottom: 10 }]} wrap={false}>
            The NYDF assesses all applications on five criteria. This section addresses each one directly so reviewers can verify eligibility and impact at a glance.
          </Text>
        </View>

        <Text style={s.h3} wrap={false}>1. Viability and Sustainability of the Business</Text>
        <Text style={s.p} wrap={false}>
          Swift Designz is not a concept. It has been operating for over a year, has 6 active paying clients, and generates N$7,000 per month in confirmed recurring income from retainer contracts, investor contributions, and project deposits. Invoices totalling N$46,964 have been issued and paid in 2026 alone. The business has a registered accounting officer, a formal CC registration, and an active NamRA tax number. It is already a functioning business. This loan is for scaling it, not starting it.
        </Text>
        <Text style={[s.p, { marginBottom: 8 }]} wrap={false}>
          Financial projections show the business reaching operational breakeven at Month 3, generating N$60,000 per month by Month 12, and producing a full-year operating surplus in Year 1. Loan repayments from Year 2 are fully serviceable from operational revenue. The full revenue model, monthly cash flow projections, and 3-year financial summary are in Section 03 of this plan.
        </Text>

        <Text style={s.h3} wrap={false}>2. Youth Empowerment Potential</Text>
        <Text style={s.p} wrap={false}>
          The Director, Keenan Husselmann, is 31 years old. All 5 positions to be hired are youth aged 22 to 33. Three of the 6 total team members are women. Every staff member will receive structured internal training across all business domains during Years 1 and 2. By Year 3, trained staff are advanced into management positions from within the business.
        </Text>

        <Text style={s.h3} wrap={false}>3. Job Creation Capacity</Text>
        <Text style={s.p} wrap={false}>
          This loan directly creates 5 formal, permanent, salaried positions from Month 1, all registered with the Social Security Commission. By Year 3, the team grows to 9 with 3 additional intern positions providing a pathway to permanent employment.
        </Text>

        <Text style={s.h3} wrap={false}>4. Innovation and Local Relevance</Text>
        <Text style={s.p} wrap={false}>
          Swift Designz builds technology that Namibian businesses currently have to import from South Africa, Europe, or the United States. The cross-platform capability unlocked by this loan (iOS, Android, Windows, macOS) means Namibian clients are served by a local company at local prices. Planned AI platforms and school tools directly address Namibia{"'"}s digital skills gap.
        </Text>

        <Text style={s.h3} wrap={false}>5. Environmental and Social Impact</Text>
        <Text style={s.p} wrap={false}>
          Fully remote operations mean zero commute, no office energy consumption, and no vehicle fleet. Cloud delivery reduces printed materials and in-person travel. Every website and app delivered gives a Namibian SME a permanent local digital presence, reducing dependency on expensive overseas services.
        </Text>
      </>}

      <Footer left={fl()} right="Executive Summary" />
    </Page>
  );
}

// ── SECTION 01 — COMPANY INFORMATION ─────────────────────────

function CompanyInfoPage() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 01 - Company Information" />
      <View>
        <Text style={s.pageTitle}>Section 01 - Company Information</Text>
        <View style={s.pageTitleRule} />
      </View>
      <H2 num="1.1" title="Business Name" />
      <Text style={s.p} wrap={false}>Swift Designz Investments CC</Text>
      <H2 num="1.2" title="Business Location" />
      <KV k="Physical Address" v="Erf 55 Kenneth McArthur Street, Auas Blick, Windhoek, Namibia" />
      <KV k="Postal Address" v="P.O. Box 4655, Rehoboth, Namibia" />
      <KV k="Region" v="Khomas" />
      <KV k="Mode of Operation" v="Fully remote, no office premises required" />
      <KV k="Website" v="swiftdesignz.co.za" />
      <KV k="Admin Portal" v="admin.swiftdesignz.co.za" />
      <KV k="Email" v="info@swiftdesignz.co.za" />
      <View style={s.div} />
      <H2 num="1.3" title="Description of Business and Services" />
      <Text style={s.p} wrap={false}>
        Swift Designz Investments CC is a digital technology company that helps businesses establish and grow their online presence. We design and build websites, online stores, and custom software applications. We also offer training in artificial intelligence tools and project management methods, and we provide monthly technical support retainers to keep client platforms running well after launch.
      </Text>
      <Text style={s.h3} wrap={false}>Future Services (Year 2 and beyond):</Text>
      <Bullet text="AI agentic platforms built for specific business domains (legal, retail, logistics, healthcare)" />
      <Bullet text="AI assistants for businesses — custom-trained, deployed, and maintained for individual companies" />
      <Bullet text="AI tutors for schools — interactive learning tools built for Namibian curricula and classrooms" />
      <View wrap={false} style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 2 }]}>Service</Text>
          <Text style={[s.th, { flex: 2 }]}>Description</Text>
          <Text style={[s.th, { flex: 1.2, textAlign: "right" as const }]}>Price Range (N$)</Text>
        </View>
        {[
          ["Website Development", "Custom business websites from Starter to Premium", "2,500 to 10,000"],
          ["E-Commerce Stores", "Shopify and custom online retail solutions", "4,000 to 15,000"],
          ["App Development", "Web and mobile application builds for Android, iOS, and cross-platform", "5,000 to 25,000+"],
          ["AI Training", "Individual 1-hour sessions and team workshops", "N$800 per session"],
          ["PM Training", "Full training programme including tools access and content", "N$2,000 fixed fee"],
          ["Maintenance Retainer", "Monthly support, updates, and monitoring (range N$800 to N$1,500)", "avg N$900 per month"],
          ["Technical Consulting", "Audits, reviews, and advisory services", "N$800 per hour"],
        ].map(([svc, desc, price], i) => (
          <View key={svc} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.td, { flex: 2 }]}>{svc}</Text>
            <Text style={[s.td, { flex: 2 }]}>{desc}</Text>
            <Text style={[s.td, { flex: 1.2, textAlign: "right" as const }]}>{price}</Text>
          </View>
        ))}
      </View>
      <View style={s.div} />
      <H2 num="1.4" title="Regulatory and Compliance Context" />
      <Text style={s.p} wrap={false}>
        Registered under the Close Corporations Act, Act 26 of 1988 (CC/2026/05589). NamRA Tax Income Number: 16271273 (ITX 16271273-011). Not VAT-registered — annual turnover below N$500,000 threshold; registration will be initiated as revenue grows. Staff registered with SSC on appointment. Accounting Officer: Rachel N. Kashala (SAIBA 4132). Active clients in Namibia and South Africa — live e-commerce stores and websites deployed in both markets.
      </Text>
      <View wrap={false}>
      <View style={s.div} />
      <H2 num="1.5" title="Sources of Funding" />
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 2 }]}>Source</Text>
          <Text style={[s.th, { flex: 2 }]}>Description</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Amount (N$)</Text>
        </View>
        {[
          ["NYDF Loan (DBN)", "Loan applied for in this application", "550,000"],
          ["Own Contribution", "Existing equipment contributed in-kind", "40,000"],
          ["Private Investor (Signed investor commitment letter attached as Supporting Document SD-01)", "Monthly contribution of N$2,000 over 5 years (ongoing)", "120,000 total"],
        ].map(([src, desc, amt], i) => (
          <View key={src} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.td, { flex: 2 }]}>{src}</Text>
            <Text style={[s.td, { flex: 2 }]}>{desc}</Text>
            <Text style={[s.td, { flex: 1, textAlign: "right" as const }]}>{amt}</Text>
          </View>
        ))}
        <View style={s.tblRTotal}>
          <Text style={[s.tdb, { flex: 4 }]}>Total Project Funding</Text>
          <Text style={[s.tdbr, { flex: 1 }]}>N$700,000</Text>
        </View>
      </View>
      </View>
      <Footer left={fl()} right="Section 01 - Company Information" />
    </Page>
  );
}

// ── SECTION 02 — MANAGEMENT PLAN ─────────────────────────────

function ManagementPlanPage() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 02 - Management Plan" />
      <View>
        <Text style={s.pageTitle}>Section 02 - Management Plan</Text>
        <View style={s.pageTitleRule} />
      </View>
      <H2 num="2.1" title="Organisational Structure" />
      <Text style={s.p} wrap={false}>
        Swift Designz Investments CC operates a flat, remote-first structure. The Director leads all technical work, project management, and strategic decisions directly. Operations and project delivery are managed by the Director because that is where the domain knowledge sits. The Business Administrator handles finance administration and day-to-day coordination. The technical team handles development, quality assurance, and systems. Marketing drives lead generation and brand growth.
      </Text>
      <Text style={s.h3} wrap={false}>Management Organogram</Text>
      <View style={s.orgWrap}>

        {/* Director */}
        <View style={s.orgTopBox}>
          <Text style={s.orgTopText}>DIRECTOR · LEAD DEVELOPER · OPERATIONS</Text>
          <Text style={s.orgTopSub}>Keenan Husselmann  ·  N$10,000/mo</Text>
        </View>
        <View style={s.orgLine} />

        {/* Horizontal spread */}
        <View style={{ flexDirection: "row", justifyContent: "center" as const }}>
          <View style={{ flex: 1, borderTopWidth: 2, borderRightWidth: 2, borderColor: "#444444", height: 14 }} />
          <View style={{ flex: 1, borderTopWidth: 2, borderLeftWidth: 2, borderColor: "#444444", height: 14 }} />
        </View>

        {/* Three departments */}
        <View style={{ flexDirection: "row", justifyContent: "center" as const, gap: 18 }}>

          {/* OPERATIONS */}
          <View style={{ alignItems: "center" as const }}>
            <View style={s.orgChildBox}>
              <Text style={s.orgChildText}>OPERATIONS</Text>
              <Text style={s.orgChildSub}>Director-led</Text>
            </View>
            <View style={s.orgLine} />
            <View style={{ flexDirection: "row", gap: 6 }}>
              <View style={s.orgStaffBox}>
                <Text style={s.orgStaffText}>Business Admin</Text>
                <Text style={s.orgStaffSub}>Georgia Orren</Text>
                <Text style={s.orgStaffSal}>N$6,500/mo</Text>
              </View>
              <View style={s.orgStaffBox}>
                <Text style={s.orgStaffText}>Project Manager</Text>
                <Text style={s.orgStaffSub}>Requelle Husselmann</Text>
                <Text style={s.orgStaffSal}>N$5,500/mo</Text>
              </View>
            </View>
          </View>

          {/* TECHNOLOGY */}
          <View style={{ alignItems: "center" as const }}>
            <View style={s.orgChildBox}>
              <Text style={s.orgChildText}>TECHNOLOGY</Text>
              <Text style={s.orgChildSub}>Dev, QA &amp; Systems</Text>
            </View>
            <View style={s.orgLine} />
            <View style={{ flexDirection: "row", gap: 6 }}>
              <View style={s.orgStaffBox}>
                <Text style={s.orgStaffText}>Systems Admin</Text>
                <Text style={s.orgStaffSub}>Anthony Bagley</Text>
                <Text style={s.orgStaffSal}>N$3,500/mo</Text>
              </View>
              <View style={s.orgStaffBox}>
                <Text style={s.orgStaffText}>QA Tester</Text>
                <Text style={s.orgStaffSub}>Tapiwa Machekera</Text>
                <Text style={s.orgStaffSal}>N$2,500/mo</Text>
              </View>
            </View>
          </View>

          {/* MARKETING */}
          <View style={{ alignItems: "center" as const }}>
            <View style={s.orgChildBox}>
              <Text style={s.orgChildText}>MARKETING</Text>
              <Text style={s.orgChildSub}>Brand &amp; Growth</Text>
            </View>
            <View style={s.orgLine} />
            <View style={s.orgStaffBox}>
              <Text style={s.orgStaffText}>Marketing Officer</Text>
              <Text style={s.orgStaffSub}>Shakira Linno</Text>
              <Text style={s.orgStaffSal}>N$4,000/mo</Text>
            </View>
          </View>

        </View>
      </View>
      <View style={s.div} />
      <View wrap={false}>
        <H2 num="2.1.1" title="Personnel: Year 1 to Year 3" />
        <View style={s.tbl}>
          <View style={s.tblH}>
            <Text style={[s.th, { flex: 1.8 }]}>Role</Text>
            <Text style={[s.th, { flex: 1.6 }]}>Staff Member</Text>
            <Text style={[s.th, { flex: 1.1 }]}>Qualification</Text>
            <Text style={[s.th, { flex: 0.8 }]}>Age</Text>
            <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Monthly (N$)</Text>
          </View>
          {[
            ["Director / Lead Developer", "Keenan Husselmann", "BSc CS Software Dev, NUST", "31", "10,000"],
            ["Business Administrator", "Georgia Orren", "BA Business Admin (Hons in progress)", "24", "6,500"],
            ["Project Manager", "Requelle Husselmann", "BA Education (Hons) + Certificate in PM", "33", "5,500"],
            ["Systems Admin Intern", "Anthony Bagley", "Studying Systems Administration", "26", "3,500"],
            ["Marketing Officer", "Shakira Linno", "BA Marketing", "25", "4,000"],
            ["QA Tester Intern", "Tapiwa Machekera", "BSc Computer Science (in progress)", "22", "2,500"],
          ].map(([role, name, qual, age, sal], i) => (
            <View key={role} style={i % 2 === 0 ? s.tblR : s.tblRA}>
              <Text style={[s.td, { flex: 1.8 }]}>{role}</Text>
              <Text style={[s.td, { flex: 1.6 }]}>{name}</Text>
              <Text style={[s.td, { flex: 1.1 }]}>{qual}</Text>
              <Text style={[s.td, { flex: 0.8 }]}>{age}</Text>
              <Text style={[s.td, { flex: 1, textAlign: "right" as const }]}>{sal}</Text>
            </View>
          ))}
          <View style={s.tblRTotal}>
            <Text style={[s.tdb, { flex: 5.3 }]}>Total Monthly Payroll</Text>
            <Text style={[s.tdbr, { flex: 1 }]}>32,000</Text>
          </View>
        </View>
      </View>
      <Text style={s.h3} wrap={false}>Planned Staff Growth (Years 2 and 3):</Text>
      <Bullet text="Year 2: no new hires. The existing team of 6 continues in their roles and undergoes structured training across all business domains including development, client management, project delivery, finance basics, and operations. The goal is to build complete business knowledge in each team member, not just technical skill." />
      <Bullet text="Year 3: staff who have completed the 2-year training are advanced into management positions within their domain. Each manager is then supported by a new assistant hire recruited as an intern. Intern positions: Assistant Developer, Assistant Admin, and Assistant Sales." />
      <Bullet text="Interns work on a pro bono basis for the first 2 months as part of their onboarding and practical training. After 2 months they move to entry-level salaries based on performance and business revenue at the time." />
      <Bullet text="This model builds a loyal, fully trained management layer from within before expanding headcount, keeping costs controlled and knowledge retention high." />
      <Footer left={fl()} right="Section 02 - Management Plan" />
    </Page>
  );
}

function ManagementPlanPage2() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 02 - Management Plan (continued)" />
      <H2 num="2.1.2" title="Experience and Technical Ability" />
      <Text style={s.h3} wrap={false}>Keenan Husselmann - Director and Lead Developer</Text>
      <Text style={s.p} wrap={false}>
        I hold a Bachelor of Computer Science degree in Software Development from NUST (Namibia University of Science and Technology). I started building professionally in early 2026 and have been trading under the Swift Designz brand since January 2026. Over the first 5 months of trading I generated N$41,000 in total income with approximately N$5,000 in expenses, achieving an 88% profit margin. Current monthly recurring revenue is N$7,000, made up of 3 active retainer clients on 1-year contracts, 1 investor, and ongoing client project deposits.
      </Text>
      <Text style={s.p} wrap={false}>
        As evidence of my technical capability, I designed and built the full administrative management platform used to run Swift Designz. This system, accessible at admin.swiftdesignz.co.za, is a custom Next.js and React application backed by a PostgreSQL database. It handles client relationship management, project tracking, full accounts receivable (quotations, invoices, payments, reminders, statements, retainers), payroll tracking, equipment management, investor management, and automated email communication. Building this system from scratch demonstrates not only technical depth but the ability to understand business requirements and translate them into working software.
      </Text>
      <Text style={s.p} wrap={false}>
        I am proficient in: TypeScript, Tailwind CSS, Supabase (PostgreSQL, authentication, storage), React, Next.js, Shopify development, mobile-responsive design, and AI-assisted development workflows.
      </Text>
      <Text style={[s.p, { fontSize: 8, color: "#555555" }]} wrap={false}>
        Full CVs and supporting credentials for all staff members are available as Supporting Documents on request. Qualifications are summarised in the personnel table in Section 2.1.1 above.
      </Text>
      <View style={s.div} />
      <H2 num="2.1.3" title="Ownership Structure" />
      <Text style={s.p} wrap={false}>
        Swift Designz Investments CC has two members. Keenan Husselmann holds an 85% member interest and serves as the sole director. Leon Husselmann holds a 15% member interest. The controlling member and day-to-day operator is Keenan Husselmann, who qualifies as youth under the NYDF criteria (aged 31, within the 18 to 45 range). The business also has one private investor (Signed investor commitment letter attached as Supporting Document SD-01) who contributes N$2,000 per month for five years under a non-ownership financial arrangement.
      </Text>
      <KV k="Member 1" v="Keenan Husselmann — 85% interest (Director, aged 31)" />
      <KV k="Member 2" v="Leon Husselmann — 15% interest" />
      <KV k="Youth Ownership" v="85% (controlling director is youth-qualifying)" />
      <KV k="Women Ownership" v="0%" />
      <KV k="Disability" v="None" />
      <View wrap={false}>
        <View style={s.div} />
        <H2 num="2.1.4" title="Strategic Alliances" />
        <Text style={s.h3} wrap={false}>Current Alliances</Text>
        <Bullet text="IT-Guru (Ambrose): hosting and domain registration partner. Facilitates affordable, reliable web hosting for all client websites deployed by Swift Designz" />
        <Bullet text="Rachel N. Kashala (SAIBA 4132): appointed Accounting Officer. Provides independent financial oversight, compliance, and annual reporting" />
        <Bullet text="Private Investor: committed to a monthly financial contribution of N$2,000 for a period of five years, providing supplementary income during the growth phase (Signed investor commitment letter attached as Supporting Document SD-01)" />
      </View>
      <Text style={s.h3} wrap={false}>Planned Future Alliances</Text>
      <Bullet text="Shopify and Google Partner certification (Year 2): pursue certified agency status with both platforms to gain qualified lead referrals, co-marketing exposure, and priority support." />
      <Bullet text="School and college partnerships (Year 3): deploy AI tutor tools and digital skills training in Namibian schools, building recurring institutional revenue and a pipeline of future-trained staff." />
      <Bullet text="Banking and accounting referral network (Year 2): become the referred ICT partner for Bank Windhoek, FNB Namibia, and accounting firms serving SME clients across Namibia." />
      <Bullet text="Telecom bundle partnership (Year 3): partner with MTC or Telecom Namibia to offer bundled connectivity and digital presence packages to their SME customer base." />
      <Bullet text="Investor expansion (Year 2 onwards): bring in additional investors with sector-specific networks in retail, education, or logistics to accelerate growth beyond NYDF loan coverage." />
      <Footer left={fl()} right="Section 02 - Management Plan" />
    </Page>
  );
}

// ── SECTION 03 — FINANCIAL INFORMATION ───────────────────────

function FinancialPage1() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 03 - Financial Information" />
      <View>
        <Text style={s.pageTitle}>Section 03 - Financial Information</Text>
        <View style={s.pageTitleRule} />
      </View>
      <H2 num="3.1" title="Implementation Plan" />
      <View style={s.box}>
        <Text style={s.boxText}>
          Important: Loan funds will not be received on the same day the application is submitted. The pre-approval period typically takes several weeks to months. During this time, Keenan Husselmann continues to operate the business as a sole practitioner, serving existing clients and maintaining current revenue. No staff will be formally employed until loan funds are confirmed and disbursed. Team members have been identified and are on standby, and may assist on a voluntary basis during this period, but formal employment, Social Security registration, and salary payments begin only after funding is received.
        </Text>
      </View>
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { width: 80 }]}>Phase</Text>
          <Text style={[s.th, { width: 95 }]}>Timeline</Text>
          <Text style={[s.th, { flex: 1 }]}>Activities</Text>
        </View>
        {[
          ["Pre-Approval", "Now - Approval\n(Estimated 4-8 weeks)", "Keenan operates solo. Existing clients continue to be served. Revenue maintained at approximately N$7,000 per month from retainers, investor, and client deposits. Team candidates are identified and on standby. Employment contracts are drafted in preparation. No formal hiring until funds are confirmed."],
          ["Phase 1", "Month 1 to 2\n(Post-disbursement)", "Loan funds received. Formal employment commences for all 5 positions. All staff registered with Social Security Commission within the first week. Hardware equipment procured from approved suppliers with quotations attached. Professional and legal fees paid. Team onboarded and remote workflows established."],
          ["Phase 2", "Month 3 to 6", "Full team operational. Active client acquisition begins. Marketing Officer launches social media campaigns and paid advertising. Target 5 new clients per month. Establish initial retainer base targeting 8 active retainer clients by end of Month 6."],
          ["Phase 3", "Month 7 to 12", "Scale operations. Target 15 or more active clients and 15 or more retainer subscriptions. Revenue should reach or exceed N$60,000 per month."],
          ["Phase 4", "Year 2 onward", "Commence NYDF loan repayments. Hire additional developers as revenue allows. Scale both Namibia and South Africa client bases. Register for PAYE and VAT as thresholds are reached."],
        ].map(([ph, tl, act], i) => (
          <View key={ph} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { width: 80 }]}>{ph}</Text>
            <Text style={[s.td, { width: 95 }]}>{tl}</Text>
            <Text style={[s.td, { flex: 1 }]}>{act}</Text>
          </View>
        ))}
      </View>
      <View wrap={false}>
        <View style={s.div} />
        <H2 num="3.2" title="Pre-Registration Trading History" />
        <Text style={s.p} wrap={false}>
          Prior to formal CC registration on 12 May 2026, the business operated as a sole proprietor under the Swift Designz brand from January 2026. The following figures are confirmed from the business own accounting records:
        </Text>
        <Bullet text="Total income (January to May 2026, 5 months): N$41,000" />
        <Bullet text="Total expenses (January to May 2026): approximately N$5,000" />
        <Bullet text="Net profit over 5 months: N$36,000 (approximately 88% profit margin)" />
        <Bullet text="Average monthly gross revenue: N$8,200" />
        <Text style={s.p} wrap={false}>
          Current monthly revenue of N$7,000 to N$7,300 is made up of three recurring sources:
        </Text>
        <Bullet text="3 active retainer clients on 1-year service contracts: N$2,800 per month combined" />
        <Bullet text="1 private investor contribution: N$2,000 per month (5-year commitment)" />
        <Bullet text="Client project deposit payments at 50% upfront on projects averaging N$5,000 in total value: approximately N$2,500 per month" />
        <Text style={s.p} wrap={false}>
          Two additional retainer clients are currently in the activation pipeline. Once confirmed, they will add approximately N$1,800 per month to the recurring revenue base. All retainer clients are on 1-year contracts, providing stable and predictable monthly income regardless of project volume in any given month.
        </Text>
        <Text style={s.p} wrap={false}>
          This demonstrates that the business already has proven, recurring revenue streams. This is not a concept seeking its first client. It is an operating business seeking the funding to grow its capacity and serve a wider client base.
        </Text>
      </View>
      <View wrap={false}>
        <View style={s.div} />
        <H2 num="3.3" title="Loan Use Breakdown" />
        <View style={s.tbl}>
          <View style={s.tblH}>
            <Text style={[s.th, { flex: 1.4 }]}>Category</Text>
            <Text style={[s.th, { flex: 2 }]}>Description</Text>
            <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Cost (N$)</Text>
          </View>
          <View style={s.tblR}>
            <Text style={[s.tdb, { flex: 1.4 }]}>Hardware</Text>
            <Text style={[s.td, { flex: 2 }]}>iMac 24-inch M4 (full kit), 2× external monitors, monitor arm, SSD, ergonomic chair, printer and toner, document shredder, iPhone 16 (128GB), iPad Air 11-inch, UPS, NAS storage</Text>
            <Text style={[s.tdr, { flex: 1 }]}>114,250</Text>
          </View>
          <View style={s.tblRA}>
            <Text style={[s.tdb, { flex: 1.4 }]}>Professional and Legal Reserve</Text>
            <Text style={[s.td, { flex: 2 }]}>Lawyer fees, accounting and audit fees, business insurance premiums</Text>
            <Text style={[s.tdr, { flex: 1 }]}>75,000</Text>
          </View>
          <View style={s.tblRTotal}>
            <Text style={[s.tdb, { flex: 3.4 }]}>Subtotal: Equipment and Reserve</Text>
            <Text style={[s.tdbr, { flex: 1 }]}>189,250</Text>
          </View>
          <View style={s.tblR}>
            <Text style={[s.tdb, { flex: 1.4 }]}>Operational Staffing (12 months)</Text>
            <Text style={[s.td, { flex: 2 }]}>5 youth employees at N$32,000 per month combined for 12 months</Text>
            <Text style={[s.tdr, { flex: 1 }]}>384,000</Text>
          </View>
          <View style={s.tblRA}>
            <Text style={[s.tdb, { flex: 1.4 }]}>Employer Statutory Costs</Text>
            <Text style={[s.td, { flex: 2 }]}>Social Security and statutory employer contributions (~2%)</Text>
            <Text style={[s.tdr, { flex: 1 }]}>7,750</Text>
          </View>
          <View style={s.tblR}>
            <Text style={[s.tdb, { flex: 1.4 }]}>Recruitment and Setup</Text>
            <Text style={[s.td, { flex: 2 }]}>Job advertising, SSC registration fees, and administrative costs</Text>
            <Text style={[s.tdr, { flex: 1 }]}>9,000</Text>
          </View>
          <View style={s.tblRTotal}>
            <Text style={[s.tdb, { flex: 3.4 }]}>Subtotal: Working Capital</Text>
            <Text style={[s.tdbr, { flex: 1 }]}>400,750</Text>
          </View>
          <View style={s.tblR}>
            <Text style={[s.tdb, { flex: 3.4 }]}>Total Funding Requirement</Text>
            <Text style={[s.tdbr, { flex: 1 }]}>590,000</Text>
          </View>
          <View style={s.tblRA}>
            <Text style={[s.td, { flex: 3.4 }]}>Less: Own Contribution (existing equipment, in-kind)</Text>
            <Text style={[s.tdr, { flex: 1 }]}>(40,000)</Text>
          </View>
          <View style={s.tblRTotal}>
            <Text style={[s.tdb, { flex: 3.4 }]}>LOAN AMOUNT REQUESTED</Text>
            <Text style={[s.tdbr, { flex: 1 }]}>N$ 550,000</Text>
          </View>
        </View>
      </View>
      <Footer left={fl()} right="Section 03 - Financial Information" />
    </Page>
  );
}

function FinancialPage2() {
  const months = [
    ["Month 1 (post-funding)", "25,000", "34,500", "(9,500)"],
    ["Month 2", "33,000", "35,000", "(2,000)"],
    ["Month 3", "40,000", "35,500", "4,500"],
    ["Month 4", "45,000", "36,000", "9,000"],
    ["Month 5", "48,000", "36,500", "11,500"],
    ["Month 6", "50,000", "37,000", "13,000"],
    ["Month 7", "53,000", "37,500", "15,500"],
    ["Month 8", "55,000", "38,000", "17,000"],
    ["Month 9", "57,000", "38,500", "18,500"],
    ["Month 10", "58,000", "39,000", "19,000"],
    ["Month 11", "59,000", "39,500", "19,500"],
    ["Month 12", "60,000", "40,000", "20,000"],
  ];
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 03 - Financial Information (continued)" />
      <H2 num="3.3.1" title="Key Financial Assumptions" />
      <Bullet text="Month 1 revenue of N$25,000 reflects ~10 active clients built during pre-approval (6-12 months). Those clients are handed to the new team at funding date; director immediately pursues next 10. Breakeven at Month 3." />
      <Bullet text="Operating costs start at N$34,500 and rise to N$40,000 by Month 12 as tools, hosting, licences, admin fees, and subscriptions accumulate. Base payroll and SSC: N$32,640." />
      <Bullet text="Hardware (N$114,250) and professional reserve (N$75,000) drawn upfront from loan at Month 1. Month 1 counts from disbursement date, not application date." />
      <Bullet text="No rent or office costs — fully remote. Employees provide own devices; company covers team software licences only (~N$650/mo Google Workspace for 6 users)." />
      <Bullet text="12-month grace period — no loan repayments during Year 1. Interest assumed at 4% per annum (conservative). Investor income N$2,000/mo continues for 5 years." />
      <View style={s.div} />
      <H2 num="3.3.1a" title="Revenue Composition: Solo Baseline vs Month 12 Target" />
      <Text style={[s.p, { marginBottom: 8 }]} wrap={false}>
        The table below shows two scenarios: the pre-funding solo baseline (what the director can carry alone — maximum 10 active project clients, currently 5), and the Month 12 target once the full team is operational. Retainer rates and project averages are drawn from actual 2026 invoices.
      </Text>
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 2.5 }]}>Revenue Source</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Solo (N$)</Text>
          <Text style={[s.th, { flex: 1.2, textAlign: "right" as const }]}>Month 12 (N$)</Text>
        </View>
        {([
          ["Website retainer subscriptions (7 clients)", "5,600", "5,600"],
          ["eStore retainer subscriptions (3 clients)", "3,600", "3,600"],
          ["Active project clients (5 solo / 12 with team)", "16,935", "40,600"],
          ["AI and PM training sessions (1/month)", "3,000", "3,000"],
          ["Ad hoc consulting and one-off services", "2,000", "5,200"],
          ["Investor contributions", "2,000", "2,000"],
        ] as [string, string, string][]).map(([src, solo, target], i) => (
          <View key={src} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.td, { flex: 2.5 }]}>{src}</Text>
            <Text style={[s.tdr, { flex: 1 }]}>{solo}</Text>
            <Text style={[s.tdr, { flex: 1.2 }]}>{target}</Text>
          </View>
        ))}
        <View style={s.tblRTotal}>
          <Text style={[s.tdb, { flex: 2.5 }]}>Total Monthly Revenue</Text>
          <Text style={[s.tdbr, { flex: 1 }]}>33,135</Text>
          <Text style={[s.tdbr, { flex: 1.2 }]}>60,000</Text>
        </View>
      </View>
      <Text style={[s.p, { fontSize: 7.5, color: "#555555", marginBottom: 6 }]} wrap={false}>
        Solo baseline reflects 5 active project clients at N$3,387 average — the realistic pre-funding workload. Maximum solo capacity is 10 clients. With 6 staff hired at Month 1, project capacity doubles and ad hoc demand is captured properly, driving revenue toward the N$60,000 Month 12 target.
      </Text>
      <View wrap={false}>
        <View style={s.div} />
        <H2 num="3.3.2" title="Year 1: Monthly Cash Flow Projection (Operating)" />
        <Text style={[s.p, { marginBottom: 8 }]} wrap={false}>
          Note: Monthly operating costs exclude the one-time hardware purchase (N$114,250) and professional reserve (N$75,000) which are funded upfront from the loan at the start of Month 1. The figures below show ongoing monthly revenue versus operating expenses only.
        </Text>
      </View>
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { width: 75 }]}>Month</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Revenue (N$)</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Oper. Costs (N$)</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Net (N$)</Text>
        </View>
        {months.map(([mo, rev, cost, net], i) => (
          <View key={mo} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { width: 75 }]}>{mo}</Text>
            <Text style={[s.tdr, { flex: 1 }]}>{rev}</Text>
            <Text style={[s.tdr, { flex: 1 }]}>{cost}</Text>
            <Text style={[s.tdr, { flex: 1 }]}>{net}</Text>
          </View>
        ))}
        <View style={s.tblRTotal}>
          <Text style={[s.tdb, { width: 75 }]}>TOTALS</Text>
          <Text style={[s.tdbr, { flex: 1 }]}>583,000</Text>
          <Text style={[s.tdbr, { flex: 1 }]}>447,000</Text>
          <Text style={[s.tdbr, { flex: 1 }]}>136,000</Text>
        </View>
      </View>
      <View style={s.box}>
        <Text style={s.boxText}>
          Month 1 starts at N$25,000 because by the time funding is received (pre-approval typically 6 to 12 months), the director will have grown the client base to approximately 10 active clients. Those clients are handed to the new staff team, freeing the director to pursue the next 10 immediately. Operating costs rise gradually from N$34,500 to N$40,000 as tools, hosting, software licences, admin fees, and subscriptions accumulate with the growing client base. The business reaches breakeven at Month 3 and generates a full-year operating surplus of N$136,000. Combined with the upfront hardware and reserve draw of N$189,250, the total Year 1 loan utilisation is approximately N$53,250, leaving N$496,750 of the N$550,000 loan intact as a repayment buffer from Year 2.
        </Text>
      </View>
      <Footer left={fl()} right="Section 03 - Financial Information" />
    </Page>
  );
}

function FinancialPage3() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 03 - Financial Information (continued)" />
      <View wrap={false}>
        <H2 num="3.3.3" title="Income Statement Projection (Year 1)" />
        <View style={s.tbl}>
          <View style={s.tblH}>
            <Text style={[s.th, { flex: 3 }]}>Income Statement Item</Text>
            <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Year 1 (N$)</Text>
          </View>
          {[
            ["Total Revenue", "583,000"],
            ["Less: Cost of Services (hosting, domains, software per project)", "(18,000)"],
          ].map(([item, val], i) => (
            <View key={item} style={i % 2 === 0 ? s.tblR : s.tblRA}>
              <Text style={[s.td, { flex: 3 }]}>{item}</Text>
              <Text style={[s.tdr, { flex: 1 }]}>{val}</Text>
            </View>
          ))}
          <View style={s.tblRTotal}>
            <Text style={[s.tdb, { flex: 3 }]}>Gross Profit</Text>
            <Text style={[s.tdbr, { flex: 1 }]}>565,000</Text>
          </View>
          {[
            ["Salaries and wages (5 staff, 12 months)", "(384,000)"],
            ["Employer SSC contributions (~2%)", "(7,750)"],
            ["Recruitment and setup costs", "(9,000)"],
            ["Software, tools, and subscriptions", "(22,000)"],
            ["Marketing and advertising", "(12,000)"],
            ["Administration and document fees", "(3,250)"],
          ].map(([item, val], i) => (
            <View key={item} style={i % 2 === 0 ? s.tblR : s.tblRA}>
              <Text style={[s.td, { flex: 3 }]}>{item}</Text>
              <Text style={[s.tdr, { flex: 1 }]}>{val}</Text>
            </View>
          ))}
          <View style={s.tblRTotal}>
            <Text style={[s.tdb, { flex: 3 }]}>Total Operating Expenses</Text>
            <Text style={[s.tdbr, { flex: 1 }]}>(438,000)</Text>
          </View>
          <View style={s.tblRTotal}>
            <Text style={[s.tdb, { flex: 3 }]}>Net Operating Surplus</Text>
            <Text style={[s.tdbr, { flex: 1 }]}>127,000</Text>
          </View>
          <View style={s.tblR}>
            <Text style={[s.td, { flex: 3 }]}>Less: Equipment depreciation (N$114,250 over 3 years)</Text>
            <Text style={[s.tdr, { flex: 1 }]}>(38,083)</Text>
          </View>
          <View style={s.tblRTotal}>
            <Text style={[s.tdb, { flex: 3 }]}>NET PROFIT BEFORE TAX (Year 1)</Text>
            <Text style={[s.tdbr, { flex: 1 }]}>88,917</Text>
          </View>
        </View>
        <Text style={[s.p, { fontSize: 7.5, color: "#555555", marginBottom: 6 }]} wrap={false}>
          Note: No loan repayments in Year 1 (12-month grace period). Hardware and professional reserve (N$189,250) are funded upfront from the loan and excluded from operating expenses above. Depreciation is calculated on hardware only over 3 years.
        </Text>
      </View>
      <View style={s.div} />
      <H2 num="3.3.4" title="3-Year Financial Projection Summary (All Years)" />
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 2 }]}>Item</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Year 1 (2026/27)</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Year 2 (2027/28)</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Year 3 (2028/29)</Text>
        </View>
        {[
          ["Annual Revenue (N$)", "583,000", "1,044,000", "1,560,000"],
          ["Monthly Revenue (average)", "48,583", "87,000", "130,000"],
          ["Annual Operating Costs (N$)", "447,000", "510,000", "560,000"],
          ["Loan Repayment (annual)", "none", "150,000", "150,000"],
          ["Total Annual Costs (N$)", "447,000", "660,000", "710,000"],
          ["Net Profit or (Loss) (N$)", "136,000", "384,000", "850,000"],
          ["Staff headcount (year-end)", "6", "9", "12"],
        ].map(([item, y1, y2, y3], i) => (
          <View key={item} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { flex: 2 }]}>{item}</Text>
            <Text style={[s.tdr, { flex: 1 }]}>{y1}</Text>
            <Text style={[s.tdr, { flex: 1 }]}>{y2}</Text>
            <Text style={[s.tdr, { flex: 1 }]}>{y3}</Text>
          </View>
        ))}
      </View>
      <Text style={[s.p, { fontSize: 7.5, color: "#555555", marginBottom: 6 }]} wrap={false}>
        * Year 2 and Year 3 operating cost increases reflect a conservative 10% annual uplift on the base payroll. New hires in Years 2 and 3 are junior and remote, keeping the per-head cost low. Payroll growth is intentionally staged to remain below revenue growth in both years.
      </Text>
      <Text style={[s.p, { marginBottom: 6 }]} wrap={false}>
        Year 1 note: Revenue starts strong at Month 1 because the director will have built up approximately 10 active clients during the pre-approval waiting period. The operating surplus of N$173,320 means the loan is used primarily to fund the hardware and professional reserve upfront, not to cover operating losses. Equipment purchase is a one-time upfront cost and is not included in the operating figures above.
      </Text>
      <Text style={[s.p, { marginBottom: 14 }]} wrap={false}>
        Year 2 revenue growth is driven by an established team at full capacity, an active retainer base of 15 or more clients, continued growth in the existing South Africa client base, and growth from the established N$7,000 per month recurring revenue base including retainer contracts, investor income, and client deposits.
      </Text>
      <View wrap={false}>
        <View style={s.div} />
        <H2 num="3.3.5" title="Loan Repayment Projection" />
        <Text style={s.p} wrap={false}>
          Repayment commences after the 12-month grace period (from approximately June 2027). At a 4% interest rate over the remaining 48 months:
        </Text>
        <View style={s.tbl}>
          <View style={s.tblH}>
            <Text style={[s.th, { flex: 2 }]}>Detail</Text>
            <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Amount</Text>
          </View>
          {[
            ["Principal (loan amount)", "N$ 550,000"],
            ["Grace period", "12 months (no repayments)"],
            ["Repayment period after grace", "48 months"],
            ["Total repayment period", "60 months (5 years)"],
            ["Interest rate (assumed at 4% per annum, conservative)", "4%"],
            ["Estimated monthly repayment from Month 13", "N$ 12,500"],
            ["Estimated annual repayment", "N$ 150,000"],
            ["Repayment start date (estimated)", "June 2027"],
            ["Repayment end date (estimated)", "May 2031"],
          ].map(([detail, amt], i) => (
            <View key={detail} style={i % 2 === 0 ? s.tblR : s.tblRA}>
              <Text style={[s.td, { flex: 2 }]}>{detail}</Text>
              <Text style={[s.tdr, { flex: 1 }]}>{amt}</Text>
            </View>
          ))}
        </View>
        <View style={s.box}>
          <Text style={s.boxText}>
            By Month 13 when repayments begin, the business projects monthly revenue of N$65,000 to N$85,000 based on the Year 1 growth trajectory ending at N$60,000 in Month 12. The recurring revenue base (retainers, investor, and deposits) will continue at or above N$7,000 per month minimum throughout. Monthly operating costs at that point will be approximately N$40,000, giving a monthly surplus of N$25,000 to N$45,000 from which to service the repayment of N$12,500 per month. The business will be profitable and able to repay the loan from operational income.
          </Text>
        </View>
      </View>
      <Footer left={fl()} right="Section 03 - Financial Information" />
    </Page>
  );
}

// ── SECTION 04 — MARKETING PLAN ──────────────────────────────

function MarketingPage() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 04 - Marketing Plan" />
      <View>
        <Text style={s.pageTitle}>Section 04 - Marketing Plan</Text>
        <View style={s.pageTitleRule} />
      </View>
      <H2 num="4.1" title="Industry Analysis" />
      <Text style={s.p} wrap={false}>
        Namibian SMEs either lack a proper digital presence or are paying high prices to agencies out of reach for small businesses. Swift Designz fills this gap: professional digital work at prices Namibian businesses can actually afford (N$2,500 to N$10,000), delivered by a local remote team with no travel overhead.
      </Text>
      <View style={s.div} />
      <H2 num="4.1.1" title="SWOT Analysis" />
      <View style={s.swotGrid}>
        <View style={s.swotCell}>
          <Text style={s.swotLabel}>Strengths</Text>
          <Text style={s.swotItem}>- Already generating revenue from real clients</Text>
          <Text style={s.swotItem}>- Proven technical capability (built own admin platform)</Text>
          <Text style={s.swotItem}>- Transparent, competitive pricing for Namibia</Text>
          <Text style={s.swotItem}>- Fully remote with no overhead on office space</Text>
          <Text style={s.swotItem}>- Registered CC with formal governance and accounting officer</Text>
          <Text style={s.swotItem}>- Live website with active lead intake and CRM system</Text>
          <Text style={s.swotItem}>- AI-assisted development reduces cost and turnaround time</Text>
          <Text style={s.swotItem}>- Apple hardware enables full cross-platform delivery (Windows, Android, iOS, macOS)</Text>
        </View>
        <View style={s.swotCell}>
          <Text style={s.swotLabel}>Weaknesses</Text>
          <Text style={s.swotItem}>- Business formally registered only in May 2026</Text>
          <Text style={s.swotItem}>- No physical office (some clients prefer face-to-face)</Text>
          <Text style={s.swotItem}>- Revenue is still in early growth phase</Text>
          <Text style={s.swotItem}>- Two team members are still studying as interns</Text>
          <Text style={s.swotItem}>- Limited brand awareness outside existing network</Text>
        </View>
        <View style={s.swotCell}>
          <Text style={s.swotLabel}>Opportunities</Text>
          <Text style={s.swotItem}>- Large underserved SME market across Namibia</Text>
          <Text style={s.swotItem}>- Government digitisation drive creates demand</Text>
          <Text style={s.swotItem}>- South Africa expansion adds a large secondary market</Text>
          <Text style={s.swotItem}>- Growing demand for AI integration services</Text>
          <Text style={s.swotItem}>- SaaS product development potential for recurring revenue</Text>
          <Text style={s.swotItem}>- No dominant low-cost digital agency currently in Namibia</Text>
        </View>
        <View style={s.swotCell}>
          <Text style={s.swotLabel}>Threats</Text>
          <Text style={s.swotItem}>- Established agencies with more resources and reputation</Text>
          <Text style={s.swotItem}>- Client payment delays affecting cash flow</Text>
          <Text style={s.swotItem}>- Internet and power reliability in Namibia</Text>
          <Text style={s.swotItem}>- Intern staff may leave when studies are complete</Text>
          <Text style={s.swotItem}>- Global website builders as DIY alternatives for some clients</Text>
        </View>
      </View>
      <View wrap={false}>
        <H2 num="4.1.2" title="Target Markets and Market Share Estimates" />
        <View style={s.tbl}>
          <View style={s.tblH}>
            <Text style={[s.th, { flex: 1 }]}>Market Segment</Text>
            <Text style={[s.th, { flex: 2 }]}>Description</Text>
            <Text style={[s.th, { flex: 1 }]}>Priority</Text>
          </View>
          {[
            ["Namibian SMEs", "Small and medium businesses across all sectors needing websites, e-commerce, or apps", "Primary, active now"],
            ["South Africa SMEs", "Existing client base with live stores and websites already deployed", "Primary, active now"],
            ["NGOs and Non-profits", "Organisations needing professional web presence and donor-facing platforms", "Primary, Year 1"],
            ["Startups and Entrepreneurs", "New businesses needing a digital foundation from day one", "Primary, Year 1"],
            ["Government and Parastatals", "Public entities requiring web systems, portals, and digital tools", "Secondary, Year 2"],
          ].map(([seg, desc, pri], i) => (
            <View key={seg} style={i % 2 === 0 ? s.tblR : s.tblRA}>
              <Text style={[s.tdb, { flex: 1 }]}>{seg}</Text>
              <Text style={[s.td, { flex: 2 }]}>{desc}</Text>
              <Text style={[s.td, { flex: 1 }]}>{pri}</Text>
            </View>
          ))}
        </View>
        <Text style={s.p} wrap={false}>
          Year 1 target: 3 to 5 new clients per month — conservative given 70,000+ registered Namibian businesses and an average project value of N$3,500 to N$10,000.
        </Text>
      </View>

      <H2 num="4.1.3" title="Market Segment Notes" />
      <View wrap={false}>
        <Text style={s.h3} wrap={false}>Namibian SMEs</Text>
        <Text style={s.p} wrap={false}>
          The largest and most accessible segment. Most Namibian SMEs either have no website, or have one that is outdated, non-mobile, or built on a free platform that limits growth. Our pricing (N$2,500 to N$10,000) is within reach for a small business that generates N$30,000 to N$200,000 per year. Retainer subscriptions after launch create recurring revenue and long-term client relationships.
        </Text>
      </View>
      <View wrap={false}>
        <Text style={s.h3} wrap={false}>South Africa SMEs</Text>
        <Text style={s.p} wrap={false}>
          An active market already generating revenue. Swift Designz has live e-commerce stores and websites deployed for South African clients. SA businesses are comfortable transacting remotely and are willing to pay for quality. Our Namibian pricing is 30 to 50% below comparable Cape Town agency rates for equivalent work — a strong competitive advantage in this market.
        </Text>
      </View>
      <View wrap={false}>
        <Text style={s.h3} wrap={false}>NGOs and Non-profits</Text>
        <Text style={s.p} wrap={false}>
          NGOs require professional web presence for donor credibility, grant applications, and public reporting. They tend to have allocated digital budgets and prefer long-term support arrangements. Maintenance retainers are particularly well-suited to this segment.
        </Text>
      </View>
      <View wrap={false}>
        <Text style={s.h3} wrap={false}>Startups and Entrepreneurs</Text>
        <Text style={s.p} wrap={false}>
          Early-stage businesses need a digital foundation quickly and at low cost. Many become long-term clients as they grow — a website at launch becomes an e-commerce store at Year 1 and a full app at Year 2. This segment has high lifetime value relative to the initial project cost.
        </Text>
      </View>
      <View wrap={false}>
        <Text style={s.h3} wrap={false}>Government and Parastatals</Text>
        <Text style={s.p} wrap={false}>
          A secondary target requiring longer sales cycles and formal procurement processes. Included as a Year 2 priority once the business has a portfolio, formal credentials, and team capacity to handle public sector delivery requirements. Contracts in this segment are typically larger and longer in duration.
        </Text>
      </View>
      <Footer left={fl()} right="Section 04 - Marketing Plan" />
    </Page>
  );
}

function MarketingPage2() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 04 - Marketing Plan (continued)" />
      <H2 num="4.1.4" title="Competition and Competitive Positioning" />
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 1.1 }]}>Competitor Type</Text>
          <Text style={[s.th, { flex: 1.8, paddingLeft: 8 }]}>What They Offer</Text>
          <Text style={[s.th, { flex: 1.8, paddingLeft: 8 }]}>Their Weakness</Text>
          <Text style={[s.th, { flex: 1.8, paddingLeft: 8 }]}>Our Advantage</Text>
        </View>
        {[
          ["Large local agencies", "Full-service digital, branding, marketing", "High prices, slow, not focused on SMEs", "Transparent pricing, fast turnaround, affordable for SMEs"],
          ["Individual freelancers", "Website builds, one-person operation", "No team, unreliable, no post-launch support", "Team capacity, consistent quality, after-sale support"],
          ["DIY platforms (Wix etc.)", "Self-service website builders", "No custom builds, limited functionality", "Custom solutions, professional results, no DIY skill needed"],
          ["Overseas agencies", "Remote-built digital services", "No local context, no in-person option, foreign currency pricing", "Locally based, NAD pricing, cultural understanding"],
        ].map(([ct, offer, weak, adv], i) => (
          <View key={ct} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { flex: 1.1 }]}>{ct}</Text>
            <Text style={[s.td, { flex: 1.8, paddingLeft: 8 }]}>{offer}</Text>
            <Text style={[s.td, { flex: 1.8, paddingLeft: 8 }]}>{weak}</Text>
            <Text style={[s.td, { flex: 1.8, paddingLeft: 8 }]}>{adv}</Text>
          </View>
        ))}
      </View>
      <View style={s.div} />
      <H2 num="4.2" title="Promotion and Advertising Strategy" />
      <Text style={s.h3} wrap={false}>Digital Marketing (Primary Channel)</Text>
      <Bullet text="Live business website (swiftdesignz.co.za) with integrated quote request and contact forms that feed directly into our CRM. All leads are automatically tracked and followed up" />
      <Bullet text="Facebook and Instagram business pages with regular content showcasing completed projects, client testimonials, and service promotions targeted at Namibian SMEs" />
      <Bullet text="LinkedIn presence for corporate and government sector outreach" />
      <Bullet text="Targeted Facebook and Google paid advertising campaigns managed by the Marketing Officer with a monthly budget of N$2,000 to N$5,000" />
      <Bullet text="Google Business listing for local search visibility" />
      <Text style={s.h3} wrap={false}>Referral Network</Text>
      <Bullet text="Existing freelance clients will be converted to formal clients with proper onboarding and retainer agreements" />
      <Bullet text="Client referral programme offering a discount on their next invoice for every successful referral" />
      <Bullet text="Partnership with IT-Guru to cross-refer clients needing hosting alongside development services" />
      <Text style={s.h3} wrap={false}>Community and Networking</Text>
      <Bullet text="Windhoek Chamber of Commerce membership and networking events" />
      <Bullet text="Participation in Namibia ICT industry events and startup communities" />
      <Bullet text="Free initial consultations to build relationships with businesses not yet ready to commit" />
      <Text style={s.h3} wrap={false}>Content Marketing</Text>
      <Bullet text="Monthly blog posts and social media content on topics relevant to Namibian businesses including digital presence, e-commerce, and AI tools" />
      <Bullet text="Short video tutorials and behind-the-scenes content to build brand trust and visibility" />
      <Text style={s.h3} wrap={false}>South Africa (Existing Market)</Text>
      <Bullet text="Swift Designz already serves clients in South Africa, with live e-commerce stores and websites actively running for SA-based clients. This is not a future expansion plan but an existing revenue stream that the loan funding will help us scale" />
      <Bullet text="The business is headquartered in Namibia and all revenue is earned and taxed in Namibia. The SA market is served entirely remotely at no additional overhead cost" />
      <Bullet text="Growing the SA client base is a key part of Year 1 and Year 2 revenue targets, with dedicated marketing spend applied to both markets from Month 1" />
      <Footer left={fl()} right="Section 04 - Marketing Plan" />
    </Page>
  );
}

// ── SECTION 05 — OPERATIONS ──────────────────────────────────

function OperationsPage() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 05 - Operations and Technology" />
      <View>
        <Text style={s.pageTitle}>Section 05 - Operations and Technology</Text>
        <View style={s.pageTitleRule} />
      </View>
      <H2 num="5.1" title="Business Process Description" />
      <Text style={s.p} wrap={false}>
        Swift Designz operates a clean, fully digital workflow from first contact through to final delivery and ongoing support:
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center" as const, marginBottom: 16, flexWrap: "wrap" as const, gap: 4 }}>
        {["Lead Inquiry", "Quotation", "Acceptance and Deposit", "Development", "Client Review", "Launch", "Post-Launch Support", "Monthly Retainer"].map((step, i, arr) => (
          <View key={step} style={{ flexDirection: "row", alignItems: "center" as const }}>
            <View style={{ borderWidth: 1, borderColor: "#999999", paddingHorizontal: 7, paddingVertical: 4, backgroundColor: "#f5f5f5" }}>
              <Text style={{ fontSize: 7.5, fontWeight: 700, color: "#333333", textAlign: "center" as const }}>{step}</Text>
            </View>
            {i < arr.length - 1 && <Text style={{ fontSize: 8, color: "#999999", marginHorizontal: 2 }}>{">"}</Text>}
          </View>
        ))}
      </View>
      <Bullet text="All client communication is handled via email and WhatsApp Business. Video calls are used for project kickoffs and major review sessions" />
      <Bullet text="Quotations are generated through our internal platform and sent as PDF documents with an online acceptance link. Clients can review line items, see payment schedules, and accept the quote digitally" />
      <Bullet text="All invoicing, payment tracking, reminders, and receipt generation are automated through our internal system. This reduces admin burden and ensures consistent follow-up" />
      <Bullet text="Development work is version-controlled through GitHub. Each project has its own repository with code reviewed by the QA Tester before client delivery" />
      <Bullet text="After launch, clients are offered a monthly maintenance retainer covering updates, monitoring, backups, and priority support" />
      <View style={s.div} />
      <H2 num="5.2" title="Supplies and Costing" />
      <Text style={s.p} wrap={false}>
        Swift Designz is a knowledge-based, digital-only business. There are no raw materials, physical inventory, or manufacturing processes. The inputs are:
      </Text>
      <Bullet text="Google Workspace Business Starter for all staff (email, Drive, Docs, Meet) — approximately N$650 per month for 6 users, covered by the company" />
      <Bullet text="Cloud hosting services facilitated through IT-Guru (hosting partner)" />
      <Bullet text="Domain registrations and SSL certificates sourced per client project" />
      <Text style={s.p} wrap={false}>
        Each team member is responsible for their own internet connection and personal devices as part of their remote working arrangement. The company provides team software licences only, including Google Workspace for all staff. All other software costs are passed through to clients as part of their project quotation.
      </Text>
      <Footer left={fl()} right="Section 05 - Operations and Technology" />
    </Page>
  );
}

function OperationsPage2() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 05 - Operations and Technology (continued)" />
      <View wrap={false}>
        <H2 num="5.3" title="Organisation of Operations and Outputs" />
        <View style={s.tbl}>
          <View style={s.tblH}>
            <Text style={[s.th, { flex: 1.2 }]}>Role</Text>
            <Text style={[s.th, { flex: 2 }]}>Responsibilities</Text>
            <Text style={[s.th, { flex: 1.5 }]}>Key Outputs</Text>
          </View>
          {[
            ["Director and Developer", "Client projects, technical architecture, quality sign-off, business strategy", "Websites, apps, project delivery"],
            ["Business Admin", "Finance administration, client billing, quotation management, SSC registration, HR admin", "Invoices, quotations, financial reports, employment records"],
            ["Project Manager", "Project planning, timeline management, client coordination, delivery oversight", "Project plans, status reports, on-time delivery"],
            ["Systems Admin", "Internal IT, network management, server maintenance, team tech support", "Stable infrastructure, uptime"],
            ["Marketing Officer", "Social media, advertising, content creation, lead generation", "Leads, brand presence, content"],
            ["QA Tester", "Testing all builds before delivery, bug reports, quality documentation", "Tested deliverables, test reports"],
          ].map(([role, resp, out], i) => (
            <View key={role} style={i % 2 === 0 ? s.tblR : s.tblRA}>
              <Text style={[s.tdb, { flex: 1.2 }]}>{role}</Text>
              <Text style={[s.td, { flex: 2 }]}>{resp}</Text>
              <Text style={[s.td, { flex: 1.5 }]}>{out}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={s.div} />
      <H2 num="5.4" title="Technology and Equipment" />
      <Text style={s.p} wrap={false}>
        The following equipment and software will be procured using the loan funds. Actual supplier quotations will be obtained from Namibian IT suppliers (Mustek Namibia, Incredible Connection Windhoek, and local ICT resellers) prior to disbursement. The prices below are mid-range estimates.
      </Text>
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 1 }]}>Category</Text>
          <Text style={[s.th, { flex: 2 }]}>Item</Text>
          <Text style={[s.th, { flex: 1 }]}>Purpose</Text>
          <Text style={[s.th, { flex: 0.8, textAlign: "right" as const }]}>Est. Cost (N$)</Text>
        </View>
        {[
          ["Computing", "iMac 24-inch M4 (10-core, 24GB, 512GB, Green)", "Primary workstation. Full kit incl. keyboard, mouse, and 24-inch display.", "45,899"],
          ["Computing", "External Monitor (27-inch, 4K)", "Extended display alongside built-in iMac screen", "5,500"],
          ["Computing", "External SSD (1TB)", "Fast project backups and portable file storage", "1,800"],
          ["Workspace", "Second External Monitor (24-inch)", "Extended dual-screen workspace for multitasking and code review", "3,500"],
          ["Workspace", "Monitor Arm (single, for ext. monitor)", "Frees desk space, ideal monitor positioning", "1,200"],
          ["Workspace", "Document Shredder", "Secure disposal of client documents (POPIA compliance)", "1,300"],
          ["Mobile", "iPhone 16 (128GB)", "iOS testing and verification.", "22,000"],
          ["Mobile", "iPad Air M2/M3 (11-inch)", "Design reviews, client presentations, and note-taking", "15,000"],
          ["Workspace", "Business Laser Printer", "Printing contracts, invoices, and client documents for signing and filing", "3,000"],
          ["Workspace", "Printer Toner Cartridges (initial supply)", "2 full replacement sets for uninterrupted document printing", "1,500"],
          ["Workspace", "Ergonomic Office Chair", "Full-time remote work setup — essential for health and productivity", "3,300"],
          ["Networking", "UPS Battery Backup", "Equipment protection during power outages", "3,250"],
          ["Networking", "NAS Network Storage", "Centralised file server and backups", "8,000"],
        ].map(([cat, item, purpose, cost], i) => (
          <View key={`${cat}-${item}`} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { flex: 1 }]}>{cat}</Text>
            <Text style={[s.td, { flex: 2 }]}>{item}</Text>
            <Text style={[s.td, { flex: 1 }]}>{purpose}</Text>
            <Text style={[s.tdr, { flex: 0.8 }]}>{cost}</Text>
          </View>
        ))}
      </View>
      <View wrap={false} style={s.tbl}>
        <View style={s.tblRA}>
          <Text style={[s.tdb, { flex: 1 }]}>Reserve</Text>
          <Text style={[s.td, { flex: 2 }]}>Professional and Legal Reserve</Text>
          <Text style={[s.td, { flex: 1 }]}>Lawyer fees, accounting fees, business insurance</Text>
          <Text style={[s.tdr, { flex: 0.8 }]}>75,000</Text>
        </View>
        <View style={s.tblRTotal}>
          <Text style={[s.tdb, { flex: 4.8 }]}>Total Hardware and Reserve</Text>
          <Text style={[s.tdbr, { flex: 0.8 }]}>189,250</Text>
        </View>
      </View>
      <Footer left={fl()} right="Section 05 - Operations and Technology" />
    </Page>
  );
}

// ── SECTION 06 — STATISTICS ───────────────────────────────────

function StatisticsPage() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 06 - Statistics" />
      <View>
        <Text style={s.pageTitle}>Section 06 - Statistics</Text>
        <View style={s.pageTitleRule} />
      </View>
      <Text style={s.h3} wrap={false}>Applicant Profile</Text>
      <View style={s.tbl}>
        {[
          ["PDN Ownership (%)", "85% (Keenan Husselmann)"],
          ["Women Ownership (%)", "0%"],
          ["Youth Ownership (%)", "85% (controlling director, aged 31)"],
          ["Age of Youth (applicant)", "31 years"],
          ["Education Qualification", "BSc Computer Science (Software Development), NUST"],
          ["Employment Status at Application", "Self-employed (sole director)"],
          ["Year of Business Registration", "2026"],
          ["Business Stage", "Startup / Early Growth"],
          ["Business Traded Formally", "Yes"],
          ["SME or Large Enterprise", "SME"],
        ].map(([k, v], i) => (
          <View key={k} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { flex: 1.6 }]}>{k}</Text>
            <Text style={[s.td, { flex: 1 }]}>{v}</Text>
          </View>
        ))}
      </View>
      <Text style={s.h3} wrap={false}>Business Location &amp; Classification</Text>
      <View style={s.tbl}>
        {[
          ["Industry", "ICT / Digital Services"],
          ["Economic Sector", "Technology and Innovation"],
          ["Town", "Windhoek"],
          ["Region", "Khomas"],
          ["Constituency", "Windhoek East"],
          ["Rural or Urban", "Urban"],
          ["Sales Region", "Namibia and South Africa (both active)"],
          ["Innovation / Tech Driven", "Yes"],
          ["Market Linkages", "Yes"],
          ["Business Development Services", "No"],
        ].map(([k, v], i) => (
          <View key={k} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { flex: 1.6 }]}>{k}</Text>
            <Text style={[s.td, { flex: 1 }]}>{v}</Text>
          </View>
        ))}
      </View>
      <View wrap={false}>
        <View style={s.div} />
        <Text style={s.h3} wrap={false}>Employment Statistics</Text>
        <View style={s.tbl}>
          <View style={s.tblH}>
            <Text style={[s.th, { flex: 2 }]}>Category</Text>
            <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Count</Text>
          </View>
          {[
            ["New Permanent Jobs Created (direct result of NYDF funding)", "5"],
            ["Retained Jobs (director, continuing from freelance)", "1"],
            ["Temporary Jobs", "0"],
            ["Skilled Jobs (developer, business admin, HR, marketing)", "4"],
            ["Semi-Skilled Jobs (systems admin intern, QA intern)", "2"],
            ["Unskilled Jobs", "0"],
            ["Direct Jobs (within the funded enterprise)", "6"],
            ["Indirect Jobs (accounting officer, hosting partner, supplier support)", "~3"],
            ["Youth Employed (all team members under 35)", "6"],
            ["Women Employed (Georgia Orren, Requelle Husselmann, Shakira Linno)", "3"],
            ["People with Disabilities Employed", "0"],
            ["People from Marginalised Communities", "0"],
          ].map(([cat, count], i) => (
            <View key={cat} style={i % 2 === 0 ? s.tblR : s.tblRA}>
              <Text style={[s.td, { flex: 2 }]}>{cat}</Text>
              <Text style={[s.tdbr, { flex: 1 }]}>{count}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={s.div} />
      <Text style={s.h3} wrap={false}>Short Description of Business Activities</Text>
      <Text style={s.p} wrap={false}>
        Swift Designz Investments CC is a Namibian digital technology company that provides website development, e-commerce solutions, web and mobile application development, AI and project management training, and monthly maintenance retainer services. The business operates fully remotely and already serves active clients in both Namibia and South Africa, with live e-commerce stores and websites running in both markets. All services are delivered digitally. The business is 85% youth-owned, tech-driven, and designed to scale.
      </Text>
      <View style={s.box}>
        <Text style={s.boxText}>
          Enterprise Owned by Person with Disability: No{"\n"}
          Enterprise Owned by Person from Marginalised Community: No{"\n"}
          Innovation and Tech Driven: Yes{"\n"}
          Market Linkages: Yes (IT-Guru hosting partner, private investor, accounting officer){"\n"}
          Business Development Services: No
        </Text>
      </View>
      <Footer left={fl()} right="Section 06 - Statistics" />
    </Page>
  );
}

// ── MAIN DOCUMENT ─────────────────────────────────────────────

function BusinessPlanDocument({ variant }: { variant: Variant }) {
  // eslint-disable-next-line react-hooks/globals
  _footerLabel = LABEL[variant].footer;
  const L = LABEL[variant];
  return (
    <Document title={L.docTitle} author="Keenan Husselmann" subject={L.subject} keywords={L.keywords}>
      <CoverPage variant={variant} />
      <TableOfContentsPage />
      <CoverLetterPage variant={variant} />
      <ExecutiveSummaryPage variant={variant} />
      <CompanyInfoPage />
      <ManagementPlanPage />
      <ManagementPlanPage2 />
      <FinancialPage1 />
      <FinancialPage2 />
      <FinancialPage3 />
      <MarketingPage />
      <MarketingPage2 />
      <OperationsPage />
      <OperationsPage2 />
      {variant === "nydf" && <StatisticsPage />}
    </Document>
  );
}

export default function BusinessPlanPDF() {
  return <BusinessPlanDocument variant="nydf" />;
}

export function GenericBusinessPlanPDF() {
  return <BusinessPlanDocument variant="generic" />;
}
