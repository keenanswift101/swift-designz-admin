import type { UserRole } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocCategorySlug =
  | "operations"
  | "development"
  | "design"
  | "sales"
  | "finance"
  | "client-relations"
  | "investor-relations"
  | "client-templates"
  | "investor-templates";

export type DocItemType = "sop" | "template";

export interface SopSection {
  heading: string;
  body: string;
}

export interface DocItem {
  id: string;            // unique slug, e.g. "ops-onboarding"
  title: string;
  description: string;   // one-line summary shown in list
  type: DocItemType;
  /** For type "sop" — full content rendered in the sign-off modal */
  sections?: SopSection[];
  /** For type "template" — links to /documents/view/[slug] */
  templateSlug?: string;
  /** Which roles can see this doc */
  roles: UserRole[];
}

export interface DocCategory {
  slug: DocCategorySlug;
  label: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // tailwind text color
  accentBg: string; // tailwind bg color for card accent
  roles: UserRole[];
  items: DocItem[];
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const DOC_CATEGORIES: DocCategory[] = [
  // ── Operations ─────────────────────────────────────────────────────────────
  {
    slug: "operations",
    label: "Operations",
    description: "Company-wide policies, onboarding and day-to-day procedures",
    icon: "Building2",
    color: "text-teal-400",
    accentBg: "bg-teal-400/10",
    roles: ["admin", "viewer"],
    items: [
      {
        id: "ops-onboarding",
        title: "Employee Onboarding",
        description: "Steps to onboard a new employee or contractor at Swift Designz",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "This SOP ensures every new team member has the tools, access, and context they need to contribute effectively from day one.",
          },
          {
            heading: "Before Start Date",
            body: "1. Send a welcome email with start date, working hours, and dress code.\n2. Create a company email account (format: firstname@swiftdesignz.co.za).\n3. Add the new team member to relevant Slack / WhatsApp channels.\n4. Prepare a device or confirm the team member's own device meets minimum specs.\n5. Pre-assign access: GitHub organisation, Figma workspace, Supabase (read-only), admin portal (viewer role by default).",
          },
          {
            heading: "Day 1",
            body: "1. Conduct a welcome call or in-person meeting with the business owner.\n2. Walk through the company overview: services, clients, current projects, and brand values.\n3. Share the Swift Designz Brand Kit (logo, colour palette, fonts).\n4. Provide access credentials via a password manager — never share passwords in plain text.\n5. Complete all SOP sign-offs in the admin portal under Documents.",
          },
          {
            heading: "Week 1",
            body: "1. Shadow an active project or client interaction.\n2. Complete any required tool-specific training (GitHub, Figma, Supabase).\n3. Set up local development environment using the README in the relevant repo.\n4. First check-in with manager at end of week to address questions.",
          },
          {
            heading: "Ongoing",
            body: "Review and re-sign all SOPs whenever a major revision is published. The admin portal will notify you when acknowledgement is required.",
          },
        ],
      },
      {
        id: "ops-data-security",
        title: "Data Security & Password Policy",
        description: "Rules for managing passwords, devices, and client data",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "To protect client data, company intellectual property, and personal information in compliance with applicable data protection principles.",
          },
          {
            heading: "Password Rules",
            body: "1. All passwords must be at least 14 characters and include uppercase, lowercase, numbers, and symbols.\n2. Every account must use a unique password — no reuse across services.\n3. Use a company-approved password manager (e.g. Bitwarden, 1Password).\n4. Enable two-factor authentication (2FA) on all work accounts: GitHub, Google Workspace, Supabase, Netlify, and any payment platforms.\n5. Never share passwords via WhatsApp, email, or any unencrypted channel.",
          },
          {
            heading: "Device Security",
            body: "1. Lock your screen whenever you step away from your device (Win + L or Ctrl + Cmd + Q).\n2. Keep your operating system and browser fully updated.\n3. Do not install unapproved software on work devices.\n4. Never connect to public Wi-Fi without a VPN for work tasks.",
          },
          {
            heading: "Client Data Handling",
            body: "1. Client personal information may only be stored in Supabase (the admin portal) — not in spreadsheets, personal cloud drives, or messaging apps.\n2. Do not share client contact details, project scope, or financial information externally without written client consent.\n3. Report any suspected data breach immediately to the business owner.",
          },
          {
            heading: "Incident Response",
            body: "If a security incident occurs:\n1. Immediately notify the business owner.\n2. Revoke compromised credentials.\n3. Document the incident: what happened, what was affected, and what was done.\n4. Review and update this SOP if the incident reveals a gap.",
          },
        ],
      },
      {
        id: "ops-equipment",
        title: "Equipment & Device Care",
        description: "How to handle, maintain and report issues with company equipment",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "To extend the lifespan of company assets and ensure all equipment is tracked and properly cared for.",
          },
          {
            heading: "General Care",
            body: "1. Keep devices clean and free of dust. Use compressed air for keyboards monthly.\n2. Never place liquids on or near workstations.\n3. Store portable devices (laptops, phones) in their cases when not in use.\n4. Do not lend company equipment to people outside Swift Designz without written approval.",
          },
          {
            heading: "Reporting Faults",
            body: "1. Log any equipment fault, damage, or loss in the Equipment module of the admin portal within 24 hours of discovery.\n2. Include a description of the issue, the date it was first noticed, and any known cause.\n3. Do not attempt self-repair on hardware unless you are qualified to do so.",
          },
          {
            heading: "Equipment Returns",
            body: "When a team member leaves Swift Designz, all company equipment must be returned on or before the last working day. The business owner will perform a condition check and update the Equipment register.",
          },
        ],
      },
      {
        id: "ops-remote-work",
        title: "Remote Work Guidelines",
        description: "Expectations for productivity, communication and availability when working remotely",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "Swift Designz operates primarily remotely. This SOP sets clear expectations so every team member can collaborate effectively regardless of location.",
          },
          {
            heading: "Working Hours",
            body: "Core hours are 09:00 – 17:00 CAT (UTC+2). Outside these hours, responses within 2 hours are expected for urgent matters. Notify the team in advance if you will be unavailable during core hours.",
          },
          {
            heading: "Communication",
            body: "1. Use the designated communication channel (WhatsApp/Slack) for all work discussions — not personal social media.\n2. Acknowledge messages within 1 hour during core hours.\n3. For video calls, ensure your background is professional and your audio/video is working before the meeting starts.",
          },
          {
            heading: "Task Tracking",
            body: "All active tasks must be visible in the project management tool. Update task statuses daily. If a blocker arises, flag it in the team channel immediately — do not wait until the next check-in.",
          },
          {
            heading: "Connectivity",
            body: "You are responsible for a stable internet connection during core hours. If load shedding or connectivity issues affect your work, notify the team as early as possible and make up the time.",
          },
        ],
      },
    ],
  },

  // ── Development ─────────────────────────────────────────────────────────────
  {
    slug: "development",
    label: "Development",
    description: "Coding standards, Git workflow, deployment and QA procedures",
    icon: "Code2",
    color: "text-blue-400",
    accentBg: "bg-blue-400/10",
    roles: ["admin", "viewer"],
    items: [
      {
        id: "dev-git-workflow",
        title: "Git Workflow & Branching",
        description: "Branching strategy, commit conventions and pull request process",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "Consistent Git practices keep the codebase clean, make deployments predictable, and allow any team member to understand project history.",
          },
          {
            heading: "Branch Strategy",
            body: "- `main` — production-ready code only. Direct pushes are prohibited.\n- `dev` — integration branch. All feature branches merge here first.\n- `feature/<ticket-or-description>` — e.g. `feature/invoice-pdf-export`.\n- `fix/<description>` — e.g. `fix/payment-modal-crash`.\n- `hotfix/<description>` — urgent production fix, branched from `main`.",
          },
          {
            heading: "Commit Message Format",
            body: "Use the conventional commits specification:\n`<type>: <short description>`\n\nTypes: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`\n\nExamples:\n- `feat: add PDF export to invoice page`\n- `fix: correct invoice total calculation`\n- `chore: update dependencies`\n\nKeep the description under 72 characters. Use the commit body for detail.",
          },
          {
            heading: "Pull Requests",
            body: "1. Open a PR from your feature branch to `dev`.\n2. Write a clear PR description: what changed, why, and how to test it.\n3. At least one approval is required before merging.\n4. Squash commits when merging to keep history clean.\n5. Delete the branch after a successful merge.",
          },
          {
            heading: "Code Review Etiquette",
            body: "- Be specific and constructive in comments. Explain the why.\n- Approve only when you are genuinely satisfied with the change.\n- Authors must address all comments before merging — 'resolve' only after the concern is genuinely resolved.",
          },
        ],
      },
      {
        id: "dev-deployment",
        title: "Deployment Checklist",
        description: "Steps to safely deploy a project or change to production",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "Deployments should be deliberate and low-risk. This checklist must be completed before any production release.",
          },
          {
            heading: "Pre-Deployment",
            body: "1. All tests passing locally (`npm run test`).\n2. Build succeeds locally (`npm run build`) with no errors.\n3. PR has been reviewed and approved.\n4. Environment variables are verified in Netlify / hosting platform.\n5. A deployment window has been communicated to the client if the site will be briefly unavailable.",
          },
          {
            heading: "Deployment",
            body: "1. Merge approved PR to `main`.\n2. Confirm CI/CD pipeline triggers automatically (Netlify deploy).\n3. Monitor the build log for errors.\n4. Once live, perform a smoke test: load the site, test the critical user path (e.g. form submission, login).",
          },
          {
            heading: "Post-Deployment",
            body: "1. Notify the client that the update is live.\n2. Monitor error logs for 30 minutes after deploy.\n3. If a critical issue is found, trigger a rollback immediately and notify the client.\n4. Log any post-deploy issues in the project's issue tracker.",
          },
        ],
      },
      {
        id: "dev-bug-reporting",
        title: "Bug Reporting & Triage",
        description: "How to report, prioritise and resolve bugs",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "A structured bug process ensures issues are resolved efficiently and clients receive timely communication.",
          },
          {
            heading: "Reporting a Bug",
            body: "Create a GitHub Issue with:\n1. **Title** — short, descriptive (e.g. 'Invoice PDF shows incorrect total').\n2. **Steps to reproduce** — numbered, exact.\n3. **Expected behaviour** — what should happen.\n4. **Actual behaviour** — what actually happens.\n5. **Environment** — browser, device, OS, app version.\n6. **Screenshots/video** if applicable.",
          },
          {
            heading: "Priority Levels",
            body: "- **P1 Critical** — site/app is down or data is being corrupted. Fix within 4 hours.\n- **P2 High** — core feature broken, no workaround. Fix within 24 hours.\n- **P3 Medium** — feature degraded, workaround exists. Fix within current sprint.\n- **P4 Low** — cosmetic or minor UX issue. Schedule in backlog.",
          },
          {
            heading: "Resolution",
            body: "1. Assign the issue to the responsible developer.\n2. Create a `fix/<description>` branch.\n3. Fix, test, and open a PR referencing the issue number.\n4. After merging, close the issue and notify the client if P1 or P2.",
          },
        ],
      },
      {
        id: "dev-code-standards",
        title: "Code Quality Standards",
        description: "TypeScript, linting, formatting and testing expectations",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "Consistent code quality makes the codebase maintainable and reduces bugs.",
          },
          {
            heading: "TypeScript",
            body: "1. Strict mode is enabled — no `any` types without justification.\n2. All function arguments and return types must be explicitly typed.\n3. Use interfaces for object shapes; use type aliases for unions and primitives.\n4. Database types live in `src/types/database.ts` — never redefine them inline.",
          },
          {
            heading: "Linting & Formatting",
            body: "1. ESLint must pass with zero errors before committing (`npm run lint`).\n2. Prettier is configured — format on save should be enabled in your editor.\n3. Do not disable lint rules with `// eslint-disable` without a comment explaining why.",
          },
          {
            heading: "Testing",
            body: "1. Write unit tests for all utility functions in `src/lib/`.\n2. Write integration tests for all API routes.\n3. Run `npm run test` before every PR — do not open a PR with failing tests.\n4. Aim for 80%+ coverage on business-critical logic (invoicing, payments).",
          },
          {
            heading: "Component Rules",
            body: "1. Prefer server components — use `'use client'` only when interactivity is required.\n2. Keep components focused: one responsibility per file.\n3. Co-locate client components with their server parent where possible.\n4. Never fetch data in a client component — pass it down as props from a server component.",
          },
        ],
      },
    ],
  },

  // ── Design ──────────────────────────────────────────────────────────────────
  {
    slug: "design",
    label: "Design",
    description: "Brand consistency, file management and design handoff process",
    icon: "Palette",
    color: "text-purple-400",
    accentBg: "bg-purple-400/10",
    roles: ["admin", "viewer"],
    items: [
      {
        id: "design-brand",
        title: "Brand Guidelines Compliance",
        description: "How to apply the Swift Designz brand correctly in all work",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "Every deliverable — internal or external — must reflect the Swift Designz brand accurately and consistently.",
          },
          {
            heading: "Core Brand Values",
            body: "Swift Designz is clean, professional, and results-focused. Tone is confident and direct — no fluff, no gimmicks. The brand does not use emojis in professional communications or documents.",
          },
          {
            heading: "Colour Palette",
            body: "- Primary Teal: #30B0B0\n- Background: #101010\n- Card Surface: #1A1A1A\n- Borders: #2A2A2A\n- Dark Gray: #303030\n- Text: #F5F5F5 (primary), #9CA3AF (muted)\n\nAlways use exact hex values. Never approximate brand colours.",
          },
          {
            heading: "Typography",
            body: "- Headings: Geist Sans (Bold / SemiBold)\n- Body: Geist Sans (Regular)\n- Code / monospace: Geist Mono\n\nMinimum body font size: 14px. Line height: 1.5–1.6.",
          },
          {
            heading: "Logo Usage",
            body: "1. Use the full logo on white/light backgrounds and the reversed version on dark backgrounds.\n2. Maintain a clear space of at least the logo height on all sides.\n3. Never stretch, rotate, recolour, or add effects to the logo.\n4. Do not place the logo on a busy or low-contrast background.",
          },
          {
            heading: "Client Work",
            body: "When designing for clients, apply their brand, not Swift Designz's. Document the client's brand guidelines before starting design work and keep them in the client's project folder.",
          },
        ],
      },
      {
        id: "design-files",
        title: "File Naming & Storage",
        description: "How to name and organise all design and project files",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "Consistent file organisation prevents lost work and makes it easy for any team member to find what they need.",
          },
          {
            heading: "Naming Convention",
            body: "Format: `YYYY-MM-DD_ClientName_ProjectName_AssetType_Version`\n\nExamples:\n- `2026-01-15_AcmeCo_Website_Homepage-Design_v1.fig`\n- `2026-02-01_InternalBrand_Logo_Final.svg`\n\nRules:\n- Use hyphens within segments, underscores between segments.\n- No spaces in file names.\n- Version numbers: `v1`, `v2`, not `final`, `final-final`.",
          },
          {
            heading: "Folder Structure (Figma)",
            body: "Organise Figma files by project:\n`[Client Name] / [Project] / [Phase]`\n\nPages within Figma:\n- Cover (project meta info)\n- Components\n- Wireframes\n- UI Designs\n- Prototype\n- Handoff",
          },
          {
            heading: "Exports",
            body: "1. Export icons at 1x, 2x, and 3x as SVG + PNG.\n2. Export images as WebP (preferred) or JPG at 80% quality.\n3. Always optimise images before delivery — use Squoosh or similar.\n4. Deliverable files go into the shared client folder in Google Drive / Supabase Storage.",
          },
        ],
      },
      {
        id: "design-handoff",
        title: "Design Handoff Process",
        description: "Preparing and delivering design files to the development team",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "A clean handoff minimises back-and-forth between design and development and ensures the final product matches the approved design.",
          },
          {
            heading: "Before Handoff",
            body: "1. All screens in the Figma file are named clearly and in the correct order.\n2. All components use auto-layout and defined styles (colours, text styles, effects).\n3. Interactive prototype is linked and covers all primary user flows.\n4. All assets requiring export are marked with export settings in Figma.\n5. Design has been reviewed and approved by the client in writing.",
          },
          {
            heading: "Handoff Checklist",
            body: "- [ ] Figma link shared with developer (view access)\n- [ ] Component library linked and published\n- [ ] All states shown: default, hover, active, disabled, empty, error, loading\n- [ ] Responsive breakpoints documented: Mobile (375px), Tablet (768px), Desktop (1280px)\n- [ ] Copy is final — no placeholder text\n- [ ] Icon set identified and linked\n- [ ] Animation specs documented (duration, easing, trigger)",
          },
          {
            heading: "Post-Handoff",
            body: "1. Be available to answer developer questions during the build phase.\n2. Conduct a design QA review before the client demo — compare the live build against the approved Figma designs.",
          },
        ],
      },
    ],
  },

  // ── Sales ───────────────────────────────────────────────────────────────────
  {
    slug: "sales",
    label: "Sales",
    description: "Lead handling, quoting process and client acquisition",
    icon: "TrendingUp",
    color: "text-green-400",
    accentBg: "bg-green-400/10",
    roles: ["admin", "viewer"],
    items: [
      {
        id: "sales-lead-response",
        title: "Lead Response SOP",
        description: "How to respond to and qualify new inbound leads",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "A fast, professional response to leads improves conversion rates and sets the right first impression for Swift Designz.",
          },
          {
            heading: "Response Times",
            body: "- Inbound leads (website form): respond within 2 hours during business hours.\n- WhatsApp/email enquiries: respond within 1 hour during business hours.\n- After hours: acknowledge with an automated or manual response, follow up at 09:00 the next business day.",
          },
          {
            heading: "Lead Qualification",
            body: "On first contact, establish:\n1. What service do they need?\n2. What is their timeline?\n3. What is their approximate budget?\n4. Have they worked with a developer/designer before?\n\nIf budget is unknown, share our pricing ranges upfront to avoid wasting both parties' time.",
          },
          {
            heading: "Logging Leads",
            body: "Every enquiry must be logged in the admin portal under Leads immediately — even if they seem unlikely to convert. Set the correct status: New, Contacted, Quoted, Won, or Lost. Add a note with key details from the first conversation.",
          },
          {
            heading: "Disqualifying a Lead",
            body: "If a lead is outside our scope (wrong industry, insufficient budget, unrealistic timeline), communicate this respectfully and offer a referral if possible. Mark the lead as Lost with a reason note.",
          },
        ],
      },
      {
        id: "sales-quoting",
        title: "Quoting & Proposal Process",
        description: "How to prepare, price and send a quotation",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "Consistent, accurate quotations protect the business from scope creep and set clear expectations with clients.",
          },
          {
            heading: "Before Writing a Quote",
            body: "1. Conduct a full scope discovery conversation with the client.\n2. Identify all deliverables, features, third-party integrations, and exclusions.\n3. Clarify who is responsible for providing content (copy, images, branding).\n4. Agree on the number of revision rounds included.",
          },
          {
            heading: "Pricing",
            body: "1. Break the quote into line items — do not provide a single lump sum.\n2. Include a contingency buffer of 10–15% on complex projects.\n3. If using a payment plan, document installment amounts and due dates clearly.\n4. All prices are in ZAR and are VAT-exclusive unless otherwise stated.",
          },
          {
            heading: "Sending the Quote",
            body: "1. Generate the quotation using the admin portal (Invoices → New Quotation).\n2. Send via the Documents module to ensure it is logged.\n3. Follow up within 3 business days if no response is received.\n4. Mark the lead status as 'Quoted' in the Leads module.",
          },
          {
            heading: "Acceptance",
            body: "A quote is considered accepted when the client signs the quotation document and pays the deposit. Do not begin work without both.",
          },
        ],
      },
      {
        id: "sales-client-onboarding",
        title: "Client Onboarding Process",
        description: "Steps to onboard a new paying client and kick off the project",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "A smooth onboarding creates client confidence and ensures the project starts on a solid foundation.",
          },
          {
            heading: "On Deposit Receipt",
            body: "1. Send a welcome email thanking the client for their trust in Swift Designz.\n2. Create the client record in the admin portal (Clients module).\n3. Create the project record, set status to 'Planning', and add the agreed milestones.\n4. Send the Client Onboarding document via the Documents module for signature.",
          },
          {
            heading: "Kickoff Meeting",
            body: "1. Schedule a kickoff call within 3 business days of deposit receipt.\n2. Agenda: introductions, confirm scope, agree on communication channels, set milestone dates, and confirm asset delivery requirements.\n3. Share a written summary of the meeting within 24 hours.",
          },
          {
            heading: "Access & Assets",
            body: "1. Request all necessary access credentials securely (use a shared password manager or one-time share link).\n2. Collect brand assets: logo, colour codes, fonts, existing website/social media accounts.\n3. Confirm hosting, domain, and deployment preferences.",
          },
          {
            heading: "Ongoing Communication",
            body: "Provide weekly progress updates via email or WhatsApp. Use the admin portal to track milestone completion. Never go silent — proactive communication prevents client anxiety.",
          },
        ],
      },
    ],
  },

  // ── Finance ─────────────────────────────────────────────────────────────────
  {
    slug: "finance",
    label: "Finance",
    description: "Invoicing, expense claims, payments and financial record-keeping",
    icon: "DollarSign",
    color: "text-amber-400",
    accentBg: "bg-amber-400/10",
    roles: ["admin", "viewer"],
    items: [
      {
        id: "fin-invoicing",
        title: "Invoice Creation & Sending",
        description: "How to create, approve and send client invoices",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "Accurate, timely invoices ensure cash flow and provide a clear record of billable work.",
          },
          {
            heading: "Creating an Invoice",
            body: "1. Navigate to Invoices → New Invoice in the admin portal.\n2. Link the invoice to the correct client and project.\n3. Add line items matching the agreed scope. Never add undiscussed charges.\n4. Set the due date — standard payment terms are 7 days unless agreed otherwise.\n5. Review the total against the signed quotation before saving.",
          },
          {
            heading: "Sending",
            body: "1. Generate the PDF from the admin portal.\n2. Send via the Documents module — this logs the document automatically.\n3. Follow up on unpaid invoices:\n   - Day 1 after due date: polite reminder\n   - Day 7: firm reminder with reference to payment terms\n   - Day 14: formal notice (use the Payment Plan Agreement if negotiating)",
          },
          {
            heading: "Recording Payments",
            body: "1. When payment is received, record it in the admin portal: Invoices → [Invoice] → Record Payment.\n2. Include the payment method and date.\n3. The income entry is created automatically — verify it appears in Accounting → Income.",
          },
          {
            heading: "Disputes",
            body: "If a client disputes an invoice, do not issue a credit note without the business owner's approval. Document the dispute in the invoice notes.",
          },
        ],
      },
      {
        id: "fin-expenses",
        title: "Expense Claim Process",
        description: "How to log and claim business expenses",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "All business expenses must be recorded accurately for tax compliance and cash flow management.",
          },
          {
            heading: "What Qualifies",
            body: "Claimable expenses include: software subscriptions, hosting costs, domain registrations, hardware for business use, professional development, and transport for client meetings. Personal expenses are not claimable.",
          },
          {
            heading: "Logging an Expense",
            body: "1. Navigate to Accounting → Expenses → New Expense.\n2. Select the correct category.\n3. Enter the amount in ZAR (including VAT if applicable).\n4. Upload the receipt or invoice — required for any expense over R100.\n5. Add a brief description of the business purpose.",
          },
          {
            heading: "Recurring Expenses",
            body: "For subscriptions (monthly/annual), set them up as recurring in the Expenses module. Review all recurring expenses quarterly to cancel unused services.",
          },
        ],
      },
      {
        id: "fin-reconciliation",
        title: "Monthly Financial Reconciliation",
        description: "Steps to reconcile income and expenses at month-end",
        type: "sop",
        roles: ["admin"],
        sections: [
          {
            heading: "Purpose",
            body: "Monthly reconciliation ensures the books are accurate and provides a clear picture of business performance.",
          },
          {
            heading: "Process",
            body: "1. On the last business day of each month, open Accounting in the admin portal.\n2. Verify all invoices issued that month are either marked Paid, Partial, or have a follow-up note.\n3. Confirm all income entries match bank receipts.\n4. Review all expense entries — confirm receipts are uploaded.\n5. Export the month's income and expense CSV (Accounting → Export).\n6. Review the net position and flag any anomalies to the business owner.",
          },
          {
            heading: "Year-End",
            body: "At financial year-end, export a full year's data and provide it to your accountant. Ensure all income entries include the correct category for tax classification.",
          },
        ],
      },
    ],
  },

  // ── Client Relations ────────────────────────────────────────────────────────
  {
    slug: "client-relations",
    label: "Client Relations",
    description: "Communication standards, project delivery and after-sales support",
    icon: "Users",
    color: "text-orange-400",
    accentBg: "bg-orange-400/10",
    roles: ["admin", "viewer"],
    items: [
      {
        id: "cr-communication",
        title: "Client Communication Standards",
        description: "How to communicate professionally with clients at every stage",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "Professional, proactive communication is the foundation of client retention and referrals.",
          },
          {
            heading: "Tone & Language",
            body: "1. Always be professional, clear, and direct.\n2. Avoid jargon — explain technical concepts in plain language.\n3. No emojis in formal emails or documents.\n4. Proofread every client-facing message before sending.",
          },
          {
            heading: "Response Times",
            body: "- Email: within 4 business hours during core hours.\n- WhatsApp: within 2 hours during core hours.\n- Never leave a client waiting more than 1 business day without a response.",
          },
          {
            heading: "Difficult Conversations",
            body: "1. If a deadline will be missed, notify the client before the deadline — never after.\n2. Acknowledge the issue, explain the cause briefly, and provide a revised timeline.\n3. Escalate to the business owner if a client becomes aggressive or the situation cannot be resolved.",
          },
          {
            heading: "Scope Changes",
            body: "Any work outside the agreed scope requires a Change Request Form (available in Documents → Client Templates). Never start out-of-scope work without a signed change request.",
          },
        ],
      },
      {
        id: "cr-handover",
        title: "Project Handover SOP",
        description: "How to close out and hand over a completed project",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "A clean handover closes the project professionally and protects both parties by documenting exactly what was delivered.",
          },
          {
            heading: "Before Handover",
            body: "1. Confirm all deliverables from the signed quotation are complete.\n2. Perform final QA — test all functionality on at least two browsers and on mobile.\n3. Ensure all client-provided assets have been returned or transferred.\n4. Confirm the final invoice is paid or a payment plan is in place.",
          },
          {
            heading: "Handover Package",
            body: "1. Generate and send the Project Handover document via the Documents module.\n2. Include: site/app URL, login credentials, hosting/domain details, and maintenance instructions.\n3. Transfer all relevant repository access to the client if applicable.\n4. Schedule a 30-minute walkthrough call to demonstrate the final product.",
          },
          {
            heading: "Post-Handover",
            body: "1. Mark the project as Completed in the admin portal.\n2. Request a testimonial or Google review from the client.\n3. Add the project to the Swift Designz portfolio if consent is given.",
          },
        ],
      },
      {
        id: "cr-support",
        title: "Support Request Handling",
        description: "How to triage and resolve post-launch client support requests",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          {
            heading: "Purpose",
            body: "Efficient support keeps clients happy and protects the business from unlimited unpaid work.",
          },
          {
            heading: "In-Warranty Support",
            body: "All projects include a 14-day warranty period post-handover. During this period, bugs related to the delivered scope are fixed at no charge. Log all warranty fixes in the project notes.",
          },
          {
            heading: "Out-of-Warranty Support",
            body: "After 14 days, support is billed at the standard hourly rate or covered by a Maintenance Retainer agreement. Provide the client with a quote before starting any out-of-warranty work.",
          },
          {
            heading: "Process",
            body: "1. Client logs a support request via WhatsApp or email.\n2. Log the request as a note in the relevant project in the admin portal.\n3. Classify as Bug (defect in delivered work) or Change Request (new requirement).\n4. Bugs in warranty: fix and notify within agreed SLA.\n5. Change requests: generate a new quotation.",
          },
        ],
      },
    ],
  },

  // ── Investor Relations ──────────────────────────────────────────────────────
  {
    slug: "investor-relations",
    label: "Investor Relations",
    description: "Reporting, governance and investor communication protocols",
    icon: "LineChart",
    color: "text-pink-400",
    accentBg: "bg-pink-400/10",
    roles: ["admin", "investor"],
    items: [
      {
        id: "inv-reporting",
        title: "Investor Reporting Schedule",
        description: "When and how to deliver investor reports and financial updates",
        type: "sop",
        roles: ["admin", "investor"],
        sections: [
          {
            heading: "Purpose",
            body: "Regular, structured reporting builds investor trust and ensures all parties have an accurate view of business performance.",
          },
          {
            heading: "Reporting Calendar",
            body: "- **Monthly**: Brief performance summary — revenue, key wins, blockers. Delivered by the 5th of each month.\n- **Quarterly**: Full financial report — income statement, expense breakdown, net position, pipeline. Delivered within 10 days of quarter end.\n- **Annual**: Year-end review including year-over-year comparison, forward projections, and strategy updates.",
          },
          {
            heading: "Report Contents",
            body: "Each report must include:\n1. Revenue for the period vs target.\n2. Key projects completed or in progress.\n3. Expense summary.\n4. Outstanding invoices / debtors.\n5. Commentary on any significant variances.\n6. Outlook for the next period.",
          },
          {
            heading: "Delivery",
            body: "Reports are delivered via the admin portal Documents module. Investors can access their reports through their restricted portal login.",
          },
        ],
      },
      {
        id: "inv-confidentiality",
        title: "Confidentiality & NDA Compliance",
        description: "Obligations and procedures for maintaining investor confidentiality",
        type: "sop",
        roles: ["admin", "investor"],
        sections: [
          {
            heading: "Purpose",
            body: "All investor information is strictly confidential. This SOP outlines obligations for both Swift Designz staff and investors.",
          },
          {
            heading: "What is Confidential",
            body: "- Investor identities, contribution amounts, and terms.\n- Business financial data shared in reports.\n- Strategic plans and pipeline information.\n- Any information marked 'Confidential' in written communications.",
          },
          {
            heading: "Staff Obligations",
            body: "1. Investor information may only be accessed by the business owner and authorised admin users.\n2. Do not discuss investor details with clients, contractors, or third parties.\n3. Store all investor documents exclusively in the admin portal — not in personal drives or messaging apps.",
          },
          {
            heading: "Investor Obligations",
            body: "Investors are bound by the Investor NDA signed at onboarding. They may not share business financial information, strategies, or client details with any third party without written consent from Swift Designz.",
          },
          {
            heading: "Breach",
            body: "Any suspected breach of confidentiality must be reported to the business owner immediately. Legal advice may be sought.",
          },
        ],
      },
      {
        id: "inv-communication",
        title: "Investor Communication Protocol",
        description: "How and when to communicate with investors",
        type: "sop",
        roles: ["admin", "investor"],
        sections: [
          {
            heading: "Purpose",
            body: "Clear communication protocols prevent misunderstandings and ensure investors always have access to the information they need.",
          },
          {
            heading: "Channels",
            body: "- Formal reports and documents: admin portal or email.\n- General updates: WhatsApp (business owner to investor only).\n- Queries: email for complex matters; WhatsApp for brief questions.",
          },
          {
            heading: "Investor Queries",
            body: "1. Acknowledge all investor queries within 1 business day.\n2. Provide a full response within 3 business days.\n3. If the query requires investigation, provide a progress update at day 2.",
          },
          {
            heading: "Meetings",
            body: "Quarterly review meetings are offered to all active investors. Meeting agenda to be shared 48 hours in advance. Minutes to be distributed within 3 business days after the meeting.",
          },
        ],
      },
    ],
  },

  // ── Client Templates ────────────────────────────────────────────────────────
  {
    slug: "client-templates",
    label: "Client Templates",
    description: "Standard documents generated for and sent to clients",
    icon: "FileText",
    color: "text-sky-400",
    accentBg: "bg-sky-400/10",
    roles: ["admin", "viewer"],
    items: [
      { id: "tpl-quote",        title: "Quotation",               description: "Formal project quotation with line items and payment terms", type: "template", templateSlug: "quote-template",         roles: ["admin", "viewer"] },
      { id: "tpl-invoice",      title: "Invoice",                  description: "Tax invoice for completed work or milestone payment",        type: "template", templateSlug: "invoice-template",       roles: ["admin", "viewer"] },
      { id: "tpl-nda",          title: "Client NDA",               description: "Non-disclosure agreement for client projects",               type: "template", templateSlug: "nda",                     roles: ["admin", "viewer"] },
      { id: "tpl-terms",        title: "Terms & Conditions",       description: "Standard service terms and conditions",                      type: "template", templateSlug: "terms-and-conditions",    roles: ["admin", "viewer"] },
      { id: "tpl-onboarding",   title: "Client Onboarding",        description: "Project kickoff document covering scope and expectations",   type: "template", templateSlug: "client-onboarding",      roles: ["admin", "viewer"] },
      { id: "tpl-change",       title: "Change Request Form",      description: "Formal out-of-scope work request and approval",             type: "template", templateSlug: "change-request-form",    roles: ["admin", "viewer"] },
      { id: "tpl-build",        title: "Proceed to Build",         description: "Client sign-off to commence development phase",             type: "template", templateSlug: "proceed-to-build",       roles: ["admin", "viewer"] },
      { id: "tpl-retainer",     title: "Maintenance Retainer",     description: "Ongoing support and maintenance agreement",                 type: "template", templateSlug: "maintenance-retainer",   roles: ["admin", "viewer"] },
      { id: "tpl-payplan",      title: "Payment Plan Agreement",   description: "Structured installment payment schedule",                   type: "template", templateSlug: "payment-plan-agreement", roles: ["admin", "viewer"] },
      { id: "tpl-handover",     title: "Project Handover",         description: "Final delivery document transferring ownership to client",  type: "template", templateSlug: "project-handover",       roles: ["admin", "viewer"] },
      { id: "tpl-estore-retainer", title: "eStore Retainer Agreement", description: "Monthly eCommerce management and support retainer contract", type: "template", templateSlug: "estore-retainer", roles: ["admin", "viewer"] },
    ],
  },

  // ── Investor Templates ──────────────────────────────────────────────────────
  {
    slug: "investor-templates",
    label: "Investor Templates",
    description: "Governance and legal documents for investors",
    icon: "Briefcase",
    color: "text-violet-400",
    accentBg: "bg-violet-400/10",
    roles: ["admin", "investor"],
    items: [
      { id: "tpl-inv-nda",         title: "Investor NDA",                  description: "Non-disclosure agreement for investors",              type: "template", templateSlug: "investor-nda",                    roles: ["admin", "investor"] },
      { id: "tpl-inv-terms",       title: "Investor Terms & Conditions",   description: "Investment terms, rights and obligations",            type: "template", templateSlug: "investor-terms-and-conditions",   roles: ["admin", "investor"] },
      { id: "tpl-inv-reporting",   title: "Investor Reporting Policy",     description: "Reporting schedule, format and delivery standards",   type: "template", templateSlug: "investor-reporting-policy",       roles: ["admin", "investor"] },
      { id: "tpl-inv-governance",  title: "Investor Governance Charter",   description: "Decision-making framework and governance structure",  type: "template", templateSlug: "investor-governance-charter",     roles: ["admin", "investor"] },
      { id: "tpl-inv-family",      title: "Family Investment Overview",    description: "Overview document for family investment structure",   type: "template", templateSlug: "family-investment-overview",      roles: ["admin", "investor"] },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCategoriesForRole(role: UserRole | null | undefined): DocCategory[] {
  const aud: UserRole = role === "investor" ? "investor" : role === "viewer" ? "viewer" : "admin";
  return DOC_CATEGORIES.filter((c) => c.roles.includes(aud)).map((c) => ({
    ...c,
    items: c.items.filter((i) => i.roles.includes(aud)),
  }));
}

export function getCategoryBySlug(slug: string): DocCategory | undefined {
  return DOC_CATEGORIES.find((c) => c.slug === slug);
}
