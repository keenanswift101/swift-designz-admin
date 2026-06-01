import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
} from "docx";

type DocChild = Paragraph | Table;

// ── Layout constants ──────────────────────────────────────────
// A4: 11906 × 16838 DXA | margins: 1134 DXA (2cm) each side
const PAGE_W = 11906;
const MARGIN = 1134;
const CONTENT_W = PAGE_W - MARGIN * 2; // 9638 DXA

// ── Colours ───────────────────────────────────────────────────
const BLACK = "111111";
const DARK = "333333";
const MID = "555555";
const LIGHT = "888888";
const RULE = "CCCCCC";
const TH_BG = "EEEEEE";
const ALT_BG = "F7F7F7";
const TOTAL_BG = "EEEEEE";

// ── Helpers ───────────────────────────────────────────────────
const border = (color = RULE) => ({ style: BorderStyle.SINGLE, size: 1, color });
const allBorders = (color = RULE) => ({ top: border(color), bottom: border(color), left: border(color), right: border(color) });
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });
const _noBorders = () => ({ top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() }); void _noBorders;

function p(children: TextRun[], opts: Record<string, unknown> = {}): Paragraph {
  return new Paragraph({ children, ...opts });
}

function run(text: string, opts: Record<string, unknown> = {}): TextRun {
  return new TextRun({ text, font: "Arial", ...opts });
}

function bold(text: string, size = 20): TextRun {
  return run(text, { bold: true, size });
}

function body(text: string): DocChild {
  return p([run(text, { size: 18, color: DARK })], { spacing: { after: 120 } });
}

function bullet(text: string): DocChild {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [run(text, { size: 18, color: DARK })],
    spacing: { after: 80 },
  });
}

function h1(text: string): DocChild {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [run(text, { size: 28, bold: true, color: BLACK })],
    spacing: { before: 320, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLACK, space: 4 } },
  });
}

function h2(num: string, title: string): DocChild[] {
  return [
    p([run(num, { size: 14, color: LIGHT, allCaps: true })], { spacing: { before: 240, after: 40 } }),
    p([run(title, { size: 22, bold: true, color: BLACK })], { spacing: { after: 120 } }),
  ];
}

function h3(text: string): DocChild {
  return p([run(text, { size: 19, bold: true, color: BLACK })], { spacing: { before: 160, after: 80 } });
}

function divider(): DocChild {
  return p([], {
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "E5E5E5", space: 0 } },
  });
}

function pgBreak(): DocChild {
  return new Paragraph({ children: [new PageBreak()] });
}

function kv(key: string, value: string): DocChild {
  return p([
    run(key + ": ", { size: 18, bold: true, color: BLACK }),
    run(value, { size: 18, color: DARK }),
  ], { spacing: { after: 80 } });
}

// ── Table helpers ─────────────────────────────────────────────
function thCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: allBorders(BLACK),
    shading: { fill: TH_BG, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [p([run(text, { size: 14, bold: true, allCaps: true, color: BLACK })], { spacing: { after: 0 } })],
  });
}

function tdCell(text: string, width: number, shade = false, isBold = false): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: allBorders(RULE),
    shading: { fill: shade ? ALT_BG : "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [p([run(text, { size: 17, bold: isBold, color: isBold ? BLACK : DARK })], { spacing: { after: 0 } })],
  });
}

function totalCell(text: string, width: number, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: { top: border(BLACK), bottom: border(BLACK), left: border(RULE), right: border(RULE) },
    shading: { fill: TOTAL_BG, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [p([run(text, { size: 17, bold: true, color: BLACK })], { spacing: { after: 0 }, alignment: align })],
  });
}

function tblRow(cells: string[], widths: number[], shade: boolean, boldFirst = false): TableRow {
  return new TableRow({
    children: cells.map((c, i) =>
      tdCell(c, widths[i], shade, boldFirst && i === 0)
    ),
  });
}

function tblHead(headers: string[], widths: number[]): TableRow {
  return new TableRow({ children: headers.map((h, i) => thCell(h, widths[i])) });
}

// ── SECTION BUILDERS ─────────────────────────────────────────

function tableOfContents(): DocChild[] {
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
    ["  3.3.3  Income Statement Projection (Year 1)", "12"],
    ["  3.3.4  3-Year Financial Projection Summary", "12"],
    ["  3.3.5  Loan Repayment Projection", "13"],
    ["Section 04 — Marketing Plan", "14"],
    ["  4.1  Industry Analysis", "14"],
    ["  4.1.1  SWOT Analysis", "14"],
    ["  4.1.2  Target Markets and Market Share Estimates", "14"],
    ["  4.1.3  Market Segment Notes", "15"],
    ["  4.1.4  Competition and Competitive Positioning", "15"],
    ["  4.2  Promotion and Advertising Strategy", "15"],
    ["Section 05 — Operations and Technology", "16"],
    ["  5.1  Operations Overview", "16"],
    ["  5.2  Delivery Methodology and Costing", "16"],
    ["  5.3  Organisation of Operations and Outputs", "16"],
    ["  5.4  Technology and Equipment", "17"],
    ["Section 06 — Statistics", "18"],
  ];

  return [
    h1("Index"),
    ...entries.map(([label, pg]) =>
      new Paragraph({
        children: [
          new TextRun({ text: label, font: "Arial", size: label.startsWith("  ") ? 16 : 18, bold: label.startsWith("Section"), color: label.startsWith("Section") ? BLACK : DARK }),
          new TextRun({ text: `\t${pg}`, font: "Arial", size: 16, color: LIGHT }),
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tabStops: [{ type: "right" as any, position: CONTENT_W }],
        spacing: { after: label.startsWith("Section") ? 120 : 60 },
      })
    ),
    pgBreak(),
  ];
}

function coverPage(): DocChild[] {
  return [
    p([run("SWIFT DESIGNZ INVESTMENTS CC", { size: 44, bold: true, color: BLACK, allCaps: true })], { spacing: { after: 40 } }),
    p([run("CC/2026/05589  ·  Windhoek, Namibia", { size: 18, color: MID })], { spacing: { after: 480 } }),
    p([run("Business Plan", { size: 72, bold: true, color: BLACK })], { spacing: { after: 80 } }),
    p([run("National Youth Development Fund Application", { size: 26, color: DARK })], { spacing: { after: 40 } }),
    p([run("Submitted to the Development Bank of Namibia", { size: 26, color: DARK })], { spacing: { after: 480 } }),
    kv("Applicant", "Keenan Husselmann"),
    kv("Date of Birth", "21 May 1995 (Age 31)"),
    kv("ID Number", "95052100450"),
    kv("Business Registration", "CC/2026/05589, registered 12 May 2026"),
    kv("NamRA Tax Income Number", "16271273 (ITX 16271273-011)"),
    kv("Business Address", "Erf 55 Kenneth McArthur Street, Auas Blick, Windhoek"),
    kv("Postal Address", "P.O. Box 4655, Rehoboth, Namibia"),
    kv("Contact", "081 388 1111  ·  info@swiftdesignz.co.za"),
    kv("Website", "swiftdesignz.co.za"),
    kv("Loan Amount Requested", "N$550,000"),
    kv("Repayment Period", "60 months (12 months grace period requested)"),
    kv("Date Prepared", "May 2026"),
    divider(),
    p([run(
      "This business plan has been prepared in support of a loan application under the National Youth Development Fund (NYDF), administered through the Development Bank of Namibia. All financial projections are based on conservative estimates derived from demonstrated pre-registration trading activity. The applicant declares that all information contained herein is true and accurate to the best of their knowledge.",
      { size: 15, color: LIGHT }
    )], { spacing: { after: 0 } }),
    pgBreak(),
  ];
}

function coverLetter(): DocChild[] {
  return [
    h1("Cover Letter"),
    p([bold("The NYDF Fund Manager", 18)], { spacing: { after: 40 } }),
    p([run("Development Bank of Namibia", { size: 18 })], { spacing: { after: 40 } }),
    p([run("PO Box 235, Windhoek, Namibia", { size: 18 })], { spacing: { after: 240 } }),
    p([run("RE: NYDF LOAN APPLICATION — SWIFT DESIGNZ INVESTMENTS CC (CC/2026/05589)", { size: 18, bold: true })], { spacing: { after: 160 } }),
    p([run("Dear Sir / Madam,", { size: 18 })], { spacing: { after: 160 } }),
    body("I am Keenan Husselmann, 31, sole director of Swift Designz Investments CC (CC/2026/05589, registered 12 May 2026, Windhoek). I hereby apply for N$550,000 under the NYDF through the Development Bank of Namibia. Swift Designz is a digital technology company building websites, e-commerce stores, apps, and AI solutions for Namibian and South African businesses. Prior to formal registration, I generated N$41,000 in confirmed income over 5 months. Current monthly recurring revenue is N$7,000."),
    body("This loan will do three things: get Apple hardware into the business so we can build and test for iOS and macOS users for the first time; fund six staff salaries for 12 months while we grow the client base; and cover professional and legal setup costs for the new CC. We are fully remote, overhead is low, and we are already generating revenue in both Namibia and South Africa."),
    body("Six young Namibians will be formally employed, registered with Social Security, and given real career experience in the technology sector. The business is profitable from Month 3 post-funding and generates a full-year operating surplus of N$136,000. This loan is a bridge to a scalable, self-sustaining business — not operating capital for a concept."),
    body("I have attached a full business plan and all required supporting documents. I welcome the opportunity to discuss this application further."),
    p([run("Yours sincerely,", { size: 18 })], { spacing: { before: 160, after: 320 } }),
    p([bold("Keenan Husselmann", 18)], { spacing: { after: 40 } }),
    p([run("Director, Swift Designz Investments CC", { size: 18, color: DARK })], { spacing: { after: 40 } }),
    p([run("081 388 1111  ·  info@swiftdesignz.co.za", { size: 18, color: DARK })], { spacing: { after: 40 } }),
    p([run("Erf 55 Kenneth McArthur Street, Auas Blick, Windhoek, Namibia", { size: 18, color: DARK })], { spacing: { after: 0 } }),
    pgBreak(),
  ];
}

function executiveSummary(): DocChild[] {
  return [
    h1("Executive Summary"),
    ...h2("WHO WE ARE", "About Swift Designz Investments CC"),
    body("Swift Designz Investments CC is a registered Namibian digital technology company providing website development, e-commerce solutions, custom software applications, AI integration, and technical training to businesses across Namibia and South Africa. The company was formally registered on 12 May 2026 under the Close Corporations Act (CC/2026/05589) and operates fully remotely from Windhoek, Khomas Region."),
    body("Prior to formal registration, the business traded under the Swift Designz brand from January 2026, generating N$41,000 in confirmed income over 5 months. Current monthly recurring revenue is N$7,000 from active retainer contracts, an investor contribution, and ongoing client project deposits. The business serves active paying clients in both Namibia and South Africa, with live e-commerce stores and websites deployed in both markets."),
    divider(),
    ...h2("WHY WE NEED THE LOAN", "Three Reasons for This Application"),
    bullet("To build a team: solo capacity is capped at 10 active clients. Six hires unlock parallel project delivery and allow the director to focus on acquisition while the team handles delivery."),
    bullet("To serve Apple users: currently Windows and Android only. Testing iOS apps requires a real iPhone; submitting to the App Store requires a Mac. The iMac and iPhone in this budget unlock an entirely new service category."),
    bullet("To cover legal and professional setup: N$75,000 reserve for legal fees, accounting, and business insurance — non-optional costs for operating a compliant CC from day one."),
    divider(),
    ...h2("IMPACT", "What This Funding Will Achieve"),
    bullet("6 permanent jobs created, all held by young Namibians aged 22 to 33"),
    bullet("3 of the 6 positions filled by women"),
    bullet("Full cross-platform capability: the business will serve Windows, Android, iOS, and macOS users for the first time"),
    bullet("Revenue growth from N$25,000 at Month 1 (post-funding) to N$60,000 and above by Month 12"),
    bullet("Formal employment and Social Security registration for the full team from day one"),
    bullet("Growth of the existing South Africa client base, bringing foreign revenue into Namibia"),
    divider(),
    ...h2("NYDF CRITERIA", "How This Application Meets the NYDF Assessment Criteria"),
    body("The NYDF assesses all applications on five criteria. This section addresses each one directly so reviewers can verify eligibility and impact at a glance."),
    h3("1. Viability and Sustainability of the Business"),
    body("Swift Designz is not a concept. It has been operating for over a year, has 6 active paying clients, and generates N$7,000 per month in confirmed recurring income from retainer contracts, investor contributions, and project deposits. Invoices totalling N$46,964 have been issued and paid in 2026 alone. The business has a registered accounting officer, a formal CC registration, and an active NamRA tax number. It is already a functioning business. This loan is for scaling it, not starting it."),
    body("Financial projections show the business reaching operational breakeven at Month 3, generating N$60,000 per month by Month 12, and producing a full-year operating surplus in Year 1. Loan repayments from Year 2 are fully serviceable from operational revenue."),
    h3("2. Youth Empowerment Potential"),
    body("The Director, Keenan Husselmann, is 31 years old. All 5 positions to be hired are youth aged 22 to 33. Three of the 6 total team members are women. Every staff member will receive structured internal training across all business domains during Years 1 and 2. By Year 3, trained staff are advanced into management positions from within the business."),
    h3("3. Job Creation Capacity"),
    body("This loan directly creates 5 formal, permanent, salaried positions from Month 1, all registered with the Social Security Commission. By Year 3, the team grows to 9 with 3 additional intern positions providing a pathway to permanent employment."),
    h3("4. Innovation and Local Relevance"),
    body("Swift Designz builds technology that Namibian businesses currently have to import from South Africa, Europe, or the United States. The cross-platform capability unlocked by this loan (iOS, Android, Windows, macOS) means Namibian clients are served by a local company at local prices. Planned AI platforms and school tools directly address Namibia's digital skills gap."),
    h3("5. Environmental and Social Impact"),
    body("Fully remote operations mean zero commute, no office energy consumption, and no vehicle fleet. Cloud delivery reduces printed materials and in-person travel. Every website and app delivered gives a Namibian SME a permanent local digital presence, reducing dependency on expensive overseas services."),
    pgBreak(),
  ];
}

function companyInfo(): DocChild[] {
  const svcW = [2400, 3838, 3400];
  const srcW = [2400, 4438, 2800];
  return [
    h1("Section 01 — Company Information"),
    ...h2("1.1", "Business Name"),
    body("Swift Designz Investments CC"),
    ...h2("1.2", "Business Location"),
    kv("Physical Address", "Erf 55 Kenneth McArthur Street, Auas Blick, Windhoek, Namibia"),
    kv("Postal Address", "P.O. Box 4655, Rehoboth, Namibia"),
    kv("Region", "Khomas"),
    kv("Mode of Operation", "Fully remote, no office premises required"),
    kv("Website", "swiftdesignz.co.za"),
    kv("Admin Portal", "admin.swiftdesignz.co.za"),
    kv("Email", "info@swiftdesignz.co.za"),
    divider(),
    ...h2("1.3", "Description of Business and Services"),
    body("Swift Designz Investments CC is a digital technology company that helps businesses establish and grow their online presence. We design and build websites, online stores, and custom software applications. We also offer training in artificial intelligence tools and project management methods, and we provide monthly technical support retainers."),
    h3("Future Services (Year 2 and beyond):"),
    bullet("AI agentic platforms built for specific business domains (legal, retail, logistics, healthcare)"),
    bullet("AI assistants for businesses — custom-trained, deployed, and maintained for individual companies"),
    bullet("AI tutors for schools — interactive learning tools built for Namibian curricula and classrooms"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: svcW,
      rows: [
        tblHead(["Service", "Description", "Price Range (N$)"], svcW),
        tblRow(["Website Development", "Custom business websites from Starter to Premium", "2,500 to 10,000"], svcW, false, true),
        tblRow(["E-Commerce Stores", "Shopify and custom online retail solutions", "4,000 to 15,000"], svcW, true, true),
        tblRow(["App Development", "Web and mobile application builds for Android, iOS, and cross-platform", "5,000 to 25,000+"], svcW, false, true),
        tblRow(["AI Training", "Individual 1-hour sessions and team workshops", "N$800 per session"], svcW, true, true),
        tblRow(["PM Training", "Full training programme including tools access and content", "N$2,000 fixed fee"], svcW, false, true),
        tblRow(["Maintenance Retainer", "Monthly support, updates, and monitoring", "avg N$900 per month"], svcW, true, true),
        tblRow(["Technical Consulting", "Audits, reviews, and advisory services", "N$800 per hour"], svcW, false, true),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    divider(),
    ...h2("1.4", "Regulatory and Compliance Context"),
    body("Registered under the Close Corporations Act, Act 26 of 1988 (CC/2026/05589). NamRA Tax Income Number: 16271273 (ITX 16271273-011). Not VAT-registered — annual turnover below N$500,000 threshold. Staff registered with SSC on appointment. Accounting Officer: Rachel N. Kashala (SAIBA 4132). Active clients in Namibia and South Africa — live e-commerce stores and websites deployed in both markets."),
    divider(),
    ...h2("1.5", "Sources of Funding"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: srcW,
      rows: [
        tblHead(["Source", "Description", "Amount (N$)"], srcW),
        tblRow(["NYDF Loan (DBN)", "Loan applied for in this application", "550,000"], srcW, false, true),
        tblRow(["Own Contribution", "Existing equipment contributed in-kind", "40,000"], srcW, true, true),
        tblRow(["Private Investor", "Monthly contribution of N$2,000 over 5 years (ongoing)", "120,000 total"], srcW, false, true),
        new TableRow({
          children: [
            totalCell("Total Project Funding", srcW[0] + srcW[1]),
            totalCell("N$710,000", srcW[2], AlignmentType.RIGHT),
          ],
        }),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    pgBreak(),
  ];
}

function managementPlan(): DocChild[] {
  const staffW = [2200, 1900, 1838, 900, 1800];
  return [
    h1("Section 02 — Management Plan"),
    ...h2("2.1", "Organisational Structure"),
    body("Swift Designz Investments CC operates a flat, remote-first structure. The Director leads all technical work, project management, and strategic decisions directly. The Business Administrator handles finance administration and day-to-day coordination. The technical team handles development, quality assurance, and systems. Marketing drives lead generation and brand growth."),
    divider(),
    ...h2("2.1.1", "Personnel: Year 1 to Year 3"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: staffW,
      rows: [
        tblHead(["Role", "Staff Member", "Qualification", "Age", "Monthly (N$)"], staffW),
        tblRow(["Director / Lead Developer", "Keenan Husselmann", "BSc CS Software Dev, NUST", "31", "10,000"], staffW, false, true),
        tblRow(["Business Administrator", "Georgia Orren", "BA Business Admin (Hons in progress)", "24", "6,500"], staffW, true, true),
        tblRow(["Project Manager", "Requelle Husselmann", "BA Education (Hons) + Certificate in PM", "33", "5,500"], staffW, false, true),
        tblRow(["Systems Admin Intern", "Anthony Bagley", "Studying Systems Administration", "26", "3,500"], staffW, true, true),
        tblRow(["Marketing Officer", "Shakira Linno", "BA Marketing", "25", "4,000"], staffW, false, true),
        tblRow(["QA Tester Intern", "Tapiwa Machekera", "BSc Computer Science (in progress)", "22", "2,500"], staffW, true, true),
        new TableRow({
          children: [
            totalCell("Total Monthly Payroll", staffW[0] + staffW[1] + staffW[2] + staffW[3]),
            totalCell("32,000", staffW[4], AlignmentType.RIGHT),
          ],
        }),
      ],
    }),
    p([], { spacing: { after: 120 } }),
    h3("Planned Staff Growth (Years 2 and 3):"),
    bullet("Year 2: no new hires. The existing team of 6 undergoes structured training across all business domains. The goal is to build complete business knowledge in each team member, not just technical skill."),
    bullet("Year 3: staff who completed 2-year training are advanced into management positions. Each manager is supported by a new assistant intern. Intern positions: Assistant Developer, Assistant Admin, and Assistant Sales."),
    bullet("Interns work on a pro bono basis for the first 2 months. After 2 months they move to entry-level salaries based on performance and business revenue."),
    divider(),
    ...h2("2.1.2", "Experience and Technical Ability"),
    h3("Keenan Husselmann — Director and Lead Developer"),
    body("BSc Computer Science (Software Development) from NUST. Trading under the Swift Designz brand since January 2026; generated N$41,000 in total income over 5 months with an 88% profit margin. Current monthly recurring revenue of N$7,000."),
    body("As evidence of technical capability, the director designed and built the full administrative management platform used to run Swift Designz (admin.swiftdesignz.co.za) — a custom Next.js and React application backed by a PostgreSQL database handling CRM, project tracking, full accounts receivable, payroll, equipment management, investor management, and automated email communication."),
    body("Tech stack: TypeScript, Tailwind CSS, Supabase (PostgreSQL, auth, storage), React, Next.js, Shopify development, mobile-responsive design, and AI-assisted development workflows."),
    p([run("Full CVs and supporting credentials for all staff members are available as Supporting Documents on request.", { size: 16, color: MID, italics: true })], { spacing: { after: 120 } }),
    divider(),
    ...h2("2.1.3", "Ownership Structure"),
    kv("Member 1", "Keenan Husselmann — 85% interest (Director, aged 31)"),
    kv("Member 2", "Leon Husselmann — 15% interest"),
    kv("Youth Ownership", "85% (controlling director is youth-qualifying)"),
    body("The business also has one private investor who contributes N$2,000 per month for five years under a non-ownership financial arrangement (see Supporting Document SD-01)."),
    divider(),
    ...h2("2.1.4", "Strategic Alliances"),
    h3("Current Alliances"),
    bullet("IT-Guru (Ambrose): hosting and domain registration partner. Facilitates affordable, reliable web hosting for all client websites deployed by Swift Designz."),
    bullet("Rachel N. Kashala (SAIBA 4132): appointed Accounting Officer. Provides independent financial oversight, compliance, and annual reporting."),
    bullet("Private Investor: committed to a monthly financial contribution of N$2,000 for a period of five years, providing supplementary income during the growth phase."),
    h3("Planned Future Alliances"),
    bullet("Shopify and Google Partner certification (Year 2): pursue certified agency status with both platforms to gain qualified lead referrals, co-marketing exposure, and priority support."),
    bullet("School and college partnerships (Year 3): deploy AI tutor tools and digital skills training in Namibian schools, building recurring institutional revenue and a pipeline of future-trained staff."),
    bullet("Banking and accounting referral network (Year 2): become the referred ICT partner for Bank Windhoek, FNB Namibia, and accounting firms serving SME clients across Namibia."),
    bullet("Telecom bundle partnership (Year 3): partner with MTC or Telecom Namibia to offer bundled connectivity and digital presence packages to their SME customer base."),
    bullet("Investor expansion (Year 2 onwards): bring in additional investors with sector-specific networks in retail, education, or logistics to accelerate growth beyond NYDF loan coverage."),
    pgBreak(),
  ];
}

function financialInfo(): DocChild[] {
  const implW = [1200, 1600, 6838];
  const loanW = [2100, 4438, 3100];
  const revW = [4000, 1700, 1969, 1969];
  const cfW = [1800, 2613, 2613, 2612];
  const yr3W = [3238, 2200, 2200, 2000];
  const repW = [6638, 3000];

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

  return [
    h1("Section 03 — Financial Information"),
    ...h2("3.1", "Implementation Plan"),
    p([run("Important: Loan funds will not be received on the same day the application is submitted. The pre-approval period typically takes several weeks to months. During this time, Keenan Husselmann continues to operate the business as a sole practitioner. No staff will be formally employed until loan funds are confirmed and disbursed.", { size: 17, color: DARK, italics: true })], { spacing: { after: 120 } }),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: implW,
      rows: [
        tblHead(["Phase", "Timeline", "Activities"], implW),
        tblRow(["Pre-Approval", "Now → Approval", "Keenan operates solo. Revenue maintained at ~N$7,000/month. Team candidates identified and on standby. No formal hiring until funds confirmed."], implW, false, true),
        tblRow(["Phase 1", "Month 1–2", "Loan received. Formal employment commences. All staff registered with SSC within first week. Hardware procured. Team onboarded."], implW, true, true),
        tblRow(["Phase 2", "Month 3–6", "Full team operational. Marketing Officer launches campaigns. Target 5 new clients per month. Build retainer base targeting 8 active retainer clients by Month 6."], implW, false, true),
        tblRow(["Phase 3", "Month 7–12", "Scale operations. Target 15+ active clients and retainer subscriptions. Revenue should reach N$60,000/month."], implW, true, true),
        tblRow(["Phase 4", "Year 2 onward", "Commence NYDF loan repayments. Scale both Namibia and South Africa client bases. Register for PAYE and VAT as thresholds are reached."], implW, false, true),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    divider(),
    ...h2("3.2", "Pre-Registration Trading History"),
    body("Prior to formal CC registration on 12 May 2026, the business operated as a sole proprietor under the Swift Designz brand from January 2026."),
    bullet("Total income (January to May 2026, 5 months): N$41,000"),
    bullet("Total expenses (January to May 2026): approximately N$5,000"),
    bullet("Net profit over 5 months: N$36,000 (approximately 88% profit margin)"),
    bullet("Average monthly gross revenue: N$8,200"),
    body("Current monthly revenue of N$7,000 to N$7,300 is made up of three recurring sources:"),
    bullet("3 active retainer clients on 1-year service contracts: N$2,800 per month combined"),
    bullet("1 private investor contribution: N$2,000 per month (5-year commitment)"),
    bullet("Client project deposit payments at 50% upfront on projects averaging N$5,000: approximately N$2,500 per month"),
    divider(),
    ...h2("3.3", "Loan Use Breakdown"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: loanW,
      rows: [
        tblHead(["Category", "Description", "Cost (N$)"], loanW),
        tblRow(["Hardware", "iMac 24-inch M4 (full kit), 2× external monitors, monitor arm, SSD, ergonomic chair, printer and toner, document shredder, iPhone 16 (128GB), iPad Air 11-inch, UPS, NAS storage", "114,250"], loanW, false, true),
        tblRow(["Professional and Legal Reserve", "Lawyer fees, accounting and audit fees, business insurance premiums", "75,000"], loanW, true, true),
        new TableRow({ children: [totalCell("Subtotal: Equipment and Reserve", loanW[0] + loanW[1]), totalCell("189,250", loanW[2], AlignmentType.RIGHT)] }),
        tblRow(["Operational Staffing (12 months)", "5 youth employees at N$32,000 per month combined for 12 months", "384,000"], loanW, false, true),
        tblRow(["Employer Statutory Costs", "Social Security and statutory employer contributions (~2%)", "7,750"], loanW, true, true),
        tblRow(["Recruitment and Setup", "Job advertising, SSC registration fees, and administrative costs", "9,000"], loanW, false, true),
        new TableRow({ children: [totalCell("Subtotal: Working Capital", loanW[0] + loanW[1]), totalCell("400,750", loanW[2], AlignmentType.RIGHT)] }),
        tblRow(["Total Funding Requirement", "", "590,000"], loanW, false, true),
        tblRow(["Less: Own Contribution (existing equipment, in-kind)", "", "(40,000)"], loanW, true, false),
        new TableRow({ children: [totalCell("LOAN AMOUNT REQUESTED", loanW[0] + loanW[1]), totalCell("N$550,000", loanW[2], AlignmentType.RIGHT)] }),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    divider(),
    ...h2("3.3.1", "Key Financial Assumptions"),
    bullet("Month 1 revenue of N$25,000 reflects ~10 active clients built during pre-approval (6–12 months). Those clients are handed to the new team at funding date; director immediately pursues next 10. Breakeven at Month 3."),
    bullet("Operating costs start at N$34,500 and rise to N$40,000 by Month 12 as tools, hosting, licences, admin fees, and subscriptions accumulate. Base payroll and SSC: N$32,640."),
    bullet("Hardware (N$114,250) and professional reserve (N$75,000) drawn upfront from loan at Month 1. Month 1 counts from disbursement date, not application date."),
    bullet("No rent or office costs — fully remote. Employees provide own devices; company covers team software licences only (~N$650/mo Google Workspace for 6 users)."),
    bullet("12-month grace period — no loan repayments during Year 1. Interest assumed at 4% per annum (conservative). Investor income N$2,000/mo continues for 5 years."),
    divider(),
    ...h2("3.3.1a", "Revenue Composition: Solo Baseline vs Month 12 Target"),
    body("The table below shows two scenarios: the pre-funding solo baseline (maximum 10 active project clients, currently 5), and the Month 12 target once the full team is operational."),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: revW,
      rows: [
        tblHead(["Revenue Source", "Solo (N$)", "Month 12 (N$)", ""], revW),
        tblRow(["Website retainer subscriptions (7 clients)", "5,600", "5,600", ""], revW, false, false),
        tblRow(["eStore retainer subscriptions (3 clients)", "3,600", "3,600", ""], revW, true, false),
        tblRow(["Active project clients (5 solo / 12 with team)", "16,935", "40,600", ""], revW, false, false),
        tblRow(["AI and PM training sessions (1/month)", "3,000", "3,000", ""], revW, true, false),
        tblRow(["Ad hoc consulting and one-off services", "2,000", "5,200", ""], revW, false, false),
        tblRow(["Investor contributions", "2,000", "2,000", ""], revW, true, false),
        new TableRow({ children: [totalCell("Total Monthly Revenue", revW[0]), totalCell("33,135", revW[1], AlignmentType.RIGHT), totalCell("60,000", revW[2], AlignmentType.RIGHT), totalCell("", revW[3])] }),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    divider(),
    ...h2("3.3.2", "Year 1: Monthly Cash Flow Projection (Operating)"),
    body("Note: Monthly operating costs exclude the one-time hardware purchase (N$114,250) and professional reserve (N$75,000) which are funded upfront from the loan at the start of Month 1."),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: cfW,
      rows: [
        tblHead(["Month", "Revenue (N$)", "Oper. Costs (N$)", "Net (N$)"], cfW),
        ...months.map(([mo, rev, cost, net], i) =>
          tblRow([mo, rev, cost, net], cfW, i % 2 !== 0, true)
        ),
        new TableRow({ children: ["TOTALS", "583,000", "447,000", "136,000"].map((t, i) => totalCell(t, cfW[i], i > 0 ? AlignmentType.RIGHT : AlignmentType.LEFT)) }),
      ],
    }),
    p([], { spacing: { after: 120 } }),
    body("Month 1 starts at N$25,000 because by the time funding is received (pre-approval typically 6 to 12 months), the director will have grown the client base to approximately 10 active clients. Those clients are handed to the new staff team, freeing the director to pursue the next 10 immediately. The business reaches breakeven at Month 3 and generates a full-year operating surplus of N$136,000. Combined with the upfront hardware and reserve draw of N$189,250, the total Year 1 loan utilisation is approximately N$53,250, leaving N$496,750 of the N$550,000 loan intact as a repayment buffer from Year 2."),
    divider(),
    ...h2("3.3.3", "Income Statement Projection (Year 1)"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [7638, 2000],
      rows: [
        tblHead(["Income Statement Item", "Year 1 (N$)"], [7638, 2000]),
        tblRow(["Total Revenue", "583,000"], [7638, 2000], false, true),
        tblRow(["Less: Cost of Services (hosting, domains, software per project)", "(18,000)"], [7638, 2000], true, false),
        new TableRow({ children: [totalCell("Gross Profit", 7638), totalCell("565,000", 2000, AlignmentType.RIGHT)] }),
        tblRow(["Salaries and wages (5 staff, 12 months)", "(384,000)"], [7638, 2000], false, false),
        tblRow(["Employer SSC contributions (~2%)", "(7,750)"], [7638, 2000], true, false),
        tblRow(["Recruitment and setup costs", "(9,000)"], [7638, 2000], false, false),
        tblRow(["Software, tools, and subscriptions", "(22,000)"], [7638, 2000], true, false),
        tblRow(["Marketing and advertising", "(12,000)"], [7638, 2000], false, false),
        tblRow(["Administration and document fees", "(3,250)"], [7638, 2000], true, false),
        new TableRow({ children: [totalCell("Total Operating Expenses", 7638), totalCell("(438,000)", 2000, AlignmentType.RIGHT)] }),
        new TableRow({ children: [totalCell("Net Operating Surplus", 7638), totalCell("127,000", 2000, AlignmentType.RIGHT)] }),
        tblRow(["Less: Equipment depreciation (N$114,250 over 3 years)", "(38,083)"], [7638, 2000], false, false),
        new TableRow({ children: [totalCell("NET PROFIT BEFORE TAX (Year 1)", 7638), totalCell("88,917", 2000, AlignmentType.RIGHT)] }),
      ],
    }),
    p([], { spacing: { after: 120 } }),
    body("Note: No loan repayments in Year 1 (12-month grace period). Hardware and professional reserve (N$189,250) are funded upfront from the loan and excluded from operating expenses above. Depreciation is calculated on hardware only over 3 years."),
    divider(),
    ...h2("3.3.4", "3-Year Financial Projection Summary"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: yr3W,
      rows: [
        tblHead(["Item", "Year 1 (2026/27)", "Year 2 (2027/28)", "Year 3 (2028/29)"], yr3W),
        tblRow(["Annual Revenue (N$)", "583,000", "1,044,000", "1,560,000"], yr3W, false, true),
        tblRow(["Monthly Revenue (average)", "48,583", "87,000", "130,000"], yr3W, true, true),
        tblRow(["Annual Operating Costs (N$)", "447,000", "510,000", "560,000"], yr3W, false, true),
        tblRow(["Loan Repayment (annual)", "none", "150,000", "150,000"], yr3W, true, true),
        tblRow(["Total Annual Costs (N$)", "447,000", "660,000", "710,000"], yr3W, false, true),
        tblRow(["Net Profit or (Loss) (N$)", "136,000", "384,000", "850,000"], yr3W, true, true),
        tblRow(["Staff headcount (year-end)", "6", "9", "12"], yr3W, false, true),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    body("Year 1 note: Revenue starts strong at Month 1 because the director will have built approximately 10 active clients during the pre-approval waiting period. The operating surplus of N$136,000 means the loan is used primarily to fund the hardware and professional reserve upfront, not to cover operating losses."),
    body("Year 2 revenue growth is driven by an established team at full capacity, an active retainer base of 15+ clients, and continued growth of the South Africa client base."),
    divider(),
    ...h2("3.3.5", "Loan Repayment Projection"),
    body("Repayment commences after the 12-month grace period (from approximately June 2027). At a 4% interest rate over the remaining 48 months:"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: repW,
      rows: [
        tblHead(["Detail", "Amount"], repW),
        tblRow(["Principal (loan amount)", "N$550,000"], repW, false, false),
        tblRow(["Grace period", "12 months (no repayments)"], repW, true, false),
        tblRow(["Repayment period after grace", "48 months"], repW, false, false),
        tblRow(["Total repayment period", "60 months (5 years)"], repW, true, false),
        tblRow(["Interest rate (assumed, conservative)", "4% per annum"], repW, false, false),
        tblRow(["Estimated monthly repayment from Month 13", "N$12,500"], repW, true, false),
        tblRow(["Estimated annual repayment", "N$150,000"], repW, false, false),
        tblRow(["Repayment start date (estimated)", "June 2027"], repW, true, false),
        tblRow(["Repayment end date (estimated)", "May 2031"], repW, false, false),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    body("By Month 13 when repayments begin, the business projects monthly revenue of N$65,000 to N$85,000. Monthly operating costs at that point will be approximately N$40,000, giving a monthly surplus of N$25,000 to N$45,000 from which to service the repayment of N$12,500 per month. The business will be profitable and able to repay the loan from operational income."),
    pgBreak(),
  ];
}

function marketingPlan(): DocChild[] {
  const tgtW = [2000, 4238, 3400];
  const cmpW = [1800, 2200, 2438, 3200];
  return [
    h1("Section 04 — Marketing Plan"),
    ...h2("4.1", "Industry Analysis"),
    body("Namibian SMEs either lack a proper digital presence or are paying high prices to agencies out of reach for small businesses. Swift Designz fills this gap: professional digital work at prices Namibian businesses can actually afford (N$2,500 to N$10,000), delivered by a local remote team with no travel overhead."),
    divider(),
    ...h2("4.1.1", "SWOT Analysis"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [CONTENT_W / 2, CONTENT_W / 2],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: CONTENT_W / 2, type: WidthType.DXA },
              borders: allBorders(RULE),
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                p([bold("Strengths", 18)], { spacing: { after: 80 } }),
                ...[
                  "Already generating revenue from real clients",
                  "Proven technical capability (built own admin platform)",
                  "Pricing 30–50% below comparable Cape Town agencies",
                  "Fully remote with no overhead on office space",
                  "Live website with active lead intake and CRM system",
                  "Apple hardware enables full cross-platform delivery",
                ].map(t => p([run("- " + t, { size: 17, color: DARK })], { spacing: { after: 60 } })),
              ],
            }),
            new TableCell({
              width: { size: CONTENT_W / 2, type: WidthType.DXA },
              borders: allBorders(RULE),
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                p([bold("Weaknesses", 18)], { spacing: { after: 80 } }),
                ...[
                  "Business formally registered only in May 2026",
                  "No physical office (some clients prefer face-to-face)",
                  "Revenue is still in early growth phase",
                  "Two team members are still studying as interns",
                  "Limited brand awareness outside existing network",
                ].map(t => p([run("- " + t, { size: 17, color: DARK })], { spacing: { after: 60 } })),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: CONTENT_W / 2, type: WidthType.DXA },
              borders: allBorders(RULE),
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                p([bold("Opportunities", 18)], { spacing: { after: 80 } }),
                ...[
                  "Large underserved SME market across Namibia",
                  "Government digitisation drive creates demand",
                  "South Africa expansion adds a large secondary market",
                  "Growing demand for AI integration services",
                  "No dominant low-cost digital agency in Namibia",
                ].map(t => p([run("- " + t, { size: 17, color: DARK })], { spacing: { after: 60 } })),
              ],
            }),
            new TableCell({
              width: { size: CONTENT_W / 2, type: WidthType.DXA },
              borders: allBorders(RULE),
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                p([bold("Threats", 18)], { spacing: { after: 80 } }),
                ...[
                  "Established agencies with more resources and reputation",
                  "Client payment delays affecting cash flow",
                  "Internet and power reliability in Namibia",
                  "Intern staff may leave when studies are complete",
                  "Global website builders as DIY alternatives",
                ].map(t => p([run("- " + t, { size: 17, color: DARK })], { spacing: { after: 60 } })),
              ],
            }),
          ],
        }),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    divider(),
    ...h2("4.1.2", "Target Markets and Market Share Estimates"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: tgtW,
      rows: [
        tblHead(["Market Segment", "Description", "Priority"], tgtW),
        tblRow(["Namibian SMEs", "Small and medium businesses needing websites, e-commerce, or apps", "Primary, active now"], tgtW, false, true),
        tblRow(["South Africa SMEs", "Existing client base with live stores and websites already deployed", "Primary, active now"], tgtW, true, true),
        tblRow(["NGOs and Non-profits", "Organisations needing professional web presence and donor-facing platforms", "Primary, Year 1"], tgtW, false, true),
        tblRow(["Startups and Entrepreneurs", "New businesses needing a digital foundation from day one", "Primary, Year 1"], tgtW, true, true),
        tblRow(["Government and Parastatals", "Public entities requiring web systems, portals, and digital tools", "Secondary, Year 2"], tgtW, false, true),
      ],
    }),
    p([], { spacing: { after: 120 } }),
    body("Year 1 target: 3 to 5 new clients per month — conservative given 70,000+ registered Namibian businesses and an average project value of N$3,500 to N$10,000."),
    divider(),
    ...h2("4.1.3", "Market Segment Notes"),
    h3("Namibian SMEs"),
    body("The largest and most accessible segment. Our pricing (N$2,500 to N$10,000) is within reach for a small business. Retainer subscriptions after launch create recurring revenue and long-term client relationships."),
    h3("South Africa SMEs"),
    body("An active market already generating revenue. SA businesses are comfortable transacting remotely and willing to pay for quality. Our Namibian pricing is 30 to 50% below comparable Cape Town agency rates — a strong competitive advantage."),
    h3("NGOs and Non-profits"),
    body("NGOs require professional web presence for donor credibility and grant applications. They tend to have allocated digital budgets and prefer long-term support arrangements. Maintenance retainers are well-suited to this segment."),
    h3("Startups and Entrepreneurs"),
    body("Early-stage businesses need a digital foundation quickly and at low cost. Many become long-term clients as they grow. This segment has high lifetime value relative to the initial project cost."),
    h3("Government and Parastatals"),
    body("A secondary target requiring longer sales cycles and formal procurement processes. Year 2 priority once the business has a portfolio and team capacity to handle public sector delivery requirements."),
    divider(),
    ...h2("4.1.4", "Competition and Competitive Positioning"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: cmpW,
      rows: [
        tblHead(["Competitor Type", "What They Offer", "Their Weakness", "Our Advantage"], cmpW),
        tblRow(["Large local agencies", "Full-service digital, branding, marketing", "High prices, slow, not focused on SMEs", "Transparent pricing, fast turnaround, affordable for SMEs"], cmpW, false, true),
        tblRow(["Individual freelancers", "Website builds, one-person operation", "No team, unreliable, no post-launch support", "Team capacity, consistent quality, after-sale support"], cmpW, true, true),
        tblRow(["DIY platforms (Wix etc.)", "Self-service website builders", "No custom builds, limited functionality", "Custom solutions, professional results"], cmpW, false, true),
        tblRow(["Overseas agencies", "Remote-built digital services", "No local context, foreign currency pricing", "Locally based, NAD pricing, cultural understanding"], cmpW, true, true),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    divider(),
    ...h2("4.2", "Promotion and Advertising Strategy"),
    h3("Digital Marketing (Primary Channel)"),
    bullet("Live business website (swiftdesignz.co.za) with integrated quote request and contact forms that feed directly into our CRM. All leads are automatically tracked and followed up."),
    bullet("Facebook and Instagram business pages with regular content showcasing completed projects, client testimonials, and service promotions targeted at Namibian SMEs."),
    bullet("LinkedIn presence for corporate and government sector outreach."),
    bullet("Targeted Facebook and Google paid advertising campaigns managed by the Marketing Officer with a monthly budget of N$2,000 to N$5,000."),
    bullet("Google Business listing for local search visibility."),
    h3("Referral Network"),
    bullet("Existing freelance clients will be converted to formal clients with proper onboarding and retainer agreements."),
    bullet("Client referral programme offering a discount on their next invoice for every successful referral."),
    bullet("Partnership with IT-Guru to cross-refer clients needing hosting alongside development services."),
    h3("South Africa Market"),
    bullet("Build on existing SA client base through direct outreach and referrals from satisfied clients."),
    bullet("Leverage lower pricing vs. Cape Town agencies as a key differentiator."),
    pgBreak(),
  ];
}

function operationsPlan(): DocChild[] {
  const eqW = [1400, 2200, 2200, 1638, 2200];
  return [
    h1("Section 05 — Operations and Technology"),
    ...h2("5.1", "Operations Overview"),
    body("Swift Designz operates a clean, fully digital workflow from first contact through to final delivery and ongoing support. All project management, communication, invoicing, and client delivery happens through digital tools. There are no physical premises, no raw materials, and no inventory."),
    body("Inputs: Google Workspace (N$650/mo for 6 users, company-covered); cloud hosting; domain/SSL per project. Employees provide own internet and devices; company covers team software only."),
    divider(),
    ...h2("5.2", "Delivery Methodology"),
    h3("Project Delivery"),
    bullet("Lead capture via website form → auto-logged to CRM → quotation within 24 hours."),
    bullet("Signed quotation acceptance (digital) → 50% deposit invoice raised."),
    bullet("Project tracked in shared project management tool (GitHub + CRM)."),
    bullet("Quality assurance review by QA Tester before any client delivery."),
    bullet("Final delivery + 50% balance invoice → retainer offer for post-launch support."),
    h3("Retainer Management"),
    bullet("Monthly retainer clients are invoiced on the 1st of each month."),
    bullet("All retainer tasks tracked in CRM with SLA response times."),
    bullet("Annual retainer renewal with updated pricing and scope."),
    divider(),
    ...h2("5.3", "Organisation of Operations and Outputs"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [1800, 4438, 3400],
      rows: [
        tblHead(["Role", "Responsibilities", "Key Outputs"], [1800, 4438, 3400]),
        tblRow(["Director and Developer", "Client projects, technical architecture, quality sign-off, business strategy", "Websites, apps, project delivery"], [1800, 4438, 3400], false, true),
        tblRow(["Business Admin", "Finance administration, client billing, quotation management, SSC registration, HR admin", "Invoices, quotations, financial reports, employment records"], [1800, 4438, 3400], true, true),
        tblRow(["Project Manager", "Project planning, timeline management, client coordination, delivery oversight", "Project plans, status reports, on-time delivery"], [1800, 4438, 3400], false, true),
        tblRow(["Systems Admin", "Internal IT, network management, server maintenance, team tech support", "Stable infrastructure, uptime"], [1800, 4438, 3400], true, true),
        tblRow(["Marketing Officer", "Social media, advertising, content creation, lead generation", "Leads, brand presence, content"], [1800, 4438, 3400], false, true),
        tblRow(["QA Tester", "Testing all builds before delivery, bug reports, quality documentation", "Tested deliverables, test reports"], [1800, 4438, 3400], true, true),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    divider(),
    ...h2("5.4", "Technology and Equipment"),
    body("The following equipment will be procured using the loan funds. Actual supplier quotations will be obtained from Namibian IT suppliers prior to disbursement."),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: eqW,
      rows: [
        tblHead(["Category", "Item", "Purpose", "Est. Cost", ""], eqW),
        tblRow(["Computing", "iMac 24-inch M4 (10-core, 24GB, 512GB, Green)", "Primary workstation. Full kit incl. keyboard, mouse, and 24-inch display.", "45,899", ""], eqW, false, true),
        tblRow(["Computing", "2× External Monitors (24-inch)", "Extended dual-screen workspace for multitasking", "7,000", ""], eqW, true, true),
        tblRow(["Computing", "External SSD (1TB)", "Fast project backups and portable file storage", "1,800", ""], eqW, false, true),
        tblRow(["Workspace", "Monitor Arm", "Frees desk space, ideal monitor positioning", "1,200", ""], eqW, true, true),
        tblRow(["Workspace", "Document Shredder", "Secure disposal of client documents (POPIA compliance)", "1,300", ""], eqW, false, true),
        tblRow(["Workspace", "Business Laser Printer", "Printing contracts, invoices, and client documents", "3,000", ""], eqW, true, true),
        tblRow(["Workspace", "Printer Toner Cartridges (initial supply)", "2 full replacement sets", "1,500", ""], eqW, false, true),
        tblRow(["Workspace", "Ergonomic Office Chair", "Full-time remote work setup — essential for health and productivity", "3,300", ""], eqW, true, true),
        tblRow(["Mobile", "iPhone 16 (128GB)", "iOS testing and verification.", "22,000", ""], eqW, false, true),
        tblRow(["Mobile", "iPad Air M2/M3 (11-inch)", "Design reviews, client presentations, and note-taking", "15,000", ""], eqW, true, true),
        tblRow(["Networking", "UPS Battery Backup (1000VA)", "Equipment protection during power outages", "3,250", ""], eqW, false, true),
        tblRow(["Networking", "NAS Network Storage (2-bay)", "Centralised file server and backups", "8,000", ""], eqW, true, true),
        tblRow(["Reserve", "Professional and Legal Reserve", "Lawyer fees, accounting fees, business insurance", "75,000", ""], eqW, false, true),
        new TableRow({ children: [totalCell("Total Hardware and Reserve", eqW[0] + eqW[1] + eqW[2] + eqW[3]), totalCell("189,250", eqW[4], AlignmentType.RIGHT)] }),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    pgBreak(),
  ];
}

function statistics(): DocChild[] {
  const apW = [4638, 5000];
  const blW = [4638, 5000];
  const empW = [6638, 3000];
  return [
    h1("Section 06 — Statistics"),
    ...h2("Applicant Profile", ""),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: apW,
      rows: [
        tblHead(["Category", "Detail"], apW),
        tblRow(["PDN Ownership (%)", "85% (Keenan Husselmann)"], apW, false, true),
        tblRow(["Women Ownership (%)", "0%"], apW, true, true),
        tblRow(["Youth Ownership (%)", "85% (controlling director, aged 31)"], apW, false, true),
        tblRow(["Age of Youth (applicant)", "31 years"], apW, true, true),
        tblRow(["Education Qualification", "BSc Computer Science (Software Development), NUST"], apW, false, true),
        tblRow(["Employment Status at Application", "Self-employed (sole director)"], apW, true, true),
        tblRow(["Year of Business Registration", "2026"], apW, false, true),
        tblRow(["Business Stage", "Startup / Early Growth"], apW, true, true),
        tblRow(["Business Traded Formally", "Yes"], apW, false, true),
        tblRow(["SME or Large Enterprise", "SME"], apW, true, true),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    ...h2("Business Location & Classification", ""),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: blW,
      rows: [
        tblHead(["Category", "Detail"], blW),
        tblRow(["Industry", "ICT / Digital Services"], blW, false, true),
        tblRow(["Economic Sector", "Technology and Innovation"], blW, true, true),
        tblRow(["Town", "Windhoek"], blW, false, true),
        tblRow(["Region", "Khomas"], blW, true, true),
        tblRow(["Constituency", "Windhoek East"], blW, true, true),
        tblRow(["Rural or Urban", "Urban"], blW, false, true),
        tblRow(["Sales Region", "Namibia and South Africa (both active)"], blW, true, true),
        tblRow(["Innovation / Tech Driven", "Yes"], blW, false, true),
        tblRow(["Market Linkages", "Yes"], blW, true, true),
        tblRow(["Business Development Services", "No"], blW, false, true),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    ...h2("Employment Statistics", ""),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: empW,
      rows: [
        tblHead(["Category", "Count"], empW),
        tblRow(["New Permanent Jobs Created (direct result of NYDF funding)", "5"], empW, false, true),
        tblRow(["Retained Jobs (director, continuing from freelance)", "1"], empW, true, true),
        tblRow(["Skilled Jobs (developer, business admin, HR, marketing)", "4"], empW, false, true),
        tblRow(["Semi-Skilled Jobs (systems admin intern, QA intern)", "2"], empW, true, true),
        tblRow(["Direct Jobs (within the funded enterprise)", "6"], empW, false, true),
        tblRow(["Indirect Jobs (accounting officer, hosting partner, supplier support)", "~3"], empW, true, true),
        tblRow(["Youth Employed (all team members under 35)", "6"], empW, false, true),
        tblRow(["Women Employed (Georgia Orren, Requelle Husselmann, Shakira Linno)", "3"], empW, true, true),
        tblRow(["People with Disabilities Employed", "0"], empW, false, true),
        tblRow(["People from Marginalised Communities", "0"], empW, true, true),
      ],
    }),
    p([], { spacing: { after: 160 } }),
    ...h2("Short Description of Business Activities", ""),
    body("Swift Designz Investments CC is a Namibian digital technology company that provides website development, e-commerce solutions, web and mobile application development, AI and project management training, and monthly maintenance retainer services. The business operates fully remotely and already serves active clients in both Namibia and South Africa, with live e-commerce stores and websites running in both markets. All services are delivered digitally. The business is 85% youth-owned, tech-driven, and designed to scale."),
    kv("Enterprise Owned by Person with Disability", "No"),
    kv("Innovation and Tech Driven", "Yes"),
    kv("Market Linkages", "Yes (IT-Guru hosting partner, private investor, accounting officer)"),
    kv("Business Development Services", "No"),
  ];
}

// ── MAIN EXPORT ───────────────────────────────────────────────

export async function generateBusinessPlanDocx(): Promise<Buffer> {
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: "–",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 360 } } },
          }],
        },
      ],
    },
    styles: {
      default: {
        document: { run: { font: "Arial", size: 18, color: DARK } },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 32, bold: true, font: "Arial", color: BLACK },
          paragraph: { spacing: { before: 0, after: 160 }, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, font: "Arial", color: BLACK },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: 16838 },
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  run("Swift Designz Investments CC  |  NYDF Business Plan 2026", { size: 14, color: LIGHT }),
                ],
                border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: RULE, space: 4 } },
                spacing: { after: 120 },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  run("Swift Designz Investments CC  ·  CC/2026/05589  ·  Windhoek, Namibia", { size: 14, color: LIGHT }),
                  run("   ", { size: 14 }),
                  new TextRun({ children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], font: "Arial", size: 14, color: LIGHT }),
                ],
                border: { top: { style: BorderStyle.SINGLE, size: 2, color: RULE, space: 4 } },
                alignment: AlignmentType.LEFT,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tabStops: [{ type: "right" as any, position: CONTENT_W }],
              }),
            ],
          }),
        },
        children: [
          ...coverPage(),
          ...tableOfContents(),
          ...coverLetter(),
          ...executiveSummary(),
          ...companyInfo(),
          ...managementPlan(),
          ...financialInfo(),
          ...marketingPlan(),
          ...operationsPlan(),
          ...statistics(),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc) as Promise<Buffer>;
}
