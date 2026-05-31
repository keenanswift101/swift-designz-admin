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
    borderWidth: 1.5,
    borderColor: "#111111",
    backgroundColor: "#eeeeee",
    paddingHorizontal: 20,
    paddingVertical: 7,
    alignItems: "center" as const,
    width: 200,
  },
  orgTopText: { fontSize: 8.5, fontWeight: 700, color: "#111111", textAlign: "center" as const },
  orgTopSub: { fontSize: 7.5, color: "#555555", textAlign: "center" as const, marginTop: 1 },
  orgLine: { width: 1.5, height: 14, backgroundColor: "#999999", alignSelf: "center" as const },
  orgChildBox: {
    borderWidth: 1,
    borderColor: "#999999",
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center" as const,
    width: 120,
  },
  orgChildText: { fontSize: 7.5, fontWeight: 700, color: "#333333", textAlign: "center" as const },
  orgChildSub: { fontSize: 7, color: "#666666", textAlign: "center" as const, marginTop: 1 },
  orgChildSal: { fontSize: 7, color: "#888888", textAlign: "center" as const, marginTop: 1 },
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
      <Text style={s.runHeadText}>Swift Designz Investments CC | NYDF Business Plan 2026</Text>
      <Text style={s.runHeadText}>{section}</Text>
    </View>
  );
}

function H2({ num, title }: { num: string; title: string }) {
  return (
    <View style={s.h2wrap}>
      <Text style={s.h2num}>{num}</Text>
      <Text style={s.h2}>{title}</Text>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={s.bRow}>
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

function CoverPage() {
  return (
    <Page size="A4" style={s.coverPage}>
      <Text style={s.coverLogoName}>SWIFT DESIGNZ INVESTMENTS CC</Text>
      <Text style={s.coverLogoSub}>CC/2026/055589 · Windhoek, Namibia</Text>
      <View style={s.coverRule} />
      <Text style={s.coverTitle}>Business Plan</Text>
      <Text style={s.coverSub}>
        National Youth Development Fund Application{"\n"}
        Submitted to the Development Bank of Namibia
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
        <Text style={s.coverDD}>9505210045</Text>
      </View>
      <View style={s.kvRow}>
        <Text style={s.coverDT}>Business Registration</Text>
        <Text style={s.coverDD}>CC/2026/055589, registered 12 May 2026</Text>
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
        <Text style={s.coverDD}>N$539,480</Text>
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
        This business plan has been prepared in support of a loan application under the National Youth Development Fund (NYDF), administered through the Development Bank of Namibia. All financial projections are based on conservative estimates derived from demonstrated pre-registration trading activity. The applicant declares that all information contained herein is true and accurate to the best of their knowledge.
      </Text>
    </Page>
  );
}

// ── COVER LETTER ─────────────────────────────────────────────

const bl = { fontSize: 9, color: "#111111", lineHeight: 1.72, marginBottom: 8 } as const;

function CoverLetterPage() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Cover Letter" />

      <View wrap={false} style={{ marginBottom: 16 }}>
        <Text style={[bl, { fontWeight: 700, marginBottom: 2 }]}>The NYDF Fund Manager</Text>
        <Text style={[bl, { marginBottom: 2 }]}>Development Bank of Namibia</Text>
        <Text style={[bl, { marginBottom: 2 }]}>PO Box 235, Windhoek</Text>
        <Text style={[bl, { marginBottom: 0 }]}>Namibia</Text>
      </View>

      <Text style={[bl, { fontWeight: 700, marginBottom: 14 }]}>
        RE: NYDF LOAN APPLICATION - SWIFT DESIGNZ INVESTMENTS CC (CC/2026/055589)
      </Text>

      <Text style={[bl, { marginBottom: 14 }]}>Dear Sir / Madam,</Text>

      <Text style={bl}>
        I am Keenan Husselmann, a 31-year-old Namibian citizen and sole director of Swift Designz Investments CC. I hereby apply for a loan of N$539,480 under the National Youth Development Fund through the Development Bank of Namibia. My business is registered as Close Corporation CC/2026/055589, effective 12 May 2026, and headquartered in Windhoek, Khomas Region.
      </Text>
      <Text style={bl}>
        Swift Designz Investments CC is a technology and digital services company. We build websites, e-commerce stores, web and mobile applications, and we provide AI training and technical consulting to businesses across Namibia. Before formal registration, I operated the business as a freelancer under the same brand from January 2026, generating an average of N$8,000 per month in revenue. The CC registration in May 2026 marks the transition from solo freelance work to a full team-based agency.
      </Text>
      <Text style={bl}>
        The loan I am requesting will be used for two things: first, to purchase the professional equipment and software licences we need to operate a proper digital agency; and second, to fund the salaries of six staff members during our first year as we grow our client base to the point where revenue can sustain the team independently. We are fully remote, which means our overhead costs are low and our ability to grow our client base across both Namibia and South Africa is strong.
      </Text>
      <Text style={bl}>
        I believe this application speaks directly to the NYDF goals. Six young Namibians will be formally employed, registered with Social Security, and given real career experience in the technology sector. The business is innovation-driven, scalable, and rooted in Namibia. We are not looking for a handout. We are asking for the bridge funding that allows us to build something that will create lasting employment and contribute to the digital economy of Namibia.
      </Text>
      <Text style={bl}>
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

      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Cover Letter" />
    </Page>
  );
}

// ── EXECUTIVE SUMMARY ─────────────────────────────────────────

function ExecutiveSummaryPage() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Executive Summary" />
      <View>
        <Text style={s.pageTitle}>Executive Summary</Text>
        <View style={s.pageTitleRule} />
      </View>
      <View style={s.box}>
        <Text style={s.boxText}>
          Swift Designz Investments CC is a Namibian-registered technology and digital services company applying for a loan of N$539,480 through the National Youth Development Fund. This funding will be used to purchase professional equipment, procure software licences, and fund the salaries of six staff members during the first twelve months of structured operations.
        </Text>
      </View>
      <H2 num="WHO WE ARE" title="About Swift Designz Investments CC" />
      <Text style={s.p}>
        Swift Designz Investments CC was registered as a Close Corporation on 12 May 2026 by Keenan Husselmann, a 31-year-old Namibian software developer holding a Bachelor of Computer Science degree in Software Development from NUST. The business grew out of four months of active freelance trading under the same brand since January 2026, during which time an average monthly revenue of N$8,000 was generated through website builds, retainer subscriptions, and consulting. The formal CC registration marks the transition from solo practice to a structured team-based agency.
      </Text>
      <Text style={s.p}>
        The business operates entirely remotely with no office premises to rent or manage. This keeps overhead low and means the business can serve clients anywhere. Swift Designz is already active in both Namibia and South Africa, with live e-commerce stores and websites deployed for clients in both markets. The business also has a live website at swiftdesignz.co.za with an integrated lead intake system, and a fully custom-built internal admin platform used to manage quotations, invoicing, billing, accounting, and client projects.
      </Text>
      <H2 num="WHAT WE DO" title="Services" />
      <Text style={s.p}>The business provides the following digital services to SMEs, NGOs, and businesses across Namibia:</Text>
      <Bullet text="Website Development: custom business websites from N$2,500 to N$10,000" />
      <Bullet text="E-Commerce Stores: Shopify and custom online stores from N$4,000 to N$15,000" />
      <Bullet text="Web and Mobile App Development: custom software from N$5,000 to N$25,000 and above" />
      <Bullet text="AI and Project Management Training: individual and team workshops" />
      <Bullet text="Monthly Maintenance Retainers: recurring support and updates" />
      <Bullet text="Technical Consulting: project reviews, audits, and advisory at N$350 per hour" />
      <View style={s.div} />
      <H2 num="WHY WE NEED THE LOAN" title="Purpose of Funding" />
      <Text style={s.p}>
        The business has demonstrated the ability to generate revenue and win clients. The limitation is capacity. As a sole operator, I can only take on a limited number of projects at a time. To grow, I need a team. And to build that team properly, with formal employment contracts, Social Security registration, and fair entry-level salaries, I need a bridge period of funding while the business scales its revenue to a level that can sustain the payroll independently.
      </Text>
      <Text style={s.p}>
        The loan will be used to: (1) procure all necessary professional hardware and software; and (2) fund six staff salaries for twelve months while the business grows monthly revenue from N$10,000 to N$60,000 and above.
      </Text>
      <H2 num="IMPACT" title="What This Funding Will Achieve" />
      <Bullet text="6 permanent jobs created, all held by young Namibians between the ages of 22 and 33" />
      <Bullet text="3 of the 6 positions filled by women" />
      <Bullet text="Revenue growth from N$10,000 per month to N$60,000 and above per month within 12 months" />
      <Bullet text="Formal employment, Social Security registration, and career development for the full team" />
      <Bullet text="Expansion of Namibia's ICT sector capacity, reducing dependency on imported digital services" />
      <Bullet text="Growth of our existing South Africa client base, bringing foreign revenue into Namibia" />
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Executive Summary" />
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
      <Text style={s.p}>Swift Designz Investments CC</Text>
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
      <Text style={s.p}>
        Swift Designz Investments CC is a digital technology company that helps businesses establish and grow their online presence. We design and build websites, online stores, and custom software applications. We also offer training in artificial intelligence tools and project management methods, and we provide monthly technical support retainers to keep client platforms running well after launch.
      </Text>
      <Text style={s.p}>
        The business is built around a simple idea: quality digital services should be accessible to all businesses in Namibia, not just large ones. Our pricing is transparent, our turnaround times are fast, and our team is young, capable, and invested in what we build.
      </Text>
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 2 }]}>Service</Text>
          <Text style={[s.th, { flex: 2 }]}>Description</Text>
          <Text style={[s.th, { flex: 1.2, textAlign: "right" as const }]}>Price Range (N$)</Text>
        </View>
        {[
          ["Website Development", "Custom business websites from Starter to Premium", "2,500 to 10,000"],
          ["E-Commerce Stores", "Shopify and custom online retail solutions", "4,000 to 15,000"],
          ["App Development", "Web and mobile application builds", "5,000 to 25,000+"],
          ["AI Training", "Individual (30 min) and team (1.5 hr) workshops", "Quoted per session"],
          ["PM Training", "Agile, Scrum, Kanban coaching and workshops", "Quoted per session"],
          ["Maintenance Retainer", "Monthly support, updates, and monitoring", "Quoted per client"],
          ["Technical Consulting", "Audits, reviews, and advisory services", "N$350 per hour"],
        ].map(([svc, desc, price], i) => (
          <View key={svc} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.td, { flex: 2 }]}>{svc}</Text>
            <Text style={[s.td, { flex: 2 }]}>{desc}</Text>
            <Text style={[s.td, { flex: 1.2, textAlign: "right" as const }]}>{price}</Text>
          </View>
        ))}
      </View>
      <Text style={s.h3}>Future Services (Year 2 and beyond):</Text>
      <Bullet text="Software-as-a-Service products built and licensed to Namibian SMEs" />
      <Bullet text="Digital automation solutions for small business workflows" />
      <Bullet text="E-learning platform development for training institutions" />
      <View style={s.div} />
      <H2 num="1.4" title="Background: Sector and Regulatory Context" />
      <Text style={s.p}>
        The ICT sector in Namibia is one of the fastest-growing segments of the national economy. The government ICT Master Plan, Vision 2030, and the Harambee Prosperity Plan II all identify digital transformation as a key driver of economic growth and youth employment. The demand for affordable, professional digital services among Namibian SMEs is significant and currently underserved. Most local businesses either rely on expensive agencies or make do with low-quality solutions from overseas platforms.
      </Text>
      <Text style={s.p}>
        Swift Designz Investments CC is registered under the Close Corporations Act, Act 26 of 1988. The company holds a NamRA Tax Income Number (16271273, ITX 16271273-011) and is registered for income tax. The business is not currently VAT-registered as annual turnover is below the N$500,000 threshold. VAT registration will be initiated as revenue grows past the threshold.
      </Text>
      <Text style={s.p}>
        The business already serves clients in both Namibia and South Africa, with live e-commerce stores and websites deployed across both markets. This gives Swift Designz an established dual-market footprint from day one. The focus is not market entry into South Africa but growing the existing client base in both countries simultaneously.
      </Text>
      <Text style={s.p}>
        The business operates fully within the regulatory framework of Namibia. Staff will be registered with the Social Security Commission upon appointment. The appointed accounting officer is Rachel N. Kashala (SAIBA 4132), providing independent financial oversight.
      </Text>
      <View style={s.div} />
      <H2 num="1.5" title="Sources of Funding" />
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 2 }]}>Source</Text>
          <Text style={[s.th, { flex: 2 }]}>Description</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Amount (N$)</Text>
        </View>
        {[
          ["NYDF Loan (DBN)", "Loan applied for in this application", "539,480"],
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
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Section 01 - Company Information" />
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
      <Text style={s.p}>
        Swift Designz Investments CC operates a flat, remote-first structure. The Director leads all technical and strategic decisions. The Business Administrator and HR Officer manage day-to-day operations, finance administration, and people management. The technical team handles development, quality assurance, and systems. Marketing drives lead generation and brand growth.
      </Text>
      <Text style={s.h3}>Management Organogram</Text>
      <View style={s.orgWrap}>
        <View style={s.orgTopBox}>
          <Text style={s.orgTopText}>DIRECTOR / LEAD DEVELOPER</Text>
          <Text style={s.orgTopSub}>Keenan Husselmann · N$10,000/mo</Text>
        </View>
        <View style={s.orgLine} />
        <View style={{ flexDirection: "row", justifyContent: "center" as const }}>
          <View style={{ flex: 1, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: "#999999", height: 14 }} />
          <View style={{ flex: 1, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: "#999999", height: 14 }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center" as const, gap: 20 }}>
          <View style={{ alignItems: "center" as const }}>
            <View style={s.orgChildBox}>
              <Text style={s.orgChildText}>OPERATIONS</Text>
              <Text style={s.orgChildSub}>Admin and Projects</Text>
            </View>
            <View style={s.orgLine} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ ...s.orgChildBox, width: 108 }}>
                <Text style={s.orgChildText}>Business Admin</Text>
                <Text style={s.orgChildSub}>Georgia Orren</Text>
                <Text style={s.orgChildSal}>N$6,500/mo</Text>
              </View>
              <View style={{ ...s.orgChildBox, width: 108 }}>
                <Text style={s.orgChildText}>Project Manager</Text>
                <Text style={s.orgChildSub}>Requelle Husselmann</Text>
                <Text style={s.orgChildSal}>N$5,500/mo</Text>
              </View>
            </View>
          </View>
          <View style={{ alignItems: "center" as const }}>
            <View style={s.orgChildBox}>
              <Text style={s.orgChildText}>TECHNOLOGY</Text>
              <Text style={s.orgChildSub}>Dev, QA and Systems</Text>
            </View>
            <View style={s.orgLine} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ ...s.orgChildBox, width: 108 }}>
                <Text style={s.orgChildText}>Systems Admin</Text>
                <Text style={s.orgChildSub}>Anthony Bagley</Text>
                <Text style={s.orgChildSal}>N$3,500/mo</Text>
              </View>
              <View style={{ ...s.orgChildBox, width: 108 }}>
                <Text style={s.orgChildText}>QA Tester</Text>
                <Text style={s.orgChildSub}>Tapiwa Machekera</Text>
                <Text style={s.orgChildSal}>N$2,500/mo</Text>
              </View>
            </View>
          </View>
          <View style={{ alignItems: "center" as const }}>
            <View style={s.orgChildBox}>
              <Text style={s.orgChildText}>MARKETING</Text>
              <Text style={s.orgChildSub}>Brand and Growth</Text>
            </View>
            <View style={s.orgLine} />
            <View style={{ ...s.orgChildBox, width: 120 }}>
              <Text style={s.orgChildText}>Marketing Officer</Text>
              <Text style={s.orgChildSub}>Shakira Linno</Text>
              <Text style={s.orgChildSal}>N$4,000/mo</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={s.div} />
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
      <Text style={s.h3}>Planned Staff Growth (Years 2 and 3):</Text>
      <Bullet text="Year 2: add 2 junior developers at N$12,000 per month each and 1 project manager at N$14,000 per month as revenue allows" />
      <Bullet text="Year 3: expand to 10 to 12 staff, including designers and a sales representative for the South Africa market" />
      <Bullet text="All salaries to be reviewed and adjusted upward by 10% per year from Year 2 onwards" />
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Section 02 - Management Plan" />
    </Page>
  );
}

function ManagementPlanPage2() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 02 - Management Plan (continued)" />
      <H2 num="2.1.2" title="Experience and Technical Ability" />
      <Text style={s.h3}>Keenan Husselmann - Director and Lead Developer</Text>
      <Text style={s.p}>
        I hold a Bachelor of Computer Science degree in Software Development from NUST (Namibia University of Science and Technology). I have been building websites, web applications, and digital solutions since my studies and have been trading as a freelancer under the Swift Designz brand since January 2026. In four months of active trading I generated an average of N$8,000 per month in revenue from website development, maintenance retainers, and consulting.
      </Text>
      <Text style={s.p}>
        As evidence of my technical capability, I designed and built the full administrative management platform used to run Swift Designz. This system, accessible at admin.swiftdesignz.co.za, is a custom Next.js and React application backed by a PostgreSQL database. It handles client relationship management, project tracking, full accounts receivable (quotations, invoices, payments, reminders, statements, retainers), payroll tracking, equipment management, investor management, and automated email communication. Building this system from scratch demonstrates not only technical depth but the ability to understand business requirements and translate them into working software.
      </Text>
      <Text style={s.p}>
        I am proficient in: TypeScript, Tailwind CSS, Supabase (PostgreSQL, authentication, storage), React, Next.js, Shopify development, mobile-responsive design, and AI-assisted development workflows.
      </Text>
      <Text style={s.h3}>Georgia Orren - Business Administrator</Text>
      <Text style={s.p}>
        Georgia Orren holds a BA in Business Administration and is currently completing her Honours degree. She brings structured administrative capability, financial reporting understanding, and client relations skills to the team.
      </Text>
      <Text style={s.h3}>Requelle Husselmann - Project Manager</Text>
      <Text style={s.p}>
        Requelle holds an Honours degree in Education and a Certificate in Project Management. She will oversee all active client projects, manage timelines and deliverables, coordinate between the development team and clients, and ensure projects are delivered on time and within scope. Her background in education supports structured planning and clear communication across the team.
      </Text>
      <Text style={s.h3}>Anthony Bagley - Systems Administration Intern</Text>
      <Text style={s.p}>
        Anthony is 26 years old and studying Systems Administration. He will manage internal IT systems, network infrastructure, server maintenance, and technical support for the team.
      </Text>
      <Text style={s.h3}>Shakira Linno - Marketing Officer</Text>
      <Text style={s.p}>
        Shakira holds a BA in Marketing. She will lead all brand and marketing activities including social media management, content creation, lead generation campaigns, and client communication.
      </Text>
      <Text style={s.h3}>Tapiwa Machekera - QA Tester Intern</Text>
      <Text style={s.p}>
        Tapiwa Machekera is 22 years old and currently studying Computer Science. As QA Tester, they will test all software and website builds before client delivery, write test cases, report bugs, and ensure quality standards are met consistently.
      </Text>
      <View style={s.div} />
      <H2 num="2.1.3" title="Ownership Structure" />
      <Text style={s.p}>
        Swift Designz Investments CC has two members. Keenan Husselmann holds an 85% member interest and serves as the sole director. Leon Husselmann holds a 15% member interest. The controlling member and day-to-day operator is Keenan Husselmann, who qualifies as youth under the NYDF criteria (aged 31, within the 18 to 45 range). The business also has one private investor (Signed investor commitment letter attached as Supporting Document SD-01) who contributes N$2,000 per month for five years under a non-ownership financial arrangement.
      </Text>
      <KV k="Member 1" v="Keenan Husselmann — 85% interest (Director, aged 31)" />
      <KV k="Member 2" v="Leon Husselmann — 15% interest" />
      <KV k="Youth Ownership" v="85% (controlling director is youth-qualifying)" />
      <KV k="Women Ownership" v="0%" />
      <KV k="Disability" v="None" />
      <View style={s.div} />
      <H2 num="2.1.4" title="Strategic Alliances" />
      <Bullet text="IT-Guru (Ambrose): hosting and domain registration partner. Facilitates affordable, reliable web hosting for all client websites deployed by Swift Designz" />
      <Bullet text="Rachel N. Kashala (SAIBA 4132): appointed Accounting Officer. Provides independent financial oversight, compliance, and annual reporting" />
      <Bullet text="Private Investor: committed to a monthly financial contribution of N$2,000 for a period of five years, providing supplementary income during the growth phase (Signed investor commitment letter attached as Supporting Document SD-01)" />
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Section 02 - Management Plan" />
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
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { width: 80 }]}>Phase</Text>
          <Text style={[s.th, { width: 95 }]}>Timeline</Text>
          <Text style={[s.th, { flex: 1 }]}>Activities</Text>
        </View>
        {[
          ["Phase 1", "Month 1 to 2\nJun to Jul 2026", "Post job vacancies, conduct interviews, and hire 5 staff members. Register all staff with Social Security Commission. Sign employment contracts. Procure all equipment and software licences. Onboard team and set up remote workflows."],
          ["Phase 2", "Month 3 to 6\nAug to Nov 2026", "Full team operational. Begin active client acquisition. Shakira to launch social media campaigns and paid advertising. Target 5 new clients per month. Establish initial retainer base targeting 8 active retainer clients by end of Month 6."],
          ["Phase 3", "Month 7 to 12\nDec 2026 to May 2027", "Scale operations. Target 15 or more active clients and 15 or more retainer subscriptions. Revenue should reach or exceed N$60,000 per month. Begin groundwork for South Africa market entry."],
          ["Phase 4", "Year 2\nJun 2027 onward", "Commence NYDF loan repayments. Hire additional developers as revenue allows. Scale both Namibia and South Africa client bases. Register for PAYE and VAT as thresholds are reached."],
        ].map(([ph, tl, act], i) => (
          <View key={ph} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { width: 80 }]}>{ph}</Text>
            <Text style={[s.td, { width: 95 }]}>{tl}</Text>
            <Text style={[s.td, { flex: 1 }]}>{act}</Text>
          </View>
        ))}
      </View>
      <View style={s.div} />
      <H2 num="3.2" title="Pre-Registration Trading History" />
      <Text style={s.p}>
        Prior to formal CC registration on 12 May 2026, the business operated as a sole proprietor under the Swift Designz brand from January 2026. During this four-month period:
      </Text>
      <Bullet text="Average monthly revenue: N$8,000" />
      <Bullet text="Revenue sources: website development projects, maintenance retainers, and ad hoc consulting services" />
      <Bullet text="One private investor committed, contributing N$2,000 per month" />
      <Bullet text="Live business website operational (swiftdesignz.co.za) with active lead intake" />
      <Bullet text="Full internal management platform built and deployed (admin.swiftdesignz.co.za)" />
      <Text style={s.p}>
        This demonstrates that the business has a real, functioning market base to grow from, not a concept seeking its first client.
      </Text>
      <View style={s.div} />
      <H2 num="3.3" title="Loan Use Breakdown" />
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 1.2 }]}>Category</Text>
          <Text style={[s.th, { flex: 2 }]}>Items</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Cost (N$)</Text>
        </View>
        {[
          ["Computing Hardware", "Development laptop, desktop workstation, 2x monitors, SSD, docking station", "71,450"],
          ["Peripherals", "Keyboard, mouse, webcam, headset and microphone, drawing tablet (Wacom)", "11,550"],
          ["Mobile Devices", "Business smartphone and tablet/iPad", "29,500"],
          ["Networking", "Wi-Fi 6 business router, UPS battery backup, NAS network storage", "15,250"],
          ["Office Equipment", "Standing desk, ergonomic chair, printer and scanner, ring light, whiteboard", "22,850"],
          ["Software Licences (12 mo)", "Adobe Creative Cloud, Figma Pro, Microsoft 365, GitHub Copilot, PM tool", "28,200"],
        ].map(([cat, items, cost], i) => (
          <View key={cat} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { flex: 1.2 }]}>{cat}</Text>
            <Text style={[s.td, { flex: 2 }]}>{items}</Text>
            <Text style={[s.tdr, { flex: 1 }]}>{cost}</Text>
          </View>
        ))}
        <View style={s.tblRTotal}>
          <Text style={[s.tdb, { flex: 3.2 }]}>Subtotal: Equipment and Software</Text>
          <Text style={[s.tdbr, { flex: 1 }]}>178,800</Text>
        </View>
      </View>
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 1.2 }]}>Category</Text>
          <Text style={[s.th, { flex: 2 }]}>Description</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Cost (N$)</Text>
        </View>
        {[
          ["Gross Payroll (12 months)", "6 staff members at a combined N$32,000 per month for 12 months", "384,000"],
          ["Employer Statutory Costs", "Social Security and statutory employer contributions (approximately 2%)", "7,680"],
          ["Recruitment and Setup", "Job advertising, SSC registration fees, and administrative costs", "9,000"],
        ].map(([cat, desc, cost], i) => (
          <View key={cat} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { flex: 1.2 }]}>{cat}</Text>
            <Text style={[s.td, { flex: 2 }]}>{desc}</Text>
            <Text style={[s.tdr, { flex: 1 }]}>{cost}</Text>
          </View>
        ))}
        <View style={s.tblRTotal}>
          <Text style={[s.tdb, { flex: 3.2 }]}>Subtotal: Working Capital</Text>
          <Text style={[s.tdbr, { flex: 1 }]}>400,680</Text>
        </View>
      </View>
      <View style={s.tbl}>
        <View style={s.tblRTotal}>
          <Text style={[s.tdb, { flex: 2 }]}>Total Funding Requirement</Text>
          <Text style={[s.tdbr, { flex: 1 }]}>N$ 579,480</Text>
        </View>
        <View style={s.tblR}>
          <Text style={[s.td, { flex: 2 }]}>Less: Own Contribution (existing equipment, in-kind)</Text>
          <Text style={[s.tdr, { flex: 1 }]}>(40,000)</Text>
        </View>
        <View style={s.tblRTotal}>
          <Text style={[s.tdb, { flex: 2 }]}>LOAN AMOUNT REQUESTED</Text>
          <Text style={[s.tdbr, { flex: 1 }]}>N$ 539,480</Text>
        </View>
      </View>
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Section 03 - Financial Information" />
    </Page>
  );
}

function FinancialPage2() {
  const months = [
    ["Jun 2026", "12,000", "36,490", "(24,490)"],
    ["Jul 2026", "15,000", "36,490", "(21,490)"],
    ["Aug 2026", "18,000", "36,490", "(18,490)"],
    ["Sep 2026", "22,000", "36,490", "(14,490)"],
    ["Oct 2026", "26,000", "36,490", "(10,490)"],
    ["Nov 2026", "30,000", "36,490", "(6,490)"],
    ["Dec 2026", "35,000", "36,490", "(1,490)"],
    ["Jan 2027", "40,000", "36,490", "3,510"],
    ["Feb 2027", "45,000", "36,490", "8,510"],
    ["Mar 2027", "50,000", "36,490", "13,510"],
    ["Apr 2027", "55,000", "36,490", "18,510"],
    ["May 2027", "60,000", "36,490", "23,510"],
  ];
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 03 - Financial Information (continued)" />
      <H2 num="3.3.1" title="Key Financial Assumptions" />
      <Bullet text="Revenue starts at N$12,000 in Month 1 (N$8,000 existing freelance base, N$2,000 investor, and N$2,000 initial new work)" />
      <Bullet text="New project revenue grows by approximately N$3,000 to N$5,000 per month as the team becomes productive and marketing ramps up" />
      <Bullet text="Monthly operating costs are fixed at N$36,490 covering payroll and employer costs at N$32,640, software subscriptions at N$2,350, and other operational expenses at N$1,500" />
      <Bullet text="Equipment (N$178,800) is a one-time upfront purchase funded from the loan in Month 1" />
      <Bullet text="Business operates with no rent or office costs as the team is fully remote" />
      <Bullet text="Grace period of 12 months means no loan repayments during Year 1" />
      <Bullet text="Loan interest rate assumed at 4% per annum (conservative estimate) for repayment calculations" />
      <Bullet text="No VAT in Year 1 as turnover is below the N$500,000 threshold" />
      <Bullet text="Investor income of N$2,000 per month continues for 5 years and is included in base revenue" />
      <View style={s.div} />
      <H2 num="3.3.2" title="Year 1: Monthly Cash Flow Projection (Operating)" />
      <Text style={[s.p, { marginBottom: 8 }]}>
        Note: Monthly operating costs exclude the one-time equipment purchase of N$178,800 which is funded upfront from the loan at the start of Month 1. The figures below show ongoing monthly revenue versus operating expenses only.
      </Text>
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
          <Text style={[s.tdbr, { flex: 1 }]}>408,000</Text>
          <Text style={[s.tdbr, { flex: 1 }]}>437,880</Text>
          <Text style={[s.tdbr, { flex: 1 }]}>(29,880)</Text>
        </View>
      </View>
      <Text style={s.p}>
        The revenue growth from N12,000 in Month 1 to N60,000 by Month 12 is driven by three compounding factors: (1) an active retainer base growing from 2 clients in Month 1 to 15 clients by Month 12 at an average of N2,000 per month each; (2) 3 to 5 new project builds per month at an average value of N6,000 per project once the full team is operational from Month 3; and (3) the continued N$2,000 monthly investor contribution included in the base revenue throughout Year 1.
      </Text>
      <View style={s.box}>
        <Text style={s.boxText}>
          The operating deficit in Year 1 is only N$29,880 due to lean entry-level salaries and zero office overhead. Combined with the one-time equipment cost of N$178,800, the total Year 1 draw on the loan is N$208,680. The remaining N$330,800 of the N$539,480 loan provides a strong working capital buffer going into Year 2 when repayments begin.
        </Text>
      </View>
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Section 03 - Financial Information" />
    </Page>
  );
}

function FinancialPage3() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 03 - Financial Information (continued)" />
      <H2 num="3.3.3" title="3-Year Financial Projection Summary" />
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 2 }]}>Item</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Year 1 (2026/27)</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Year 2 (2027/28)</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Year 3 (2028/29)</Text>
        </View>
        {[
          ["Annual Revenue (N$)", "408,000", "1,044,000", "1,560,000"],
          ["Monthly Revenue (average)", "34,000", "87,000", "130,000"],
          ["Annual Operating Costs (N$)", "437,880", "480,000", "528,000"],
          ["Loan Repayment (annual)", "none", "146,400", "146,400"],
          ["Total Annual Costs (N$)", "437,880", "626,400", "674,400"],
          ["Net Profit or (Loss) (N$)", "(29,880)", "417,600", "885,600"],
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
      <Text style={[s.p, { fontSize: 7.5, color: "#555555", marginBottom: 6 }]}>
        * Year 2 and Year 3 operating cost increases reflect a conservative 10% annual uplift on the base payroll. New hires in Years 2 and 3 are junior and remote, keeping the per-head cost low. Payroll growth is intentionally staged to remain below revenue growth in both years.
      </Text>
      <Text style={[s.p, { marginBottom: 6 }]}>
        Year 1 note: The operating deficit is fully covered by the NYDF loan. Equipment purchase is not included in the operating costs above as it is a one-time upfront cost.
      </Text>
      <Text style={[s.p, { marginBottom: 14 }]}>
        Year 2 revenue growth is driven by an established team at full capacity, an active retainer base of 15 or more clients, continued growth in the existing South Africa client base, and growth from the established N$8,000 per month revenue foundation.
      </Text>
      <View style={s.div} />
      <H2 num="3.3.4" title="Loan Repayment Projection" />
      <Text style={s.p}>
        Repayment commences after the 12-month grace period (from approximately June 2027). At a 4% interest rate over the remaining 48 months:
      </Text>
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 2 }]}>Detail</Text>
          <Text style={[s.th, { flex: 1, textAlign: "right" as const }]}>Amount</Text>
        </View>
        {[
          ["Principal (loan amount)", "N$ 539,480"],
          ["Grace period", "12 months (no repayments)"],
          ["Repayment period after grace", "48 months"],
          ["Total repayment period", "60 months (5 years)"],
          ["Interest rate (assumed at 4% per annum, conservative)", "4%"],
          ["Estimated monthly repayment from Month 13", "N$ 12,200"],
          ["Estimated annual repayment", "N$ 146,400"],
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
          By Month 13 when repayments begin, the business projects monthly revenue of N$75,000 to N$90,000 based on the Year 1 growth trajectory. Monthly operating costs at that point will be approximately N$40,000, giving a monthly surplus of N$35,000 to N$50,000 from which to service the repayment of N$12,200 per month. The business will be profitable and able to repay the loan comfortably from operational income.
        </Text>
      </View>
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Section 03 - Financial Information" />
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
      <Text style={s.p}>
        The digital services sector in Namibia is growing rapidly. The government ICT Master Plan, Vision 2030, and the Harambee Prosperity Plan II all identify technology and digital transformation as priority areas for economic development. Demand for professional websites, e-commerce platforms, and custom software is increasing across all sectors including retail, hospitality, construction, healthcare, NGOs, and government. The majority of Namibian SMEs either lack a proper digital presence or are paying high prices to agencies that are out of reach for small business owners.
      </Text>
      <Text style={s.p}>
        Swift Designz sits in a gap that is currently underserved: professional digital work at prices a Namibian small business can actually afford, delivered by a local team that understands the local market. Our fully remote operating model means we can serve clients anywhere in the country without travel or logistics costs.
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
      <Text style={s.p}>
        There are over 70,000 registered businesses in Namibia. We estimate that 40% of those currently lack a proper digital presence. Even capturing 0.1% of this market (70 clients per year) would represent significant annual revenue given our average project value of N$6,000 to N$12,000. Our realistic Year 1 target is 3 to 5 new clients per month (36 to 60 clients in the year), which is conservative and achievable.
      </Text>
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Section 04 - Marketing Plan" />
    </Page>
  );
}

function MarketingPage2() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 04 - Marketing Plan (continued)" />
      <H2 num="4.1.3" title="Competition and Competitive Positioning" />
      <View style={s.tbl}>
        <View style={s.tblH}>
          <Text style={[s.th, { flex: 1 }]}>Competitor Type</Text>
          <Text style={[s.th, { flex: 1.5 }]}>What They Offer</Text>
          <Text style={[s.th, { flex: 1.5 }]}>Their Weakness</Text>
          <Text style={[s.th, { flex: 1.5 }]}>Our Advantage</Text>
        </View>
        {[
          ["Large local agencies", "Full-service digital, branding, marketing", "High prices, slow, not focused on SMEs", "Transparent pricing, fast turnaround, affordable for SMEs"],
          ["Individual freelancers", "Website builds, one-person operation", "No team, unreliable, no post-launch support", "Team capacity, consistent quality, after-sale support"],
          ["DIY platforms (Wix etc.)", "Self-service website builders", "No custom builds, limited functionality", "Custom solutions, professional results, no DIY skill needed"],
          ["Overseas agencies", "Remote-built digital services", "No local context, no in-person option, foreign currency pricing", "Locally based, NAD pricing, cultural understanding"],
        ].map(([ct, offer, weak, adv], i) => (
          <View key={ct} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { flex: 1 }]}>{ct}</Text>
            <Text style={[s.td, { flex: 1.5 }]}>{offer}</Text>
            <Text style={[s.td, { flex: 1.5 }]}>{weak}</Text>
            <Text style={[s.td, { flex: 1.5 }]}>{adv}</Text>
          </View>
        ))}
      </View>
      <View style={s.div} />
      <H2 num="4.2" title="Promotion and Advertising Strategy" />
      <Text style={s.h3}>Digital Marketing (Primary Channel)</Text>
      <Bullet text="Live business website (swiftdesignz.co.za) with integrated quote request and contact forms that feed directly into our CRM. All leads are automatically tracked and followed up" />
      <Bullet text="Facebook and Instagram business pages with regular content showcasing completed projects, client testimonials, and service promotions targeted at Namibian SMEs" />
      <Bullet text="LinkedIn presence for corporate and government sector outreach" />
      <Bullet text="Targeted Facebook and Google paid advertising campaigns managed by the Marketing Officer with a monthly budget of N$2,000 to N$5,000" />
      <Bullet text="Google Business listing for local search visibility" />
      <Text style={s.h3}>Referral Network</Text>
      <Bullet text="Existing freelance clients will be converted to formal clients with proper onboarding and retainer agreements" />
      <Bullet text="Client referral programme offering a discount on their next invoice for every successful referral" />
      <Bullet text="Partnership with IT-Guru to cross-refer clients needing hosting alongside development services" />
      <Text style={s.h3}>Community and Networking</Text>
      <Bullet text="Windhoek Chamber of Commerce membership and networking events" />
      <Bullet text="Participation in Namibia ICT industry events and startup communities" />
      <Bullet text="Free initial consultations to build relationships with businesses not yet ready to commit" />
      <Text style={s.h3}>Content Marketing</Text>
      <Bullet text="Monthly blog posts and social media content on topics relevant to Namibian businesses including digital presence, e-commerce, and AI tools" />
      <Bullet text="Short video tutorials and behind-the-scenes content to build brand trust and visibility" />
      <Text style={s.h3}>South Africa (Existing Market)</Text>
      <Bullet text="Swift Designz already serves clients in South Africa, with live e-commerce stores and websites actively running for SA-based clients. This is not a future expansion plan but an existing revenue stream that the loan funding will help us scale" />
      <Bullet text="The business is headquartered in Namibia and all revenue is earned and taxed in Namibia. The SA market is served entirely remotely at no additional overhead cost" />
      <Bullet text="Growing the SA client base is a key part of Year 1 and Year 2 revenue targets, with dedicated marketing spend applied to both markets from Month 1" />
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Section 04 - Marketing Plan" />
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
      <Text style={s.p}>
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
      <Text style={s.p}>
        Swift Designz is a knowledge-based, digital-only business. There are no raw materials, physical inventory, or manufacturing processes. The inputs are:
      </Text>
      <Bullet text="Software licences and subscriptions (Adobe Creative Cloud, Figma, Microsoft 365, GitHub Copilot, and project management tools)" />
      <Bullet text="Cloud hosting services facilitated through IT-Guru (hosting partner)" />
      <Bullet text="Domain registrations and SSL certificates sourced per client project" />
      <Text style={s.p}>
        Each team member is responsible for their own internet connection as part of their remote working arrangement. All software costs are either included in the planned licence budget or passed through to clients as part of their project quotation.
      </Text>
      <View style={s.div} />
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
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Section 05 - Operations and Technology" />
    </Page>
  );
}

function OperationsPage2() {
  return (
    <Page size="A4" style={s.page}>
      <RunHead section="Section 05 - Operations and Technology (continued)" />
      <H2 num="5.4" title="Technology and Equipment" />
      <Text style={s.p}>
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
          ["Computing", "Development Laptop", "Primary developer workstation", "32,500"],
          ["Computing", "Desktop Workstation", "High-performance rendering and compilation", "25,000"],
          ["Computing", "External Monitors x2", "Extended display for productivity and design", "11,000"],
          ["Computing", "External SSD (2TB)", "Project backups and portable storage", "1,650"],
          ["Computing", "USB-C Docking Station", "Connect peripherals to laptop", "1,300"],
          ["Peripherals", "Mechanical Keyboard", "Ergonomic typing for long sessions", "2,250"],
          ["Peripherals", "Ergonomic Mouse", "Reduced wrist strain", "1,550"],
          ["Peripherals", "Webcam (1080p+)", "Professional video calls and client meetings", "1,650"],
          ["Peripherals", "USB Microphone and Headset", "Clear audio for calls and recordings", "2,350"],
          ["Peripherals", "Drawing Tablet (Wacom)", "Precise design input for UI/UX work", "3,750"],
          ["Mobile", "Business Smartphone", "Client communication and mobile testing", "16,500"],
          ["Mobile", "Tablet and iPad", "Design reviews, presentations, note-taking", "13,000"],
          ["Networking", "Wi-Fi 6 Business Router", "Fast, stable internet for home office", "4,000"],
          ["Networking", "UPS Battery Backup", "Equipment protection during power outages", "3,250"],
          ["Networking", "NAS Network Storage", "Centralised file server and backups", "8,000"],
          ["Office", "Sit-Stand Desk", "Ergonomic workspace for long sessions", "9,500"],
          ["Office", "Ergonomic Chair", "Lumbar support for seated work", "7,500"],
          ["Office", "Printer and Scanner", "Contracts, invoices, physical document handling", "3,250"],
          ["Office", "Ring Light and Studio Lighting", "Professional appearance in video calls", "1,500"],
          ["Office", "Whiteboard", "Visual planning and diagrams", "1,100"],
          ["Software (12 mo)", "Adobe Creative Cloud", "Design, video, and photography suite", "10,800"],
          ["Software (12 mo)", "Figma Pro", "UI/UX design and prototyping", "6,000"],
          ["Software (12 mo)", "Microsoft 365 Business", "Email, productivity, and collaboration", "4,800"],
          ["Software (12 mo)", "GitHub Copilot and Pro", "Code hosting, CI/CD, AI coding assistant", "4,200"],
          ["Software (12 mo)", "Project Management Tool", "Task tracking and project boards", "2,400"],
        ].map(([cat, item, purpose, cost], i) => (
          <View key={`${cat}-${item}`} style={i % 2 === 0 ? s.tblR : s.tblRA}>
            <Text style={[s.tdb, { flex: 1 }]}>{cat}</Text>
            <Text style={[s.td, { flex: 2 }]}>{item}</Text>
            <Text style={[s.td, { flex: 1 }]}>{purpose}</Text>
            <Text style={[s.tdr, { flex: 0.8 }]}>{cost}</Text>
          </View>
        ))}
        <View style={s.tblRTotal}>
          <Text style={[s.tdb, { flex: 4.8 }]}>Total Equipment and Software</Text>
          <Text style={[s.tdbr, { flex: 0.8 }]}>178,800</Text>
        </View>
      </View>
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Section 05 - Operations and Technology" />
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
      <View style={s.twoC}>
        <View style={s.c50}>
          <Text style={s.h3}>Applicant Profile</Text>
          <KV k="PDN Ownership (%)" v="85% (Keenan Husselmann)" />
          <KV k="Women Ownership (%)" v="0%" />
          <KV k="Youth Ownership (%)" v="85% (controlling director, aged 31)" />
          <KV k="Age of Youth (applicant)" v="31 years" />
          <KV k="Education Qualification" v="BSc Computer Science (Software Development), NUST" />
          <KV k="Employment Status at Application" v="Self-employed (sole director)" />
          <KV k="Year of Business Registration" v="2026" />
          <KV k="Business Stage" v="Startup / Early Growth" />
          <KV k="Business Traded Formally" v="Yes" />
          <KV k="SME or Large Enterprise" v="SME" />
        </View>
        <View style={s.c50}>
          <Text style={s.h3}>Business Location</Text>
          <KV k="Industry" v="ICT / Digital Services" />
          <KV k="Economic Sector" v="Technology and Innovation" />
          <KV k="Town" v="Windhoek" />
          <KV k="Region" v="Khomas" />
          <KV k="Rural or Urban" v="Urban" />
          <KV k="Sales Region" v="Namibia and South Africa (both active)" />
          <KV k="Innovation / Tech Driven" v="Yes" />
          <KV k="Market Linkages" v="Yes" />
          <KV k="Business Development Services" v="No" />
        </View>
      </View>
      <View style={s.div} />
      <Text style={s.h3}>Employment Statistics</Text>
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
      <View style={s.div} />
      <Text style={s.h3}>Short Description of Business Activities</Text>
      <Text style={s.p}>
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
      <Footer left="Swift Designz Investments CC | NYDF Business Plan 2026" right="Section 06 - Statistics" />
    </Page>
  );
}

// ── MAIN DOCUMENT ─────────────────────────────────────────────

export default function BusinessPlanPDF() {
  return (
    <Document
      title="Swift Designz Investments CC - NYDF Business Plan 2026"
      author="Keenan Husselmann"
      subject="National Youth Development Fund Loan Application"
      keywords="NYDF, DBN, business plan, Swift Designz, Namibia, ICT"
    >
      <CoverPage />
      <CoverLetterPage />
      <ExecutiveSummaryPage />
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
      <StatisticsPage />
    </Document>
  );
}
