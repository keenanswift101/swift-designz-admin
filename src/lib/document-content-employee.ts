import type { TemplateDocument } from "@/components/documents/pdf-styles";

const COMPANY = "Swift Designz Investments CC";
const CC_REG = "CC/2026/05589";
const ADDR = "Erf 55 Kenneth McArthur Street, Auas Blick, Windhoek, Namibia";
const EMAIL = "info@swiftdesignz.co.za";
const EFFECTIVE = "June 2026";

/* ================================================================
   COMPANY INFO
   ================================================================ */

export const companyOverview: TemplateDocument = {
  title: "Company Overview",
  subtitle: "Welcome to Swift Designz",
  ref: "SD-CO-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: `Welcome to ${COMPANY}. This document provides an introduction to who we are, what we do, and what we stand for. Please read it carefully as part of your onboarding.`,
    },
    {
      type: "section",
      number: "01",
      title: "Who We Are",
      bullets: [
        `${COMPANY} is a registered Close Corporation (${CC_REG}) based in Windhoek, Namibia.`,
        "We specialise in web design, web development, e-commerce solutions, app development, AI training, and digital consulting.",
        "Our Managing Member is Keenan Husselmann. Our Accounting Officer is Rachel N. Kashala (SAIBA 4132).",
        `Our physical address is ${ADDR}.`,
        "We serve clients across Namibia and the broader Southern African region.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Our Mission",
      body: "To deliver high-quality digital products and services that help businesses grow, operate efficiently, and compete in a modern economy.",
    },
    {
      type: "section",
      number: "03",
      title: "Our Values",
      bullets: [
        "Quality First — we do not ship work we are not proud of.",
        "Client Respect — clients trust us with their business; we honour that trust.",
        "Ownership — every team member owns their work from start to finish.",
        "Continuous Learning — technology changes fast; we stay ahead.",
        "Integrity — we are honest in communication, pricing, and timelines.",
        "Efficiency — we build systems and processes that save time and reduce errors.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Services We Offer",
      bullets: [
        "Website Design & Development (starter, professional, premium tiers)",
        "E-Commerce Store Builds (Shopify, WooCommerce, custom)",
        "App & Software Development (MVP to full-scale)",
        "AI Workflow Training (individual and team sessions)",
        "Project Management Training (Agile, Scrum, Kanban)",
        "Digital Consulting and Strategy",
        "Maintenance Retainers (monthly support packages)",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Financial Year",
      body: "Our financial year ends on the last day of February each year. All financial reporting, budgets, and performance reviews align to this cycle.",
    },
    {
      type: "section",
      number: "06",
      title: "Contact",
      bullets: [
        `Email: ${EMAIL}`,
        "Website: swiftdesignz.co.za",
        "Admin Portal: admin.swiftdesignz.co.za",
        `Address: ${ADDR}`,
      ],
    },
  ],
};

export const brandGuide: TemplateDocument = {
  title: "Brand & Design Guidelines",
  subtitle: "Visual Identity & Communication Standards",
  ref: "SD-BG-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "These guidelines ensure consistent representation of the Swift Designz brand across all client-facing materials, internal documents, and digital products. All team members must follow these standards.",
    },
    {
      type: "section",
      number: "01",
      title: "Colours",
      bullets: [
        "Primary Teal: #30B0B0 — used for headings, CTAs, highlights, and brand accents.",
        "Dark Background: #101010 — default page/screen background.",
        "Surface Dark: #303030 — card and panel backgrounds.",
        "White / Off-White: #F5F5F5 — body text on dark backgrounds.",
        "Do not use bright yellows, pinks, or neons. The palette is professional and minimal.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Typography",
      bullets: [
        "Primary font: Inter (Google Fonts). Use for all UI, documents, and emails.",
        "Headings: Inter Bold or SemiBold, letter-spacing 2–4px, uppercase for labels.",
        "Body text: Inter Regular, 13–14px, line-height 1.6.",
        "Monospace (code blocks): JetBrains Mono or system monospace.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Logo Usage",
      bullets: [
        "The Swift Designz logo is the primary brand mark. Do not stretch, recolour, or modify it.",
        "Use the teal version on dark backgrounds, the dark version on light backgrounds.",
        "Minimum clear space: 16px on all sides.",
        "Do not place the logo on busy photographic backgrounds.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Tone of Voice",
      bullets: [
        "Professional but approachable — no corporate jargon.",
        "Direct and clear — state what you mean, no padding.",
        "No emojis in formal documents, invoices, or emails.",
        "No faith references, political commentary, or personal opinions in company communications.",
        "First-person plural (we, our) for company communications. First-person singular (I, my) only in personal correspondence.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Document Standards",
      bullets: [
        "All PDFs use the standard Swift Designz PDF template (black and white).",
        "Use the admin portal for all client-facing document generation — never freehand in Word.",
        "Document numbers follow the format SD26-XXX-001 (year prefix, type code, sequential number).",
        "All documents include the CC registration number and NamRA TIN where applicable.",
      ],
    },
  ],
};

export const orgStructure: TemplateDocument = {
  title: "Organisation Structure",
  subtitle: "Roles, Reporting Lines & Responsibilities",
  ref: "SD-ORG-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This document defines the organisational structure of Swift Designz Investments CC, including roles, reporting lines, and key responsibilities.",
    },
    {
      type: "section",
      number: "01",
      title: "Leadership",
      bullets: [
        "Managing Member: Keenan Husselmann — overall business direction, client relationships, product decisions, financial oversight.",
        "Accounting Officer: Rachel N. Kashala (SAIBA 4132) — financial statements, tax compliance, NamRA submissions.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Departments",
      bullets: [
        "Development — responsible for all web, app, and software builds.",
        "Design — UI/UX, brand assets, and visual content.",
        "Operations — admin portal, billing, client communication, and project coordination.",
        "Marketing — social media, content, and lead generation (currently handled by Managing Member).",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Reporting Lines",
      bullets: [
        "All team members report directly to the Managing Member unless a project lead is designated.",
        "Project leads are assigned per-project and are responsible for deliverables, timelines, and client updates.",
        "AI agents are supervised by the Managing Member and logged in the Team section of the admin portal.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Decision Authority",
      bullets: [
        "Pricing changes: Managing Member only.",
        "New client acceptance: Managing Member approval required.",
        "Scope changes on active projects: requires written Change Request (see SOP-CR).",
        "Vendor/tool subscriptions over N$500/month: Managing Member approval.",
        "Emergency decisions: team member acts and reports to Managing Member within 24 hours.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Admin Portal Access Levels",
      bullets: [
        "Admin — full system access (Managing Member only).",
        "Viewer — billing, quotations, leads (operations staff).",
        "Employee — documents and settings only (new staff, contractors).",
        "Investor — restricted investor portal.",
      ],
    },
  ],
};

/* ================================================================
   LEGAL & COMPLIANCE
   ================================================================ */

export const employeeNda: TemplateDocument = {
  title: "Employee Confidentiality Agreement",
  subtitle: "Non-Disclosure & Confidentiality Policy",
  ref: "SD-NDA-EMP-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: `This Confidentiality Agreement is between ${COMPANY} ("the Company") and each employee, contractor, or team member ("you"). By working with the Company you agree to these terms.`,
    },
    {
      type: "section",
      number: "01",
      title: "Confidential Information",
      body: "Confidential information includes, but is not limited to:",
      bullets: [
        "Client names, contact details, project scope, pricing, and payment terms.",
        "Source code, system architecture, database schemas, and admin portal credentials.",
        "Financial data: revenue, expenses, profit, salaries, and investor details.",
        "Business strategies, roadmaps, pricing models, and sales pipelines.",
        "Internal tools, workflows, SOPs, and operational procedures.",
        "Any information marked 'confidential' or disclosed in a context where confidentiality is implied.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Obligations",
      bullets: [
        "You must not disclose confidential information to any third party without prior written consent from the Managing Member.",
        "You must use confidential information only for the purpose of performing your duties.",
        "You must store confidential information securely and not on personal devices without authorisation.",
        "You must immediately report any suspected or actual breach to the Managing Member.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Duration",
      body: "These obligations remain in force during your engagement and for a period of 2 years after the end of your engagement, regardless of how it ends.",
    },
    {
      type: "section",
      number: "04",
      title: "Consequences of Breach",
      bullets: [
        "Breach of this agreement may result in immediate termination of your engagement.",
        "The Company reserves the right to pursue civil damages for any loss caused by a breach.",
        "Certain breaches may constitute criminal offences under Namibian law.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Exceptions",
      body: "Confidentiality does not apply to information that: (a) is or becomes publicly known through no fault of yours; (b) you already possessed before engagement; (c) you received from a third party with no confidentiality obligation; (d) you are required by law to disclose.",
    },
  ],
};

export const dataProtectionPolicy: TemplateDocument = {
  title: "Data Protection & Privacy Policy",
  subtitle: "Handling of Personal and Client Data",
  ref: "SD-DPP-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "Swift Designz Investments CC collects and processes personal data in the course of providing services. This policy sets out how we handle that data and what is expected of all staff.",
    },
    {
      type: "section",
      number: "01",
      title: "Data We Collect",
      bullets: [
        "Client data: name, company, email, phone, physical address, banking details.",
        "Project data: scope, deliverables, communication history.",
        "Financial data: invoice amounts, payment records, tax information.",
        "Employee data: name, contact details, employment contract, salary.",
        "Visitor data: IP addresses, browser details (for hosted sites).",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "How We Use Data",
      bullets: [
        "To deliver contracted services to clients.",
        "To issue invoices, receipts, and financial statements.",
        "To comply with NamRA tax obligations (TIN: 16271273).",
        "To manage employment and contractor relationships.",
        "We do not sell, rent, or share personal data with third parties for marketing.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Data Storage",
      bullets: [
        "All client and financial data is stored in Supabase (PostgreSQL, encrypted at rest).",
        "Documents are stored in Supabase Storage.",
        "Email services use Resend (GDPR-compliant).",
        "No personal data is stored on personal devices or unencrypted local drives.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Staff Obligations",
      bullets: [
        "Only access data necessary for your assigned tasks.",
        "Do not export or copy client data to personal storage.",
        "Report data loss or unauthorised access immediately to the Managing Member.",
        "Use strong, unique passwords for all company systems.",
        "Enable two-factor authentication on all company accounts where available.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Data Retention",
      bullets: [
        "Client records are retained for 7 years after the end of the relationship (tax compliance).",
        "Employee records are retained for 5 years after the end of employment.",
        "Marketing data is deleted within 30 days of a request.",
      ],
    },
  ],
};

export const acceptableUsePolicy: TemplateDocument = {
  title: "Acceptable Use Policy",
  subtitle: "IT Systems & Technology Standards",
  ref: "SD-AUP-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This policy governs acceptable use of company systems, software, devices, and internet access. It applies to all employees and contractors.",
    },
    {
      type: "section",
      number: "01",
      title: "Company Systems",
      body: "Company systems include: the admin portal (admin.swiftdesignz.co.za), Supabase, GitHub repositories, Netlify, Google Workspace, Resend, and any other tools provided for work purposes.",
    },
    {
      type: "section",
      number: "02",
      title: "Permitted Use",
      bullets: [
        "Using company systems for work-related tasks only.",
        "Installing approved tools and software required for your role.",
        "Accessing client data and company information necessary for your assignments.",
        "Using AI tools (Claude, ChatGPT) for productivity, provided no confidential data is submitted to public AI models without approval.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Prohibited Use",
      bullets: [
        "Using company systems for personal business, freelancing, or competing activities.",
        "Sharing login credentials with any other person.",
        "Installing unlicensed software or using pirated tools.",
        "Accessing, downloading, or distributing illegal, offensive, or inappropriate content.",
        "Using company email or domains for personal communications unrelated to work.",
        "Mining cryptocurrency or running non-work processes on company infrastructure.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Security Standards",
      bullets: [
        "Use unique, strong passwords (minimum 12 characters) for every system.",
        "Enable 2FA on Gmail, GitHub, Supabase, Netlify, and the admin portal.",
        "Lock your screen when stepping away from your workstation.",
        "Do not connect to public WiFi without a VPN when accessing company systems.",
        "Report phishing emails or suspicious activity immediately.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Monitoring",
      body: "The Company reserves the right to monitor usage of company systems for security and compliance purposes. Use of company systems constitutes consent to such monitoring.",
    },
  ],
};

export const codeOfConduct: TemplateDocument = {
  title: "Code of Conduct",
  subtitle: "Workplace Behaviour & Professional Standards",
  ref: "SD-COC-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This Code of Conduct sets out the standards of behaviour expected from all employees and contractors of Swift Designz Investments CC.",
    },
    {
      type: "section",
      number: "01",
      title: "Professionalism",
      bullets: [
        "Treat colleagues, clients, and partners with respect at all times.",
        "Communicate professionally in all written and verbal interactions.",
        "Meet deadlines. If a deadline is at risk, communicate proactively — not after the fact.",
        "Take ownership of your work. Do not blame others for problems you contributed to.",
        "Maintain a positive, solution-oriented attitude in challenging situations.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Integrity",
      bullets: [
        "Do not misrepresent your skills, experience, or the status of your work.",
        "Do not submit work that is not yours without proper attribution.",
        "Report errors and bugs as soon as they are discovered — do not conceal them.",
        "Do not accept gifts or incentives from clients or vendors that could create conflicts of interest.",
        "Declare any conflict of interest to the Managing Member immediately.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Respect & Inclusion",
      bullets: [
        "Discrimination based on race, gender, religion, nationality, age, or disability is not tolerated.",
        "Harassment, bullying, or intimidation in any form will result in immediate disciplinary action.",
        "Maintain a work environment where everyone can contribute without fear.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Client Relations",
      bullets: [
        "Never speak negatively about clients, even after a difficult engagement.",
        "Do not share client details, project scope, or pricing with external parties.",
        "Always represent the company professionally in client-facing interactions.",
        "Escalate disputes or difficult client situations to the Managing Member immediately.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Consequences",
      body: "Violations of this Code of Conduct may result in a written warning, suspension, or immediate termination depending on severity. Serious violations (fraud, harassment, data breach) may be referred to the relevant Namibian authorities.",
    },
  ],
};

/* ================================================================
   SOPs
   ================================================================ */

export const sopClientOnboarding: TemplateDocument = {
  title: "SOP: Client Onboarding",
  subtitle: "Standard Operating Procedure",
  ref: "SD-SOP-CO-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This SOP governs the process of onboarding a new client from initial enquiry through to project kickoff. All team members involved in client-facing work must follow this procedure.",
    },
    {
      type: "section",
      number: "01",
      title: "Lead Qualification",
      bullets: [
        "All new enquiries are captured in the admin portal under Leads.",
        "Assign the lead a source (quote form, contact form, manual) and initial status (new).",
        "Within 24 hours, send an acknowledgement email and begin qualification.",
        "Qualification criteria: clear scope, realistic budget, decision-maker contact, Namibian or SADC-based.",
        "Mark leads as contacted, quoted, won, or lost as they progress.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Quotation",
      bullets: [
        "Create a quotation in the admin portal (Accounts Receivable > Quotations).",
        "Include all line items, payment plan, notes, and terms.",
        "Send the quotation via the portal — do not send manually.",
        "Follow up if no response after 5 business days.",
        "Valid for 14 calendar days from issue date.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Acceptance & Deposit",
      bullets: [
        "Client accepts quotation via the public acceptance link (portal auto-records this).",
        "Invoice for first instalment is generated automatically after acceptance.",
        "Work does not begin until deposit is received and confirmed in the portal.",
        "Record deposit payment via Accounts Receivable > Payments.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Project Setup",
      bullets: [
        "Convert the client record to an active project in the portal.",
        "Create a project with milestones, start date, and assigned team member.",
        "Send the Client Onboarding document and collect required assets (logo, copy, branding).",
        "Schedule kickoff call if required.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Handover",
      body: "Upon project completion, follow SOP-DPL (Deployment & Handover) to close out the project and issue the final invoice.",
    },
  ],
};

export const sopProjectManagement: TemplateDocument = {
  title: "SOP: Project Management",
  subtitle: "Standard Operating Procedure",
  ref: "SD-SOP-PM-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This SOP defines how projects are planned, tracked, and delivered at Swift Designz. All active projects must be managed in the admin portal.",
    },
    {
      type: "section",
      number: "01",
      title: "Project Creation",
      bullets: [
        "All projects must be created in the admin portal under Projects.",
        "Required fields: client, project name, status, start date, expected end date.",
        "Break the project into milestones with individual due dates.",
        "Assign team members per milestone if applicable.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Status Updates",
      bullets: [
        "Update project status weekly: planning → in_progress → review → completed.",
        "Log milestone completions in the portal as they are achieved.",
        "If a deadline is at risk, update the expected end date and notify the Managing Member.",
        "Client-facing status updates go via email — not verbal.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Communication Cadence",
      bullets: [
        "Weekly internal status update to Managing Member (every Monday).",
        "Client update every 2 weeks minimum, or when a milestone is completed.",
        "All significant decisions, changes, and approvals must be documented in writing.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Scope Management",
      bullets: [
        "Any change to the agreed scope must follow SOP-CR (Change Request).",
        "Do not begin out-of-scope work without an approved Change Request and updated invoice.",
        "Scope creep is the leading cause of project delays — flag it immediately.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Closure",
      bullets: [
        "Mark the project as completed in the portal only after the client has signed off.",
        "Issue the final invoice immediately upon sign-off.",
        "Complete the Project Handover document and deliver to client.",
        "Archive all project files in the designated folder.",
      ],
    },
  ],
};

export const sopDesignProcess: TemplateDocument = {
  title: "SOP: Design Process",
  subtitle: "Standard Operating Procedure",
  ref: "SD-SOP-DP-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This SOP defines the design workflow for all client projects, from brief to approved deliverables.",
    },
    {
      type: "section",
      number: "01",
      title: "Brief & Discovery",
      bullets: [
        "Obtain a clear written brief before any design work begins.",
        "Required inputs: brand assets (logo, colours), target audience, competitor examples, content/copy.",
        "If assets are missing, request them in writing before starting. Do not make assumptions.",
        "Review the quotation to confirm what deliverables are included.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Wireframing & Concepts",
      bullets: [
        "Create low-fidelity wireframes for key pages before high-fidelity design.",
        "Present 1–2 concept directions to the client for feedback.",
        "Document all feedback in writing. Verbal approvals are not accepted.",
        "Each revision round counts against the revision limit in the contract.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "High-Fidelity Design",
      bullets: [
        "Apply the Swift Designz brand or client brand to approved wireframes.",
        "Design mobile-first — all layouts must be responsive.",
        "Use the Swift Designz design system (teal palette, Inter font) for internal tools.",
        "Export assets at 2x resolution minimum. Use SVG for icons and logos.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Client Review & Approval",
      bullets: [
        "Send designs via a shareable link (Figma, PDF, or staging URL).",
        "Allow 5 business days for client feedback.",
        "A maximum of 2 revision rounds is included unless otherwise quoted.",
        "Obtain written approval before moving to development.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Handover to Development",
      bullets: [
        "Export all assets and organise by component/page.",
        "Provide annotated specs (spacing, colours, fonts, interactions) to the developer.",
        "Remain available for design queries during development.",
      ],
    },
  ],
};

export const sopDevelopmentWorkflow: TemplateDocument = {
  title: "SOP: Development Workflow",
  subtitle: "Standard Operating Procedure",
  ref: "SD-SOP-DEV-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This SOP defines the development standards and workflow for all software, web, and app projects at Swift Designz.",
    },
    {
      type: "section",
      number: "01",
      title: "Repository Setup",
      bullets: [
        "All projects must have a Git repository (GitHub, private).",
        "Use the naming convention: client-name-project-type (e.g., acme-ecommerce, delta-landing).",
        "Initialise with a README, .gitignore, and .env.example.",
        "Never commit .env files, secrets, or credentials to the repository.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Branching Strategy",
      bullets: [
        "main — production-ready code only.",
        "dev — active development, always deployable to staging.",
        "feature/xxx — individual features or tasks.",
        "hotfix/xxx — urgent production fixes.",
        "Merge to main via pull request with at least 1 reviewer approval.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Commit Standards",
      bullets: [
        "Use conventional commits: feat:, fix:, chore:, docs:, refactor:, test:.",
        "Commits must be atomic — one logical change per commit.",
        "Write commit messages in present tense: 'add login page', not 'added login page'.",
        "Reference issue or task numbers where applicable.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Code Standards",
      bullets: [
        "TypeScript is required for all Next.js and React projects.",
        "Use Tailwind CSS for styling. No inline styles except where Tailwind is insufficient.",
        "All components must be typed. No implicit any.",
        "Run lint and TypeScript checks before every commit (tsc --noEmit, eslint).",
        "Environment variables follow SCREAMING_SNAKE_CASE. Use NEXT_PUBLIC_ prefix for client-side vars.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Deployment",
      bullets: [
        "All projects are deployed to Netlify unless otherwise specified.",
        "Automatic preview deployments are enabled for all branches.",
        "Production deployments require QA sign-off (see SOP-QA).",
        "Environment variables must be set in Netlify before any production deploy.",
      ],
    },
  ],
};

export const sopQaTesting: TemplateDocument = {
  title: "SOP: QA & Testing",
  subtitle: "Standard Operating Procedure",
  ref: "SD-SOP-QA-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This SOP defines quality assurance and testing requirements for all deliverables. No work is shipped to production without passing QA.",
    },
    {
      type: "section",
      number: "01",
      title: "QA Checklist — All Projects",
      bullets: [
        "All pages/screens load without errors on Chrome, Firefox, and Safari.",
        "Mobile layout tested at 375px (iPhone SE) and 768px (tablet).",
        "All forms validate correctly and handle empty/invalid input.",
        "All links and navigation work. No 404 errors on internal links.",
        "Images are optimised (next/image or WebP format, < 200KB each).",
        "Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "QA Checklist — E-Commerce",
      bullets: [
        "Product pages, cart, checkout, and payment flow tested end-to-end.",
        "Test with at least 2 payment methods (card, EFT if applicable).",
        "Order confirmation emails received and correctly formatted.",
        "Inventory tracking works for products with limited stock.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "QA Checklist — Admin Portal / Apps",
      bullets: [
        "All CRUD operations work (create, read, update, delete).",
        "Role-based access control tested for all user roles.",
        "Error states display user-friendly messages.",
        "TypeScript build passes with no errors (npm run build).",
        "Unit tests pass (npm run test).",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Bug Reporting",
      bullets: [
        "Log bugs with: page/component, steps to reproduce, expected vs actual behaviour, screenshot.",
        "Severity levels: Critical (blocks core flow), Major (feature broken), Minor (cosmetic).",
        "Critical and Major bugs must be resolved before any production deployment.",
        "Minor bugs may be documented and scheduled for next release.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Sign-Off",
      body: "QA sign-off must be given in writing (email or admin portal note) by the Managing Member or designated project lead before production deployment.",
    },
  ],
};

export const sopClientCommunication: TemplateDocument = {
  title: "SOP: Client Communication",
  subtitle: "Standard Operating Procedure",
  ref: "SD-SOP-CC-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This SOP defines communication standards for all client interactions. Consistent, professional communication builds trust and reduces disputes.",
    },
    {
      type: "section",
      number: "01",
      title: "Response Times",
      bullets: [
        "Respond to all client emails within 1 business day.",
        "Acknowledge receipt of a message even if the full response will take longer.",
        "After-hours and weekend messages are acknowledged the next business day.",
        "Urgent client issues (live site down, critical bug) are responded to within 4 hours.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Communication Channels",
      bullets: [
        "Primary: email (keenan@swiftdesignz.co.za or info@swiftdesignz.co.za).",
        "Secondary: WhatsApp for quick status updates only — not for decisions or approvals.",
        "All approvals, change requests, and scope decisions must be in email — not WhatsApp.",
        "Do not provide personal phone numbers to clients unless specifically authorised.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Writing Standards",
      bullets: [
        "Use formal but conversational English. No slang.",
        "Address clients by first name after initial contact.",
        "Always include the project reference in subject lines: e.g., [SD26-INV-010] Invoice Follow-Up.",
        "Proofread all client emails before sending.",
        "Never argue with a client over email. Escalate disputes to the Managing Member.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Difficult Conversations",
      bullets: [
        "Delays, errors, or issues must be communicated proactively — before the client notices.",
        "Own the problem, offer a solution, and give a realistic timeframe.",
        "Do not make promises you cannot keep to avoid a difficult conversation.",
        "Escalate to the Managing Member before communicating any scope reduction or refund.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Closure",
      body: "At project completion, send a formal close-out email with: final deliverables, handover document link, receipt of final payment, and an invitation to leave a review.",
    },
  ],
};

export const sopChangeRequest: TemplateDocument = {
  title: "SOP: Change Request",
  subtitle: "Standard Operating Procedure",
  ref: "SD-SOP-CR-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This SOP defines how scope changes are handled. Any change to an agreed project scope must follow this process without exception.",
    },
    {
      type: "section",
      number: "01",
      title: "What Requires a Change Request",
      bullets: [
        "Adding pages, features, or functionality not in the original quotation.",
        "Changing the platform, tech stack, or major design direction.",
        "Extending the project timeline at client request.",
        "Adding integrations (payment gateways, CRMs, APIs) not originally scoped.",
        "Revisions beyond the included revision rounds.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Process",
      bullets: [
        "Client or team member identifies a change and logs it.",
        "Generate a Change Request document via the admin portal (Documents > Change Request Form).",
        "Include: description of change, reason, estimated additional cost, and timeline impact.",
        "Send to client for review and written approval.",
        "Do not begin the change until written approval is received.",
        "Issue a supplementary invoice for any additional cost before work starts.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "No Verbal Approvals",
      body: "Verbal or WhatsApp approvals for scope changes are not binding. A signed Change Request document or email confirmation from the client is required in all cases.",
    },
    {
      type: "section",
      number: "04",
      title: "Impact on Timeline",
      bullets: [
        "All approved changes extend the project timeline proportionally.",
        "Update the project milestones in the admin portal after every approved change.",
        "Communicate the revised timeline to the client in writing.",
      ],
    },
  ],
};

export const sopDeployment: TemplateDocument = {
  title: "SOP: Deployment & Handover",
  subtitle: "Standard Operating Procedure",
  ref: "SD-SOP-DPL-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This SOP governs the final deployment to production and the formal handover of deliverables to the client.",
    },
    {
      type: "section",
      number: "01",
      title: "Pre-Deployment Checklist",
      bullets: [
        "QA sign-off completed and documented (see SOP-QA).",
        "All Change Requests approved and invoiced.",
        "Final invoice issued or payment plan up to date.",
        "Environment variables set in Netlify production environment.",
        "Custom domain configured and SSL certificate active.",
        "Google Analytics, search console, or other tracking tools configured if required.",
        "Backup of previous version (if applicable) taken.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Deployment",
      bullets: [
        "Merge dev branch into main via pull request.",
        "Netlify auto-deploys from main — confirm the deployment succeeds in Netlify dashboard.",
        "Verify production site against the QA checklist one final time.",
        "Test all critical user flows on the live URL (forms, checkout, login).",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Client Handover",
      bullets: [
        "Generate the Project Handover document via the admin portal.",
        "Include: access credentials (admin logins, hosting), domain management instructions, content update guide.",
        "Email the Handover document and confirm the client has received and tested access.",
        "Provide a 48-hour post-launch support window for critical issues at no extra charge.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Project Closure",
      bullets: [
        "Mark project as completed in the admin portal.",
        "Issue final invoice if not already sent.",
        "Archive all project files (assets, source code, documents) in the designated archive.",
        "Update client record with project completion date.",
      ],
    },
  ],
};

/* ================================================================
   HR POLICIES
   ================================================================ */

export const hrLeavePolicy: TemplateDocument = {
  title: "Leave & Attendance Policy",
  subtitle: "Human Resources Policy",
  ref: "SD-HR-LP-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This policy governs leave entitlements, attendance expectations, and the process for requesting time off.",
    },
    {
      type: "section",
      number: "01",
      title: "Annual Leave",
      bullets: [
        "Full-time employees are entitled to 20 working days of paid annual leave per year.",
        "Part-time and contract staff: leave is pro-rated based on contracted hours.",
        "Leave accrues monthly from the start date.",
        "Annual leave must be requested at least 5 business days in advance.",
        "Leave during peak project delivery periods requires Managing Member approval.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Sick Leave",
      bullets: [
        "Employees are entitled to 10 paid sick days per year.",
        "A medical certificate is required for absences of 3 or more consecutive days.",
        "Notify the Managing Member before 09:00 on the first day of absence.",
        "Unused sick leave does not carry over or get paid out.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Public Holidays",
      bullets: [
        "All Namibian public holidays are observed as non-working days.",
        "Work required on a public holiday will be compensated at 1.5x the daily rate.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Attendance",
      bullets: [
        "Core working hours are 08:00–17:00 Monday to Friday (Namibian time).",
        "Remote work is permitted subject to the Remote Work Policy (HR-RW).",
        "Repeated late arrivals without notification will result in a formal warning.",
        "All leave is recorded by the Managing Member.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Leave Request Process",
      bullets: [
        "Submit leave requests via email to the Managing Member.",
        "Include: type of leave, start date, end date, total days.",
        "You will receive written confirmation of approval or rejection within 2 business days.",
      ],
    },
  ],
};

export const hrRemoteWork: TemplateDocument = {
  title: "Remote Work Policy",
  subtitle: "Human Resources Policy",
  ref: "SD-HR-RW-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "Swift Designz operates as a remote-first company. This policy defines the expectations and responsibilities of remote workers.",
    },
    {
      type: "section",
      number: "01",
      title: "Eligibility",
      bullets: [
        "All roles at Swift Designz are remote-eligible unless a specific task requires physical presence.",
        "New employees may be required to attend in-person onboarding sessions.",
        "Remote work is a privilege that can be modified if performance or security requirements change.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Equipment & Environment",
      bullets: [
        "You are responsible for having a reliable internet connection (minimum 10Mbps) and a suitable work environment.",
        "Company-provided equipment (if any) is for work use only and must be returned upon termination.",
        "Use a VPN when accessing company systems on public or shared networks.",
        "Ensure your workspace is private when discussing confidential client information.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Availability",
      bullets: [
        "Be available during core hours (08:00–17:00 Namibian time) unless otherwise agreed.",
        "Respond to messages within 2 hours during core hours.",
        "Update your status if you are unavailable for extended periods.",
        "Attend scheduled video calls on time. Test your connection before important calls.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Security",
      bullets: [
        "Lock your screen when not at your desk.",
        "Do not work from public places where screens are visible to others.",
        "Use 2FA on all company accounts.",
        "Report any security incidents (lost device, suspicious login) immediately.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Performance",
      body: "Remote work is measured by output, not hours. Deadlines and deliverable quality are the primary performance indicators. Consistent failure to meet deliverables may result in revised remote work arrangements.",
    },
  ],
};

export const hrExpenseClaims: TemplateDocument = {
  title: "Expense Claims Policy",
  subtitle: "Human Resources Policy",
  ref: "SD-HR-EC-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This policy governs how employees and contractors submit and are reimbursed for work-related expenses.",
    },
    {
      type: "section",
      number: "01",
      title: "Claimable Expenses",
      bullets: [
        "Software tools and subscriptions required for your role (pre-approved only).",
        "Travel costs for client meetings or company events (pre-approved).",
        "Internet and phone costs: a fixed monthly allowance may be agreed for remote staff.",
        "Training and professional development (pre-approved, with certificate of completion).",
        "Hardware and peripherals (pre-approved, becomes company property).",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Non-Claimable Expenses",
      bullets: [
        "Personal meals and entertainment unless part of a pre-approved client engagement.",
        "Home office furniture unless specifically approved.",
        "Personal phone plans or internet upgrades.",
        "Fines, penalties, or personal legal fees.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Approval Process",
      bullets: [
        "All expenses over N$200 must be pre-approved by the Managing Member.",
        "Submit pre-approval via email with: description, amount, reason, and supplier.",
        "Emergency purchases below N$500 may be made first and submitted within 24 hours.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Claim Submission",
      bullets: [
        "Submit claims monthly with original receipts or invoices.",
        "Claims submitted more than 60 days after the expense date will not be reimbursed.",
        "Approved claims are reimbursed with the next payroll or within 5 business days.",
      ],
    },
  ],
};

export const hrPerformanceReview: TemplateDocument = {
  title: "Performance Review Policy",
  subtitle: "Human Resources Policy",
  ref: "SD-HR-PR-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "This policy defines the performance review process at Swift Designz. Reviews ensure alignment, recognition of achievement, and identification of development needs.",
    },
    {
      type: "section",
      number: "01",
      title: "Review Frequency",
      bullets: [
        "Formal reviews are conducted twice per year: in August and February (aligned to financial year end).",
        "New employees have a 90-day probationary review.",
        "Informal check-ins occur monthly between team members and the Managing Member.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Review Areas",
      bullets: [
        "Delivery: meeting deadlines and quality standards.",
        "Communication: client and internal communication quality.",
        "Initiative: proactively identifying and solving problems.",
        "Technical Skills: relevance and growth of technical capabilities.",
        "Teamwork & Culture: alignment with company values and code of conduct.",
      ],
    },
    {
      type: "section",
      number: "03",
      title: "Process",
      bullets: [
        "Team member submits a self-assessment form 5 days before the review.",
        "Managing Member reviews performance against targets and self-assessment.",
        "1-on-1 review meeting (30–60 minutes) — remote or in person.",
        "Written summary of outcomes, ratings, and goals for next period.",
        "Both parties sign and retain a copy of the review summary.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Outcomes",
      bullets: [
        "Salary review — adjustments take effect from the start of the next month.",
        "Role changes or promotions are communicated in writing.",
        "Development plans: training, mentorship, or project exposure.",
        "Performance improvement plans (PIP) for team members not meeting expectations.",
      ],
    },
  ],
};

/* ================================================================
   CONFLICT RESOLUTION
   ================================================================ */

export const conflictResolutionPolicy: TemplateDocument = {
  title: "Conflict Resolution Policy",
  subtitle: "Workplace Dispute Resolution",
  ref: "SD-CRP-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "Swift Designz is committed to resolving workplace conflicts fairly, quickly, and professionally. This policy outlines the steps for resolving disagreements between team members or with management.",
    },
    {
      type: "section",
      number: "01",
      title: "Guiding Principles",
      bullets: [
        "Address conflicts early — small issues become big problems when ignored.",
        "All parties deserve to be heard without judgment.",
        "Confidentiality must be maintained throughout the process.",
        "Resolution should be constructive, not punitive.",
        "Retaliation against anyone who raises a conflict in good faith is prohibited.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Step 1: Direct Resolution",
      body: "Where safe to do so, the parties involved should first attempt to resolve the conflict directly. A private, calm conversation is often the fastest solution. Both parties should focus on the issue, not the person.",
    },
    {
      type: "section",
      number: "03",
      title: "Step 2: Mediation",
      body: "If direct resolution fails, either party may request mediation by the Managing Member. The Managing Member will arrange a structured meeting within 5 business days, hear both perspectives, and facilitate a written agreement.",
    },
    {
      type: "section",
      number: "04",
      title: "Step 3: Formal Resolution",
      body: "If mediation does not resolve the matter, a formal written complaint is submitted. The Managing Member will investigate, consult relevant documentation, and issue a written decision within 10 business days.",
    },
    {
      type: "section",
      number: "05",
      title: "External Escalation",
      body: "If the matter remains unresolved and involves a breach of Namibian labour law, either party may refer the matter to the Office of the Labour Commissioner in accordance with the Labour Act, 2007 (Act 11 of 2007).",
    },
  ],
};

export const grievanceProcedure: TemplateDocument = {
  title: "Grievance Procedure",
  subtitle: "Employee Rights & Complaint Process",
  ref: "SD-GRP-2026",
  version: "1.0",
  effective: EFFECTIVE,
  blocks: [
    {
      type: "info",
      text: "Any employee or contractor who believes they have been treated unfairly, discriminated against, or harassed has the right to raise a formal grievance. This procedure ensures that all grievances are taken seriously and handled fairly.",
    },
    {
      type: "section",
      number: "01",
      title: "Grounds for Grievance",
      bullets: [
        "Unfair treatment, discrimination, or harassment.",
        "Breach of contract terms or agreed working conditions.",
        "Failure to pay salary, allowances, or reimbursements on time.",
        "Bullying, intimidation, or hostile work environment.",
        "Unfair performance review or disciplinary action.",
        "Breach of confidentiality or privacy.",
      ],
    },
    {
      type: "section",
      number: "02",
      title: "Informal Grievance",
      body: "Before a formal grievance, try to resolve the issue informally by raising it directly with the relevant person or with the Managing Member. Many grievances are resolved at this stage without formal process.",
    },
    {
      type: "section",
      number: "03",
      title: "Formal Grievance Submission",
      bullets: [
        "Submit a written grievance to the Managing Member at info@swiftdesignz.co.za.",
        "Include: your name, date, description of the issue, relevant dates, any evidence, and your desired outcome.",
        "The Managing Member will acknowledge receipt within 2 business days.",
      ],
    },
    {
      type: "section",
      number: "04",
      title: "Investigation",
      bullets: [
        "The Managing Member (or an appointed independent person if the grievance is against the Managing Member) will investigate.",
        "The investigation will be completed within 15 business days.",
        "Both parties will have an opportunity to present their account.",
        "A written outcome will be provided.",
      ],
    },
    {
      type: "section",
      number: "05",
      title: "Appeal",
      body: "If you are not satisfied with the outcome, you may appeal in writing within 5 business days. If the appeal is also against the Managing Member, an external mediator will be appointed. The final internal decision is binding pending any external legal process.",
    },
    {
      type: "section",
      number: "06",
      title: "External Bodies",
      body: "Nothing in this procedure prevents you from approaching the Office of the Labour Commissioner (Namibia) or any other relevant statutory body at any time.",
    },
  ],
};
