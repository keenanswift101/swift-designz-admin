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
  | "investor-templates"
  | "team-accounting"
  | "team-development"
  | "team-admin"
  | "team-project-management"
  | "employee-company-info"
  | "employee-legal"
  | "employee-dev"
  | "employee-design"
  | "employee-pm"
  | "employee-client-relations"
  | "employee-hr"
  | "employee-conflict";

export type DocItemType = "sop" | "template";

export type SopSectionExtra =
  | { type: "colors"; items: { name: string; hex: string; usage?: string }[] }
  | { type: "image"; src: string; alt: string; caption?: string };

export interface SopSection {
  heading: string;
  body: string;
  extras?: SopSectionExtra[];
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
            heading: "Two Weeks Before Start Date",
            body: "1. Issue the signed employment contract via the admin portal Documents module — do not allow the person to start without a signed contract on file.\n2. Register the new team member with the Social Security Commission (SSC) and submit the EMP 1 form to NamRA within 14 days of their start date.\n3. Create a company Google Workspace account (format: firstname@swiftdesignz.co.za) and set a strong temporary password using the company password manager.\n4. Provision access: GitHub organisation (appropriate team), Figma workspace (viewer to start), admin portal (employee role by default — upgrade after 30 days if the role requires it), Netlify (read-only), Supabase (read-only).\n5. Add the team member to the designated team communication channel (WhatsApp group or equivalent).\n6. Prepare or confirm the device they will use meets the minimum specification: 16GB RAM, 512GB SSD, modern browser, stable internet connection (minimum 10Mbps).\n7. Send a welcome email confirming start date, start time, working hours, dress code (business casual for client calls, casual otherwise), and the name of their primary point of contact.",
          },
          {
            heading: "Day 1",
            body: "1. Conduct a 60-minute welcome call with the Managing Member — cover company background, services we offer, current client portfolio, active projects, and the values we hold non-negotiably: quality, ownership, and client respect.\n2. Walk through the admin portal together: Leads, Clients, Projects, Invoices, Documents. The admin portal is the source of truth for all business activity — everything lives here.\n3. Deliver access credentials via the company password manager (Bitwarden or equivalent) — never share credentials via WhatsApp, email, or any unencrypted channel.\n4. Assign the 'Documents' section as the first task: the new team member must read and sign-off every SOP in their role category (Documents → relevant category). This must be completed by end of day 1.\n5. Share the Swift Designz Brand Kit: primary teal (#30B0B0), background (#101010), font (Inter), logo files, and the rule that we never use emojis in professional communications.\n6. Assign a specific onboarding task: read an active project brief and prepare 3 questions — to be discussed at the Day 3 check-in.",
          },
          {
            heading: "Week 1 — Integration",
            body: "1. Day 2–3: shadow a client interaction or project update (screen share if remote). Observe how communications are written, how scope is managed, and how the admin portal is used in real work.\n2. Day 3: 30-minute check-in with Managing Member — answer the onboarding questions, clarify role boundaries, agree on first real deliverable and due date.\n3. Day 4–5: set up local development environment (for dev roles) using the project README. Run npm install and npm run dev — confirm the project builds locally before end of week. For non-dev roles: complete a dry run of the first core workflow (e.g. create a test quotation, generate a PDF, review a statement).\n4. By end of week 1: the team member should be able to independently navigate the admin portal, locate any client or project, and understand how invoicing, payments, and documents flow.\n5. End-of-week check-in (30 minutes): the new team member shares what they understand, what is still unclear, and what they need to be productive in week 2. The Managing Member adjusts access and responsibilities accordingly.",
          },
          {
            heading: "30-Day Probationary Review",
            body: "At 30 days, conduct a formal probationary review. Assess: quality of work output, communication with the team, understanding of company procedures, adherence to SOPs, and meeting of any agreed deliverables. Be direct — this is the right time to address any gaps. The review is two-way: the new team member should also provide feedback on what is working and what is not. Document the review in writing and file it in the HR folder in the team member's profile. If performance is satisfactory, confirm continuation. If there are concerns, issue a written Performance Improvement Plan (PIP) with specific targets and a 30-day resolution timeline.",
          },
          {
            heading: "Ongoing Responsibilities",
            body: "1. Re-read and re-sign all SOPs when a major revision is published — the admin portal will prompt this in the Documents section.\n2. Attend all scheduled team check-ins. Notify the Managing Member in advance if you cannot attend.\n3. Update the admin portal whenever your role, skills, or contact details change.\n4. Request a role access upgrade through the Managing Member in writing if your responsibilities expand beyond your current portal access level.\n5. All team members are expected to report procedural gaps, security incidents, or compliance concerns to the Managing Member as soon as they are discovered — silence is not an option.",
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
            heading: "Password Standards",
            body: "All passwords for company systems must be at least 16 characters and must include a mix of uppercase letters, lowercase letters, numbers, and special symbols. Every account must use a unique password — password reuse across services is strictly prohibited and is a disciplinary matter. Use a company-approved password manager (Bitwarden is recommended — it is free, open-source, and supports shared vaults for the team). Enable two-factor authentication (2FA) on every work account without exception: GitHub, Google Workspace, Supabase, Netlify, any payment platform, and the admin portal. Prefer authenticator app 2FA (Google Authenticator, Authy) over SMS 2FA — SIM-swap attacks are a real and documented threat in Namibia. Never share passwords via WhatsApp, email, SMS, or any unencrypted channel. If a password must be transferred, use the secure send feature in your password manager. Rotate passwords immediately upon any suspected compromise — do not wait to investigate first, rotate first and investigate second.",
          },
          {
            heading: "Device & Endpoint Security",
            body: "Lock your screen every time you step away from your device, even for a minute — use Win + L (Windows) or Ctrl + Cmd + Q (macOS). Enable full-disk encryption on your work device: BitLocker (Windows) or FileVault (macOS). Keep your operating system, browser, and all software fully updated — security patches must be applied within 48 hours of release. Do not install unapproved software on work devices. If you need a new tool, request approval from the Managing Member before installing. Never connect to public Wi-Fi (airports, cafes, hotels) without an active VPN for any work-related task. Keep your work device physically secure — do not leave it unattended in public spaces. If a work device is lost or stolen, report it to the Managing Member within 1 hour and remotely wipe it immediately using your device's built-in remote management (Find My / Microsoft Find My Device).",
          },
          {
            heading: "Client & Company Data Handling",
            body: "All client personal information, project data, and financial records may only be stored in Supabase (accessed via the admin portal) — never in personal Google Drive, Dropbox, local spreadsheets, WhatsApp, or any messaging application. Classify data before sharing: Public (can be shared freely), Internal (team only), Confidential (admin-only, restricted to Managing Member and authorised staff), Strictly Confidential (investor data, legal documents, personal financial records — Managing Member only). Do not share client names, project scope, pricing, or invoice amounts with anyone outside the company without explicit written consent from both the client and the Managing Member. Do not photograph, screenshot, or record confidential screens unless required for a specific work task. All screenshots used for work purposes must be stored in the project folder, not in personal device galleries. When a team member leaves the company, revoke all access on the last day and change all shared passwords immediately — no exceptions.",
          },
          {
            heading: "Incident Detection & Response",
            body: "A security incident includes: unauthorised access to any company account, a lost or stolen device, a phishing email that was clicked, a credential that was accidentally shared or committed to a repository, a suspicious login notification from any service, or any situation where you believe company or client data may have been exposed. Response protocol: Step 1 — Contain: immediately revoke or rotate the compromised credential, log out all sessions, or remotely wipe the device. Step 2 — Report: notify the Managing Member within 30 minutes of discovery — send a WhatsApp message even if outside core hours. Do not delay notification to investigate. Step 3 — Document: write a clear timeline of what happened, when, what systems were potentially accessed, and what was done. Step 4 — Review: within 5 business days, the Managing Member conducts a post-incident review and updates this SOP if the incident reveals a gap in current procedures. If client data was potentially accessed, the Managing Member will determine whether the affected client(s) must be notified — this is not optional.",
          },
          {
            heading: "Annual Security Review",
            body: "Each February, the Managing Member conducts an annual security review covering: all team member access levels (remove access for anyone who no longer needs it), all active software subscriptions and API keys (rotate keys, cancel unused services), all shared passwords (rotate any that have not been changed in 12 months), all devices (verify encryption is active, OS is updated), and a review of all third-party integrations with admin portal access (Resend, Supabase, Netlify — verify only authorised keys are active). The outcome of the annual review is documented in the admin portal notes.",
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
            heading: "Asset Registration",
            body: "Every piece of company equipment — computers, monitors, peripherals, phones, cameras, and any item with a value over N$500 — must be registered in the Equipment module of the admin portal. Required fields: asset name, model, serial number, purchase date, purchase price, current assigned user, condition (Excellent / Good / Fair / Poor), and warranty expiry date. Assets must be registered within 3 business days of acquisition. If you are issued equipment that is not registered, notify the Managing Member immediately — do not use unregistered company equipment for client work. Equipment registration data feeds into the company's asset base for insurance, tax depreciation, and the NYDF loan application.",
          },
          {
            heading: "Daily & Monthly Care",
            body: "Daily: shut down your computer fully at the end of the working day — do not leave it in sleep mode indefinitely. Store portable devices (laptops, tablets) in their protective cases when not in use. Do not leave devices on the floor where they can be stepped on or exposed to dust. Monthly: clean keyboards with compressed air. Wipe screens with a microfibre cloth — no household cleaning sprays on screens. Check all cable connections and replace fraying cables before they fail. Verify all software updates are applied. Back up any local project files to the designated cloud storage location — work files must not exist only on a local device. Annual: have all battery-powered devices (laptops, phones) assessed for battery health. Replace batteries that hold less than 80% of original capacity.",
          },
          {
            heading: "Reporting Faults & Damage",
            body: "Log any equipment fault, damage, accidental damage, or loss in the Equipment module of the admin portal within 24 hours of discovery. Your entry must include: the asset name and serial number, the date the issue was first noticed, a detailed description of the fault or damage, the suspected cause (if known), and whether the issue affects your ability to work. Do not attempt to self-repair hardware unless you are a qualified technician. Do not take company equipment to an unauthorised repair shop without the Managing Member's approval. If equipment damage was caused by negligence (dropping, liquid damage, ignoring warnings), the Managing Member will determine whether the repair cost is borne by the company or the team member, with reference to the employment contract. P1 faults (device unusable) must be escalated to the Managing Member immediately by WhatsApp, not just logged in the portal.",
          },
          {
            heading: "Equipment Issued to Remote Staff",
            body: "If company equipment is issued to a remote team member, a written Equipment Loan Agreement must be signed before the equipment is dispatched. The agreement specifies: the equipment being loaned, the expected return date or end-of-engagement return obligation, the team member's responsibility for insuring the equipment while in their possession, and the condition at time of dispatch (documented with photos). The team member is responsible for the cost of returning the equipment at the end of their engagement unless otherwise agreed in writing.",
          },
          {
            heading: "Equipment Return & Exit Process",
            body: "When a team member's engagement ends for any reason — resignation, contract expiry, or termination — all company equipment must be returned on or before the last working day. The Managing Member or designated administrator performs a condition check on return, comparing to the condition at time of issue. Any damage beyond normal wear and tear is documented in the Equipment module and addressed per the employment contract. After return: revoke all access credentials, remove the device from cloud management services, wipe the device if it is being reallocated, and update the Equipment register status to 'Available'. Final payroll payment is not released until all equipment is returned and checked.",
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
            heading: "Eligibility & Setup",
            body: "All roles at Swift Designz are remote-eligible unless a client engagement or company requirement specifies physical presence. To work remotely, you must have: a private, dedicated workspace with a door you can close during calls — working from a shared open space where client or financial information could be overheard is not acceptable. A reliable internet connection with a minimum download speed of 10Mbps and upload of 5Mbps — test your connection at fast.com before your first week. A device meeting minimum spec (see Equipment SOP). A professional, neutral background for all video calls — at minimum, a tidy, uncluttered background. A working headset with a microphone — built-in laptop microphones are not acceptable for client calls due to echo and background noise.",
          },
          {
            heading: "Working Hours & Availability",
            body: "Core working hours are 08:00 – 17:00 Namibian time (UTC+2), Monday to Friday. You must be reachable by the team communication channel within 30 minutes of a message during core hours. Respond to direct messages from the Managing Member within 15 minutes during core hours. If you will be unavailable for more than 1 hour during core hours for any reason (load shedding, medical appointment, personal emergency), notify the team before the unavailability begins — not during or after. Do not simply 'go quiet.' Work hours must be productive and output-focused — Swift Designz measures performance by delivery quality and deadlines met, not hours clocked. However, if you are consistently unavailable during core hours without explanation, it will be treated as a disciplinary matter.",
          },
          {
            heading: "Communication Standards",
            body: "All work-related discussions must take place in the designated team channel — not on personal social media, personal WhatsApp, or informal channels that cannot be archived. Mark your status as 'Away' in the team channel whenever you are stepping away for more than 20 minutes. For video calls: test your audio and video 5 minutes before any scheduled call. Never join a client call on a mobile device unless you have no alternative. Mute yourself when not speaking on group calls. Use professional language and maintain the same tone you would in a physical office — the fact that you are remote does not lower the standard of communication. Written communication must be proofread before sending. Typos and grammatical errors in client-facing communications reflect on the company.",
          },
          {
            heading: "Task Tracking & Accountability",
            body: "All active tasks must be reflected in the admin portal or designated project tracking tool. Update your task statuses at the start and end of each working day. If a task is blocked — by a missing client asset, an unresolved technical issue, or a dependency on another team member — flag it in the team channel immediately with a specific description of the blocker and what you need to resolve it. Do not simply stop work and wait in silence. Submit a brief end-of-day update every Friday: what was completed this week, what is in progress, and any blockers for next week. This replaces the need for a physical weekly meeting and keeps the Managing Member informed without micromanagement.",
          },
          {
            heading: "Load Shedding & Connectivity Contingency",
            body: "Namibia's power supply can be unreliable. You are expected to have a contingency plan for load shedding or outages: a charged laptop battery for up to 4 hours of work, mobile data as a backup internet connection, and knowledge of the nearest reliable Wi-Fi location (library, co-working space) if your home connection fails. If a power or connectivity outage affects more than 3 hours of a working day, notify the Managing Member immediately and plan to make up the lost time within the same week. Persistent connectivity or power issues must be discussed with the Managing Member — if the situation cannot be resolved, the business may need to provide equipment or a co-working stipend.",
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
            heading: "Branch Strategy",
            body: "Swift Designz uses a two-branch production model. `main` is the production branch — it represents what is live on the client's website or the admin portal right now. Direct pushes to main are prohibited without exception. `dev` is the integration branch — all feature work is merged here first and tested before it ever touches main. Feature branches follow the pattern `feature/<short-description>` (e.g. `feature/invoice-pdf-export`, `feature/retainer-payment-modal`). Bug fix branches use `fix/<description>` (e.g. `fix/payment-total-rounding`). Hotfixes — production issues that cannot wait for a full PR cycle — use `hotfix/<description>` and are branched directly from `main`, then merged back to both `main` and `dev`. Never work directly on `dev` or `main`. Every change, no matter how small, gets its own branch and PR. The only exception is a one-line documentation change or typo correction, which the Managing Member may commit directly to dev with a `docs:` prefix.",
          },
          {
            heading: "Commit Message Format",
            body: "All commits must follow the Conventional Commits specification: `<type>(<optional scope>): <short description>`. Types in use at Swift Designz: `feat` — a new feature or user-visible change; `fix` — a bug fix; `chore` — tooling, dependencies, config changes that don't affect production behaviour; `docs` — documentation only; `refactor` — code restructure with no behaviour change; `test` — adding or fixing tests; `perf` — performance improvement. The short description must be present-tense, under 72 characters, and describe what the commit does, not what you did: write 'add invoice PDF download button', not 'added PDF button'. If the commit closes an issue or relates to a specific feature, add it in the commit body on the second line: 'Closes #42'. Bad example: 'fixed stuff'. Good example: `fix(invoices): correct cent-to-rand formatting on PDF total line`. Commit messages are part of the audit trail — they must be readable by someone who was not in the room.",
          },
          {
            heading: "Pull Request Standards",
            body: "Open a PR from your feature branch to `dev` (never directly to `main`). Every PR must include a description covering: what changed and why (one short paragraph), how to test it (specific steps a reviewer can follow), any environment variables, database migrations, or configuration changes required, and any known edge cases or limitations. PRs that touch the database schema must include the migration SQL file. PRs that add a new page or route must include a screenshot or screen recording of the UI. Self-review your diff before assigning a reviewer — remove debug logs, commented-out code, and console.logs. At least one approval is required before merging. Squash and merge to keep the main/dev history linear and readable. Delete the feature branch after a successful merge — the repository should not accumulate stale branches.",
          },
          {
            heading: "Code Review Etiquette",
            body: "As a reviewer: read the PR description fully before looking at the code. If the PR description is missing or unclear, request changes before reviewing the code — a PR without context cannot be properly reviewed. Leave specific, constructive comments explaining the why, not just the what: 'This will cause an N+1 query on the invoices page — consider fetching client names in a single join' is useful; 'Fix this' is not. Use the convention: prefix with 'nit:' for non-blocking style suggestions, 'question:' for genuine queries, and 'blocker:' for issues that must be resolved before merge. Approve only when you are genuinely satisfied — not to unblock someone. As the author: respond to every comment before marking it as resolved. 'Resolve' means the concern was addressed, not dismissed. If you disagree with a review comment, explain why in a reply — do not silently close it. The goal of review is shared code ownership, not gatekeeping.",
          },
          {
            heading: "Protecting Production",
            body: "The `main` branch is branch-protected — it cannot be pushed to directly. All merges to `main` go through dev first, then via a PR from `dev` to `main` only after: all tests pass, the feature has been tested on the dev deployment, and the Managing Member or lead developer has reviewed the changes. Before merging `dev` into `main`, run `npm run build` locally and confirm it produces zero errors and zero TypeScript warnings. Production deployments trigger automatically via Netlify on every push to `main` — monitor the Netlify build log and perform a smoke test on the live URL within 10 minutes of every deployment.",
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
            heading: "Pre-Deployment Verification",
            body: "Before merging to `main` and triggering a production deployment, complete every item on this checklist without exception. 1. All automated tests pass: `npm run test` exits with zero failures. 2. TypeScript build passes with no errors: `npm run build` completes successfully. 3. ESLint passes with zero errors: `npm run lint` is clean. 4. The PR has at least one approval from a team member who is not the author. 5. All environment variables required by the new code are set in Netlify production environment (check by comparing `.env.local` with the Netlify Environment Variables panel — missing vars cause silent failures). 6. Any database migrations required by the new code have been run on the production Supabase project. 7. If the deployment changes any URL, route, or redirect behaviour, confirm the affected pages are tested on the dev deployment before touching production.",
          },
          {
            heading: "Client Communication",
            body: "If the deployment could cause any visible downtime or change to a live client website, notify the client at least 24 hours in advance. This includes: major layout or design changes, navigation restructures, changes to forms or checkout flows, anything that changes a URL the client has shared with their own customers, and any database migrations that modify how their data is displayed. The notification must state: what is changing, when (date and estimated time window), and a contact point if they experience issues after the change goes live. For the admin portal itself: notify all active portal users (including investors) of any planned maintenance window via the notification system.",
          },
          {
            heading: "Deployment Execution",
            body: "1. Merge the approved PR from `dev` to `main` using the 'Squash and merge' option. Write a clear merge commit message. 2. Navigate to the Netlify dashboard and confirm a new deployment has triggered automatically within 60 seconds. 3. Monitor the build log in real time — do not navigate away. A build that fails mid-way may leave the site in a broken state. 4. If the build fails, immediately investigate the error in the Netlify log. Do not attempt to re-deploy without understanding why it failed. 5. Once the build completes successfully, the Netlify dashboard shows the new deploy as 'Published'. 6. Clear your browser cache and open the live URL. Do not rely on a cached version for the smoke test.",
          },
          {
            heading: "Post-Deployment Smoke Test",
            body: "Within 10 minutes of every production deployment, perform a smoke test covering the critical paths: load the homepage and confirm it renders without a white screen. Test login and logout. If invoicing was touched: create a test invoice and confirm the PDF generates correctly. If email was touched: send a test email and confirm it arrives with the correct content. If the database schema was changed: perform at least one read and one write operation on the affected table. Test on both desktop (Chrome) and mobile (375px viewport in DevTools) for any UI changes. If any smoke test step fails, immediately open the Netlify dashboard and click 'Publish deploy' on the previous deployment to roll back — do this before investigating the cause. Notify the Managing Member and any affected clients immediately if a rollback is required.",
          },
          {
            heading: "Rollback Protocol",
            body: "A rollback is not a failure — it is the correct response to a production issue. Never try to fix a broken production deployment with a rushed hotfix while users are affected. Roll back first, fix correctly on a branch, test thoroughly, then redeploy. To roll back: open the Netlify dashboard, navigate to the Deploys tab, click the last known-good deployment, and click 'Publish deploy'. This takes approximately 30 seconds. After rollback: open a `hotfix/<description>` branch from `main` (which is now back at the previous good state), fix the issue, test it, open a PR, get a review, and deploy normally. Every rollback must be followed by a post-mortem: what broke, why, how it was missed in pre-deployment checks, and what change to the process prevents it recurring.",
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
            heading: "What Qualifies as a Bug",
            body: "A bug is any behaviour where the application does something different from what the approved design, quotation, or specification says it should do. This includes: incorrect data displayed or calculated, forms that accept invalid input or reject valid input, features that work on one browser or device but not another, email delivery failures, PDF generation errors, authentication or authorisation errors (wrong user can access wrong data), and any unhandled error that results in a white screen, 500 error, or broken page. A feature request or design change is not a bug — it goes through the Change Request SOP. When in doubt about classification, err on the side of calling it a bug and let triage clarify.",
          },
          {
            heading: "How to Report a Bug",
            body: "Every bug must be logged as a GitHub Issue in the relevant repository. The issue title must be specific and searchable — not 'invoice broken' but 'Invoice PDF total shows ZAR instead of NAD on line 3'. The issue body must include all of the following: 1. Steps to reproduce — numbered, exact, starting from a logged-out or fresh state if applicable. 2. Expected behaviour — what should happen when you follow those steps. 3. Actual behaviour — what actually happens, including any error messages verbatim. 4. Environment — browser name and version, operating system, device type (desktop/mobile), the URL where the bug occurs. 5. Frequency — does it happen every time, sometimes, or once? 6. Impact — how many users or clients are affected? 7. Screenshots or screen recording — required for any UI bug; optional for console/log errors but strongly recommended. Bugs reported via WhatsApp without a corresponding GitHub Issue will not be actioned — log it formally.",
          },
          {
            heading: "Severity Classification & SLA",
            body: "P1 Critical: the site or application is completely down, a production security breach is active, data is being corrupted or lost, or a client cannot complete a payment or invoice process. Resolution target: 4 hours. The Managing Member must be notified immediately by direct call if outside business hours — this is the only scenario where that is appropriate. P2 High: a core feature is broken and there is no workaround (cannot send invoices, cannot generate PDFs, cannot log in). Resolution target: 24 hours. P3 Medium: a feature is degraded but a workaround exists, or a non-critical page is broken. Resolution target: next sprint cycle (within 5 business days). P4 Low: a cosmetic issue, minor layout bug, or style inconsistency that does not affect functionality. Schedule in the next sprint backlog. Severity is assigned at triage by the Managing Member or lead developer — do not assume severity in your bug report.",
          },
          {
            heading: "Resolution Process",
            body: "1. The Managing Member or lead developer triages the bug within 2 hours of logging (during business hours), assigns severity, and assigns it to a developer. 2. The assigned developer confirms they have reproduced the bug locally before writing a single line of fix code — never fix a bug you cannot reproduce. 3. Create a `fix/<description>` branch from `dev` (or from `main` for P1 hotfixes). 4. Write the fix with a corresponding test that would have caught the bug — if a test is not feasible, document why. 5. Open a PR with a description that links to the GitHub Issue: 'Fixes #42'. 6. The reviewer verifies the fix by following the original reproduction steps. 7. After merge, the original reporter re-tests on the staging deployment before the fix goes to production. 8. For P1 and P2 bugs: close the GitHub Issue and notify the affected client by email within 1 hour of the fix going live, including a brief description of what was fixed.",
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
            heading: "TypeScript Standards",
            body: "TypeScript strict mode is enabled on all Swift Designz projects and must remain enabled. No `any` types are permitted without a comment explaining exactly why the type cannot be known at compile time — this is a code review blocker. All function parameters and return types must be explicitly typed. Use `interface` for object shapes that are extended or implemented; use `type` for unions, intersections, and aliases. All database-related types live exclusively in `src/types/database.ts` — never define an inline type that duplicates a database type. Use the `UserRole` type from `database.ts` wherever a role is referenced. When working with Supabase query results, always destructure `{ data, error }` and check `error` before using `data` — never assume a query succeeded. Money values are stored as integer cents throughout the codebase — never use floating point for currency. Use `formatCurrency()` from `src/lib/utils.ts` for all display formatting.",
          },
          {
            heading: "Linting, Formatting & Pre-commit",
            body: "ESLint must pass with zero errors before any commit — run `npm run lint` before opening a PR. Do not use `// eslint-disable-next-line` or `// eslint-disable` comments without a code comment directly below explaining the specific reason: 'Disabled because [specific reason]'. Using an eslint-disable to silence a valid warning is a code smell — fix the underlying issue instead. Prettier is configured for the project — enable 'Format on Save' in VS Code (`editor.formatOnSave: true`). Tabs vs spaces, quote style, and trailing commas are not matters for debate — Prettier decides, and all code is formatted by Prettier. Imports must be ordered: external packages first, then internal `@/` paths, then relative paths. Remove all unused imports before committing — the TypeScript build will catch these, but do not leave them for the compiler to clean up.",
          },
          {
            heading: "Component Architecture",
            body: "Prefer server components for all data fetching — a React Server Component (RSC) fetches data directly from Supabase and passes it to child components as props. Add the `'use client'` directive only when a component needs browser APIs, React state, event handlers, or hooks. Do not add `'use client'` as a default — it defeats the purpose of the App Router. Keep components single-responsibility: a component that renders a table should not also contain the data fetching logic, the delete action, and the pagination. For complex interactive UI: the server component fetches data and renders a client component wrapper, passing serialised data as props. Never call a server action from a server component — server actions are for client-initiated mutations only. Route handlers (`route.ts`) are for public APIs and third-party callbacks; use server actions (`actions.ts`) for all internal form submissions and button-triggered mutations.",
          },
          {
            heading: "Testing Requirements",
            body: "Write unit tests (Vitest) for all functions in `src/lib/` that contain logic — utility functions, formatters, calculations, and business rules. If a function does arithmetic (currency, dates, percentages), it must have a unit test. Write integration tests (Playwright) for every critical user flow in the admin portal: login, creating a quotation, sending an invoice, recording a payment, generating a PDF. Run the full test suite before every PR: `npm run test` (unit) and `npm run e2e` (Playwright). A PR that reduces test coverage on business-critical paths (invoicing, payments, authentication) is a blocker — restore coverage before merging. Tests must be deterministic — no tests that sometimes pass and sometimes fail. If a test is flaky, fix the test or the code, do not mark it as skip.",
          },
          {
            heading: "Security in Code",
            body: "Never commit secrets, API keys, or credentials to the repository. All environment variables must be declared in `.env.local` (never committed) and documented in the README. Use `NEXT_PUBLIC_` prefix only for values that are intentionally exposed to the browser. Before committing, run `git diff --staged` and scan for any string that looks like a key, password, or token. If a secret is accidentally committed, treat it as compromised: rotate it immediately, then use `git filter-repo` to remove it from history, and force-push with the Managing Member's authorisation. Never trust user-supplied input for database queries — always use the Supabase client's parameterised query interface. Never render raw user input as HTML — use `escapeHtml()` from `src/lib/utils.ts` for any user-provided content that appears in the DOM.",
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
            heading: "Brand Identity & Values",
            body: "Swift Designz positions itself as clean, professional, and results-focused. Every design decision — spacing, colour, typography, tone — must reinforce these qualities. The brand does not use decorative flourishes, loud gradients, stock photography clichés, or emoji in any professional output. Confidence is expressed through clarity, not decoration. When in doubt: remove an element, don't add one. The design language is dark-first: all internal tools and templates default to a dark theme. Client deliverables follow the client's own brand, but where Swift Designz branding appears (email headers, invoice footers, document covers), it must be exact.",
          },
          {
            heading: "Colour Palette — Internal Brand",
            body: "Primary Teal (interactive elements, highlights, CTAs): #30B0B0. Dark Background (page backgrounds): #101010. Card Surface (elevated panels, modals): #1A1A1A. Border (dividers, outlines): #2A2A2A. Dark Grey (secondary surfaces): #303030. Body Text (primary): #F5F5F5. Muted Text (labels, captions): #9CA3AF. Success: #22C55E. Warning: #F59E0B. Danger: #EF4444. Always use exact hex values — never approximate. Do not introduce ad-hoc colours without approval. For client projects: document the client's exact colour codes in a brand file stored in their project folder before touching any design tool.",
          },
          {
            heading: "Typography Standards",
            body: "Swift Designz internal tools use Inter as the body font (all weights). Document headers use Inter Bold or SemiBold. Body copy: Inter Regular at minimum 13px with a line height of 1.6. All client projects use the client's own specified fonts — never substitute without written approval. When a client has not provided a font specification, default to Inter for digital projects and document the assumption in the project notes. Minimum accessible body font size for any web project: 16px. Line length (measure) for comfortable reading: 45–75 characters per line. Never set body copy in all-caps — it reduces readability. Headings may use SemiBold or Bold, but body text must always be Regular weight for sustained reading.",
          },
          {
            heading: "Logo Usage Rules",
            body: "The Swift Designz logo may only be used in its approved forms: full colour on dark backgrounds, and reversed (white on teal) for light backgrounds. Maintain a clear exclusion zone of at least the height of the 'S' in the logotype on all four sides — nothing else may enter this zone. Prohibited: stretching or squishing the logo proportions, rotating the logo, applying drop shadows or glows, recolouring the logo, placing the logo on a patterned or low-contrast background, using an older version of the logo. If you are unsure which logo file to use, ask before proceeding — using the wrong file on a client deliverable requires a full reprint or recreation. Logo files are stored in the company's shared asset folder — always pull from there, never recreate the logo.",
          },
          {
            heading: "Applying Client Brands",
            body: "When designing for clients, your job is to serve their brand, not yours. Before starting any design work, collect and document: the client's logo files (SVG and PNG, all variants), their exact colour codes (HEX, RGB, CMYK if print is involved), their approved fonts and font weights, their tone of voice guidelines (formal, casual, playful — ask if they don't have a written guide), and examples of designs they like and dislike. Store all of this in the client's brand folder before opening Figma. Never guess at a client's brand colours from a screenshot — always get the source files. If the client provides brand materials that are inconsistent or low quality, flag it in writing before starting and agree on which version to use.",
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
            heading: "File Naming Convention",
            body: "All design files, exports, and deliverables follow this naming convention: YYYY-MM-DD_ClientName_ProjectName_AssetType_Version. Use the ISO date format (year-month-day) so files sort chronologically. Use underscores to separate the segments. Use hyphens within segments where a segment has multiple words. No spaces in file names — spaces break URLs and cause errors in automated pipelines. Version numbers use lowercase 'v' followed by a number: v1, v2, v3. Never use 'final', 'final-v2', 'latest', or 'new' as version identifiers — they are meaningless the moment you create v2. If a file is the definitive approved version, note it in the project log rather than in the file name. Examples: 2026-06-01_AcmeCo_Website_Homepage-Design_v3.fig, 2026-05-15_SwiftDesignz_BrandKit_Logo-Primary_v1.svg.",
          },
          {
            heading: "Figma File Structure",
            body: "Every client project in Figma is organised as: [Client Name] → [Project Name] → [Phase]. Inside each Figma file, create pages in this order: 1. Cover — project name, client, date, designer name, version. 2. Design System — colours, typography, spacing, components. 3. Wireframes — low-fidelity layout explorations. 4. UI Designs — high-fidelity approved screens. 5. Prototype — linked interactive flows. 6. Handoff — annotated specs and export-ready assets. Never work in a single long unnamed page. Each frame must be named clearly: not 'Frame 47' but 'Home / Desktop / Logged Out'. Group frames by user flow, not by page number. Archive deprecated screens by moving them to a 'Graveyard' page — never delete work in progress in case the client changes their mind.",
          },
          {
            heading: "Export Standards",
            body: "Icons: export as SVG (for web) at 1x. Where SVG is not supported, export PNG at 1x, 2x, and 3x. Icons must be on a transparent background — never export on a coloured fill. Images and photos: WebP is the preferred format for web projects (best compression-to-quality ratio). JPG at 80–85% quality is acceptable for clients who cannot use WebP. PNG only for images that require transparency. AVIF for projects targeting modern browsers only. All images must be optimised before delivery — use Squoosh (squoosh.app) or ImageOptim. Delivery target: no single image on a web page should exceed 200KB after optimisation. Hero images: aim for under 100KB. PDF documents: always export at 300dpi for print-quality and 72dpi for digital delivery.",
          },
          {
            heading: "Version Control & Backup",
            body: "Figma maintains version history automatically — use it. Save a named version at every significant milestone: 'Client Review v1 — sent 2026-06-01', 'Approved by client — 2026-06-05'. This allows instant restoration if the client wants to revert. For exported files and local project files: all design deliverables must be uploaded to the designated client folder in the company cloud storage within 24 hours of creation. Local copies on your device are working copies only — the cloud folder is the official record. Never keep client files only on a local drive. If you are starting a new project and the client folder does not exist yet, create it immediately before starting work — do not accumulate files on your desktop.",
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
            heading: "Handoff Readiness Criteria",
            body: "A design is ready for handoff only when all of the following are true: the client has provided written sign-off on the high-fidelity designs (an email saying 'approved' is acceptable, a verbal approval is not). All screens are present and named correctly in Figma. No Lorem Ipsum or placeholder content remains — all copy is final. All component states are designed: default, hover, active, focus, disabled, empty state, error state, and loading state. Every state must be visible in the Figma file. Responsive breakpoints are designed for at minimum: 375px (mobile), 768px (tablet), 1280px (desktop). No open design feedback comments in Figma — all comments resolved or actioned. A failure to meet any of these criteria before handoff creates technical debt that the developer has to guess at — this leads to bugs and rework.",
          },
          {
            heading: "Pre-Handoff File Preparation",
            body: "Before sharing with the developer: 1. Ensure all components are built with Auto Layout — hard-coded widths and heights make responsive implementation difficult. 2. All colours, text styles, and effects must use named Figma Styles — no ad-hoc hex colours on individual elements. 3. All icons must be from a consistent icon set (Lucide React for Swift Designz projects) — no mixing icon styles. 4. All assets that need to be exported are flagged with export settings in Figma (right-click → Mark for export). 5. Run the Figma 'Inspect' tab yourself before sharing — confirm spacing values, colours, and font specs are readable by the developer. 6. Create a Handoff page in the Figma file with: spacing system documentation, z-index stack, animation specs (timing, easing, trigger), and any interaction details that are not obvious from the prototype.",
          },
          {
            heading: "Handing Over to the Developer",
            body: "Share the Figma file with the developer using 'View' access — not 'Edit' access. Developers do not edit Figma files; they read them. Provide a written handoff note covering: the Figma link, the prototype link for the primary user flow, a list of all screens and their intended routes/pages, any third-party libraries or icon sets used, any animations or transitions not prototyped in Figma (describe them in words), and any known design constraints or compromises that were made during the process. Schedule a 30-minute handoff call with the developer to walk through the design — this one call prevents hours of back-and-forth questions. Be available during the build phase for design queries — respond to developer questions within 2 hours during core hours.",
          },
          {
            heading: "Design QA After Build",
            body: "Before any client demo or production deployment, conduct a design QA by comparing the live build side-by-side with the approved Figma designs. Check every screen at both mobile (375px) and desktop (1280px) viewports. Verify: colours match exactly (use a colour picker tool if uncertain), spacing and alignment are accurate, typography sizes and weights match the spec, all interactive states (hover, active, focus, disabled) are implemented, animations and transitions match the spec, all empty states and error states are present and styled. Log any discrepancies as design QA issues in GitHub — do not send them informally via WhatsApp. Categorise each as: Critical (wrong layout, missing feature, broken on mobile) or Minor (1–2px spacing off, slightly wrong colour shade). Critical issues must be resolved before the client demo. Minor issues are acceptable to defer to the next sprint with the Managing Member's approval.",
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
            heading: "Response Times & First Contact",
            body: "Inbound leads from the website form (swiftdesignz.co.za) arrive automatically in the admin portal Leads module. Respond to all new leads within 2 hours during business hours (08:00–17:00 Namibian time). For WhatsApp and direct email enquiries, respond within 1 hour during business hours. After-hours leads must be acknowledged with a brief message (automated or manual) confirming receipt, and followed up fully at 09:00 the next business day. Speed of response is a competitive advantage — a lead who enquires with three agencies and gets a response from one within an hour will almost always engage with that one first. Never let a new lead sit unactioned for more than 2 hours without a reason logged in the admin portal. If you cannot respond yourself during core hours, escalate to the Managing Member immediately.",
          },
          {
            heading: "Lead Qualification",
            body: "The purpose of the first contact is not to sell — it is to qualify. You need to determine whether this lead is a good fit before investing time in a proposal. Qualify on four dimensions: 1. Scope — what service do they need, and is it something Swift Designz does? (Web design, development, e-commerce, apps, retainers, AI training.) 2. Budget — what is their approximate budget? If they cannot give a number, share our starting price ranges: websites from N$8,000, e-commerce from N$15,000, apps from N$25,000. A client who balks at starting prices is not a fit — do not spend hours on a proposal for someone who cannot afford the service. 3. Timeline — is their deadline realistic? A client who needs a full e-commerce store in 2 weeks is setting everyone up to fail. 4. Decision-making — are you speaking to the decision-maker? A gatekeeper cannot say yes. If not, find out when you can speak with the person who can. Record all qualification information in the lead notes in the admin portal immediately after the first conversation.",
          },
          {
            heading: "Logging & Tracking Leads",
            body: "Every enquiry — regardless of source, likelihood of conversion, or size — must be logged in the admin portal Leads module within 1 hour of first contact. Required fields: full name, company (if applicable), email, phone number, service enquired about, budget range, timeline, source (website form, WhatsApp referral, cold enquiry, social media), and a note from the first conversation. Status must be kept current throughout the sales process: New (received, not yet contacted) → Contacted (first response sent) → Qualified (budget, scope, and timeline established) → Quoted (quotation sent) → Negotiating (follow-up in progress) → Won (deposit received) → Lost (disqualified or declined). Never mark a lead as Lost without a reason — the reason field drives future sales improvements.",
          },
          {
            heading: "Disqualification & Referral",
            body: "Not every lead is a fit, and that is acceptable. Disqualify a lead when: the budget is firmly below the minimum for the requested service and negotiation is not viable, the required timeline is unrealistic and the client is not flexible, the scope is entirely outside Swift Designz's service offerings, the client has unreasonable expectations that cannot be corrected in a first conversation, or there is a conflict of interest with an existing client. When disqualifying: be direct and respectful. Do not string a lead along with vague responses hoping they will go away. Tell them clearly that you do not think you are the right fit and, where possible, refer them to someone who might be. Referrals build goodwill and often come back. Mark the lead as Lost with the specific reason. Do not delete lead records — they are company data.",
          },
          {
            heading: "Follow-Up Cadence",
            body: "After sending a quotation, follow up if you have not received a response. Day 3 after sending: a brief, friendly check-in — 'Just checking this reached you and the details are clear.' Day 7: a more direct follow-up — 'Are there any questions I can answer?' Day 14: a final follow-up — 'I want to make sure I have not dropped the ball on my end. Do you have an update on timing?' If there is still no response after day 14, mark the lead as Lost with status 'Unresponsive' and move on. Do not send more than 3 unsolicited follow-up messages. Persistence is appropriate; harassment is not. Log every follow-up contact in the lead notes with the date and what was sent.",
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
            heading: "Scope Discovery Before Quoting",
            body: "Never write a quotation without a thorough scope discovery conversation. A quote written from a one-line email brief will be wrong, and a wrong quote leads to scope disputes, underpayment, and client dissatisfaction. The discovery conversation must cover: the full list of pages or features required; every third-party integration (payment gateway, booking system, CRM, social media feeds); who provides all content (copy, images, video) and by when; the number of revision rounds included; hosting, domain, and email requirements; launch date and any hard deadlines; whether an existing site is being redesigned (migration complexity) or this is greenfield; whether the client needs training to manage the site after delivery. Document the answers to every one of these questions in the lead notes in the admin portal before opening the quotation builder.",
          },
          {
            heading: "Pricing & Line Items",
            body: "All quotations must be broken into line items — a single lump sum is not acceptable because it gives the client no visibility into what they are paying for and makes change requests impossible to price. Standard line items for a website project: Project Setup & Discovery, Wireframes & Design, Development, Content Integration, Revisions (up to N rounds), Testing & QA, Deployment & Go-Live, Training (if included). Pricing is set by the Managing Member and reviewed quarterly. Do not quote outside approved price ranges without the Managing Member's written approval. For complex projects with technical unknowns, include a contingency line item of 10–15% labelled 'Scope Buffer'. If the scope buffer is not used, it is credited to the client on the final invoice — being transparent about this builds trust.",
          },
          {
            heading: "Payment Plans",
            body: "Swift Designz offers four standard payment plan structures for quotations: Full Payment (100% upfront, 5% discount applied), Standard 50/50 (50% deposit, 50% on delivery), 2-Month Flex (50% deposit, 25% at midpoint, 25% on delivery), 3-Month Ease (40% deposit, 30% at month 1, 30% on delivery). Use the payment plan preset in the quotation builder — do not manually calculate installments. All installment amounts and due dates must be explicitly stated in the quotation. The deposit is due before any work begins — no exceptions. If a client requests a custom payment plan, escalate to the Managing Member. All prices are in Namibian Dollars (NAD). The quotation must state whether amounts are VAT-inclusive or VAT-exclusive.",
          },
          {
            heading: "Sending & Following Up",
            body: "Generate the quotation in the admin portal (Accounts Receivable → Quotations → New Quotation). Review the generated PDF before sending — check: client name spelling, project name, every line item and amount, payment plan schedule, validity date (standard: 30 days from issue date). Send using the 'Send Quotation' button in the admin portal — this attaches the PDF, sends the acceptance link, and logs the send event automatically. Do not send quotations manually via email without using the portal — untracked quotations create AR chaos. After sending, mark the lead status as 'Quoted'. Follow up on day 3 and day 7 if no response. If the client has questions, answer them in writing via email and update the quotation if scope changes. If the validity period expires without acceptance, reissue the quotation — do not accept verbal agreement on an expired quote.",
          },
          {
            heading: "Quotation Acceptance & Handover to Billing",
            body: "A quotation is formally accepted when the client uses the acceptance link in the quotation email to sign electronically, OR sends a written email explicitly confirming acceptance (not just a thumbs up or WhatsApp message). On acceptance: the admin portal marks the quotation as Accepted, the first installment invoice is automatically generated, and a notification is sent to the Managing Member. The Managing Member reviews the accepted quote and confirms readiness to proceed. The first invoice must be sent and the deposit received before the project record is created and the team is assigned. No work begins before the deposit is confirmed — this protects the business from unbillable discovery and design work for clients who ultimately do not proceed.",
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
            heading: "Deposit Receipt — Immediate Actions",
            body: "When a deposit payment is confirmed in the admin portal: 1. Send a personalised welcome email within 2 hours — not a template blast. Reference the project by name, express genuine enthusiasm for the work, and confirm the next step (kickoff call scheduling). 2. Create the client record in the Clients module if it does not already exist — verify all contact details are correct. 3. Create the project record: link it to the client, set the project name, start date, estimated delivery date, and status as 'Planning'. 4. Break down the scope into milestones in the project record — at minimum: Kickoff, Design Approval, Development Handoff, UAT, Launch. 5. Generate and send the Client Onboarding document via the Documents module — this is the formal project agreement that sets expectations. The client must acknowledge it before the kickoff call.",
          },
          {
            heading: "Kickoff Meeting Preparation",
            body: "Schedule the kickoff call within 3 business days of deposit receipt — not within 3 weeks. Prepare the following before the call: a printed or screen-ready version of the agreed scope from the quotation, a project timeline showing milestone dates, a list of all assets and decisions required from the client (content, branding, access credentials), a communication plan (primary contact on both sides, preferred channel, response time expectations), a brief on how the admin portal works for the client (where they will find documents, how invoices are sent, how they accept quotes). Send the agenda to the client 24 hours before the kickoff call so they can prepare on their side.",
          },
          {
            heading: "Kickoff Call Execution",
            body: "The kickoff call agenda: (10 min) Introductions and building rapport — understand who the client is, what the business does, and who the real end users of the deliverable are. (15 min) Scope walkthrough — go through every line item in the quotation and confirm the client understands what is included and what is not. Address ambiguities now, not mid-project. (10 min) Timeline review — confirm each milestone date. Flag any risk the client's asset delivery timeline creates. (10 min) Communication expectations — agree on who the primary contact is, what channel is used, how quickly each party responds, and what needs to be in writing. (5 min) Next steps — confirm the first deliverable, its due date, and what the client needs to deliver for work to begin. Send written meeting notes within 24 hours covering decisions made and action items with owners and deadlines.",
          },
          {
            heading: "Asset & Access Collection",
            body: "Work cannot begin without the necessary client assets and access. Required assets for a web project: company logo in vector format (AI, EPS, or SVG — not a JPG screenshot), approved colour codes in HEX, web fonts or links to the font licence, all content (copywriting, images, video) for all pages being built, existing site login credentials if a redesign (hosting, CMS, domain registrar). Collect access credentials using a secure method only — OneTimeSecret (onetimesecret.com) for passwords, or the company password manager's secure send feature. Never accept passwords via WhatsApp or plain email. Set a firm deadline for asset delivery: assets not received by [agreed date] will delay the project start, and the timeline adjusts proportionally. Document this deadline in writing in the project notes and copy it to the client in the meeting summary.",
          },
          {
            heading: "Ongoing Client Relationship",
            body: "Good onboarding is the beginning of an ongoing relationship, not a one-time event. After kickoff: send a progress update at every milestone completion — do not wait for the client to ask. Respond to all client messages within 4 business hours during core hours. If a milestone will be delayed for any reason, notify the client before the original due date with a revised date and a brief reason. Do not communicate scope changes, pricing changes, or timeline changes verbally — put everything in writing. After project delivery: request a testimonial or Google review within 1 week of the client expressing satisfaction. Discuss ongoing maintenance retainer options. A successfully delivered project is the most effective sales tool for the next project.",
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
            heading: "Creating an Invoice",
            body: "Navigate to Accounts Receivable → Billing in the admin portal. Every invoice must be linked to a specific client and a specific project — an invoice without a project link is a data quality failure. Line items must match the agreed quotation exactly. Never add charges that were not in the accepted quotation or a subsequently approved Change Request — unagreed charges destroy client trust instantly and are often disputed. Use the AR number system (SD26-INV-XXX) generated automatically by the portal — never create manual invoice numbers. Standard payment terms are 7 days from the invoice date. If the client has agreed to different terms in writing, reflect them on the invoice. Set the due date correctly — the reminder system schedules itself based on the due date. Before saving, compare the invoice total against the accepted quotation or payment plan schedule to confirm it matches.",
          },
          {
            heading: "Sending Invoices",
            body: "Use the 'Send Invoice' button in the admin portal — this generates the PDF, attaches it to an email, sends the email via Resend to the client's billing email address, and logs the sent event automatically. Do not send invoices manually as email attachments outside the portal — untracked invoice sends create AR chaos and make it impossible to manage reminders. Before clicking Send: verify the billing email address is correct (a bounced invoice delays payment by days). If the invoice is for an installment in a payment plan, confirm the portal has pre-populated the correct installment number and that the payment plan schedule in the email shows the correct amounts and due dates for all installments. Send invoices during business hours — an invoice that arrives at 23:00 on a Friday is less likely to be actioned than one that arrives Monday morning.",
          },
          {
            heading: "Following Up on Unpaid Invoices",
            body: "The admin portal auto-schedules payment reminders when an invoice is sent. The reminder stages are: 3 days before due date (gentle reminder), on the due date (due today reminder), 3 days overdue (firm reminder), and 7 days overdue (urgent notice). These reminders are placed in the Reminders queue under Accounts Receivable and must be reviewed and approved before they send. Do not let reminders sit unapproved for more than 24 hours — delayed reminders are the leading cause of slow payment collection. If a client still has not paid after the 7-day overdue reminder, escalate to the Managing Member. The Managing Member will decide whether to issue a formal statement, place the account on hold, or engage the client directly. Do not threaten legal action without the Managing Member's explicit instruction.",
          },
          {
            heading: "Recording Payments",
            body: "When a client submits proof of payment, verify the amount against the invoice in the admin portal before recording the payment. Navigate to the invoice → Record Payment. Required fields: payment date (use the date the funds were received in the bank account, not the date the proof of payment was sent), amount received, payment method (EFT, cash, card), and any reference number from the bank statement. For partial payments: record the amount received and confirm the remaining balance displayed is correct. After recording payment, send the payment receipt using the 'Send Receipt' button — this generates a PDF receipt and emails it to the client automatically. Do not skip sending receipts. A receipt is both a courtesy and a legal record. Verify the corresponding income entry appears in Accounting → Income after recording.",
          },
          {
            heading: "Credit Notes & Disputes",
            body: "A credit note reduces the amount owed on an invoice. It is used for: billing errors, agreed scope reductions, goodwill adjustments authorised by the Managing Member, or to cancel an invoice that should not have been issued. Under no circumstances may a credit note be issued without written authorisation from the Managing Member — this is a financial control. To raise a credit note: navigate to the invoice → Add Credit Note, enter the amount and reason. The credit note is logged against the invoice and reduces the outstanding balance. If a client disputes an invoice amount: do not issue a credit note while the dispute is unresolved. Log the dispute reason in the invoice notes and escalate to the Managing Member within 1 business day. The Managing Member reviews the scope agreement and determines whether the dispute is valid before any adjustment is made.",
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
            heading: "What Is & Is Not Claimable",
            body: "Claimable business expenses — items that reduce the company's taxable income — include: software subscriptions used for business purposes (Adobe, Figma, GitHub, Netlify, Supabase, Resend, etc.), domain registrations and hosting fees, hardware and peripherals purchased for business use (becomes company property, not personal property), professional development (courses, books, certifications directly related to your role), transport costs for client meetings (fuel or Uber — must be documented with client name and meeting purpose), mobile data or internet costs directly attributable to business use (with documentation), and bank charges. Non-claimable expenses include: personal meals, entertainment, clothing, gym memberships, personal phone plans, fines, penalties, and any personal spending regardless of how it is framed. If you are unsure whether an expense qualifies, ask the Managing Member before incurring it — not after.",
          },
          {
            heading: "Pre-Approval Requirements",
            body: "Any single expense over N$500 requires pre-approval from the Managing Member via written message (WhatsApp or email is acceptable) before the purchase is made. For recurring subscriptions over N$300/month, get approval before signing up — not after the first charge arrives. Emergency purchases under N$500 that could not wait for pre-approval must be reported to the Managing Member within 24 hours of the purchase with a brief explanation of why it was urgent. Claiming an expense that was not pre-approved (where pre-approval was required) may result in the claim being rejected at the Managing Member's discretion.",
          },
          {
            heading: "Logging Expenses in the Portal",
            body: "Navigate to Accounting → Expenses → New Expense. Required fields: date of the expense (the date you paid, not the date you are logging it), category (Software, Hardware, Transport, Professional Development, Hosting, Other), description (be specific — not 'software' but 'Figma annual subscription FY2026'), amount in Namibian Dollars including any VAT, and source document upload. A receipt or invoice must be uploaded for every expense without exception — not a photo of a WhatsApp payment notification, but the actual supplier invoice or receipt. If you paid via EFT and the supplier does not issue a receipt, use the bank statement line item as supporting documentation. Log expenses within 3 business days of incurring them — do not accumulate a month's worth and submit them all at once.",
          },
          {
            heading: "Recurring Subscriptions",
            body: "All recurring subscriptions (monthly or annual) must be documented in a subscriptions register maintained by the Managing Member. When a new subscription is set up, add it to the register with: service name, purpose, monthly or annual cost, billing date, payment method, and the team member responsible for it. Review all recurring subscriptions on the first business day of each quarter. Cancel any subscription that has not been used in the previous 30 days. Subscriptions left running unused are pure waste — N$200/month unused is N$2,400 per year. Before cancelling a subscription, confirm with the team that the service is genuinely unused — do not cancel shared tools without notifying all users.",
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
            heading: "Month-End Reconciliation Process",
            body: "The monthly reconciliation is performed on the last business day of each month and must be completed by the 5th of the following month. Step 1 — Invoice review: open Accounting in the admin portal and review every invoice issued during the month. Confirm each one is: Paid (receipt issued), Partial (correct outstanding balance showing), Sent (still within terms — no action needed), or Overdue (escalate to AR reminder process). No invoice may be in an unknown or ambiguous state. Step 2 — Income reconciliation: for every payment recorded in the portal during the month, verify it corresponds to an actual bank deposit on the bank statement. The amount, date, and client reference must match. Flag any discrepancy immediately. Step 3 — Expense reconciliation: for every expense entry in the portal during the month, verify the source document (receipt/invoice) is uploaded and the amount matches the bank debit. Step 4 — Net position: calculate total income received minus total expenses paid. Compare to the bank account closing balance. Investigate any material difference before closing the month.",
          },
          {
            heading: "Bank Statement Matching",
            body: "Download the full month's bank statement from Bank Windhoek online banking on the last business day of the month. Work through every debit and credit line: income credits must match a payment confirmation in the admin portal — if a credit appears with no matching portal entry, investigate immediately (was it recorded under a different client? was it a personal transfer?). Expense debits must match an expense entry in the portal — if a debit appears with no entry, log it and attach the bank statement line as the source document. Any transaction you cannot identify within 24 hours must be escalated to the Managing Member. A reconciled month has zero unmatched transactions. Retain bank statements for 7 years — download and file them in Finance/[YYYY-MM]/Bank Statements.",
          },
          {
            heading: "Financial Reports & Year-End",
            body: "After completing the monthly reconciliation, generate the following reports from the admin portal: P&L Report for the month (Accounting → P&L Report), Accounts Receivable Ageing Report (outstanding invoices by age bracket), and the accounts receivable balance summary. Share all three with the Managing Member by the 5th of the following month. At financial year-end (last day of February): export the full year's income and expense data as CSV (Accounting → Export). Prepare a year-end summary: total revenue, total expenses, net profit, accounts receivable balance, and any outstanding liabilities. Provide all documentation to the Accounting Officer (Rachel N. Kashala, SAIBA 4132) by 15 March for financial statement preparation. Ensure all income entries have the correct category assigned — the Accounting Officer uses these categories for tax classification and preparing the ITX return.",
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
            heading: "Written Communication Standards",
            body: "Every client-facing message — email, WhatsApp, or any other channel — reflects the quality of Swift Designz as a business. Write with the same care you would give a document going to a board of directors. Use full sentences and correct punctuation. No abbreviations that the client might not understand. No slang, no excessive informality, and no emojis in any context. Plain English always: if you catch yourself writing 'leverage synergies' or 'moving the needle', delete it and say what you mean. Explain all technical concepts in plain language — a client who cannot understand your update is a client who loses confidence. Proofread every message before sending. If you are writing under stress or frustration, write the message, save it as a draft, re-read it in 10 minutes, and send a calmer version. Never send an emotional response to a client in real time.",
          },
          {
            heading: "Response Times & Channels",
            body: "Email: respond within 4 business hours during core hours (08:00–17:00 Namibian time). WhatsApp: respond within 2 hours during core hours. Missed calls: call back within 2 hours or send a WhatsApp acknowledging the call and confirming when you will be available. Never leave a client waiting more than 1 business day without any response — even if you cannot fully answer yet, send an acknowledgement: 'Received your message — I am looking into this and will come back to you by [specific time].' Do not use personal WhatsApp for client communication — use the company WhatsApp account or business email. WhatsApp is appropriate for quick updates and brief questions. For scope discussions, approvals, change requests, or anything that requires a record: use email. Decisions communicated only on WhatsApp are difficult to enforce if a dispute arises.",
          },
          {
            heading: "Proactive Communication",
            body: "The single biggest cause of client dissatisfaction is the feeling of being ignored or kept in the dark. Prevent this with proactive updates. Send a progress update at every milestone completion — do not wait for the client to ask. If you anticipate a delay, communicate it before the originally agreed date, not after. The message format for a delay notification: 'I wanted to give you advance notice that [milestone] will be ready on [new date] instead of [original date]. This is because [brief, honest reason]. Here is what I am doing to minimise the impact: [your plan].' Clients can handle bad news; they cannot handle surprises. A client who receives proactive communication throughout a project is far more likely to refer new clients than one who had to chase for updates.",
          },
          {
            heading: "Scope Change Communication",
            body: "Scope creep is the most common cause of profitability erosion on client projects. Any request that goes beyond the agreed deliverables in the signed quotation is a scope change — even if it seems small. The correct response to a scope change request is never an immediate 'yes' or 'no'. The correct response is: 'Let me check the current scope and come back to you with how this fits or what a change request would look like.' Then: 1. Review the signed quotation. 2. Determine if the request is genuinely out of scope. 3. If it is, generate a Change Request Form (Documents → Client Templates → Change Request Form) with the additional cost and any timeline impact. 4. Send it to the client for written approval. 5. Issue a supplementary invoice before beginning the additional work. Do not begin out-of-scope work without a signed Change Request — not even if the client says 'just a small change', 'it will only take a few minutes', or 'we agreed on this verbally'. Every change that costs money must be documented.",
          },
          {
            heading: "Escalation & Difficult Clients",
            body: "Escalate to the Managing Member immediately when: a client is being verbally abusive, threatening, or making you uncomfortable; a dispute has gone through two rounds of written communication without resolution; a client is making allegations of negligence, fraud, or threatening legal action; you have received a formal demand, letter of complaint, or any legal correspondence; a client is attempting to withhold a final payment; or you are genuinely unsure how to respond to a sensitive situation. When escalating: do not apologise on behalf of the company without the Managing Member's direction. Do not make promises or concessions. Do not respond further to the client until the Managing Member has reviewed the situation. Forward all relevant correspondence to the Managing Member without editing or paraphrasing. A difficult client handled well becomes a loyal client. A difficult client handled poorly becomes a legal or reputational risk.",
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
            heading: "Pre-Handover Checklist",
            body: "A project is not ready for handover unless all of the following are true: every deliverable from the signed quotation has been built and tested. All approved Change Requests have been completed and invoiced. The final QA has been completed and all critical and major bugs are resolved (see Development SOP: QA Checklist). The client has signed off on every milestone in writing. The final invoice has been issued (even if payment terms allow time to pay — the invoice must exist). All client-provided assets (content, logos, credentials) that were collected during the project are either integrated into the final product or returned to the client. The Project Handover document has been generated in the admin portal and the content is complete and accurate. Do not rush handover to close the project on the books — an incomplete handover leads to post-launch support requests that are unbillable.",
          },
          {
            heading: "Handover Package Contents",
            body: "The Project Handover document generated via the Documents module must include: the live URL of the delivered website, app, or system; all login credentials for the platform (CMS, hosting, admin dashboard) delivered via a secure method (OneTimeSecret link, not plain email); domain registrar account details and the renewal date; hosting account details and the renewal date; a plain-English guide to performing the most common content updates the client will need (adding a blog post, updating a price, changing a contact number); instructions for what to do if something breaks (who to contact, what information to provide); a list of all third-party services used in the project and their login details; and the company's maintenance retainer offer with pricing. Generate the PDF via the portal and send it using the 'Send' button — log the send event. Do not email the handover document as a plain attachment outside the portal.",
          },
          {
            heading: "Handover Call",
            body: "Schedule a 45-minute handover call with the client within 3 business days of completing the final deliverable. The agenda: (10 min) Live walkthrough of the delivered product — demonstrate every feature against the original scope. The client must see the full product working, not just screenshots. (15 min) Training on the CMS or admin system — screen share the actual interface. Record the call and share the recording with the client so they can refer back to it. (10 min) Handover package walkthrough — show them where all credentials, documents, and instructions are. (10 min) Q&A. At the end of the call: confirm the client is satisfied with the delivery, confirm the payment status for any outstanding balances, and agree on a point of contact for the post-launch warranty period. If the client is not satisfied at the handover call, this is not the time to close the project — log the issues, create a resolution plan, and reschedule handover.",
          },
          {
            heading: "Post-Handover & Warranty",
            body: "All Swift Designz projects include a 14-day post-launch warranty period. During this period, any defect in the delivered scope — something that does not work as it was designed and agreed to — is fixed at no charge as a priority. This does not cover new features, content changes, or changes of mind. Log all warranty requests in the project notes in the admin portal with the date received and the date resolved. If a warranty fix requires more than 4 hours of work, escalate to the Managing Member to determine whether it is genuinely a defect or a scope change. After the warranty period expires: mark the project as Completed in the admin portal. Request a testimonial or Google review — ask specifically and give the client a link to make it easy. Ask whether the client would consent to the project being featured in the portfolio and on social media. If consent is given, log it in the client record.",
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
            heading: "Receiving & Logging Support Requests",
            body: "Support requests come in via email to info@swiftdesignz.co.za and via the client's primary WhatsApp contact. Every support request — regardless of how it arrives — must be logged in the admin portal within 2 hours of receipt. Navigate to the client's record → Projects → [Relevant Project] → Add Note. The note must include: date and time received, how it was received (email/WhatsApp), a description of the issue in the client's own words, the urgency indicated by the client, and your initial assessment of the nature of the request. Do not attempt to fix anything before you have logged the request. A support request that exists only in WhatsApp and your memory is a liability — if it is not in the portal, it did not happen.",
          },
          {
            heading: "Classification: Bug vs Change Request",
            body: "Every support request is either a Bug or a Change Request — this classification determines how it is handled and whether it is billable. A Bug is a defect: the application or website does something different from what was agreed in the signed quotation. Examples: a form that was supposed to send email notifications and does not; a page that was designed for mobile and is not responsive on mobile; a calculation that produces an incorrect result. A Change Request is a new requirement: the client wants something added, modified, or removed that was not part of the original scope. Examples: adding a new page that was not in the quotation; changing the navigation structure; adding a new product category. When in doubt about classification, ask the Managing Member — incorrect classification leads to either unbillable work or a billing dispute.",
          },
          {
            heading: "In-Warranty Support (0–14 days post-launch)",
            body: "During the 14-day warranty period, confirmed Bugs are fixed at no charge as a high priority. The target resolution time is: P1 (site down or major feature broken) — 4 hours from the time of logging. P2 (feature degraded, workaround available) — 24 hours. P3 (cosmetic) — 5 business days. On resolution: notify the client in writing specifying what the bug was, what caused it, and what was fixed. Log the resolution in the project notes with the date and time. If a warranty fix reveals that the root cause is something outside Swift Designz's control (hosting issue, client's browser extension, third-party API failure), document this clearly — the fix may still be done as a courtesy, but the client must understand the cause.",
          },
          {
            heading: "Out-of-Warranty Support (15+ days post-launch)",
            body: "After the 14-day warranty period, all support is billable unless the client has an active Maintenance Retainer. For Bugs that are clearly defects in the delivered work: use your judgment — minor bugs discovered after the warranty period may be fixed as a goodwill gesture with the Managing Member's approval. Log the decision. For all other support (changes, new features, content updates, migrations): generate a quotation before any work begins. The quotation must specify the support rate, the estimated hours, and the scope of the fix or change. Do not start work and then invoice retrospectively — this creates disputes. If the client has a Maintenance Retainer: verify that the requested support falls within the retainer scope and the allocated monthly hours before starting. If the request exceeds the retainer hours, notify the client and obtain approval for additional billing before proceeding.",
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
            heading: "Reporting Calendar & Deadlines",
            body: "Swift Designz provides investors with three levels of reporting. Monthly Report: a concise performance summary delivered via the admin portal by the 5th of each calendar month, covering the prior month. This is a high-level brief — revenue collected, key projects delivered, new leads won, and any significant blockers or risks. It is not a full financial statement. Quarterly Report: a comprehensive financial and operational report delivered within 10 business days of each quarter end (quarters run March–May, June–August, September–November, December–February). This includes an income statement, expense breakdown, net position, accounts receivable ageing, pipeline summary, and strategy updates. Annual Report: a full year-end review delivered by 31 May each year (3 months after the 28 February financial year end). This includes audited or reviewed financial statements, year-over-year comparisons, forward projections for the next financial year, and a strategic review.",
          },
          {
            heading: "Monthly Report Contents",
            body: "The monthly report must include the following sections: 1. Revenue: total invoiced in the period, total collected in the period, and the variance with a brief explanation if material. 2. Accounts Receivable: total outstanding, broken down by age (0–30 days, 31–60 days, 61–90 days, 90+ days). Flag any accounts over 60 days with a brief note on status. 3. Key Wins: projects completed, clients onboarded, notable milestones. 4. Pipeline: number of active leads, number of open quotations, value of open quotations. 5. Expenses: total operating expenses for the period compared to the prior month. 6. Net Position: profit or loss for the period and year-to-date. 7. Commentary: any events, decisions, or external factors that affected performance. 8. Outlook: what is planned for the next 30 days and any expected revenue. Reports are generated from the admin portal and delivered as PDFs via the investor's restricted portal login.",
          },
          {
            heading: "Quarterly & Annual Report Standards",
            body: "Quarterly reports follow the same structure as monthly reports but include additional sections: a full income statement (P&L), a balance sheet summary, a cash flow summary, a comparison to the same quarter in the prior year (once prior year data exists), and a strategic update covering product development, team changes, market observations, and any changes to the business model or service offerings. Annual reports are the most comprehensive — they include everything in the quarterly report plus: a full review of all goals set at the start of the financial year versus actual outcomes, a risk register update (what risks materialised, what new risks exist), a dividend or distribution discussion if applicable, and forward projections for the next financial year broken down by quarter. All financial data in investor reports must be drawn from the admin portal and reconciled against the bank statement before inclusion — no estimated figures.",
          },
          {
            heading: "Delivery & Access",
            body: "All investor reports are delivered through the admin portal's investor portal login. When a new report is ready: generate the PDF, upload it via the Documents module, and send a notification to the investor by email or WhatsApp confirming the report is available. Do not send investor reports as plain email attachments — all investor documents must be logged in the portal for audit purposes. Investors access their restricted portal at admin.swiftdesignz.co.za using their allocated login. The portal shows only investor-relevant content: dashboard, projects, documents, investor module, equipment, and reports. If an investor reports difficulty accessing the portal, resolve the access issue within 1 business day — an investor who cannot see their reports loses confidence quickly.",
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
            heading: "What is Confidential",
            body: "The following information is strictly confidential and may not be disclosed to any third party by either Swift Designz staff or investors without written consent from the Managing Member: investor identities, the fact that a person is an investor, the amount and terms of their investment, and any communications between Swift Designz and its investors. Business financial data including revenue, expenses, profit margins, client names, project values, and pipeline data. Strategic plans, product roadmaps, pricing strategies, and market positioning. Client identities, their project details, payment history, and any contractual terms. Employee details, salaries, and performance information. Any document, email, or communication marked 'Confidential' or 'Private'. The Investor NDA signed during onboarding gives these obligations legal force — breach of the NDA is actionable under Namibian contract law.",
          },
          {
            heading: "Staff Obligations",
            body: "Access to investor information is restricted to the Managing Member and specifically authorised admin users. No other staff member — including employees, contractors, or interns — may access investor records, investment amounts, or investor reports. Do not discuss investors or investment terms with clients, contractors, team members without access clearance, or any member of the public. All investor documents are stored exclusively in the admin portal — never in personal Google Drive, Dropbox, personal devices, WhatsApp conversations, or any external service. If you discover that investor information has been inadvertently shared with an unauthorised person — even within the company — report it to the Managing Member immediately. The correct response is disclosure and containment, not concealment.",
          },
          {
            heading: "Investor Obligations",
            body: "Investors who have signed the Investor NDA are bound by the following obligations: they may not share financial data, strategic information, or client details received through the investor portal or reports with any third party. They may not use business information obtained through their investor relationship for personal financial advantage beyond their agreed investment returns (insider trading equivalent). They may not share login credentials for the investor portal with any other person. They must notify the Managing Member immediately if they believe their portal access has been compromised or if they have inadvertently shared confidential information. The confidentiality obligations in the NDA survive the end of the investment relationship — they apply even after an investor exits. The NDA is a binding legal document, not a formality.",
          },
          {
            heading: "Breach Response",
            body: "A suspected breach of investor confidentiality is a serious matter. If you suspect a breach: 1. Do not confront the suspected party yourself — report to the Managing Member immediately by direct message. 2. Preserve all evidence: do not delete messages, emails, or documents that may be relevant. 3. The Managing Member will assess the nature and scope of the breach. 4. If the breach is confirmed: the Managing Member will consult legal counsel and determine whether the breach is material enough to warrant legal action. 5. The affected party will be notified in writing of the breach and the company's position. 6. If the breach involves a staff member, the disciplinary procedure applies. If it involves an investor, the NDA provides the legal framework for remedy. Swift Designz takes confidentiality obligations seriously and will not overlook breaches regardless of the relationship with the person involved.",
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
            heading: "Communication Channels & Principles",
            body: "All formal investor communications — reports, documents, agreements, and material updates — are delivered via the admin portal or by email from info@swiftdesignz.co.za. Informal updates (brief status messages, scheduling confirmations) may be sent via WhatsApp from the Managing Member directly. No staff member other than the Managing Member may initiate communication with an investor without explicit authorisation. This channel discipline exists to prevent confusion about who speaks officially on behalf of the company. Every significant investor communication must be logged — if it was on WhatsApp, copy the key content into a note in the investor's record in the admin portal. If something was said verbally, follow it up in writing within 24 hours to create a record. The principle: if it is not written, it did not happen.",
          },
          {
            heading: "Response Standards",
            body: "Investor queries must be acknowledged within 1 business day of receipt — even if you cannot answer fully, send a confirmation that the query was received and confirm when you will respond. Provide a full response within 3 business days. If the query requires investigation or data gathering that will take longer than 3 business days, communicate this on day 2: 'I am still gathering the information to answer your question fully. I expect to have a complete response by [specific date].' Never leave an investor query unacknowledged for more than 1 business day. Investors who feel ignored become anxious and lose confidence, and anxious investors ask more questions, not fewer. Good communication hygiene prevents this cycle.",
          },
          {
            heading: "Investor Meetings",
            body: "Quarterly review meetings are offered to all active investors within 15 days of the quarterly report being published. Format: video call (preferred) or in-person in Windhoek if the investor is local. Duration: 45–60 minutes. Agenda structure: (10 min) Review of the quarterly report — key numbers, highlights, concerns. (15 min) Business update — what is happening in the business beyond the numbers. (15 min) Strategy discussion — where is the business going, what is being planned. (10 min) Investor Q&A — open floor. The agenda must be shared with the investor at least 48 hours before the meeting. Meeting notes must be distributed within 3 business days, covering: key points discussed, decisions made, and any commitments made by either party. If a commitment is made in a meeting, log it in the admin portal as an action item with a due date.",
          },
          {
            heading: "Material Events & Unscheduled Communication",
            body: "Certain events require investor notification outside the regular reporting schedule. These include: a material change in business revenue (more than 20% above or below projections for a quarter), a significant new client or contract win, the loss of a key client, a legal dispute or regulatory action, a change in key personnel (Managing Member or Accounting Officer), a change in the company's registered details, a proposed change to the terms of any investment agreement, and any event that could materially affect the value of the investment. Material events must be communicated to all affected investors within 5 business days of the Managing Member becoming aware of them. The communication must be factual, honest, and clear about the impact — do not downplay material negative events. Investors who receive bad news promptly and clearly are far more likely to remain supportive than investors who discover bad news was withheld.",
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

  // ── Employee: Company Info ──────────────────────────────────────────────────
  {
    slug: "employee-company-info",
    label: "Company Info",
    description: "Who we are, what we stand for, and how the business is structured",
    icon: "Building2",
    color: "text-teal-400",
    accentBg: "bg-teal-400/10",
    roles: ["admin", "employee"],
    items: [
      {
        id: "emp-company-overview",
        title: "Company Overview & Welcome",
        description: "Introduction to Swift Designz — mission, values, services, and key contacts",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          { heading: "Who We Are", body: "Swift Designz Investments CC (CC/2026/05589) is a registered Namibian Close Corporation headquartered at Erf 55 Kenneth McArthur Street, Auas Blick, Windhoek. We are a digital agency specialising in web design, web development, e-commerce solutions, mobile and software applications, AI workflow training, and project management consulting. We serve businesses across Namibia and beyond.\n\nManaging Member: Keenan Husselmann. Accounting Officer: Rachel N. Kashala (SAIBA 4132). NamRA TIN: 16271273. CC Registration effective: 12 May 2026.\n\nThe admin portal (admin.swiftdesignz.co.za) is the single source of truth for all business activity — every client, project, invoice, document, and team member is tracked here. If it is not in the portal, it does not exist for business purposes." },
          { heading: "Mission & Values", body: "Our mission is to deliver high-quality digital products that give Namibian businesses the competitive presence they deserve — combining strong technical execution with clear communication and genuine ownership of outcomes.\n\nThe five values that define how we work:\n\n1. Quality First — We do not ship work we would not be proud to put our name on. If something is not right, we fix it before it goes to the client.\n2. Client Respect — Clients trust us with their businesses. We honour that by being honest, proactive, and professional at every touchpoint.\n3. Ownership — Every team member owns their area completely. If something is in your scope and it goes wrong, you own the fix.\n4. Continuous Learning — The digital landscape changes constantly. Staying current is not optional — it is part of the job.\n5. Integrity — We say what we mean, we do what we say, and we do not cut corners when no one is watching.\n\nThese are not a wall poster. They are the standard against which your work is measured." },
          { heading: "Services We Deliver", body: "Website Design & Development: responsive, mobile-first websites on Next.js, WordPress, or Webflow.\n\nE-Commerce: Shopify, WooCommerce, and custom stores with payment gateway integration.\n\nApp & Software Development: web apps, dashboards, internal tools built to production standards.\n\nAI Workflow Training: structured training for businesses integrating Claude, ChatGPT, and Midjourney into their operations.\n\nMaintenance Retainers: monthly agreements for ongoing support, updates, and site management.\n\nProject Management Training: workshops covering scoping, milestone planning, stakeholder communication, and delivery accountability.\n\nEvery team member represents all of these services in every interaction. When you communicate with a client, you are Swift Designz." },
          { heading: "Key Contacts & Systems", body: "Business email: info@swiftdesignz.co.za\nWebsite: swiftdesignz.co.za\nAdmin portal: admin.swiftdesignz.co.za\nPhysical: Erf 55 Kenneth McArthur Street, Auas Blick, Windhoek\nPostal: P.O. Box 4655, Rehoboth, Namibia\nBanking: Bank Windhoek, Maerua Mall, Account 8056219849, Code 483-872\n\nCore systems:\n- Admin portal — clients, projects, invoices, documents, team\n- GitHub — version control for all development\n- Figma — design files and prototypes\n- Google Workspace — email and calendar\n- Supabase — database and auth (dev team)\n- Netlify — deployment and hosting (dev team)" },
        ],
      },
      {
        id: "emp-brand-guide",
        title: "Brand & Design Guidelines",
        description: "Logo, colours, typography, tone of voice, and visual identity standards",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "The Swift Designz Logo",
            body: "The logo is the most visible representation of the company. Use it correctly in every context.\n\nRules:\n• Use the full logo on dark backgrounds (default).\n• Use the reversed version on light backgrounds only.\n• Maintain a clear exclusion zone of at least the height of the logomark on all four sides.\n• Never stretch, rotate, recolour, apply shadows, or add effects.\n• Never place the logo on a busy or low-contrast background.\n• Always use the source file — never recreate or resize by eye.\n\nLogo files are in the company shared asset folder. If you cannot locate them, ask before proceeding.",
            extras: [{ type: "image", src: "/logo.png", alt: "Swift Designz logo", caption: "Official Swift Designz logo — use source files only, never recreate" }],
          },
          {
            heading: "Colour Palette",
            body: "Always use exact hex values — never approximate. Even a small shift in the primary teal is noticeable and looks unprofessional. For client projects: document the client's exact colour codes before opening any design tool.",
            extras: [{
              type: "colors",
              items: [
                { name: "Primary Teal", hex: "#30B0B0", usage: "CTAs, links, highlights" },
                { name: "Background", hex: "#101010", usage: "Page backgrounds" },
                { name: "Card Surface", hex: "#1A1A1A", usage: "Panels, modals, cards" },
                { name: "Border", hex: "#2A2A2A", usage: "Dividers, outlines" },
                { name: "Dark Grey", hex: "#303030", usage: "Secondary surfaces" },
                { name: "Text Primary", hex: "#F5F5F5", usage: "Body copy, headings" },
                { name: "Text Muted", hex: "#9CA3AF", usage: "Labels, captions" },
                { name: "Success", hex: "#22C55E", usage: "Paid, completed" },
                { name: "Warning", hex: "#F59E0B", usage: "Pending, overdue" },
                { name: "Danger", hex: "#EF4444", usage: "Errors, destructive" },
              ],
            }],
          },
          { heading: "Typography", body: "Font: Inter (all weights). Available on Google Fonts — load via Next.js `next/font/google`, never via a `<link>` tag.\n\nScale:\n• H1 / Page titles: 28–32px, Bold (700)\n• H2 / Section headings: 20–24px, SemiBold (600)\n• H3 / Card headings: 16–18px, SemiBold (600)\n• Body: 14–16px, Regular (400), line height 1.6\n• Labels / Captions: 12px, Medium (500)\n\nMinimum body size for web: 14px. For print: 10pt. Never set body copy in all-caps. Body text is always Regular weight — never Bold." },
          { heading: "Tone of Voice", body: "Swift Designz communicates as a direct, knowledgeable professional — not a corporation, not a casual friend.\n\nKey rules:\n• Plain English always. Explain technical terms in the same sentence.\n• Short sentences. Over 25 words? Split it.\n• Active voice: 'We deliver the project', not 'The project is delivered by us.'\n• No padding — every word earns its place.\n• No emojis in professional contexts: emails, documents, proposals, invoices, reports.\n• No faith references or political commentary in any company output.\n• First-person plural (we/our) for company content.\n\nIf unsure: read it aloud. If it sounds like a press release, simplify. If it sounds like a text message, formalise." },
          { heading: "Document & Asset Standards", body: "All client-facing documents — quotations, invoices, receipts, statements, contracts — are generated via the admin portal. Never create these manually in Word, Google Docs, or Canva.\n\nPDF documents use the Swift Designz B&W template. Do not add colour to document PDFs.\n\nIcon set: Lucide React for all digital work. Do not mix icon libraries within a project.\n\nImage exports:\n• Web: WebP (preferred), PNG for transparency, JPG at 85% for photos\n• Print: PDF at 300dpi\n• Minimum: 2x resolution for all web assets\n• Optimise all images before delivery — target under 200KB per image" },
        ],
      },
      {
        id: "emp-org-structure",
        title: "Organisation Structure",
        description: "Roles, reporting lines, and decision-making authority",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          { heading: "Structure & Reporting Lines", body: "Swift Designz operates as a flat structure with clear accountability:\n\nManaging Member (Keenan Husselmann)\n  └── Accounting Officer (Rachel N. Kashala) — financial statements, tax, compliance\n  └── Project Leads (assigned per project) — delivery accountability\n      └── Team Members (developers, designers, admin, marketing)\n\nAll team members report directly to the Managing Member unless a Project Lead is explicitly designated in writing for a specific project. Project Leads have authority over delivery decisions within their project scope only — not over pay, contracts, or company-wide decisions.\n\nDepartments (functional areas):\n• Development — web, app, and software engineering\n• Design — UI/UX, brand, visual design\n• Operations — admin, finance support, project coordination\n• Marketing — content, social media, lead generation" },
          { heading: "Decision Authority Matrix", body: "Managing Member approval required:\n• Any pricing change or discount over 5%\n• Accepting a new client\n• Vendor or tool subscription over N$500/month\n• Hiring, changing, or ending an engagement\n• Any communication that could be interpreted as a legal commitment\n• Public statements about the company\n• Any refund or credit over N$1,000\n\nProject Lead authority (within their project only):\n• Day-to-day delivery and task prioritisation\n• Escalating a bug to Critical severity\n• Requesting a Change Request from a client\n\nTeam Member authority (no approval needed):\n• Daily work execution within agreed scope\n• Logging support requests, bugs, and issues in the portal\n• Purchasing pre-approved tools under N$500 (report same day)\n\nWhen in doubt: ask before acting." },
          { heading: "Portal Access Levels", body: "Admin — full access: all clients, projects, invoices, payments, accounting, documents, team, equipment, settings, investor data. Currently: Managing Member only.\n\nViewer — create and edit invoices, quotations, and leads. Cannot access accounting reports, investor data, or company settings.\n\nEmployee — Documents and Settings only. Cannot view client financial data, invoices, or pipeline.\n\nInvestor — restricted portal: dashboard, projects, documents, investor module, equipment, and reports only.\n\nAccess changes are made by the Managing Member only. Request additional access in writing if your role expands." },
        ],
      },
      {
        id: "emp-services-catalogue",
        title: "Services Catalogue",
        description: "Full breakdown of every service Swift Designz offers, with delivery scope and typical timelines",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          { heading: "Web Design & Development", body: "What we deliver: responsive, mobile-first websites built to the agreed design and specification.\n\nTech stack: Next.js (preferred for dynamic sites), WordPress (content-heavy sites with non-technical editors), Webflow (design-forward static marketing sites). Hosting: Netlify by default.\n\nDeliverables: wireframes, Figma designs (client-approved), fully coded and tested website, CMS training if applicable, Project Handover document.\n\nTypical timeline: 3–6 weeks for a standard 5–8 page website, depending on client content delivery speed.\n\nNot included by default: copywriting, photography, logo design, domain purchase, ongoing hosting payments (client's responsibility after handover)." },
          { heading: "E-Commerce & Apps", body: "E-Commerce: fully functional online stores with payment gateway integration. Platforms: Shopify (recommended), WooCommerce, or custom Next.js. Typical timeline: 4–8 weeks. Not included: payment gateway registration (client must provide API keys), product photography, product descriptions.\n\nApp & Software Development: web apps, admin dashboards, internal tools, and data-driven software. Tech: Next.js + Supabase + TypeScript. Typical timeline: 8–24 weeks depending on complexity. Minimum quote: N$25,000. Do not quote below this threshold without the Managing Member's approval — projects scoped below this are typically underdelivered.\n\nAll projects require: thorough scope discovery, signed quotation, and deposit payment before any work begins." },
          { heading: "Retainers, Training & Other Services", body: "Maintenance Retainers: monthly agreements for a set number of support hours. Covers content updates, security patches, bug fixes, and performance monitoring. All retainers are managed through the Retainer Subscriptions module in the admin portal.\n\nAI Workflow Training: 2–8 hour structured training (in-person or virtual) teaching teams to integrate Claude, ChatGPT, Gemini, and Midjourney into daily operations. Deliverables: customised training deck + 30-day implementation guide.\n\nProject Management Training: workshops for teams or managers covering scoping, milestone planning, stakeholder communication, and delivery accountability. Typically 4–8 hours per engagement.\n\nAll scope, pricing, and deliverables for any engagement must be documented in a signed quotation before work begins — no verbal agreements." },
        ],
      },
      {
        id: "emp-tools-tech-stack",
        title: "Tools & Technology Stack",
        description: "Every tool used at Swift Designz — what it does and how to get access",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          { heading: "Design Tools", body: "Figma — primary design tool for all UI/UX work, wireframes, prototypes, and design systems. Access: request from Managing Member. All client project files live in the company Figma workspace — do not work in personal accounts.\n\nLucide React — icon library for all digital projects. Browse at lucide.dev. Never mix icon libraries within a project.\n\nSquoosh (squoosh.app) — browser-based image optimisation. Use for all image exports before production. Default: WebP at 85% quality.\n\nGoogle Fonts / next/font — Inter is the primary font. Load via Next.js font optimisation, never via a `<link>` tag." },
          { heading: "Development Tools", body: "GitHub — version control. Every project lives in the Swift Designz GitHub organisation. All work on feature branches — never commit directly to main.\n\nNext.js — primary web framework. React 19, App Router. Server Components by default — Client Components only when necessary.\n\nSupabase — PostgreSQL database, authentication, RLS, and file storage. The admin portal's entire backend. Read-only access for development reference.\n\nNetlify — deployment and hosting. All projects deploy via GitHub push to main. Environment variables live in the Netlify dashboard only — never in committed code.\n\nVS Code — recommended editor. Required extensions: ESLint, Prettier, Tailwind CSS IntelliSense, GitLens.\n\nTypeScript — mandatory. Strict mode. No `any` types." },
          { heading: "Communication & Finance Tools", body: "Google Workspace — company email (firstname@swiftdesignz.co.za) and Google Calendar. All formal communications use the company email.\n\nWhatsApp Business — quick team comms and client updates. The company number is used for client-facing communication by the Managing Member.\n\nResend — transactional email. Used by the admin portal to send invoices, receipts, reminders, and statements. Do not use personal email for any automated business emails.\n\nBitwarden — password manager. All company accounts stored here, not in browser-saved passwords. Request access from the Managing Member.\n\nAdmin Portal — the primary business management system: clients, projects, leads, invoices, quotations, payments, retainers, accounting, documents, team, equipment, investors.\n\nBank Windhoek Online Banking, NamRA e-Services, and SSC Portal — access restricted to Managing Member and Accounting Officer only." },
        ],
      },
      {
        id: "emp-working-calendar",
        title: "Working Hours & Public Holidays",
        description: "Core hours, Namibian public holidays observed, and leave request process",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          { heading: "Working Hours", body: "Core hours: 08:00–17:00 Namibian time (UTC+2), Monday to Friday. All team members are expected to be reachable and actively working during these hours. Lunch: 12:00–13:00 (response times up to 1 hour acceptable for non-urgent matters).\n\nSwift Designz does not clock in/out — performance is measured by output quality and deadlines met. However, being consistently unavailable during core hours without communication is treated as an attendance issue.\n\nAfter-hours contact: only urgent matters may be escalated via direct WhatsApp to the Managing Member outside core hours. This is not a channel for routine questions." },
          { heading: "Namibian Public Holidays Observed", body: "1 January — New Year's Day\n21 March — Independence Day\nGood Friday — variable\nEaster Monday — variable\n1 May — Workers' Day\n4 May — Cassinga Day\n25 May — Africa Day\n26 August — Heroes' Day\n10 December — Human Rights Day\n25 December — Christmas Day\n26 December — Family Day\n\nIf a public holiday falls on Saturday or Sunday, the following Monday is observed. Work required on a public holiday due to a client deadline must be agreed in advance and compensated at 1.5x the daily rate." },
          { heading: "Leave Request Process", body: "Annual leave: 20 working days per year (full-time), pro-rated for part-time or fixed-term. Leave accumulates monthly.\n\nTo request leave: send a WhatsApp message or email to the Managing Member with: type of leave, first day, last day, and total working days. Submit at least 5 business days before the start date. Leave during peak delivery periods may be declined with an alternative date offered.\n\nSick leave: notify the Managing Member before 09:00 on the first day. A medical certificate is required for 3+ consecutive sick days.\n\nLeave is not approved until you receive written confirmation from the Managing Member. Do not assume approval." },
        ],
      },
    ],
  },

  // ── Employee: Legal & Compliance ────────────────────────────────────────────
  {
    slug: "employee-legal",
    label: "Legal & Compliance",
    description: "Confidentiality, data protection, acceptable use, code of conduct, IP, and disciplinary procedure — required sign-off",
    icon: "FileText",
    color: "text-rose-400",
    accentBg: "bg-rose-400/10",
    roles: ["admin", "employee"],
    items: [
      {
        id: "emp-nda",
        title: "Confidentiality Agreement",
        description: "Your legally binding obligations regarding client data, business information, and IP — requires sign-off",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "What is Confidential",
            body: "The following categories of information are confidential and may not be disclosed to any third party under any circumstances without explicit written consent from the Managing Member:\n\nClient information: names, contact details, company information, project scope, deliverables, pricing, payment terms, and any discussion of their business strategy or competitive position.\n\nFinancial data: company revenue, expenses, profit margins, invoice amounts, salary and compensation details, investor identities, investment amounts and terms, banking details, and tax information.\n\nTechnical information: source code, database schemas, system architecture, API keys, access credentials, admin portal data, and any intellectual property developed during your engagement.\n\nBusiness strategy: sales pipeline, leads under consideration, pricing strategies, product roadmaps, planned service launches, and partnership discussions.\n\nPersonnel information: information about other team members, their roles, compensation, performance, or personal circumstances.\n\nOperational information: these SOPs, internal workflows, client communication patterns, and tooling configurations.\n\nIf you are ever unsure whether a piece of information is confidential, treat it as confidential until you have confirmed otherwise with the Managing Member in writing.",
          },
          {
            heading: "Your Obligations During Engagement",
            body: "You must not disclose, share, discuss, post, publish, or otherwise make available any confidential information to any person outside Swift Designz Investments CC — including friends, family members, former colleagues, or professional contacts — without explicit written authorisation from the Managing Member.\n\nYou must use confidential information only for the purpose of performing your assigned duties. Accessing confidential information out of curiosity, for personal benefit, or for any purpose unrelated to your work is a breach of this agreement.\n\nYou must store all confidential information securely. Client data lives in Supabase via the admin portal — not in personal Google Drive, personal email, USB drives, local spreadsheets, WhatsApp, or any service not authorised by the company. If you are unsure whether a storage method is approved, ask before using it.\n\nYou must not create copies of confidential documents for personal retention. When your engagement ends, all company documents, files, credentials, and data in your possession must be returned or deleted.\n\nYou must report any suspected or actual breach — including accidental disclosure — to the Managing Member immediately. Prompt reporting is a mitigating factor. Concealment of a breach is treated as a deliberate act and will be addressed accordingly.",
          },
          {
            heading: "Post-Engagement Obligations",
            body: "Your confidentiality obligations do not end when your engagement with Swift Designz ends. They continue for a period of 2 years after your last day of engagement for all confidential information you accessed during your time with the company.\n\nThis means: for 2 years after leaving Swift Designz, you may not:\n• Use client information to approach those clients as a competitor or on behalf of a competitor.\n• Share financial, strategic, or technical information about Swift Designz with any third party.\n• Reproduce or use any intellectual property, code, designs, or materials you developed during your engagement without written permission.\n• Assist any person or organisation in circumventing the protections in this agreement.\n\nAfter 2 years, general knowledge and skills you developed during your engagement are yours to use. However, specific client data, proprietary systems, and trade secrets remain confidential indefinitely.",
          },
          {
            heading: "Consequences of Breach",
            body: "A breach of this confidentiality agreement is a serious matter with potentially serious consequences.\n\nImmediate employment consequences: a confirmed breach will result in immediate termination of your engagement, without notice or payment in lieu, regardless of the stage of any current projects.\n\nCivil liability: Swift Designz reserves the right to pursue civil damages for any loss caused by a breach of confidentiality. This includes loss of a client, loss of a competitive advantage, and any legal costs incurred in enforcing this agreement.\n\nCriminal liability: certain breaches — particularly those involving theft of company data, fraud, or criminal damage — may be referred to the Namibian Police Service (NAMPOL) and prosecuted under applicable Namibian legislation, including the Computer Crimes Act and the Labour Act.\n\nBy signing this document, you confirm that you have read, understood, and agree to be legally bound by these obligations for the duration of your engagement and for 2 years thereafter.",
          },
        ],
      },
      {
        id: "emp-data-protection",
        title: "Data Protection & Privacy Policy",
        description: "How to classify, handle, store, and dispose of personal and client data — requires sign-off",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Data We Collect and Hold",
            body: "Swift Designz holds the following categories of personal and business data in the course of operating as a digital agency:\n\nClient personal data: full names, company names, email addresses, phone numbers, physical and postal addresses, NamRA Tax Identification Numbers (TINs), and banking details for payment processing.\n\nProject data: scope documents, quotations, invoices, contracts, communication history, design files, and source code.\n\nFinancial data: all income and expense records, payment confirmations, bank statements, tax filings, and payroll records.\n\nEmployee data: full names, contact details, identity document numbers, banking details, contracts of employment, performance records, and payslips.\n\nInvestor data: investor identities, investment amounts, terms, reports, and all communications.\n\nAll of this data is stored exclusively in Supabase (the admin portal's database), the company's Google Workspace, and the designated cloud file storage. It must never be stored in personal accounts, messaging apps, or any system not authorised by the Managing Member.",
          },
          {
            heading: "Data Classification & Access Control",
            body: "Not all data requires the same level of protection. Swift Designz uses four classification levels:\n\nPublic: information the company voluntarily makes available — the company name, address, email, website, and general service descriptions. No access restrictions.\n\nInternal: day-to-day working documents, project status updates, and internal SOPs. Accessible to all team members with a company login.\n\nConfidential: client names and contact details, project pricing, invoice amounts, and financial summaries. Accessible only to team members who need it for their specific role. Do not share with other team members unless there is a clear work need.\n\nStrictly Confidential: investor identities and investment terms, salary and compensation data, full financial statements, legal correspondence, and login credentials. Accessible only to the Managing Member and Accounting Officer. Do not access, share, or discuss this category of data under any circumstances.",
          },
          {
            heading: "Your Data Handling Obligations",
            body: "Access only the data you need to complete your assigned tasks. If your role does not require access to a particular category of data, do not access it — even if the system technically allows it.\n\nDo not export, copy, or download client data to personal storage. This includes: saving a client's contact details in your personal phone, copying invoices to personal Google Drive, or screenshotting financial data for personal reference.\n\nDo not share personal data with third parties — including suppliers, contractors, or any other service provider — without the Managing Member's written approval.\n\nUse strong, unique passwords (16+ characters) on every company system and enable 2FA. A compromised account is a data breach.\n\nWhen you finish working with a data file or document, close it. Do not leave sensitive documents open on your screen while away from your device.\n\nData retention obligations: client records must be retained for a minimum of 7 years. Employee records must be retained for 5 years after the end of the engagement. Do not delete any company data without written authorisation from the Managing Member — even if you believe it is no longer needed.",
          },
          {
            heading: "Data Breach Response",
            body: "A data breach is any event where personal or confidential data is accessed, disclosed, altered, or destroyed without authorisation — whether by an external attacker, an internal error, or accidental exposure.\n\nExamples of data breaches: sending a client's invoice to the wrong email address, leaving a logged-in company device unattended in a public space, accidentally posting confidential information in a group chat, a phishing attack that results in a compromised company account, and losing a device that has company data on it.\n\nYou must report any suspected or confirmed data breach to the Managing Member immediately — the same day, not the next business day. Contact via WhatsApp or call if outside business hours. Do not wait to investigate fully before reporting — report what you know, then investigate.\n\nThe Managing Member will assess the breach, determine its scope, take containment steps, and decide whether the affected clients or authorities need to be notified. In certain cases, Namibian law may require notification of affected parties.\n\nConcealing a data breach — or delaying its report — is treated as a deliberate act and will result in disciplinary action, regardless of the original circumstances.",
          },
          {
            heading: "Acknowledgement",
            body: "Swift Designz processes personal data only for the purpose of delivering its services to clients, complying with its tax and regulatory obligations, and managing its team. We do not sell, rent, license, or otherwise share personal data with third parties for commercial purposes.\n\nWe rely on Supabase's built-in encryption at rest and in transit to protect stored data. We rely on role-based access control in the admin portal to limit data access to authorised users.\n\nBy signing this document, you confirm that:\n• You have read and understood the data categories, classification levels, and your personal obligations.\n• You will handle all company data in accordance with this policy throughout your engagement and for the retention period thereafter.\n• You will report any suspected breach immediately.\n• You understand that a violation of this policy may result in disciplinary action, termination, and/or legal proceedings.",
          },
        ],
      },
      {
        id: "emp-acceptable-use",
        title: "Acceptable Use Policy",
        description: "Rules for using company systems, software, credentials, and AI tools — requires sign-off",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Covered Systems",
            body: "This policy applies to all systems, platforms, devices, and accounts provided by or associated with Swift Designz Investments CC. This includes, but is not limited to:\n\n• The admin portal (admin.swiftdesignz.co.za)\n• Google Workspace (company email and calendar)\n• GitHub (Swift Designz organisation and all repositories)\n• Supabase (database and authentication)\n• Netlify (deployment and hosting)\n• Figma (design workspace)\n• Bitwarden (password manager)\n• Any company WhatsApp account or number\n• Any software subscription paid for by the company\n• Any device owned by the company or issued on loan\n\nThis policy also applies to personal devices when they are used to access company systems — the system is covered by this policy regardless of what device it is accessed from.",
          },
          {
            heading: "Permitted Use",
            body: "Company systems are provided exclusively for legitimate business purposes related to your role at Swift Designz. Permitted activities include:\n\n• Performing tasks directly related to your assigned projects and role responsibilities.\n• Using approved productivity tools (VS Code, Figma, Google Workspace) for work tasks.\n• Installing tools and extensions required for your role, provided they are listed in the Tools & Technology Stack SOP or have been approved by the Managing Member in writing.\n• Using AI productivity tools (Claude, ChatGPT, Gemini) to assist with work tasks — subject to the AI tools policy below.\n• Accessing company documentation, SOPs, and training materials for professional development.\n\nPersonal use of company systems is not a disciplinary matter if it is brief and incidental — checking personal email during a work break is not a concern. Sustained personal use during working hours or use that interferes with work performance is not acceptable.",
          },
          {
            heading: "Prohibited Use",
            body: "The following activities are strictly prohibited on company systems and may result in immediate disciplinary action:\n\nCompetitive activity: using company systems, time, or resources to operate a competing business, solicit Swift Designz clients for personal gain, or work for a direct competitor while engaged with Swift Designz — unless explicitly agreed in writing in your contract.\n\nCredential sharing: sharing your login credentials with any other person, including colleagues. If a colleague needs access to a system, request access through the Managing Member — do not share your credentials.\n\nSoftware piracy: installing unlicensed software on company devices or using pirated tools in company projects. All software must be properly licensed.\n\nInfrastructure abuse: using company infrastructure (servers, hosting, domain names, APIs) for personal projects, cryptocurrency mining, running bots, or any non-work purpose.\n\nIllegal or harmful content: accessing, downloading, storing, or distributing content that is illegal, pornographic, discriminatory, or that constitutes harassment.\n\nSecurity circumvention: attempting to bypass, disable, or test security controls on company systems without explicit authorisation from the Managing Member.",
          },
          {
            heading: "AI Tools Policy",
            body: "Swift Designz encourages the productive use of AI tools including Claude (Anthropic), ChatGPT (OpenAI), and Gemini (Google) for tasks such as drafting content, debugging code, summarising documents, and accelerating research. These are powerful tools when used responsibly.\n\nPermitted: using AI to assist with writing, coding, planning, and analysis tasks related to your work.\n\nProhibited without explicit approval: submitting confidential client information to any public AI model. This includes: client names, project details, pricing, source code that identifies the client, or any data that would allow the AI provider to identify the client or their business. Public AI models are not private — your input may be used to train future models.\n\nIf your work requires using an AI tool with client data (e.g. processing a client's product catalogue), raise this with the Managing Member first. Approved workflows for handling client data with AI will use enterprise-tier or self-hosted models with appropriate data processing agreements.\n\nAll AI-generated output used in client deliverables must be reviewed, edited, and approved by a human team member before delivery. You are responsible for the accuracy and quality of everything you submit — 'the AI wrote it' is not an acceptable explanation for an error.",
          },
          {
            heading: "Security Requirements & Monitoring",
            body: "All team members are required to:\n• Use a unique, strong password (minimum 16 characters) for every company account, stored in Bitwarden.\n• Enable two-factor authentication (2FA) on every company account — authenticator app preferred over SMS.\n• Lock your screen whenever you step away from your device, even briefly.\n• Use a VPN when accessing company systems on any network that is not your private home network.\n• Keep all operating systems, browsers, and installed software updated within 48 hours of security patch releases.\n• Report phishing emails, suspicious login notifications, or any unusual system behaviour immediately.\n\nThe Company reserves the right to monitor usage of company systems for the purposes of security, compliance, and performance management. This monitoring may include review of access logs, email records on company accounts, and activity on company-owned devices. Accessing a company system constitutes consent to this monitoring policy.",
          },
        ],
      },
      {
        id: "emp-code-of-conduct",
        title: "Code of Conduct",
        description: "Workplace behaviour, professionalism, integrity, and anti-harassment standards — requires sign-off",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Professionalism & Work Standards",
            body: "Swift Designz holds every team member to a consistent standard of professional conduct. The following behaviours are required of all team members at all times:\n\nDeadlines: meet your commitments. If a deadline is at risk, communicate the risk before the deadline — not after it passes. A missed deadline that was anticipated but not communicated is a failure of professional conduct, not just of delivery.\n\nAccuracy and honesty: do not misrepresent the status of your work, your skill level, or the hours you have invested. If work is incomplete, say so. If you made an error, report it immediately — the cost of fixing an acknowledged error is almost always lower than the cost of the same error discovered later.\n\nConflict of interest: declare any situation where your personal interests could influence your professional decisions to the Managing Member immediately upon becoming aware of it. This includes: having a personal relationship with a client, owning shares in a supplier, or having a financial interest in an outcome of a business decision.\n\nRepresentation: you represent Swift Designz in every interaction during your engagement — not only during formal client meetings. Your social media, professional networking, and public behaviour reflect on the company. Conduct yourself accordingly.",
          },
          {
            heading: "Respect, Dignity & Anti-Harassment",
            body: "Swift Designz is committed to a workplace where every team member is treated with dignity and respect, regardless of their background, identity, or role in the company.\n\nProhibited conduct — the following are strictly prohibited and will result in disciplinary action up to and including immediate termination:\n• Discrimination based on race, ethnicity, gender, gender identity, sexual orientation, age, disability, religion, nationality, or any other characteristic protected under Namibian law.\n• Verbal, written, or physical harassment of any team member, client, partner, or contractor.\n• Creating, sharing, or tolerating a hostile, intimidating, or offensive work environment.\n• Bullying — defined as repeated unreasonable behaviour directed at a person that creates a risk to their health and safety or dignity.\n• Sexual harassment in any form, including unwanted comments, physical contact, or digital communication.\n\nIf you experience or witness any of the above: you have the right to report it. Use the Grievance Procedure (Legal & Compliance → Grievance Procedure). Reports will be treated confidentially and investigated promptly. Retaliation against anyone who reports harassment in good faith is itself a disciplinary matter.",
          },
          {
            heading: "Client & Partner Relations",
            body: "Clients and partners are the foundation of the business. Your conduct in every client interaction must reflect the standards Swift Designz has committed to.\n\nMandatory behaviours:\n• Respond to client communications within the timeframes set in the Communication SOP.\n• Deliver what was agreed in the quotation. Do not deliver less and bill the same.\n• Escalate client dissatisfaction to the Managing Member immediately — do not attempt to manage a genuinely unhappy client alone.\n\nProhibited behaviours:\n• Speaking negatively about a client to another team member, in any context — what you say internally shapes how you treat them externally.\n• Sharing client names, project details, or pricing with competitors or any third party.\n• Entering into side agreements with clients outside of Swift Designz's formal engagement structure — if a client approaches you for personal work, you must declare this to the Managing Member before agreeing to anything.\n• Making commitments to clients (scope, timeline, pricing) that have not been authorised by the Managing Member.",
          },
          {
            heading: "Social Media & Public Statements",
            body: "Team members must exercise good judgment on social media and in any public forum. Specific rules:\n\nYou may not: post, share, or comment on anything that discloses confidential company information, client names, project details, or financial data. You may not make any public statement on behalf of Swift Designz — press releases, media interviews, partnership announcements, or public responses to negative reviews — without the Managing Member's approval. You may not engage in public disputes with clients, competitors, or members of the public that could damage the company's reputation.\n\nYou may: identify yourself as a team member of Swift Designz on professional networks such as LinkedIn. Share publicly available information about the company (website, services, contact details). Share your own professional work and portfolio items, provided you have the client's consent and the content does not reveal confidential details.\n\nWhen in doubt: do not post. Ask the Managing Member first.",
          },
          {
            heading: "Disciplinary Process & Consequences",
            body: "Violations of the Code of Conduct are addressed through a structured process, with the severity of the response proportional to the severity of the conduct.\n\nStage 1 — Verbal Warning: for first-time, minor violations where the team member acknowledges the issue and commits to improvement. Documented in writing by the Managing Member within 24 hours.\n\nStage 2 — Written Warning: for repeated minor violations after a verbal warning, or for a first-time moderate violation. The written warning sets specific improvement targets and a review timeline.\n\nStage 3 — Final Written Warning: for continued violations after a written warning, or for a serious violation. Specifies that the next breach will result in termination.\n\nStage 4 — Immediate Termination: for gross misconduct, which includes: fraud, theft, deliberate data breach, harassment, violence, or any action that causes serious harm to the company, a client, or a colleague. Gross misconduct bypasses stages 1–3.\n\nAll disciplinary actions are documented in writing. The team member has the right to respond to any disciplinary finding in writing within 5 business days. Nothing in this process prevents a team member from approaching the Office of the Labour Commissioner if they believe a disciplinary action is unfair.",
          },
        ],
      },
      {
        id: "emp-ip-ownership",
        title: "Intellectual Property & Ownership",
        description: "Who owns the work you create — IP assignment, client IP, and personal project rules — requires sign-off",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Work Product Ownership",
            body: "Any work you create in the course of your engagement with Swift Designz — including but not limited to: source code, design files, databases, documentation, written content, training materials, processes, methodologies, and any other intellectual property — is owned by Swift Designz Investments CC from the moment it is created.\n\nThis applies regardless of: which device you used to create it, whether you created it during or outside core working hours (if it is for a Swift Designz project), whether the work was your original idea, and whether the work was formally assigned to you or you created it on your own initiative for the company's benefit.\n\nYou are required to promptly disclose to the Managing Member any work product you create that relates to Swift Designz's business — even if you created it independently — so that ownership and usage can be properly recorded.\n\nThis clause does not apply to work you create entirely in your personal time that is entirely unrelated to Swift Designz's business. Personal side projects on your own time, using your own resources, are yours.",
          },
          {
            heading: "Client IP",
            body: "When Swift Designz creates deliverables for a client — a website, an application, design assets — the ownership of those deliverables transfers to the client upon receipt of full payment, in accordance with the project contract.\n\nThis means: once a project is fully paid for, the client owns the final deliverables. Swift Designz retains the right to display completed work in its portfolio (with client consent), and retains ownership of any proprietary frameworks, tooling, or internal components used in the project that predate the client engagement.\n\nYou may not: use a client's assets, brand materials, content, or deliverables for any purpose other than completing their project. You may not reuse client-specific code, designs, or data in other projects without the Managing Member's explicit written approval and, in many cases, the client's consent.\n\nIf you are unsure whether a component is a client deliverable (owned by the client after payment) or a company internal tool (owned by Swift Designz), ask the Managing Member before reusing it.",
          },
          {
            heading: "Open Source & Third-Party Licensing",
            body: "Swift Designz uses a number of open-source libraries, frameworks, and tools in its work. When incorporating open-source software into client projects, you are responsible for ensuring the licence terms are compatible with commercial use.\n\nLicences and their implications for commercial projects:\n• MIT Licence — very permissive. Commercial use, modification, and distribution are allowed. Attribution required in the code, not necessarily in the product.\n• Apache 2.0 — similar to MIT. Patent protection included. Commercial use allowed.\n• GPL (General Public License) — requires that any derivative work also be distributed under GPL. This is a significant constraint for commercial software — avoid GPL-licensed libraries in client projects unless the Managing Member approves and the client is informed.\n• Commercial licences — always verify the licence before using any paid or enterprise software in a client project. The licence purchased for internal Swift Designz use may not cover client deployments.\n\nWhen in doubt: check the licence. The npm licence-checker tool can audit all dependencies in a Node.js project. Never assume a library is free to use commercially because it is free to download.",
          },
          {
            heading: "Personal Projects & Non-Compete",
            body: "You are free to pursue personal projects on your own time, using your own resources, as long as they do not:\n• Directly compete with Swift Designz's services (web design, development, AI training, e-commerce, maintenance retainers) in the Namibian market.\n• Use or incorporate any Swift Designz intellectual property, client data, or proprietary methodologies.\n• Require you to use Swift Designz's systems, infrastructure, or company time.\n• Create a conflict of interest with a current or prospective Swift Designz client.\n\nIf you have a personal project that could potentially be in conflict with any of the above, disclose it to the Managing Member before you start. A disclosed personal project that is approved in writing is not a violation of this policy.\n\nThis non-compete applies during your engagement and for 12 months after the end of your engagement, within Namibia only.",
          },
        ],
      },
      {
        id: "emp-disciplinary-procedure",
        title: "Disciplinary & Grievance Procedure",
        description: "Your rights and responsibilities in disciplinary proceedings and grievance submissions — requires sign-off",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Principles of Fair Process",
            body: "Swift Designz is committed to fair, consistent, and transparent disciplinary and grievance procedures. These procedures are grounded in the Namibian Labour Act, 2007 (Act 11 of 2007) and the principle that every team member has the right to know the allegation against them, the right to respond, and the right to be heard before a decision is made.\n\nKey principles:\n• No disciplinary action will be taken without the team member being informed of the allegation in writing and given a reasonable opportunity to respond.\n• The Managing Member will investigate allegations before determining an outcome — a conclusion is not predetermined.\n• Disciplinary proceedings are confidential. The details of any proceeding will not be shared with other team members beyond what is necessary.\n• Retaliation against a team member for raising a grievance, participating in a disciplinary investigation, or exercising any right under this procedure is prohibited and will itself be treated as a disciplinary matter.",
          },
          {
            heading: "Disciplinary Procedure",
            body: "When a potential violation of company policy is identified, the following process applies:\n\nStep 1 — Investigation: the Managing Member (or designated investigator) gathers facts. The team member under investigation is notified in writing within 2 business days and given the opportunity to provide their account of events.\n\nStep 2 — Notice of hearing: if the investigation indicates a potential violation, the team member receives a written notice specifying the allegation, the relevant policy, the proposed disciplinary outcome, and the date and time of a hearing. Minimum notice: 48 hours before the hearing.\n\nStep 3 — Hearing: the team member may present their response to the allegation, call witnesses, and submit supporting evidence. The hearing is conducted by the Managing Member. Notes are taken.\n\nStep 4 — Outcome: a written outcome is issued within 5 business days of the hearing. The outcome will be one of: no action (allegation not substantiated), verbal warning, written warning, final written warning, or dismissal.\n\nStep 5 — Appeal: the team member may appeal the outcome in writing within 5 business days of receiving it. Appeals are reviewed by an independent person where possible, or by the Managing Member with fresh consideration of the evidence.",
          },
          {
            heading: "Gross Misconduct",
            body: "Certain conduct is so serious that the graduated disciplinary process (verbal warning → written warning → final warning) does not apply. Gross misconduct results in immediate suspension pending investigation, and may result in summary dismissal without notice or payment in lieu of notice.\n\nExamples of gross misconduct at Swift Designz:\n• Theft or fraud of any kind, including misappropriation of company funds, falsification of expense claims, or deception of clients.\n• Deliberate breach of confidentiality that causes or could cause material harm.\n• Physical violence or credible threats of violence toward any person.\n• Sexual harassment or serious harassment of any kind.\n• Wilful damage to company or client property.\n• Serious data breach caused by deliberate action or reckless disregard for security policy.\n• Working for a direct competitor without disclosure, in violation of the employment contract.\n• Providing false information in an investigation.\n\nEven in gross misconduct cases, the team member will be informed of the allegations and given the opportunity to respond before a final decision is made. The obligation of fairness is not waived — only the graduated warning process.",
          },
          {
            heading: "Grievance Procedure",
            body: "You have the right to raise a formal grievance if you believe you have been treated unfairly, if company policy has not been followed, if you have experienced harassment or discrimination, or if you have any other legitimate workplace concern.\n\nStep 1 — Informal resolution: where it is safe and appropriate to do so, attempt to resolve the issue directly with the other party in a private, calm conversation. Many workplace issues can be resolved at this stage.\n\nStep 2 — Formal grievance submission: if informal resolution is not possible or appropriate, submit a written grievance to info@swiftdesignz.co.za. Your grievance must include: your name, the date, a clear description of the issue, the dates and details of relevant events, any evidence you have, and your desired outcome.\n\nStep 3 — Acknowledgement: the Managing Member will acknowledge your grievance within 2 business days.\n\nStep 4 — Investigation and hearing: an investigation will be completed and a hearing scheduled within 15 business days. You will be given the opportunity to present your account.\n\nStep 5 — Outcome: a written outcome will be issued within 5 business days of the hearing.\n\nStep 6 — Appeal: if you are dissatisfied with the outcome, you may appeal in writing within 5 business days. If the grievance is against the Managing Member, an independent mediator will be engaged.",
          },
          {
            heading: "Labour Commissioner",
            body: "Nothing in this internal procedure prevents you from approaching the Office of the Labour Commissioner of Namibia at any stage of the process, in accordance with the Labour Act, 2007 (Act 11 of 2007).\n\nThe Office of the Labour Commissioner can be contacted at:\nMinistry of Labour, Industrial Relations and Employment Creation\nPrivate Bag 19005\nWindhoek, Namibia\nTelephone: +264 61 206 9111\n\nYou may refer a dispute to the Labour Commissioner if: the internal procedure has been exhausted without satisfactory resolution, you believe you have been unfairly dismissed, you believe your rights under the Labour Act have been violated, or you wish to pursue a conciliation or arbitration process.\n\nSwift Designz will cooperate fully with any legitimate Labour Commissioner process. By signing this document, you confirm that you have read, understood, and accept the disciplinary and grievance procedures set out above.",
          },
        ],
      },
      {
        id: "emp-social-media-policy",
        title: "Social Media & Public Communication Policy",
        description: "What you can and cannot post publicly about the company, clients, and your work — requires sign-off",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Why This Policy Exists",
            body: "Social media is permanent, public, and fast-moving. A single post can damage a client relationship, breach a confidentiality agreement, create legal liability, or undermine the company's reputation in ways that take years to recover from. This policy is not designed to restrict your personal freedom — it is designed to protect you, your colleagues, and the company from unintended consequences.\n\nThis policy applies to all public digital communications: social media posts and comments (Facebook, Instagram, LinkedIn, TikTok, X/Twitter), public WhatsApp groups, public forums and communities (Reddit, Discord, Stack Overflow), public blog posts, podcast appearances, and any other medium where the content is accessible to people outside the company.\n\nThe policy applies regardless of whether you identify yourself as a Swift Designz team member in the post.",
          },
          {
            heading: "What You May Post",
            body: "You are free to be a professional person with a public presence. The following are explicitly permitted:\n\n• Identifying yourself as a team member at Swift Designz on LinkedIn and other professional networks. You may list your role, the type of work you do, and skills you have developed.\n\n• Sharing publicly available information about Swift Designz — the company website, services offered, contact details, and general information about what the company does.\n\n• Sharing your own portfolio work — designs, code samples, completed projects — provided: the work has been delivered to the client and you have the Managing Member's verbal or written confirmation that the client consents to being featured. Do not share project details (scope, pricing, client challenges) even when sharing visual work.\n\n• General professional commentary about your industry — design trends, development practices, tools and technologies — that does not reference company clients or projects.\n\n• Personal content unrelated to work — travel, hobbies, family, and personal interests are entirely your own business.",
          },
          {
            heading: "What You May Not Post",
            body: "The following are prohibited and may result in disciplinary action, including immediate termination and potential civil liability:\n\n• Confidential information: client names, project details, pricing, scope, or any information covered by the Confidentiality Agreement.\n\n• Financial information: company revenue, profit, expenses, salaries, or investor details.\n\n• Negative commentary: disparaging remarks about clients, competitors, colleagues, or the company — even anonymously. 'A client of mine' is still identifiable in context.\n\n• Legal or regulatory matters: any reference to ongoing or potential legal disputes, regulatory investigations, or compliance matters.\n\n• Unofficial company positions: statements that could be interpreted as the official position of Swift Designz on any matter — political, social, commercial, or otherwise — without the Managing Member's prior written approval.\n\n• Internal matters: details of internal disciplinary proceedings, grievances, team conflicts, or business challenges that are not public knowledge.",
          },
          {
            heading: "Crisis Situations",
            body: "A crisis situation is any event where there is significant public discussion about Swift Designz or one of its clients — positive or negative. This includes: a project going viral, a negative review gaining traction, media enquiries, and public allegations of any kind.\n\nIn a crisis situation, the correct response for every team member except the Managing Member is: say nothing publicly until the Managing Member has issued guidance. Do not respond to public comments, do not share your personal opinion, and do not attempt to defend the company without coordination. An uncoordinated response from multiple people almost always makes the situation worse.\n\nIf you become aware of a developing crisis (you see a negative post gaining traction, a journalist contacts you, a client makes a public complaint), notify the Managing Member immediately by direct WhatsApp — regardless of the time.\n\nBy signing this document, you confirm that you have read and understand this policy and will apply it throughout your engagement and for 2 years after its end, in accordance with your confidentiality obligations.",
          },
        ],
      },
    ],
  },

  // ── Employee: Development Department ─────────────────────────────────────────
  {
    slug: "employee-dev",
    label: "Development",
    description: "Technical SOPs for developers — Git, TypeScript, Next.js, Supabase, testing, security, and deployment",
    icon: "Code2",
    color: "text-blue-400",
    accentBg: "bg-blue-400/10",
    roles: ["admin", "employee"],
    items: [
      {
        id: "emp-dev-environment-setup",
        title: "Local Environment Setup",
        description: "Full guide to setting up your development environment from scratch",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Prerequisites & Version Requirements",
            body: "Before cloning any Swift Designz repository, ensure your machine meets the following requirements:\n\nNode.js: use NVM (Node Version Manager) to manage Node versions. Install NVM first, then run `nvm install 20` and `nvm use 20`. Do not use the system Node.js installation — version mismatches cause subtle build failures. Verify with `node --version` (must be 20.x) and `npm --version` (must be 10.x+).\n\nGit: version 2.40 or later. Verify with `git --version`. Configure your identity before your first commit:\n`git config --global user.name \"Your Name\"`\n`git config --global user.email \"your-name@swiftdesignz.co.za\"`\n\nVS Code: download the latest stable version from code.visualstudio.com. Required extensions (install via Extensions panel):\n• ESLint (dbaeumer.vscode-eslint)\n• Prettier (esbenp.prettier-vscode)\n• TypeScript Error Lens (usernamehw.errorlens)\n• Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)\n• GitLens (eamodio.gitlens)\n• Supabase (supabase.supabase)\n\nVS Code settings to set in your workspace settings.json:\n`\"editor.formatOnSave\": true`\n`\"editor.defaultFormatter\": \"esbenp.prettier-vscode\"`\n`\"typescript.preferences.importModuleSpecifier\": \"non-relative\"`",
          },
          {
            heading: "Cloning & Installing Dependencies",
            body: "1. Clone the repository from GitHub:\n`git clone https://github.com/swiftdesignz/<repo-name>.git`\n`cd <repo-name>`\n\n2. Install dependencies:\n`npm install`\n\nDo not use `yarn` or `pnpm` — the project uses npm and has a `package-lock.json`. Mixing package managers corrupts the lock file.\n\n3. Copy the environment template:\n`cp .env.example .env.local`\n\nThen fill in all required values. Your `.env.local` will be provided by the Managing Member via the company password manager (Bitwarden). Never share `.env.local` contents via WhatsApp, email, or any unencrypted channel. The `.env.local` file is in `.gitignore` and must never be committed.\n\n4. Verify the build:\n`npm run build`\n\nThe build must complete with zero errors and zero TypeScript warnings before you write a single line of new code. If the build fails on a clean install, notify the Managing Member immediately — do not attempt to fix a broken main branch.\n\n5. Start the development server:\n`npm run dev`\n\nThe admin portal runs on http://localhost:3000. Do not change the port without checking for hard-coded references.",
          },
          {
            heading: "Supabase Local Development",
            body: "The admin portal connects to the production Supabase project by default, even in local development. This is intentional — we use a staging/preview pattern, not a local database.\n\nWhen working on database changes (new tables, column additions, RLS policies), the correct workflow is:\n1. Write your migration SQL in `supabase/` directory as a new `.sql` file.\n2. Test the migration against a copy of the schema (you can inspect the schema at `supabase/schema.sql`).\n3. Submit the migration file in your PR — do not run it against production yourself.\n4. The Managing Member runs migrations against production after PR review and approval.\n\nSupabase project ID: `nxuvzdrqgrmureejigpf`\n\nAll Supabase client instances live in:\n• `src/lib/supabase/server.ts` — server-side (Server Components, Server Actions, API Routes)\n• `src/lib/supabase/client.ts` — client-side (Client Components only)\n• `src/lib/supabase/admin.ts` — service role client (bypasses RLS, admin operations only)\n\nNever import the admin client in a Client Component. It uses the `SUPABASE_SERVICE_ROLE_KEY` which must never reach the browser.",
          },
          {
            heading: "Environment Variables Reference",
            body: "The following environment variables are required for the admin portal. All must be present in `.env.local` for local development and in Netlify Environment Variables for production.\n\nRequired:\n• `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (safe to expose)\n• `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (safe to expose, RLS enforced)\n• `SUPABASE_SERVICE_ROLE_KEY` — Service role key (never expose to browser)\n• `RESEND_API_KEY` — Resend email API key (server-side only, no NEXT_PUBLIC_ prefix)\n• `NEXT_PUBLIC_APP_URL` — set to `http://localhost:3000` locally\n• `EMAIL_BASE_URL` — always `https://admin.swiftdesignz.co.za` (never localhost, used in all email links)\n\nOptional (Google OAuth):\n• `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`\n• `GOOGLE_WEB_CLIENT_SECRET`\n\nConvention: `NEXT_PUBLIC_` prefix makes a variable available in the browser bundle. Use it only for values that are genuinely safe to expose publicly. All API keys must never have this prefix.",
          },
          {
            heading: "Running Tests & Linting",
            body: "Every developer is expected to run the following before opening a pull request:\n\n`npm run lint` — ESLint. Must exit with zero errors. Address every lint error; do not suppress with `eslint-disable` comments without a written justification in the code.\n\n`npx tsc --noEmit` — TypeScript type check. Must exit with zero errors. This is the single most important quality gate — if TypeScript is unhappy, the code is wrong, not the types.\n\n`npm run test` — Vitest unit tests. All tests must pass. Do not merge a PR that breaks existing tests. If a test failure is a false positive, investigate why — do not skip the test.\n\n`npm run build` — Next.js production build. Must complete successfully. A build that passes `tsc --noEmit` but fails `npm run build` usually indicates a runtime type error or a missing module.\n\nFor Playwright E2E tests (longer running, run before major releases):\n`npm run e2e`\n\nThese commands are run in CI (Netlify build pipeline) automatically on every PR. If CI fails, do not merge — fix the failing check.",
          },
        ],
      },
      {
        id: "emp-dev-git",
        title: "Git Workflow & Version Control",
        description: "Branching strategy, commit conventions, PR process, and conflict resolution",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Branch Model",
            body: "Swift Designz uses a two-branch production model:\n\n`main` — production. Represents exactly what is live. Direct pushes are blocked at the repository level. You cannot push to main under any circumstances.\n\n`dev` — integration. All feature branches are merged here first and tested before anything reaches main. You may never work directly on `dev`.\n\nBranch naming:\n• `feature/<short-description>` — new features (e.g. `feature/invoice-pdf-export`)\n• `fix/<description>` — bug fixes (e.g. `fix/retainer-modal-overflow`)\n• `hotfix/<description>` — urgent production fixes (branched from `main`, merged back to both `main` and `dev`)\n• `chore/<description>` — dependency updates, config changes\n• `docs/<description>` — documentation-only changes\n\nRule: every change gets its own branch. No exceptions. A one-line fix still gets a branch and a PR — it takes 60 seconds and protects the team from broken deployments.",
          },
          {
            heading: "Commit Message Standards",
            body: "All commits must follow Conventional Commits format:\n`<type>(<optional-scope>): <short description>`\n\nTypes in use:\n• `feat` — a new feature or user-visible behaviour change\n• `fix` — a bug fix\n• `chore` — build, deps, config changes with no production impact\n• `docs` — documentation only\n• `refactor` — code restructure with zero behaviour change\n• `test` — adding or fixing tests\n• `perf` — a measurable performance improvement\n• `style` — formatting only (Prettier, whitespace)\n\nRules:\n• Short description: present tense, imperative mood, under 72 characters\n• Write what the commit DOES, not what you DID: 'add payment receipt modal' not 'added modal'\n• Scope is optional but helpful: `fix(invoices): correct cent rounding on PDF`\n• If it closes an issue: add `Closes #42` on the second line\n\nBad: `git commit -m \"stuff\"` or `git commit -m \"WIP\"`\nGood: `git commit -m \"feat(retainers): add record payment button with portal modal\"`\n\nBefore committing: run `git diff --staged` and read every changed line. Remove debug console.logs, commented-out code, and TODO comments that belong in GitHub Issues, not in the codebase.",
          },
          {
            heading: "Pull Request Process",
            body: "Every change to `dev` or `main` goes through a pull request. There are no exceptions.\n\nOpening a PR:\n1. Push your feature branch: `git push -u origin feature/your-branch`\n2. Open a PR from your branch to `dev` on GitHub (never directly to `main`).\n3. Write a PR description covering:\n   — What changed (one paragraph explaining the change and why)\n   — How to test it (numbered steps a reviewer can follow in under 5 minutes)\n   — Database migrations required (list any new SQL files)\n   — Env vars added or changed (list them; do not include values)\n   — Screenshots or recordings for any UI changes\n\nPR checklist before requesting review:\n• `npm run build` passes locally\n• `npx tsc --noEmit` passes\n• `npm run lint` has zero errors\n• `npm run test` has zero failures\n• Debug logs and commented code removed\n• Migration SQL file included if schema changed\n\nMerge strategy: always 'Squash and merge' — this keeps `dev` and `main` history linear and readable. Delete the branch after merge — stale branches are noise.\n\nDo not self-merge. At least one reviewer must approve before you merge, even if you are the only person who understands the change — ask the Managing Member.",
          },
          {
            heading: "Resolving Merge Conflicts",
            body: "Merge conflicts happen when two branches modify the same lines of a file. They are a normal part of collaborative development — do not panic.\n\nStep-by-step resolution:\n1. Fetch the latest dev: `git fetch origin`\n2. From your feature branch: `git merge origin/dev`\n3. Git will list conflicted files. Open each in VS Code — conflicted sections are marked:\n```\n<<<<<<< HEAD\n// your changes\n=======\n// dev changes\n>>>>>>> origin/dev\n```\n4. Resolve by keeping the correct version of each section. For complex conflicts, ask the author of the other change to review your resolution.\n5. After resolving all conflicts: `git add <resolved-files>` then `git commit`.\n6. Push the updated branch: `git push`.\n\nNever resolve a conflict by simply accepting all of 'theirs' or all of 'mine' without reading both sides. You may lose work or introduce bugs. If unsure about a conflict in a critical file (auth middleware, Supabase schema, payment logic), ask before resolving.\n\nAvoid long-lived branches — the longer a branch lives, the more severe its conflicts will be. Merge from dev into your branch at least every 2 days on active features.",
          },
          {
            heading: "What Never Goes in Git",
            body: "The following must never be committed to any branch under any circumstances:\n\n• `.env`, `.env.local`, `.env.production` — environment variable files\n• `node_modules/` — dependencies installed by npm\n• Any API key, secret, token, or password — in any file, any format\n• `*.pem`, `*.key`, `*.cert` — certificate files\n• Database dump files containing real client or financial data\n• Large binary files (>5MB) — images, PDFs, videos belong in cloud storage or the `public/` directory only if genuinely needed\n\nIf you accidentally commit a secret:\n1. Treat it as immediately compromised — rotate the key NOW, before doing anything else.\n2. Notify the Managing Member within 30 minutes.\n3. Remove the secret from git history using `git filter-repo` (not `git rm` — that only removes it from HEAD, not history).\n4. Force-push is required after history rewrite — get Managing Member approval first.\n\nUse `git diff --staged` before every commit to scan for secrets. Consider installing `git-secrets` or `gitleaks` to catch accidents automatically.",
          },
        ],
      },
      {
        id: "emp-dev-typescript",
        title: "TypeScript & Code Standards",
        description: "Strict mode rules, naming conventions, type patterns, and money handling",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "TypeScript Strict Mode",
            body: "TypeScript strict mode is enabled on all Swift Designz projects and must remain enabled permanently. What this means in practice:\n\n`noImplicitAny` — every variable, parameter, and return value must be explicitly typed or be inferable by TypeScript. The `any` type is banned without exception in production code. If you are dealing with a third-party library that returns untyped data, create a type for it.\n\n`strictNullChecks` — `null` and `undefined` are not assignable to other types without explicitly handling them. This forces you to check for null before using a value, which prevents entire categories of runtime errors.\n\n`strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization` — all enabled. TypeScript will catch many classes of bugs at compile time rather than at runtime in front of a client.\n\nThe rule: if `npx tsc --noEmit` fails, the code is wrong. Never work around TypeScript errors with casts (`as any`, `as unknown`) unless there is a specific, documented reason that you cannot avoid it. Leave a comment explaining why:\n```typescript\n// The Supabase RPC returns untyped JSON — type is verified by the DB function signature\nconst result = data as RetainerPaymentResult;\n```",
          },
          {
            heading: "Type Definitions & Organisation",
            body: "All database-related types live exclusively in `src/types/database.ts`. Never define an inline interface that duplicates or approximates a database type. When in doubt, check `database.ts` first.\n\n`src/types/accounts-receivable.ts` — AR-specific types (quotations, invoices, statements)\n`src/types/employee-contract.ts` — employment contract types\n`src/types/estore-retainer.ts` — retainer contract types\n\nConventions:\n• Use `interface` for object shapes that represent entities, props, or API payloads — they support declaration merging and `extends`.\n• Use `type` for unions, intersections, aliases, and computed types.\n• Name interfaces with `PascalCase` (e.g. `InvoiceRow`, `ClientProfile`).\n• Name type aliases with `PascalCase` (e.g. `UserRole`, `PaymentMethod`).\n• Props interfaces for React components: suffix with `Props` (e.g. `SendReceiptButtonProps`).\n\nMoney values:\n• All money in the database is stored as integer cents. N$2,500 = 250000.\n• Never use floating-point arithmetic for money. `0.1 + 0.2 !== 0.3` in JavaScript.\n• Always use `formatCurrency(cents: number): string` from `src/lib/utils.ts` for display.\n• When receiving amounts from the database, always validate the field is a number before arithmetic. Use `row.amount_cents ?? row.amount ?? 0` for backwards-compatible reads.",
          },
          {
            heading: "Naming Conventions",
            body: "File and folder naming:\n• React components: `PascalCase.tsx` (e.g. `SendReceiptButton.tsx`)\n• Server actions files: `actions.ts` in the route directory\n• Utility modules: `camelCase.ts` (e.g. `formatCurrency.ts`)\n• API routes: `route.ts` in the appropriate `app/api/` directory\n• Type files: descriptive name, often with the domain prefix (e.g. `employee-contract.ts`)\n\nVariable and function naming:\n• Variables and functions: `camelCase`\n• Constants (module-level, non-reactive): `SCREAMING_SNAKE_CASE` (e.g. `DOC_CATEGORIES`, `INVOICE_STATUS`)\n• Boolean variables: prefix with `is`, `has`, `can`, `should` (e.g. `isSigned`, `hasError`, `canDelete`)\n• Event handlers: prefix with `handle` (e.g. `handleSubmit`, `handleDelete`)\n• Server actions: suffix with `Action` (e.g. `sendReceiptAction`, `deleteInvoiceAction`)\n\nDatabase-derived names:\n• Use exactly the column name from the database for consistency (e.g. `invoice_id`, `sent_at`, `created_at`)\n• When mapping to camelCase in TypeScript, follow Supabase's automatic camelCase conversion\n• Never rename a database field in code without a migration to rename it in the database too",
          },
          {
            heading: "Import Organisation & Module Rules",
            body: "Import order in every file (enforced by ESLint):\n1. React and Next.js built-ins (`react`, `next/...`)\n2. Third-party packages (`framer-motion`, `lucide-react`, `@supabase/...`)\n3. Internal absolute paths prefixed with `@/` (`@/lib/...`, `@/components/...`, `@/types/...`)\n4. Relative imports (`./something`, `../something`)\n\nEach group separated by a blank line. Prettier and ESLint will enforce this — if your editor formats on save, imports will be ordered automatically.\n\nNo barrel exports (`index.ts` that re-exports everything) — they make tree-shaking harder and create circular dependency risks. Import directly from the source file.\n\nDo not import entire libraries when you need one function:\nBad: `import * as _ from 'lodash'`\nGood: `import { debounce } from 'lodash'` (or better, write the utility yourself if it is simple)\n\nLucide React: import only the icons you use:\nBad: `import * as Icons from 'lucide-react'`\nGood: `import { ChevronRight, FileText, CheckCircle } from 'lucide-react'`",
          },
          {
            heading: "Supabase Query Patterns",
            body: "Always destructure `{ data, error }` from every Supabase query and handle the error case before using data:\n```typescript\nconst { data, error } = await supabase\n  .from('invoices')\n  .select('id, amount, client_id')\n  .eq('id', invoiceId)\n  .single();\n\nif (error) {\n  console.error('Invoice fetch failed:', error.message);\n  return { error: 'Failed to load invoice' };\n}\n// data is now guaranteed non-null\n```\n\nNever chain `.data` without checking `error` first. Supabase returns `null` data on errors, and accessing properties on `null` causes runtime crashes.\n\nFor paginated queries, always use `.range(from, to)` — never fetch unbounded lists from large tables. The `invoices`, `quotations`, and `clients` tables can grow large; unbounded queries will time out.\n\nRLS is your friend — all data access through the anon client is automatically filtered by row-level security policies. The service role client (admin client) bypasses RLS — use it only in server-side admin operations and API routes that verify the caller is authenticated and has admin role.\n\nType the response explicitly using the generated database types:\n```typescript\nimport type { Database } from '@/types/database';\ntype InvoiceRow = Database['public']['Tables']['invoices']['Row'];\n```",
          },
        ],
      },
      {
        id: "emp-dev-nextjs-patterns",
        title: "Next.js App Router Patterns",
        description: "Server vs client components, data fetching, server actions, layouts, and route handlers",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Server Components vs Client Components",
            body: "Next.js App Router defaults to React Server Components (RSC). This is a fundamental architectural shift from the Pages Router — understanding it correctly is mandatory.\n\nServer Components (default, no directive needed):\n• Can import and use server-side modules (Node.js, file system, databases)\n• Can be async — `async function Page()` is valid\n• Cannot use React state (`useState`, `useReducer`)\n• Cannot use React effects (`useEffect`, `useLayoutEffect`)\n• Cannot use browser APIs (`window`, `document`, `localStorage`)\n• Cannot use event handlers (`onClick`, `onChange`)\n• Rendered on the server — no JavaScript sent to the browser for these components\n\nClient Components (`'use client'` directive at the top of the file):\n• Can use all React hooks\n• Can use browser APIs and event handlers\n• Are hydrated in the browser\n• Cannot be async at the component level\n• Can still be pre-rendered on the server (SSR) — `'use client'` does not mean 'client-only', it means 'enable React interactivity'\n\nDecision rule: default to Server Components. Add `'use client'` only when you specifically need interactivity, state, or browser APIs. A page that fetches data from Supabase and displays it should be a Server Component — the data fetch happens on the server and the result is sent to the browser as HTML.",
          },
          {
            heading: "Data Fetching in Server Components",
            body: "In the App Router, data fetching is done directly in async Server Components:\n\n```typescript\n// src/app/(dashboard)/invoices/page.tsx\nimport { createClient } from '@/lib/supabase/server';\n\nexport default async function InvoicesPage() {\n  const supabase = await createClient();\n  const { data: invoices, error } = await supabase\n    .from('invoices')\n    .select('id, ar_number, amount, status, client:clients(name)')\n    .order('created_at', { ascending: false })\n    .limit(50);\n\n  if (error) {\n    // Handle gracefully — never throw unhandled in a page\n    return <ErrorState message=\"Failed to load invoices\" />;\n  }\n\n  return <InvoiceTable invoices={invoices} />;\n}\n```\n\nRules:\n• Never use `useEffect` + `fetch` in a Client Component when a Server Component can do the same job.\n• For parallel data fetching (multiple independent queries), use `Promise.all`:\n```typescript\nconst [{ data: invoices }, { data: clients }] = await Promise.all([\n  supabase.from('invoices').select('*'),\n  supabase.from('clients').select('id, name'),\n]);\n```\n• Do not fetch data in a parent component and pass it down 5 levels. Fetch it in the component that needs it — Server Components can be nested freely.",
          },
          {
            heading: "Server Actions",
            body: "Server Actions replace traditional API endpoints for form submissions and button-triggered mutations. They are TypeScript functions that run on the server but can be called from Client Components.\n\nEvery route with mutations has an `actions.ts` file:\n```typescript\n// src/app/(dashboard)/invoices/actions.ts\n'use server';\n\nimport { createClient } from '@/lib/supabase/server';\nimport { requireAuth } from '@/lib/auth';\nimport { revalidatePath } from 'next/cache';\n\nexport async function deleteInvoiceAction(invoiceId: string): Promise<{ error?: string }> {\n  // 1. Always authenticate first\n  const { user, profile } = await requireAuth();\n  if (profile.role !== 'admin') {\n    return { error: 'Permission denied' };\n  }\n\n  // 2. Validate inputs\n  if (!invoiceId || typeof invoiceId !== 'string') {\n    return { error: 'Invalid invoice ID' };\n  }\n\n  // 3. Perform the mutation\n  const supabase = await createClient();\n  const { error } = await supabase\n    .from('invoices')\n    .delete()\n    .eq('id', invoiceId);\n\n  if (error) return { error: error.message };\n\n  // 4. Revalidate affected pages\n  revalidatePath('/invoices');\n  return {};\n}\n```\n\nRules:\n• Always mark the file with `'use server'` directive\n• Always authenticate the user first — never trust that the caller is authorised\n• Always return a typed result object `{ error?: string }` — never throw from a Server Action\n• Always call `revalidatePath()` or `revalidateTag()` after a successful mutation so the UI refreshes\n• Never return sensitive data (passwords, keys) from a Server Action",
          },
          {
            heading: "Route Handlers & Public APIs",
            body: "Route Handlers (`route.ts`) are used for:\n• Public API endpoints (e.g. `/api/leads` for the main site form submission)\n• Third-party callbacks (e.g. `/api/auth/google/callback`)\n• File download endpoints (e.g. `/api/docs/invoices/[id]`)\n• Webhook receivers\n\nThey are not used for internal form submissions — use Server Actions for those.\n\nExample structure:\n```typescript\n// src/app/api/leads/route.ts\nimport { NextResponse } from 'next/server';\n\nexport async function POST(request: Request) {\n  // 1. Parse and validate body\n  const body = await request.json();\n  if (!body.name || !body.email) {\n    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });\n  }\n\n  // 2. Sanitise inputs — never trust external data\n  const name = body.name.trim().slice(0, 200);\n  const email = body.email.trim().toLowerCase();\n\n  // 3. Perform operation\n  // ...\n\n  return NextResponse.json({ success: true });\n}\n```\n\nAuthentication in route handlers: use `createClient()` from `@/lib/supabase/server` and call `supabase.auth.getUser()`. Never use `getSession()` for authentication — it does not verify the JWT on the server and can be spoofed. `getUser()` makes a network call to Supabase and is the only safe server-side auth check.",
          },
          {
            heading: "Layout, Loading & Error Files",
            body: "The App Router uses special files for structural UI:\n\n`layout.tsx` — persistent UI wrapper. The root layout at `src/app/layout.tsx` wraps every page. The dashboard layout at `src/app/(dashboard)/layout.tsx` wraps all authenticated pages and renders the `AppShell` (sidebar + topbar). Layouts persist between route navigations — do not put page-specific data fetching in a layout.\n\n`loading.tsx` — automatic loading UI. Next.js shows this file's content while the page's async data fetching is in progress. Keep it lightweight — a skeleton or spinner. The admin portal uses glass-card skeletons that match the page layout.\n\n`error.tsx` — error boundary. Catches errors thrown during rendering of the page. Must be a Client Component (`'use client'`). Renders a recovery UI with a retry button. Do not use this as your primary error handling — handle errors in the data fetching itself and render friendly error states. `error.tsx` is the last resort.\n\n`not-found.tsx` — 404 page. Rendered when `notFound()` is called from a page or when a route does not exist.\n\nRoute Groups: `(dashboard)` and `(public)` are route groups — the parentheses tell Next.js this is a grouping, not a URL segment. `src/app/(dashboard)/invoices/page.tsx` renders at `/invoices`, not `/dashboard/invoices`.",
          },
        ],
      },
      {
        id: "emp-dev-testing",
        title: "Testing: Unit, Integration & E2E",
        description: "What to test, how to write tests with Vitest and Playwright, and coverage expectations",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Testing Philosophy",
            body: "Tests at Swift Designz exist to catch regressions and verify business logic — not to achieve a coverage number. Every test must test something that could actually break in a way that matters.\n\nTest pyramid (write more of the lower layers):\n1. Unit tests (most) — individual functions, utilities, formatters, business logic calculations\n2. Integration tests (moderate) — Server Actions called with real Supabase, API routes with real HTTP\n3. E2E tests (least) — full user flows through the browser using Playwright\n\nWhat must have unit tests:\n• Every function in `src/lib/utils.ts`\n• All currency formatting and arithmetic\n• Payment plan schedule generation\n• Any function that takes input and produces output with non-trivial logic\n• Date calculations (due dates, overdue calculations)\n\nWhat must have E2E tests:\n• Login and logout\n• Creating and sending an invoice\n• Recording a payment and viewing the receipt\n• Generating a PDF\n• Quotation to invoice conversion flow\n• Any critical client-facing flow",
          },
          {
            heading: "Writing Vitest Unit Tests",
            body: "Unit tests live alongside the code they test or in `__tests__/` directories. File naming: `utils.test.ts`, `formatCurrency.test.ts`.\n\nExample unit test structure:\n```typescript\nimport { describe, it, expect } from 'vitest';\nimport { formatCurrency } from '@/lib/utils';\n\ndescribe('formatCurrency', () => {\n  it('formats zero cents as N$0.00', () => {\n    expect(formatCurrency(0)).toBe('N$0.00');\n  });\n\n  it('formats 250000 cents as N$2,500.00', () => {\n    expect(formatCurrency(250000)).toBe('N$2,500.00');\n  });\n\n  it('handles negative values (refunds)', () => {\n    expect(formatCurrency(-50000)).toBe('-N$500.00');\n  });\n\n  it('rounds half-cents correctly', () => {\n    // 100.005 rounds to 100.01\n    expect(formatCurrency(10001)).toBe('N$100.01');\n  });\n});\n```\n\nPrinciples:\n• One assertion per test where possible — if the test fails, the failure message is unambiguous\n• Test edge cases: zero, negative numbers, null/undefined inputs, very large numbers\n• Test error conditions: what happens when the function receives invalid input?\n• Never test implementation details — test what the function does, not how it does it\n• Tests must be deterministic: no `Math.random()`, no `Date.now()` without mocking",
          },
          {
            heading: "Writing Playwright E2E Tests",
            body: "E2E tests live in the `tests/` or `e2e/` directory. They test real user flows in a real browser.\n\nExample E2E test:\n```typescript\nimport { test, expect } from '@playwright/test';\n\ntest.describe('Invoice creation', () => {\n  test.beforeEach(async ({ page }) => {\n    // Log in before each test\n    await page.goto('/login');\n    await page.fill('[data-testid=\"email\"]', 'test@swiftdesignz.co.za');\n    await page.fill('[data-testid=\"password\"]', process.env.TEST_PASSWORD!);\n    await page.click('[data-testid=\"login-submit\"]');\n    await page.waitForURL('/');\n  });\n\n  test('creates and sends an invoice', async ({ page }) => {\n    await page.goto('/invoices');\n    await page.click('[data-testid=\"new-invoice\"]');\n    // ... fill form ...\n    await page.click('[data-testid=\"save-invoice\"]');\n    await expect(page.getByText('Invoice created')).toBeVisible();\n  });\n});\n```\n\nFor interactive UI elements, add `data-testid` attributes to critical elements — do not rely on text content or CSS classes for selectors in tests.\n\nPlaywright config: `playwright.config.ts` sets the base URL, browser list (Chrome, Firefox, WebKit), and test parallelism. Do not modify this file without approval.",
          },
          {
            heading: "Pre-PR Test Checklist",
            body: "Before opening any pull request, complete the following in order:\n\n1. `npx tsc --noEmit` — zero TypeScript errors. Fix every error, no exceptions.\n\n2. `npm run lint` — zero ESLint errors. Address root causes, do not suppress.\n\n3. `npm run test` — all Vitest unit tests pass. If your change breaks an existing test, determine whether the test or the code is wrong. Do not delete or skip a failing test without Managing Member approval.\n\n4. `npm run build` — production build succeeds. Build failures often reveal issues that TypeScript misses (dynamic imports, missing env vars, React hydration warnings).\n\n5. For UI changes: manually test on Chrome at 375px (mobile) and 1440px (desktop). Check both light and dark modes.\n\n6. For any change touching invoices, quotations, payments, or emails: perform an end-to-end manual test of the full flow from creation to delivery.\n\nDo not rely on 'it worked in dev' as your sole QA. The dev server masks many issues that only surface in a production build.",
          },
        ],
      },
      {
        id: "emp-dev-security",
        title: "Security Practices",
        description: "Secrets management, input validation, XSS prevention, auth guards, and RLS",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Secrets & Environment Variables",
            body: "Never commit secrets. This is the most important security rule and it is non-negotiable.\n\nWhat counts as a secret:\n• API keys (Supabase, Resend, Netlify, any third party)\n• Database connection strings and passwords\n• Private cryptographic keys (RSA, ECDSA, PEM files)\n• OAuth client secrets (Google, GitHub)\n• JWT secrets and signing keys\n• Any value prefixed with `sk_`, `secret_`, `key_`, or `token_` from a vendor\n\nSecrets go in `.env.local` (locally) and Netlify Environment Variables (production). The `.env.local` file is in `.gitignore` and must never be staged or committed.\n\nBefore every commit, run:\n`git diff --staged | grep -i 'key\\|secret\\|token\\|password'`\n\nIf you see anything suspicious, unstage the file immediately and investigate.\n\nIf a secret is accidentally committed: rotate it immediately (before doing anything else), then remove it from git history using `git filter-repo`. Notify the Managing Member within 30 minutes. Assume the secret is compromised the moment it appears in the repository — even briefly, even on a private repo.",
          },
          {
            heading: "Input Validation & Sanitisation",
            body: "Never trust user-supplied input. This applies to:\n• Form data from browser clients\n• Query parameters in URLs\n• Request bodies in API endpoints\n• Data from third-party webhooks\n• Data from Supabase queries that was originally user-supplied\n\nValidation rules:\n• Check types: ensure numbers are actually numbers, strings are strings, dates parse correctly\n• Check length: impose maximum lengths on all string inputs (names: 200 chars, descriptions: 2000 chars)\n• Check format: validate emails match a pattern, phone numbers are numeric, IDs match UUID format\n• Check ranges: monetary amounts must be non-negative integers\n\nFor HTML output — never insert user data directly into HTML without escaping:\n```typescript\n// WRONG — XSS vulnerability\ndocument.innerHTML = `<p>${userInput}</p>`;\n\n// CORRECT — use escapeHtml from utils\nimport { escapeHtml } from '@/lib/utils';\ndocument.innerHTML = `<p>${escapeHtml(userInput)}</p>`;\n```\n\nFor Supabase queries — always use the Supabase client's query builder. Never construct SQL strings manually. The query builder uses parameterised queries which are immune to SQL injection:\n```typescript\n// WRONG — SQL injection risk if invoiceId is user-supplied\nconst query = `SELECT * FROM invoices WHERE id = '${invoiceId}'`;\n\n// CORRECT — parameterised\nconst { data } = await supabase.from('invoices').select('*').eq('id', invoiceId);\n```",
          },
          {
            heading: "Authentication & Authorisation Guards",
            body: "Authentication (who are you?) and authorisation (what can you do?) are separate checks. Both are required.\n\nIn Server Components and Server Actions, use the auth helpers from `src/lib/auth.ts`:\n```typescript\nimport { requireAuth, requireAdmin } from '@/lib/auth';\n\n// Requires authenticated user (any role)\nconst { user, profile } = await requireAuth();\n\n// Requires admin role — throws redirect to /login if not\nawait requireAdmin();\n```\n\nDo not roll your own auth checks in each file — use these helpers. They call `supabase.auth.getUser()` which verifies the JWT server-side.\n\nFor role-based data access, rely on Row Level Security (RLS) policies in Supabase as your primary enforcement layer. Your application-level role checks are a secondary layer. RLS operates at the database level and cannot be bypassed from the application regardless of what the client sends.\n\nRLS is disabled for the service role client (`admin.ts`). This client must only be used in:\n• Server-side admin operations (creating profiles, role assignments)\n• API routes that have already verified the caller is an admin\n• Never in Client Components or public-facing API routes",
          },
          {
            heading: "Common Vulnerabilities to Avoid",
            body: "These are the most common security mistakes in Next.js applications. Know them and avoid them:\n\nXSS (Cross-Site Scripting): injecting malicious scripts into rendered HTML. Prevention: escape all user content before inserting into HTML; use React's JSX (which auto-escapes) not `dangerouslySetInnerHTML` unless absolutely necessary; use `escapeHtml()` from utils for any non-JSX HTML rendering.\n\nCSRF (Cross-Site Request Forgery): tricking a user's browser into making unintended requests. Prevention: Next.js Server Actions include built-in CSRF protection — do not bypass this by using plain `fetch` for mutations that should be Server Actions.\n\nInsecure Direct Object Reference (IDOR): exposing an ID and letting users access any record by changing it. Prevention: always verify the authenticated user has permission to access the specific record being requested, not just that they are logged in. Use RLS policies for this.\n\nServer-Side Request Forgery (SSRF): letting user input control which external URLs the server fetches. Prevention: never construct a `fetch()` URL from user input. Validate and whitelist any URLs used in server-side HTTP requests.\n\nSensitive Data Exposure: returning more data than needed from API endpoints. Prevention: always specify exact column lists in Supabase selects — never use `.select('*')` in production code for tables that contain sensitive fields like `banking_details`, `tax_number`, or `salary`.",
          },
        ],
      },
      {
        id: "emp-dev-performance",
        title: "Performance & Web Vitals",
        description: "Core Web Vitals targets, image optimisation, code splitting, and caching",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Core Web Vitals Targets",
            body: "Every page delivered to clients must meet Google's Core Web Vitals thresholds. These metrics directly affect search ranking and perceived quality.\n\nLCP (Largest Contentful Paint) — target: <2.5 seconds. The time until the largest element in the viewport is rendered. Primarily affected by: hero image loading time, server response time, render-blocking resources. Fix: optimise the hero image (WebP, proper sizing, `priority` prop on `next/image`), ensure server responses are fast.\n\nCLS (Cumulative Layout Shift) — target: <0.1. The total amount of unexpected visual movement during page load. Caused by: images without dimensions, ads, embeds, dynamically injected content above existing content. Fix: always set explicit `width` and `height` on images; reserve space for dynamic content with skeleton loaders.\n\nINP (Interaction to Next Paint) — target: <200ms. Replaced FID in 2024. Measures the delay between user interaction and the next visual update. Affected by: heavy JavaScript execution on the main thread, long tasks blocking rendering. Fix: avoid synchronous operations in event handlers; defer non-critical JavaScript; use `useTransition` for non-urgent state updates.\n\nMeasure with: Chrome DevTools > Lighthouse (local testing) and Google Search Console (real user data). Run a Lighthouse audit before every production deployment for client sites.",
          },
          {
            heading: "Image Optimisation",
            body: "Always use `next/image` (`<Image>` from 'next/image') for all images in Next.js projects. Never use a plain `<img>` tag unless there is a specific technical reason that makes `next/image` impossible.\n\nWhat `next/image` does automatically:\n• Serves WebP or AVIF format to browsers that support it\n• Resizes images to the exact dimensions needed\n• Lazy loads images below the fold\n• Prevents layout shift by reserving space\n\nConfiguration:\n```tsx\nimport Image from 'next/image';\n\n// Static images — width and height required\n<Image src=\"/logo.png\" alt=\"Swift Designz logo\" width={200} height={60} />\n\n// Hero images — use priority to preload immediately\n<Image src={heroUrl} alt=\"Hero\" fill className=\"object-cover\" priority />\n\n// Remote images — must be in next.config.js remotePatterns\n```\n\nImage file guidelines:\n• Maximum file size: 200KB for general content images, 500KB for hero images\n• Format: WebP preferred for photography, SVG for logos and icons\n• Resolution: provide 2x the display resolution (retina screens) — if displayed at 400px wide, the source should be 800px wide\n• Never export Figma designs as PNG when SVG is available — SVGs are resolution-independent and smaller",
          },
          {
            heading: "Code Splitting & Bundle Size",
            body: "Next.js automatically code-splits at the page level — each route gets its own JavaScript chunk. Within a page, you can further optimise with dynamic imports.\n\nUse dynamic imports for:\n• Large libraries only needed on certain pages (rich text editors, chart libraries, PDF renderers)\n• Components that render below the fold\n• Anything that is not needed for the initial render\n\n```typescript\nimport dynamic from 'next/dynamic';\n\n// Only load the PDF renderer when needed\nconst InvoicePDF = dynamic(() => import('@/components/invoices/InvoicePDF'), {\n  ssr: false, // PDF renderer uses browser APIs\n  loading: () => <div className=\"animate-pulse\">Loading PDF...</div>,\n});\n```\n\nMonitoring bundle size:\n• Run `npm run build` — Next.js prints a bundle size table. Watch for pages that grow beyond 100KB of JavaScript (First Load JS).\n• Use `@next/bundle-analyzer` (ask Managing Member to enable) to visualise what's in each bundle.\n• `@react-pdf/renderer` is the heaviest dependency in the portal — ensure it is never imported in a Server Component or a widely-used Client Component.",
          },
          {
            heading: "Caching & Revalidation",
            body: "Next.js App Router caches aggressively by default. Understanding the cache layers prevents stale data bugs.\n\nRequest Memoisation: within a single render cycle, identical `fetch()` calls are automatically deduplicated. Supabase queries through the client are not automatically memoised — avoid fetching the same data in multiple places in the same render tree.\n\n`revalidatePath('/invoices')` — purges the cache for a specific route. Call this in every Server Action after a successful mutation. Without it, the page may show stale data after a create, update, or delete operation.\n\n`revalidateTag('invoices')` — purges all cached data tagged with 'invoices'. Useful when a mutation affects data on multiple pages.\n\nFor the admin portal: most pages are not statically cached because they require authentication. The more relevant cache is the Supabase client's internal request cache within a Server Component render cycle.\n\nCommon stale data bugs:\n• Forgetting `revalidatePath()` after a Server Action mutation\n• Using a stale Supabase client instance (always `await createClient()` fresh in each Server Component)\n• Client-side state not reflecting server state after a Server Action — use `router.refresh()` from `useRouter()` in the Client Component if needed",
          },
        ],
      },
      {
        id: "emp-dev-debugging",
        title: "Debugging & Error Investigation",
        description: "Systematic approach to debugging: browser tools, server logs, Supabase logs, and Netlify logs",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Scientific Debugging Method",
            body: "Effective debugging is a systematic process, not trial and error. Follow these steps in order:\n\n1. Reproduce the bug reliably. If you cannot reproduce it consistently, you cannot verify when it is fixed. Document the exact steps. If it is intermittent, establish under what conditions it occurs.\n\n2. Read the error message carefully. The full error message, including the stack trace, tells you exactly where the failure is. Do not skim it — read every line.\n\n3. Identify the layer where the error originates: browser/client, server/Next.js, Supabase, or an external service.\n\n4. Form a hypothesis about the cause. Before changing any code, write down what you think is wrong and why.\n\n5. Test the hypothesis with the smallest possible change. Avoid changing multiple things at once — you will not know which change fixed it.\n\n6. Verify the fix covers the root cause, not just the symptom. If you fixed the symptom, the root cause will surface elsewhere.\n\n7. Write a test that would have caught this bug. This is not optional — a bug that does not have a corresponding regression test will recur.",
          },
          {
            heading: "Browser DevTools",
            body: "Chrome DevTools is your primary debugging tool for client-side issues.\n\nConsole panel:\n• Filter by 'Errors' to see only errors — ignore warnings until errors are resolved\n• `console.log` is for temporary debugging only — remove all `console.log` statements before committing\n• Look for red error messages with stack traces — click the file:line reference to jump to the source\n\nNetwork panel:\n• Inspect all API and Supabase requests — look for failed requests (red rows), 4xx and 5xx status codes\n• Click a failed request and view the Response tab for the error body\n• For Supabase PostgREST errors, the response JSON contains a `code`, `message`, and `details` field that precisely identifies the database error\n\nSources panel:\n• Set breakpoints by clicking line numbers in the source view\n• Step through code execution line by line with F10 (step over) and F11 (step into)\n• Inspect variable values at any breakpoint by hovering over them\n\nReact DevTools extension (install separately):\n• Inspect component props and state in the Components panel\n• Profile component render performance in the Profiler panel",
          },
          {
            heading: "Server-Side Logging & Next.js Errors",
            body: "Server Component and Server Action errors appear in the terminal where `npm run dev` is running — not in the browser console. Split your attention between the browser and the terminal.\n\nCommon server-side errors:\n\n`Error: Objects are not valid as a React child` — you are trying to render an object directly. Check for accidental rendering of Supabase response objects instead of their properties.\n\n`Error: Async/await is not yet supported in Client Components` — you have an `async` function component with `'use client'`. Client Components cannot be async. Fetch data in a Server Component or use a hook with `useEffect`.\n\n`Error: Cannot access [...] before initialization` — circular import. Check your import chain for two files that import each other.\n\n`Hydration failed` — the server-rendered HTML does not match what React renders in the browser. Common causes: using `Date.now()` or `Math.random()` on the server (values change between renders), rendering based on `window` or `localStorage` without checking `typeof window !== 'undefined'` first.\n\nFor production errors: check the Netlify build log for build-time errors, and the Netlify function logs for runtime Server Action and API route errors.",
          },
          {
            heading: "Supabase & Database Debugging",
            body: "Supabase errors appear in the destructured `{ error }` from queries — always check and log them:\n```typescript\nconst { data, error } = await supabase.from('invoices').select('*');\nif (error) {\n  console.error('[invoices fetch]', error.code, error.message, error.details);\n  // error.code is the PostgreSQL error code\n  // error.message is the human-readable message\n  // error.details has additional context\n}\n```\n\nCommon Supabase error codes:\n• `42501` — insufficient privilege (RLS policy blocking the query). Check the RLS policy for the table and the user's role.\n• `23503` — foreign key constraint violation. You are trying to insert/update a row that references a non-existent ID in another table.\n• `23505` — unique constraint violation. A row with that value already exists.\n• `PGRST116` — no rows found for `.single()`. The query returned 0 rows — use `.maybeSingle()` if 0 rows is a valid result.\n• `PGRST200` — relationship not found. Check your `.select()` join syntax.\n\nFor complex query debugging: use the Supabase Studio SQL editor (dashboard.supabase.com → project → SQL Editor) to run queries directly. This bypasses RLS and shows raw results — useful for isolating whether the issue is data, RLS, or query logic.",
          },
        ],
      },
    ],
  },

  // ── Employee: Design Department ───────────────────────────────────────────────
  {
    slug: "employee-design",
    label: "Design",
    description: "SOPs for designers — brief process, Figma workflow, responsive standards, handoff, and accessibility",
    icon: "Palette",
    color: "text-purple-400",
    accentBg: "bg-purple-400/10",
    roles: ["admin", "employee"],
    items: [
      {
        id: "emp-design-brief",
        title: "Design Brief & Discovery Process",
        description: "Required inputs before touching Figma — what to gather, clarify, and confirm in writing",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Why the Brief Comes First",
            body: "Beginning design work without a complete brief is the single most common cause of revision overruns and client dissatisfaction. Every hour of design work done without a clear brief risks being thrown away. The brief is not a formality — it is a contract between the designer and the project.\n\nThe brief must be obtained before you open Figma. Not after the first screen. Not during wireframing. Before.\n\nIf you receive a verbal brief only (in a call or meeting), you are responsible for writing it up and sending it to the Managing Member and client for written confirmation. A brief that exists only in someone's memory is not a brief.",
          },
          {
            heading: "Required Inputs from the Client",
            body: "Before starting any design project, obtain written confirmation of all of the following:\n\nBrand assets:\n• Logo files in SVG and PNG format (not screenshots or JPEGs of logos)\n• Exact colour codes in HEX (e.g. #1E3A5F) — not 'navy blue'\n• Primary and secondary font names and weights\n• Any existing style guide, brand manual, or design system\n\nProject information:\n• Target audience: who are the users? Age range, technical literacy, context of use (mobile vs desktop vs print)\n• Key competitors or reference sites the client likes and why\n• Key competitors or reference sites the client does not like and why\n• The single most important action a user should take on the site/app (primary CTA)\n• List of pages or screens required — every page in scope confirmed in writing\n\nContent:\n• Copy for each page, or confirmation that copy will be provided and by when\n• Images and photography, or confirmation that stock images are acceptable and the client will provide search keywords\n• Do not design for dummy text beyond wireframe stage — high-fidelity designs must use real or realistic copy\n\nIf any of the above is missing: request it in writing, note the date of the request, and do not proceed past wireframes until it is received.",
          },
          {
            heading: "Questions to Ask at Brief Stage",
            body: "Use the following questions to probe for the information clients often forget to provide:\n\n'If a first-time visitor to this site/app had to describe what you do in one sentence after 5 seconds, what should that sentence be?' — This reveals the hierarchy of information.\n\n'What are the 3 things that should make a visitor feel most confident in choosing you?' — Identifies key trust elements.\n\n'Have you had any previous websites or apps? What did users complain about?' — Reveals known UX problems to avoid.\n\n'Who will maintain this after we hand over? Will they have design skills?' — Affects how complex the CMS or component library should be.\n\n'Are there any strict regulatory or compliance requirements? (Legal disclaimers, accessibility standards, data collection notices)' — Affects layout and content structure.\n\n'What is your launch date? Is it fixed or flexible?' — A fixed date affects what scope is achievable.\n\n'What does success look like 6 months after launch? How will you measure it?' — Aligns design decisions with business goals.",
          },
          {
            heading: "Brief Sign-Off",
            body: "Once the brief is complete and all inputs are received, send a written brief summary to the client and the Managing Member. The summary must include:\n\n• Project name and scope (list of pages/screens in scope, explicitly list anything out of scope)\n• Target audience and key messages\n• Design direction agreed (based on references provided)\n• Timeline: start date, wireframe review date, hi-fi review date, handoff date\n• Revision rounds included (typically 2 rounds of revisions per the contract)\n• What happens when revision rounds are exceeded (refer to the Change Request SOP)\n• Content responsibility: who provides copy and images, and by what date\n\nRequest a written reply confirming the brief before starting wireframes. 'Looks good, proceed' in an email is sufficient. The brief summary and confirmation email must be saved in the client's project folder.",
          },
        ],
      },
      {
        id: "emp-design-figma",
        title: "Figma Workspace & File Management",
        description: "File naming, page structure, layer naming, components, and version control in Figma",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "File Naming Convention",
            body: "All Figma files must be named according to the following convention:\n`[Client Code] - [Project Name] - [Phase]`\n\nExamples:\n• `SD26-ACM - ACM Logistics Website - Design`\n• `SD26-INT - Interior Studio App - Wireframes`\n• `SD26-INT - Interior Studio App - Prototype`\n\nClient codes come from the admin portal client record. Never use informal names ('Johns website', 'new client project'). If a client does not have a code yet, request one from the Managing Member before creating the file.\n\nAll client Figma files must live inside the client's designated folder in the Swift Designz Figma workspace — not in your personal drafts or personal Figma account. Files in personal accounts are not backed up, not accessible to the team, and not covered by the company's Figma subscription.",
          },
          {
            heading: "Page Structure",
            body: "Every Figma file must follow this page structure:\n\nPage 1: Cover\n• Project name, client, designer, version, and last updated date\n• No design content — this is the file's business card\n\nPage 2: Design System\n• Colour styles (pulled from client brand)\n• Text styles (all typeface + size + weight combinations used in the project)\n• Component library for this project (buttons, cards, form fields, icons)\n• Do not mix project-specific and Swift Designz brand styles\n\nPage 3: Wireframes\n• Low-fidelity wireframes for all pages in scope\n• Clearly labelled with page names\n• Grey-scale only — no colour at wireframe stage\n\nPage 4: High-Fidelity Designs\n• Desktop and mobile versions of each page, side by side\n• Use auto-layout wherever possible — designs must reflect real content reflow\n\nPage 5: Assets for Export\n• Final export-ready assets only\n• Named exactly as they will be named in the code (e.g. `hero-bg.webp`, `logo.svg`)\n\nPage 6: Archive\n• Previous design directions, rejected concepts, old versions\n• Never delete client-approved work — move it to Archive",
          },
          {
            heading: "Layer Naming & Auto-Layout",
            body: "Layer naming is not optional. Unnamed layers (`Rectangle 1`, `Frame 47`) in a file that is handed to a developer or reviewed by a client are unprofessional and make QA impossible.\n\nLayer naming rules:\n• Use descriptive, semantic names: `nav/desktop`, `hero/headline`, `card/pricing-card`\n• Use forward-slash notation to group related layers: `button/primary`, `button/secondary`, `button/disabled`\n• Boolean layers: prefix with `is-` for toggle variants: `is-active`, `is-disabled`\n• Never leave auto-named layers in a final design — find them with Ctrl/Cmd + F and filter by 'Frame', 'Rectangle', 'Ellipse'\n\nAuto-layout:\n• Use Auto Layout for every container that holds multiple elements. Manual spacing becomes misaligned when content changes.\n• Set Gap between items and Padding explicitly — do not use 'Hug' for unknown dimensions in production designs\n• Name auto-layout containers semantically — the layer name should tell the developer what this is: `nav-container`, `hero-section`, `card-grid`\n\nComponents:\n• Anything that appears more than once must be a component\n• Build components with variants for all states: default, hover, active, disabled, loading, error\n• Never duplicate a component by copy-pasting — detach → modify → if different enough to be a new component, create a new variant",
          },
          {
            heading: "Version Control & Client Sharing",
            body: "Figma has built-in version history — use it actively.\n\nSave named versions at these milestones:\n• After wireframes are complete: 'v1.0 — Wireframes'\n• After client approves wireframes: 'v1.1 — Wireframes Approved'\n• After hi-fi designs are complete: 'v2.0 — High-Fidelity'\n• After each round of revisions: 'v2.1 — After Revision Round 1'\n• At handoff: 'v3.0 — Final for Handoff'\n\nTo save a named version in Figma: File > Save to Version History > add a name and description.\n\nSharing with clients:\n• Share the Figma prototype link (not the file edit link) for client review\n• Set the sharing permission to 'Can view' — clients must never have edit access\n• Include instructions with the share link: 'Click the play button (top right) to view the prototype. Leave comments by right-clicking any element.'\n• Never send Figma files as downloads for client review — always share the link\n\nAt project handoff:\n• Export all final assets in the agreed formats (WebP for photos, SVG for logos and icons, PNG for anything else)\n• Include a Figma Inspect link so the developer can see exact measurements, colours, and font properties",
          },
        ],
      },
      {
        id: "emp-design-responsive",
        title: "Responsive Design Standards",
        description: "Mobile-first design, breakpoints, touch targets, and multi-device testing",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Mobile-First Principle",
            body: "All designs at Swift Designz are designed mobile-first. This means the mobile layout is designed before the desktop layout — not adapted from desktop after the fact.\n\nWhy mobile-first:\n• The majority of web traffic worldwide is mobile. For our Namibian client base, mobile usage is even higher due to mobile data being the primary internet access point for many users.\n• Designing mobile-first forces prioritisation — if a content element does not fit on mobile, it may not be essential.\n• Responsive CSS is easier to write as progressive enhancement (adding complexity for larger screens) than as regression (removing complexity for smaller screens).\n\nPractical workflow:\n1. Design the mobile version (375px wide) first, with all required content.\n2. Identify which elements expand, reflow, or are added at tablet and desktop widths.\n3. Design the tablet version (768px) showing reflow and any new elements.\n4. Design the desktop version (1440px) with full layout.\n\nHand the developer all three versions. A developer working from only a desktop design will produce a poor mobile layout — always provide the mobile spec.",
          },
          {
            heading: "Breakpoints & Layout Grids",
            body: "Standard breakpoints used across all Swift Designz projects (aligned with Tailwind CSS defaults):\n\n• `sm`: 640px — small tablets and large phones in landscape\n• `md`: 768px — tablets\n• `lg`: 1024px — laptops and small desktops\n• `xl`: 1280px — standard desktops\n• `2xl`: 1536px — large desktops\n\nIn Figma, create frames at these widths for each key page:\n• Mobile: 375px wide (iPhone SE / most Android mid-range)\n• Tablet: 768px wide\n• Desktop: 1440px wide (design at this width — it represents most laptop/desktop screens)\n\nLayout grids:\n• Mobile: 4-column grid, 16px gutters, 16px margin\n• Tablet: 8-column grid, 24px gutters, 32px margin\n• Desktop: 12-column grid, 24px gutters, auto margin (centred container, max-width 1280px)\n\nAlways design with a grid overlay active in Figma. Elements that do not align to the grid will look inconsistent in implementation.",
          },
          {
            heading: "Touch Targets & Interactive Elements",
            body: "All interactive elements on mobile must meet minimum touch target size requirements. Insufficient touch targets are the number one cause of poor mobile usability.\n\nMinimum sizes (per WCAG 2.1 and Apple/Google guidelines):\n• Minimum touch target size: 44×44px\n• Recommended: 48×48px for primary actions\n• Minimum spacing between adjacent touch targets: 8px\n\nApplied in design:\n• Buttons: minimum height 44px. Prefer 48px for primary CTAs.\n• Checkboxes and radio buttons: the label must be part of the tap target — the entire label row, not just the checkbox\n• Navigation links in mobile menus: minimum height 48px per item\n• Form fields: minimum height 44px with appropriate padding so the tap area is the full field, not just the text\n\nLinks in body copy: on mobile, never place two links so close together that a user will accidentally tap the wrong one. Minimum 8px vertical spacing between inline links.\n\nIn Figma: check your touch targets by drawing a 44×44px rectangle overlay on every interactive element before handoff. Flag any that do not meet the minimum to the Managing Member before finalising the design.",
          },
          {
            heading: "Multi-Device Testing",
            body: "Designs must be tested before handoff to confirm they translate correctly to code. After the developer implements the design, design QA is part of the designer's responsibilities — not an optional extra.\n\nDesign QA checklist:\n\nMobile (375px):\n• All content is visible without horizontal scrolling\n• Text is legible (minimum 16px body, 14px secondary)\n• All buttons and links meet the 44px minimum touch target\n• Images are not cropped in unintended ways\n• Forms are usable with a mobile keyboard active\n\nTablet (768px):\n• Layout reflows correctly — no elements overlapping or misaligned\n• Navigation is accessible (hamburger menu or adapted layout)\n\nDesktop (1440px):\n• Maximum content width is contained (max-width: 1280px centred)\n• No elements stretch to fill the full 1440px when they should not\n• Hover states are applied to interactive elements\n\nBrowser testing:\n• Chrome (primary)\n• Safari (critical for iOS users — rendering differs from Chrome)\n• Firefox\n\nTest on a real mobile device — not just DevTools responsive mode. DevTools does not accurately replicate touch behavior, font rendering, or iOS-specific quirks.",
          },
          {
            heading: "Accessibility Standards",
            body: "All designs must meet WCAG 2.1 AA accessibility standards as a minimum. This is not optional — accessible design reaches more users and protects the company from legal risk.\n\nColour contrast:\n• Normal text (<24px or <18.67px bold): minimum contrast ratio of 4.5:1 against background\n• Large text (≥24px or ≥18.67px bold): minimum contrast ratio of 3:1\n• Use the Figma plugin 'Contrast' or the Stark accessibility plugin to check ratios\n• The Swift Designz primary text (#F5F5F5) on the background (#101010) achieves approximately 19:1 — exceptional. Ensure client brand colours also meet the minimum.\n\nFocus states:\n• Every interactive element must have a visible focus ring for keyboard navigation\n• Do not remove the default browser focus outline without replacing it with an equally visible alternative\n• In dark themes, focus rings should be the primary teal colour (#30B0B0) at minimum 3px width\n\nAlt text:\n• Every image that conveys information must have a descriptive alt text specified in the design handoff notes\n• Decorative images (backgrounds, dividers) should have empty alt text (`alt=\"\"`) to be skipped by screen readers\n\nTypography accessibility:\n• Minimum body text size: 16px for web\n• Maximum line length: 70–80 characters (approximately 640px at 16px)\n• Minimum line height: 1.5 × font size for body text",
          },
        ],
      },
      {
        id: "emp-design-handoff",
        title: "Asset Export & Developer Handoff",
        description: "Export settings, naming conventions, Figma Inspect, and annotation standards",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Export Formats & Settings",
            body: "The format you export assets in has a significant impact on performance and quality. Use the correct format for each asset type:\n\nLogos and icons:\n• SVG (Scalable Vector Graphics) — for all vector assets. SVGs are resolution-independent, typically smaller than PNG, and can be animated with CSS.\n• Export condition: the SVG must be clean — remove any unnecessary groups, empty layers, or hidden elements in Figma before exporting. Use the 'Iconify' or 'Clean Document' plugin to simplify complex SVGs.\n\nPhotographs and hero images:\n• WebP format, 80% quality — best balance of quality and file size for web\n• Fallback PNG only if the developer cannot support WebP in the target environment\n• Export at 2× the display size (retina) — a 800px wide image displayed at 400px wide\n• Maximum file size: 200KB for content images, 500KB for full-width hero images\n\nUI screenshots and mockups:\n• PNG — lossless, appropriate for images with sharp edges and text\n• WebP preferred if file size is a concern\n\nFavicons:\n• Export as SVG (modern browsers) AND 32×32 PNG (legacy browsers and browser tabs)\n• ICO format is not required for web projects — only for legacy applications\n\nNever export Figma frames directly as JPEG — JPEG compression artefacts are visible at boundaries and text edges.",
          },
          {
            heading: "Asset Naming Convention",
            body: "All exported assets must be named before handoff. The developer should be able to understand what every file is without opening it.\n\nConvention: `[section]-[element]-[variant].[extension]`\n\nExamples:\n• `hero-bg.webp` — hero section background image\n• `about-portrait-mobile.webp` — about section portrait image, mobile crop\n• `logo.svg` — primary logo\n• `logo-white.svg` — white variant of logo\n• `icon-check.svg` — check icon\n• `icon-arrow-right.svg` — right arrow icon\n\nRules:\n• All lowercase\n• Hyphens for word separation (no underscores, no spaces, no camelCase)\n• No version numbers in file names (no `hero-v2.webp`, `logo-final.svg`) — assets in the handoff are final by definition\n• Descriptive, not generic: `testimonial-bg.webp` not `image3.webp`\n• Icons prefixed with `icon-`: `icon-phone.svg`, `icon-email.svg`\n\nOrganise exported assets in folders by section:\n```\nassets/\n  logos/\n  icons/\n  hero/\n  about/\n  testimonials/\n```",
          },
          {
            heading: "Developer Handoff Documentation",
            body: "Design handoff is not 'send the Figma link'. A complete handoff package includes:\n\n1. Figma Inspect link with 'Can view' access — the developer uses this to check exact measurements, colours, font properties, and export assets directly from Figma.\n\n2. Exported assets folder — pre-exported in the correct formats and names, organised by section.\n\n3. Design notes document — a written supplement to Figma covering:\n   • Animations and transitions (describe timing, easing, trigger)\n   • Hover and focus states (specify what changes and by how much)\n   • Behaviour on scroll (sticky elements, parallax, reveal animations)\n   • Edge cases (what happens when a product name is very long, when a list is empty, when an image fails to load)\n   • Responsive behaviour notes for non-obvious breakpoint changes\n\n4. Component specification:\n   • List of all reusable components and their variants\n   • Which states each component has (default, hover, active, disabled, loading, error)\n   • The 'states' page in Figma should show all variants for all components\n\n5. Content requirement notes:\n   • Maximum character limits for text fields (headline: 60 chars, body: 300 chars)\n   • Image aspect ratios required (hero: 16:9, team photo: 1:1, card thumbnail: 4:3)\n   • Alt text for every image in the design",
          },
        ],
      },
    ],
  },

  // ── Employee: Project Management Department ───────────────────────────────────
  {
    slug: "employee-pm",
    label: "Project Management",
    description: "SOPs for PMs — project setup, milestone tracking, client communication, scope management, and closure",
    icon: "Briefcase",
    color: "text-amber-400",
    accentBg: "bg-amber-400/10",
    roles: ["admin", "employee"],
    items: [
      {
        id: "emp-pm-setup",
        title: "Project Setup in the Admin Portal",
        description: "Creating a project record, setting milestones, assigning the team, and configuring tracking",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "When to Create a Project Record",
            body: "A project record in the admin portal must be created as soon as a quotation is accepted and the deposit invoice is issued. Do not wait for the deposit to be paid before creating the project — the record establishes the project's existence and links to the client and quotation.\n\nDo not create a project record before a quotation is accepted. Projects in 'planning' status that have no corresponding accepted quotation confuse the pipeline and distort revenue reporting.\n\nIf a project is started without a formal quotation (which should never happen — see the Change Request SOP and escalate if it does), a retrospective quotation must be created and the project record linked to it as soon as the omission is identified.",
          },
          {
            heading: "Creating the Project Record",
            body: "Navigate to Projects > New Project in the admin portal. Fill in every required field — no field may be left blank:\n\nClient: link to the correct client record. If the client does not exist yet, create the client record first.\n\nProject name: use a consistent naming pattern: `[Client Name] - [Project Type]`. Examples: 'Namibia Organics - E-commerce Website', 'ACM Logistics - Brand Identity'. Do not use vague names like 'New Website' or 'Phase 2'.\n\nQuotation: link to the accepted quotation. This creates the financial relationship between the project and billing.\n\nStatus: set to 'Planning' on creation. Status transitions:\n• Planning → In Progress (when first milestone work begins)\n• In Progress → Review (when project is submitted for client review)\n• Review → Completed (when client provides written sign-off)\n• Any status → On Hold (when project is paused by client request — requires written confirmation)\n\nStart date: the first day of active work. Not the quotation date. Not the deposit date.\n\nTarget end date: from the project brief. If no end date was agreed, discuss with the Managing Member and set one — projects without deadlines do not ship.",
          },
          {
            heading: "Setting Milestones",
            body: "Every project must have milestones. Milestones are the checkpoints at which the client reviews and approves the work before the next phase begins. They also link to payment instalments.\n\nStandard milestone structure for a website project:\n• M1: Project kickoff and brief confirmed\n• M2: Wireframes approved\n• M3: High-fidelity designs approved\n• M4: Development complete — staging review\n• M5: Client-approved on staging — go live\n• M6: Post-launch testing complete — project closed\n\nFor smaller projects (landing pages, single-feature apps), a simplified structure:\n• M1: Design approved\n• M2: Development complete and live\n\nFor each milestone, record:\n• Name (as above)\n• Description: what is delivered at this milestone\n• Due date\n• Assigned team member responsible for delivery\n\nMilestone due dates must be realistic — cross-reference the project timeline in the brief and account for client review time (minimum 3 business days per review).",
          },
          {
            heading: "Team Assignment & Access",
            body: "Each project must have a designated project lead — the team member who is the primary contact for the Managing Member on that project. The project lead is responsible for:\n• Updating milestone statuses in the portal\n• Sending client progress updates (see Client Communication SOP)\n• Flagging risks and blockers to the Managing Member\n• Ensuring all team members working on the project know their deliverables and deadlines\n\nAssign team members to the project in the portal. Every team member assigned to a project must have the appropriate system access:\n• GitHub repository access (dev team)\n• Figma project access (design team)\n• Admin portal viewer access (all team members assigned to a project)\n\nDo not assign team members to projects in the portal if they do not have the system access needed to do the work — request access from the Managing Member before assignment.",
          },
        ],
      },
      {
        id: "emp-pm-tracking",
        title: "Milestone & Delivery Tracking",
        description: "Weekly status updates, milestone sign-off, blocker management, and the Friday update",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Status Update Cadence",
            body: "Project status must be kept current in the admin portal at all times. The portal is the source of truth — the Managing Member and investors see project status from there. Stale statuses are misleading and cause coordination failures.\n\nRequired update frequency:\n• Milestone status: update on the day a milestone is completed. Do not batch milestone updates at the end of the week.\n• Project status: update whenever the project's overall status changes.\n• Daily minimum: confirm your current task is still on track. If it is not, flag it (see Blocker Management section).\n\nStatus definitions:\n• Planning: project exists, brief is complete, work has not started\n• In Progress: active work is being done\n• Review: deliverable is submitted to client or internal review — awaiting feedback\n• On Hold: work is paused, pending client input, payment, or a dependency\n• Completed: client has provided written sign-off and final invoice is issued\n• Cancelled: project will not proceed — reason must be noted",
          },
          {
            heading: "Milestone Sign-Off",
            body: "A milestone is only complete when the deliverable is approved in writing by the client. 'Approved in writing' means: an email, a message in the designated project communication channel, or a signed change request. A verbal 'it looks good' in a call does not constitute sign-off.\n\nAfter each milestone delivery:\n1. Send the client the deliverable with clear instructions for how to review it.\n2. Specify a review deadline: 'Please provide your feedback or approval by [date]. If we do not hear from you by then, we will follow up.'\n3. Follow up if no response after 3 business days.\n4. If the client is unresponsive for 7+ business days, notify the Managing Member — the project may need to be placed On Hold to avoid holding developer/designer time.\n\nWhen written approval is received:\n• Update the milestone status to 'Completed' in the portal with the date\n• Note the approval source (email from client@example.com, 12 June 2026)\n• Proceed to the next milestone\n\nDo not proceed to the next phase without documented approval of the current one. 'We discussed it on the call' is not documented approval.",
          },
          {
            heading: "Blocker Management",
            body: "A blocker is anything that prevents you or another team member from progressing on the project. Blockers left unaddressed are the primary cause of missed deadlines.\n\nTypes of blockers:\n• Client blockers: client has not provided required assets (logo files, copy, product images), has not responded to review request, or has not paid the required instalment\n• Internal blockers: a dependency on another team member who is behind, a technical issue that requires investigation, an ambiguous brief that needs clarification before work can continue\n• External blockers: third-party API outage, domain transfer delay, hosting issue\n\nWhen you identify a blocker:\n1. Flag it in the team channel immediately — the same day, with a specific description of what is blocked, what is needed, and who needs to provide it.\n2. Update the project milestone status to reflect the blocker: add a note in the milestone description.\n3. Notify the Managing Member if the blocker will delay the milestone delivery date by more than 2 business days.\n4. Do not simply stop work and wait silently — identify what other work can progress while the blocker is being resolved.\n\nFor client blockers: the project lead sends a polite but direct email to the client. Include: what is needed, why it is blocking progress, and the date by which it is needed to keep the project on schedule.",
          },
          {
            heading: "Friday End-of-Week Update",
            body: "Every Friday by 16:00, the project lead submits a brief status update to the Managing Member via the team channel or email. This is not optional — it replaces the need for a weekly status meeting.\n\nFormat (keep it to one paragraph per project):\n\n---\nProject: [Name] — [Status]\nThis week: [What was completed — specific, e.g. 'Wireframes for Homepage, About, and Contact pages complete. Sent to client for review on Thursday.']\nNext week: [What is planned — specific, e.g. 'Awaiting wireframe feedback. If received by Monday, Hi-Fi designs start Tuesday.']\nBlockers: [Any current blockers — or 'None']\nMilestone at risk: [Yes / No — if Yes, explain why and what is being done]\n---\n\nIf a milestone is at risk, the Friday update is too late to be the first time the Managing Member hears about it — the blocker should have been flagged earlier in the week. The Friday update is a summary, not a first notification of problems.",
          },
        ],
      },
      {
        id: "emp-pm-scope",
        title: "Scope Management & Change Requests",
        description: "Recognising scope creep, the formal CR process, and what never gets started without approval",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "What Scope Creep Looks Like",
            body: "Scope creep is the gradual expansion of project scope beyond what was agreed in the original quotation, often without a corresponding increase in time or budget. It is the most common cause of project overruns and unprofitable projects.\n\nCommon forms of scope creep:\n\nFeature additions: 'Can you also add a blog section?' — the original quote was for a landing page.\n\nPlatform changes: 'We've decided to use Shopify instead of a custom build.' — the quote was for a custom Next.js build.\n\nContent additions: 'We actually have 15 product pages, not 5.' — the brief specified 5 pages.\n\nRevision overruns: a client on their fifth round of revisions when the contract includes 2.\n\nTechnology changes: 'Can the site have an API integration with our ERP?' — not in scope.\n\nDesign concept changes: 'We've decided we want a completely different style' — after high-fidelity approval.\n\nThe rule: any addition, change, or expansion beyond what is explicitly described in the accepted quotation requires a Change Request. The principle is simple — if it was not in the quote, it was not in the price.",
          },
          {
            heading: "The Change Request Process",
            body: "When scope creep is identified, do not begin the additional work. Do not tell the client 'we can do that'. Stop and follow this process:\n\nStep 1 — Identify and document: write down exactly what the client is requesting and why it falls outside the original quotation.\n\nStep 2 — Estimate: assess the additional time and cost. For development changes, consult the developer. For design changes, consult the designer. Be realistic — underestimating a Change Request creates the same problem you are trying to solve.\n\nStep 3 — Notify the Managing Member: before communicating to the client, inform the Managing Member that a Change Request is required and get approval for the proposed additional cost.\n\nStep 4 — Generate the Change Request document: use the Change Request Form template in the Documents module. Include:\n• Description of the additional work requested\n• Why it falls outside the original scope (reference the quotation line items)\n• Additional cost (in NAD, including VAT if applicable)\n• Timeline impact (does this extend the project end date?)\n• Revised milestone dates if applicable\n\nStep 5 — Send to client for approval: the CR document goes to the client by email. Request written confirmation.\n\nStep 6 — Do not start until approved: work on the Change Request begins only after written client approval AND the supplementary invoice is issued. The supplementary invoice is generated in the admin portal.\n\nStep 7 — Update the portal: update the project scope notes and milestone dates to reflect the approved CR.",
          },
          {
            heading: "Revision Rounds — Enforcing the Limit",
            body: "Every Swift Designz quotation includes a defined number of revision rounds — typically 2 per project phase. A revision round is one round of feedback from the client, addressed by the designer or developer, and one further round of feedback on the revisions.\n\nEnforcing revision limits is the project lead's responsibility. If a client is on their third round of design revisions when the contract includes 2, the project lead must:\n\n1. Politely and promptly notify the client in writing that the included revision rounds have been used.\n\nTemplate:\n'Hi [Client name], I wanted to flag that we have now completed the 2 revision rounds included in your project agreement. Any further revisions will be subject to an additional fee of [rate] per round. I've prepared a Change Request for your review — please confirm if you'd like to proceed.'\n\n2. Generate a Change Request for the additional revision round before proceeding.\n\nDo not allow revision overruns to accumulate and then raise them all at once at the end of the project. This approach damages client relationships and creates disputes. Raise it at the moment the limit is exceeded, each time.",
          },
          {
            heading: "Verbal and WhatsApp Approvals",
            body: "Verbal approvals (in calls, in person) and WhatsApp message approvals for scope changes and Change Requests are not binding and must not be relied upon.\n\nThis rule exists because:\n• Verbal agreements cannot be referenced, shared, or verified later\n• WhatsApp messages can be deleted, edited, or the phone lost\n• In a dispute, 'he said on the call that we should add it' is not evidence\n• Clients occasionally misremember or change their position after verbal approvals\n\nIf a client verbally approves a Change Request on a call:\n1. Send a follow-up email immediately after the call: 'Following our call, I'm attaching the Change Request for [description]. Please reply to confirm your approval so we can proceed.'\n2. Do not start work until that email reply is received.\n\nIf a client approves via WhatsApp:\n1. Reply: 'Great, I'll send the formal Change Request to your email for confirmation.'\n2. Send the CR by email and request email confirmation.\n3. Do not start work until email confirmation is received.\n\nThis process protects both the company and the client from misunderstandings.",
          },
        ],
      },
      {
        id: "emp-pm-closure",
        title: "Project Closure & Handover",
        description: "Pre-closure checklist, sign-off requirements, handover documentation, and archiving",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Conditions for Project Closure",
            body: "A project can only be marked as 'Completed' in the admin portal when all of the following conditions are met:\n\n1. Client has provided written sign-off on the final deliverable. 'Written' means email, not WhatsApp. The sign-off must reference the specific deliverable and indicate satisfaction.\n\n2. All Change Requests have been approved, invoiced, and paid or are on an agreed payment plan.\n\n3. All invoices (final instalment) have been issued.\n\n4. Project handover document has been generated and sent to the client.\n\n5. All files, assets, and source code have been archived in the correct project folder.\n\n6. Access credentials for any third-party services (domain registrar, hosting, CMS) have been transferred to the client or documented in the handover document.\n\nDo not mark a project completed because active development is finished. The project is complete when the client has formally accepted the deliverable and all administrative steps are done.",
          },
          {
            heading: "Project Handover Document",
            body: "Generate the Project Handover document via the admin portal (Documents > Project Handover). Every field must be completed — do not leave sections blank or mark them 'N/A' without explanation.\n\nSections to complete:\n\nProject Summary: project name, client, start and end dates, brief description of deliverable.\n\nAccess Credentials: every login credential the client will need to manage their product independently:\n• Domain registrar login and registrar URL\n• Hosting control panel (Netlify, Vercel, cPanel) — with read-only or limited access set up for the client if full access is not appropriate\n• CMS login (Sanity, WordPress, Prismic) — admin account set up in client's name\n• Google Analytics / Search Console — client added as owner\n• Any third-party integrations (payment gateways, email providers) — client added as admin\n\nContent Management Guide: a plain-English guide covering the 3–5 most common tasks the client will need to perform themselves:\n• How to add a new product\n• How to update their contact information\n• How to view their sales reports\n\nTechnical Notes: framework, language, deployment platform, repository location, any known limitations or upcoming maintenance requirements.\n\nPost-Launch Support: reminder of what is included (48-hour critical issue support, as per contract) and the process for reporting issues after that window.",
          },
          {
            heading: "Post-Launch Support Period",
            body: "Every project includes a 48-hour post-launch support period for critical issues at no additional charge. This period starts when the project is marked live — not when the client first uses the site.\n\nWhat qualifies as a critical issue in the support period:\n• A core feature that worked on staging but is broken in production\n• A page that returns a 500 error or fails to load\n• A form that is not submitting or is throwing errors\n• A critical user flow (checkout, contact, booking) that is non-functional\n\nWhat does not qualify as a critical issue:\n• A request to change the design\n• A content update the client wants to make\n• A feature that was not in the original scope\n• A cosmetic issue that does not affect usability\n\nIf a critical issue is reported during the support period:\n• Acknowledge within 2 hours during business hours\n• Investigate and provide an estimated resolution time within 4 hours\n• If the issue cannot be resolved within 48 hours, notify the Managing Member — the client may need interim assistance\n\nAfter the 48-hour period expires, any fixes are chargeable, or the client is directed to their retainer agreement if one is in place.",
          },
          {
            heading: "File Archiving",
            body: "When a project is completed, all files must be archived within 5 business days of the final sign-off. This is not optional — disorganised file storage creates costs when clients return years later for support or scope changes.\n\nArchiving checklist:\n\nCode repository:\n• Merge all branches to main — no dangling feature branches\n• Ensure the README is up to date with setup instructions\n• Tag the release: `git tag v1.0.0 -m 'Initial launch'`\n• Confirm the repository is private (unless the client has requested open-source)\n\nDesign files:\n• Save a final named version in Figma: 'vFinal — Handover [date]'\n• Export all design assets to the project's cloud storage folder in their final form\n• Archive the Figma file to the 'Completed Projects' folder\n\nDocuments:\n• Brief document\n• All Change Requests (approved copies)\n• Client sign-off emails (forward to the admin portal email or note in project record)\n• Final invoice and payment confirmation\n• Handover document (sent copy)\n\nAdmin portal:\n• Mark all milestones as completed\n• Update project status to 'Completed'\n• Note the handover date and the team member who completed the handover in the project notes",
          },
        ],
      },
    ],
  },

  // ── Employee: Client Relations Department ─────────────────────────────────────
  {
    slug: "employee-client-relations",
    label: "Client Relations",
    description: "SOPs for client-facing work — onboarding, communication, expectations, escalation, and retention",
    icon: "Users",
    color: "text-green-400",
    accentBg: "bg-green-400/10",
    roles: ["admin", "employee"],
    items: [
      {
        id: "emp-cr-onboarding",
        title: "Client Onboarding Flow",
        description: "End-to-end process from lead received to project kickoff — every step and who owns it",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Stage 1 — Lead Receipt & Qualification",
            body: "All new leads enter the admin portal via one of three channels:\n• The contact form on swiftdesignz.co.za (auto-creates a Lead record via the public API)\n• A direct referral or cold outreach (manually created in the Leads module by the Managing Member or assigned team member)\n• An investor or existing client referral (manually created, flagged as 'Referral' in the source field)\n\nYour first action on a new lead: respond within 24 business hours. Non-response within 24 hours is a disciplinary matter. The response does not need to be a full proposal — it can be a brief acknowledgment that you received their enquiry and that you will follow up with a detailed response within a specific timeframe.\n\nQualification questions to answer before creating a quotation:\n• What is the scope? (Website, app, branding, maintenance?)\n• What is their budget range? (Ask directly — it saves time for both parties)\n• What is their timeline? (When do they need it live?)\n• Who is the decision-maker? (Are you talking to the person who can approve the quote?)\n• Do they have existing brand assets? (Logo, colours, fonts?)\n• What is their current solution and why are they changing?\n\nLead statuses — update as it progresses:\n`new` → `contacted` → `qualified` → `quoted` → `won` or `lost`\n\nA lead marked 'lost' must have a reason noted in the portal. 'Lost' without a reason is useless data.",
          },
          {
            heading: "Stage 2 — Quotation to Acceptance",
            body: "Create the quotation in the admin portal under Accounts Receivable > Quotations. Quotation numbers are auto-generated (SD26-Q-001 format). Do not manually create or send a quotation outside the portal.\n\nQuotation essentials:\n• Itemise every deliverable — vague line items lead to scope disputes later\n• Set a payment plan (full pay, standard 50/50, 2-month flex, 3-month ease)\n• Set a validity period — quotations expire after 30 days by default. An expired quotation must be re-issued with current pricing before work begins\n• Include terms that cover revision rounds, intellectual property transfer, and the Change Request process\n\nSending the quotation:\n• Send via the portal using the 'Send Quotation' action — this generates a PDF and sends a branded email with an acceptance link\n• Do not email a manually prepared PDF from your personal email — all quotation correspondence must go through the portal\n\nFollow-up cadence:\n• Day 1: quotation sent\n• Day 3: follow-up if no acknowledgement\n• Day 7: second follow-up\n• Day 14: final follow-up. If no response, update lead status to 'Unresponsive' and notify Managing Member. Do not chase beyond this point without direction.\n\nWhen the client accepts:\n• The portal auto-records the acceptance (date, IP address, name)\n• The first instalment invoice is generated automatically\n• Notify the Managing Member immediately\n• Create the project record (see Project Management SOP)",
          },
          {
            heading: "Stage 3 — Deposit to Kickoff",
            body: "Work does not begin until the deposit is confirmed in the admin portal. 'I will pay this week' is not confirmation. The payment must be reflected in the bank account and recorded in the portal as a payment confirmation.\n\nAfter the deposit is confirmed:\n1. Send a kickoff preparation email to the client. Include:\n   • Welcome message and who their primary point of contact is\n   • A list of everything you need from them to start (brand assets, content, reference sites)\n   • The agreed start date and first milestone due date\n   • The best way to reach you for questions (email, project channel)\n   • What to expect in the first week\n\n2. Schedule the kickoff call within 3 business days of the deposit. The kickoff call covers:\n   • Brief walkthrough of what was agreed in the quotation\n   • Confirming the timeline and milestones\n   • Q&A from the client\n   • Agreeing on the primary communication channel and update frequency\n\n3. After the kickoff call: send a written summary of what was discussed and agreed — 'Following our call today...' This protects both parties and ensures alignment.\n\n4. Begin work only when all inputs from the client are received. If assets are missing, set a deadline: 'We need your logo files by [date] to keep the project on schedule.'",
          },
          {
            heading: "Client Onboarding Document",
            body: "Generate and send the Client Onboarding document via the admin portal (Documents > Client Onboarding). This document must be sent to the client before or at the kickoff call.\n\nThe Client Onboarding document covers:\n• What to expect at each project milestone\n• How to provide feedback (specific is good, 'I don't like it' without explanation is not actionable)\n• How changes outside the original scope are handled (Change Request process)\n• The revision round limit and what happens when it is exceeded\n• Payment schedule and what happens if a payment is late\n• Communication channels and response time expectations\n• What happens at the end of the project (handover, post-launch support)\n\nSend the document to the client's email (via the portal) and request confirmation that they have received and read it. File the send confirmation in the project record.\n\nThis document exists to prevent the most common client disputes. A client who understood the process at onboarding and has a document to reference is far less likely to dispute a Change Request or be frustrated by a revision limit.",
          },
        ],
      },
      {
        id: "emp-cr-communication",
        title: "Professional Communication Standards",
        description: "Email standards, response time SLAs, channel rules, and tone guidelines",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Communication Channels & Their Purpose",
            body: "Different channels serve different purposes. Using the wrong channel for the wrong type of communication creates confusion and leaves no paper trail.\n\nEmail (info@swiftdesignz.co.za):\n• Primary channel for all formal client communication\n• Required for: quotation discussions, scope changes, milestone approvals, invoicing, disputes, any decision that needs to be documented\n• Response time SLA: within 1 business day. If you cannot provide a full response within 1 day, send an acknowledgement: 'Thank you for your email — I will come back to you with a detailed response by [date].'\n\nWhatsApp:\n• Quick status updates only: 'Your site is now live' or 'I will send the design this afternoon'\n• Never use WhatsApp for: scope discussions, pricing, approvals, complaints, anything that needs to be referenced later\n• If a client raises a significant issue on WhatsApp, acknowledge it and move the conversation to email: 'Thanks for flagging this — I'll send you an email so we can document the solution.'\n\nVideo calls (Google Meet, Zoom):\n• For complex discussions, design reviews, and kickoff calls\n• Always follow up a call with a written summary by email within 1 hour of the call ending\n• Never make scope commitments on a call without the written follow-up — verbal commitments on calls are not binding until confirmed in writing\n\nPhone:\n• Emergency contact only — not for project discussions\n• If a client calls unexpectedly about a project, note the key points during the call and send a written follow-up immediately after",
          },
          {
            heading: "Email Writing Standards",
            body: "Every email you send represents Swift Designz. The quality of your written communication reflects directly on the company's professionalism.\n\nSubject line:\n• Include the project reference: '[SD26-Q-012] Updated quotation for ACM Logistics'\n• Be specific: 'Website design — round 2 revisions attached' not 'Update'\n• Never send replies with 'Re: Re: Re: Fwd:' chains without clearing the subject\n\nEmail structure:\n1. Greeting: 'Hi [Name],' — first name is appropriate for established clients. 'Dear Mr./Ms. [Name],' for first contact with formal prospects.\n2. Context sentence: one sentence explaining why you are writing\n3. Body: clear, structured content. Use bullet points for lists. Use numbered steps for processes. Never write a wall of text.\n4. Call to action: what do you need from them, and by when?\n5. Closing: 'Kind regards,' or 'Best regards,' followed by your full name and title\n\nTone:\n• Professional but not stiff. Conversational English, not corporate jargon.\n• Direct: say what you mean. Avoid hedging ('I was just wondering if maybe you could possibly...')\n• Proofread every email before sending. One typo is excusable. Consistent errors are unprofessional.\n• No emojis in client emails\n• No slang or informal language ('gonna', 'wanna', 'u', 'pls')\n\nCC and BCC:\n• CC the Managing Member on all emails where scope, pricing, or disputes are discussed\n• BCC yourself on important client communications as a personal record",
          },
          {
            heading: "Response Time SLAs",
            body: "Response time SLAs are your commitment to the client. Exceeding them — even once — damages trust. Meeting them consistently builds it.\n\nClient emails: respond within 1 business day. Business hours are 08:00–17:00, Monday to Friday, Namibian time (UTC+2). An email received at 16:45 on Friday may be responded to at 09:00 on Monday — within SLA.\n\nClient WhatsApp (quick status questions): respond within 2 hours during business hours.\n\nClient phone calls: return missed calls within 2 hours during business hours.\n\nWhen you cannot meet the SLA:\n• Send an acknowledgement immediately: 'Hi [Name], thanks for reaching out. I'm currently [brief reason — not 'busy' but 'on a client call', 'completing a deadline']. I'll get back to you with a full response by [specific time — not 'soon' or 'later today'].'\n• Do not miss an acknowledged deadline. If you said you would respond by 14:00, respond by 14:00.\n\nOut-of-office:\n• Set a Google Workspace out-of-office reply whenever you are absent for more than 4 hours during business hours.\n• The out-of-office must name who to contact in your absence and their email address.\n• Notify the Managing Member whenever you set an out-of-office — client queries may need to be re-routed.",
          },
          {
            heading: "Client Meeting Protocol",
            body: "Whether in person or on video, client meetings require preparation and professional execution.\n\nBefore the meeting:\n• Confirm the meeting 24 hours in advance with a brief agenda: 'Hi [Name], looking forward to our call tomorrow at 10:00. We will cover [agenda items]. Please let me know if you'd like to add anything.'\n• Test your audio and video 5 minutes before any video call\n• Have the admin portal open with the client's project record ready\n• Have any deliverables or presentations ready to share — no 'wait, let me find that' during the call\n• Know what decisions you need to come out of the meeting with\n\nDuring the meeting:\n• Be on time. If you will be late, notify the client before the meeting time, not after.\n• Take notes on decisions, action items, and anything that will need to be referenced later\n• Never commit to scope, pricing, or timeline changes during a meeting without the Managing Member's prior approval. If pressed, say: 'I need to confirm this with my team and I will come back to you in writing.'\n\nAfter the meeting:\n• Send a written meeting summary within 1 hour. Format: 'Following our call today, here is a summary of what we discussed and what the next steps are:'\n• List decisions made, action items with owners and due dates, and any open questions\n• Request the client reply to confirm the summary is accurate",
          },
        ],
      },
      {
        id: "emp-cr-escalation",
        title: "Managing Difficult Situations & Escalation",
        description: "How to handle complaints, delays, disputes, and scope conflicts without damaging the relationship",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          {
            heading: "Communicating Bad News Proactively",
            body: "Bad news communicated proactively is manageable. Bad news discovered by the client is a crisis.\n\nExamples of bad news that must be communicated proactively:\n• A deadline that will not be met — communicate as soon as you know, not on the day of\n• An error discovered in delivered work — notify the client before they find it\n• A technical issue that is affecting their live site or product\n• A delay caused by a missing input (the client did not provide assets on time) — communicate the downstream impact immediately\n\nHow to communicate bad news:\n1. Acknowledge the problem directly and clearly. Do not bury it in a long email.\n2. Take ownership. Even if the cause is partially the client's (their late assets caused the delay), your role is to manage the project — lead with what you are doing to resolve it.\n3. Present a solution or revised timeline with the bad news. 'We have hit a delay' without a plan is distressing. 'We have hit a delay of 3 days due to X, and our revised delivery date is [date]' is manageable.\n4. Give a realistic new date — not an optimistic one. Overpromising and then missing the revised date is worse than being honest about a longer delay the first time.\n\nNever:\n• Hope the client does not notice a problem and say nothing\n• Blame other team members, suppliers, or circumstances to the client\n• Make commitments to resolve the problem that you are not certain you can keep",
          },
          {
            heading: "Handling Client Complaints",
            body: "A complaint is a client telling you that their expectation has not been met. Handle it well and you can strengthen the relationship. Handle it poorly and you lose the client.\n\nStep 1 — Listen fully before responding. Resist the urge to defend or explain while the client is still describing their concern. Let them finish.\n\nStep 2 — Acknowledge and validate. 'I understand why this is frustrating' is not an admission of fault — it is acknowledgement that the client's experience matters. Do not use corporate non-apologies ('I am sorry if you feel...') — they are insulting.\n\nStep 3 — Investigate before committing to a position. If the complaint involves a technical failure, a missed deliverable, or a scope dispute, do not commit to any position until you have reviewed the project record, the quotation, and the communications history. 'Let me review this and come back to you by [time]' is a perfectly appropriate response.\n\nStep 4 — Respond with facts, not opinions. 'The original quotation includes 2 revision rounds. We have completed 3 rounds. The additional revision is covered by the Change Request we discussed on [date].' is a factual response. 'You are asking for more than you paid for' is not.\n\nStep 5 — Escalate to the Managing Member before: offering any refund or credit, agreeing to additional work at no charge, making any commitment about how the issue will be resolved. All commitments on complaints go through the Managing Member.",
          },
          {
            heading: "Escalation Triggers",
            body: "Certain situations must be escalated to the Managing Member immediately — do not attempt to resolve them independently.\n\nEscalate immediately when:\n• A client threatens legal action or mentions a lawyer\n• A client threatens to post a negative review or share a complaint publicly\n• A client claims the delivered work is completely different from what they approved\n• A client is more than 30 days overdue on a payment and has not responded to reminders\n• A client requests a refund for completed, approved work\n• A client has had their access revoked for non-payment and is contacting you directly to reinstate it\n• Any situation involving a threat, abuse, or harassment from a client\n• You believe a team member's error has caused or is likely to cause significant client harm\n\nHow to escalate:\n• Message the Managing Member directly on WhatsApp with a brief description of the situation\n• Do not send an email for urgent escalations — use direct message\n• If you have already replied to the client, forward the relevant thread\n• Pause any further client communication on the issue until the Managing Member has been briefed\n\nNever escalate by simply forwarding a client email to the Managing Member without context. Include: what the issue is, your understanding of the facts, what you have said to the client so far, and what you need from the Managing Member.",
          },
        ],
      },
    ],
  },

  // ── Employee: HR Policies ───────────────────────────────────────────────────
  {
    slug: "employee-hr",
    label: "HR Policies",
    description: "Leave, remote work, expense claims, and performance review policies",
    icon: "Users",
    color: "text-green-400",
    accentBg: "bg-green-400/10",
    roles: ["admin", "employee"],
    items: [
      {
        id: "emp-hr-leave",
        title: "Leave & Attendance Policy",
        description: "Annual leave, sick leave, public holidays, and attendance expectations",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          { heading: "Leave Entitlements", body: "Annual leave: 20 working days per year (full-time). Sick leave: 10 paid days per year. Pro-rated for part-time/contract staff. Medical certificate required for 3+ consecutive sick days. Annual leave must be requested 5 business days in advance. Leave during peak delivery periods requires Managing Member approval." },
          { heading: "Attendance & Hours", body: "Core working hours: 08:00–17:00 Monday to Friday (Namibian time). Remote work is permitted subject to the Remote Work Policy. Notify the Managing Member before 09:00 on the first day of sick leave. Repeated late arrivals without notification will result in a formal warning. Namibian public holidays are observed." },
          { heading: "Request Process", body: "Submit leave requests via email to the Managing Member. Include: type of leave, start date, end date, total days. Confirmation within 2 business days. Unused sick leave does not carry over or pay out. Work required on a public holiday is compensated at 1.5x the daily rate." },
        ],
      },
      {
        id: "emp-hr-remote",
        title: "Remote Work Policy",
        description: "Expectations, security requirements, and performance standards for remote workers",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          { heading: "Eligibility & Equipment", body: "All roles are remote-eligible unless physical presence is required. You are responsible for a reliable internet connection (minimum 10Mbps) and a suitable private work environment. Use a VPN when accessing company systems on public or shared networks. Company-provided equipment is for work use only and must be returned on termination." },
          { heading: "Availability & Communication", body: "Be available during core hours (08:00–17:00 Namibian time). Respond to messages within 2 hours during core hours. Update your status for extended unavailability. Attend scheduled video calls on time. Test your connection before important calls. Lock your screen when not at your desk." },
          { heading: "Performance & Security", body: "Remote work is measured by output, not hours. Deadlines and quality are the primary indicators. Enable 2FA on all company accounts. Do not work from public places where screens are visible to others. Report any security incidents (lost device, suspicious login) immediately." },
        ],
      },
      {
        id: "emp-hr-expenses",
        title: "Expense Claims Policy",
        description: "What can be claimed, how to get approval, and how to submit",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          { heading: "Claimable vs Non-Claimable", body: "Claimable (pre-approved): software tools required for your role, travel for client meetings, internet/phone allowance (if agreed), approved training with certificate, approved hardware (becomes company property). Non-claimable: personal meals/entertainment, home office furniture, personal phone plans, fines and penalties." },
          { heading: "Approval Process", body: "All expenses over N$200 must be pre-approved by the Managing Member via email. Include: description, amount, reason, supplier. Emergency purchases below N$500 may be made first and submitted within 24 hours. Claims submitted more than 60 days after the expense date will not be reimbursed." },
          { heading: "Submission", body: "Submit claims monthly with original receipts or invoices. Approved claims are reimbursed with next payroll or within 5 business days. By signing this policy you confirm you understand what is and is not claimable and will only submit legitimate business expenses." },
        ],
      },
      {
        id: "emp-hr-performance",
        title: "Performance Review Policy",
        description: "Review frequency, assessment areas, and what outcomes to expect",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          { heading: "Review Schedule", body: "Formal reviews twice per year: August and February (aligned to financial year end). New employees have a 90-day probationary review. Informal monthly check-ins between team members and the Managing Member. Reviews are an opportunity for two-way feedback — come prepared." },
          { heading: "What is Assessed", body: "Delivery: meeting deadlines and quality standards. Communication: client and internal communication quality. Initiative: proactively identifying and solving problems. Technical Skills: relevance and growth. Teamwork & Culture: alignment with company values and code of conduct." },
          { heading: "Outcomes", body: "Salary reviews take effect from the start of the next month. Role changes and promotions are communicated in writing. Development plans: training, mentorship, or project exposure. Performance Improvement Plans (PIP) are issued for team members consistently not meeting expectations. PIPs are formal documents with targets and a review timeline." },
        ],
      },
    ],
  },

  // ── Employee: Conflict Resolution ───────────────────────────────────────────
  {
    slug: "employee-conflict",
    label: "Conflict Resolution",
    description: "Workplace dispute resolution, grievance procedure, and your rights",
    icon: "TrendingUp",
    color: "text-orange-400",
    accentBg: "bg-orange-400/10",
    roles: ["admin", "employee"],
    items: [
      {
        id: "emp-conflict-resolution",
        title: "Conflict Resolution Policy",
        description: "How workplace conflicts are raised, mediated, and resolved",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          { heading: "Guiding Principles", body: "Address conflicts early — small issues become big problems when ignored. All parties deserve to be heard without judgment. Confidentiality must be maintained throughout. Resolution should be constructive, not punitive. Retaliation against anyone who raises a conflict in good faith is prohibited and is itself a disciplinary matter." },
          { heading: "Resolution Steps", body: "Step 1 — Direct Resolution: where safe, speak directly with the other party in a calm, private setting. Focus on the issue, not the person. Step 2 — Mediation: if direct resolution fails, request mediation by the Managing Member. A structured meeting will be arranged within 5 business days, both perspectives heard, and a written agreement facilitated. Step 3 — Formal Resolution: if mediation fails, submit a written formal complaint. A decision is issued within 10 business days." },
          { heading: "External Escalation", body: "If the matter remains unresolved and involves a breach of Namibian labour law, either party may refer it to the Office of the Labour Commissioner in accordance with the Labour Act, 2007 (Act 11 of 2007). Nothing in this policy prevents you from approaching any statutory body at any time." },
        ],
      },
      {
        id: "emp-grievance",
        title: "Grievance Procedure",
        description: "Your right to raise concerns and the formal process for doing so",
        type: "sop",
        roles: ["admin", "employee"],
        sections: [
          { heading: "Your Rights & Grounds", body: "You have the right to raise a formal grievance if you believe you have been treated unfairly, discriminated against, or harassed. Grounds include: unfair treatment, breach of contract, failure to pay on time, bullying or intimidation, unfair disciplinary action, and breach of confidentiality or privacy." },
          { heading: "Formal Submission", body: "Submit a written grievance to info@swiftdesignz.co.za. Include: your name, date, description of the issue, relevant dates, any evidence, and your desired outcome. The Managing Member will acknowledge receipt within 2 business days. An investigation will be completed within 15 business days. Both parties will have the opportunity to present their account." },
          { heading: "Appeal & External Bodies", body: "If unsatisfied with the outcome, you may appeal in writing within 5 business days. If the grievance is against the Managing Member, an external mediator will be appointed. The final internal decision is binding pending any external legal process. You may approach the Office of the Labour Commissioner at any time regardless of internal process." },
        ],
      },
    ],
  },

  // ── Team: Accounting ────────────────────────────────────────────────────────
  {
    slug: "team-accounting",
    label: "Accounting Team",
    description: "Bookkeeping, VAT, payroll, financial close, and compliance procedures for the accounting team",
    icon: "DollarSign",
    color: "text-emerald-400",
    accentBg: "bg-emerald-400/10",
    roles: ["admin", "viewer"],
    items: [
      {
        id: "acct-bookkeeping",
        title: "SOP: Bookkeeping & Transaction Recording",
        description: "Daily and weekly procedures for recording all income and expenses accurately",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Daily Recording", body: "All income received must be recorded in the admin portal under Income Entries on the day it is received — not when it is invoiced. All expenses must be recorded in Expense Entries on the date of the transaction. Every entry requires: date, amount (in cents), category, supplier or client reference, and a description clear enough to explain the transaction to an auditor." },
          { heading: "Source Documents", body: "Never create an entry without a source document. Income: bank statement + invoice reference. Expenses: receipt, invoice, or bank statement. All source documents must be filed digitally in the correct folder within 24 hours of the transaction. PDF scans of paper receipts are acceptable. WhatsApp screenshots are not acceptable as sole supporting documents." },
          { heading: "Weekly Reconciliation", body: "Every Friday: reconcile all income entries against the bank statement for the week. Flag any discrepancy immediately to the Managing Member. Reconcile all expense entries against receipts. Mark each item as reconciled. Unreconciled items from the previous week must be resolved before closing the current week. A weekly reconciliation summary must be shared with the Managing Member by end of business Friday." },
          { heading: "Month-End Close", body: "By the 5th of each month: all transactions for the prior month must be finalised, reconciled, and locked. No backdated entries after lock date without Managing Member approval. Generate the P&L report from the admin portal. Export CSV backup. Submit the monthly management accounts summary to the Managing Member." },
        ],
      },
      {
        id: "acct-vat",
        title: "SOP: VAT & Tax Compliance (NamRA)",
        description: "VAT registration, filing periods, calculation, and NamRA submission procedures",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Registration & TIN", body: "NamRA TIN: 16271273 (Tax Type: ITX 16271273-011). VAT registration threshold in Namibia: N$500,000 annual turnover. Monitor revenue monthly — flag the Managing Member when projected annual revenue approaches N$400,000. All tax filings and correspondence use the registered physical address: Erf 55 Kenneth McArthur Street, Auas Blick, Windhoek." },
          { heading: "VAT Calculation", body: "Standard VAT rate: 15%. All client invoices must clearly state whether amounts are VAT-inclusive or VAT-exclusive. If registered: output VAT on all sales, input VAT credit on qualifying purchases. Do not claim input VAT on entertainment, personal expenses, or non-business items. Keep all VAT invoices from suppliers (must show supplier VAT number)." },
          { heading: "Filing & Payments", body: "VAT returns are filed bi-monthly (every 2 months). Filing is due by the last business day of the month following the end of the VAT period. Late submission penalties: 10% of tax outstanding. File via NamRA e-services portal or physically at NamRA offices. Payment must be made simultaneously with submission. Retain all filing confirmations for 5 years." },
          { heading: "Annual Income Tax", body: "Financial year end: last day of February. Annual income tax return (ITX) due 6 months after year end (31 August). Provisional tax payments due: 31 August (first) and 28 February (second). Prepare provisional tax estimates using current year income projections. All calculations must be reviewed by the Accounting Officer (Rachel N. Kashala, SAIBA 4132) before submission." },
        ],
      },
      {
        id: "acct-payroll",
        title: "SOP: Payroll Processing",
        description: "Monthly payroll calculation, deductions, and payment procedures",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Payroll Schedule", body: "Payroll is processed on the 25th of each month (or the last business day before if 25th falls on a weekend/public holiday). Payroll must be submitted to the Managing Member for approval by the 22nd. Payment is released only after written approval. Employees must be notified of any changes to their pay at least 2 weeks in advance." },
          { heading: "Calculations & Deductions", body: "Gross pay per employment contract. Deductions: PAYE (Pay As You Earn) — calculated per NamRA tax tables. Social Security contributions: employer 0.9% + employee 0.9% of gross (capped at N$108/month each). Employee contributions are deducted from gross pay. Employer contributions are an additional cost to the company. Net pay = gross pay minus PAYE minus employee Social Security." },
          { heading: "PAYE & Social Security Filing", body: "PAYE and Social Security must be paid to NamRA and Social Security Commission respectively by the 20th of the following month. PAYE is filed monthly via ITX return. Social Security is filed monthly via the SS Commission online portal. Late payment penalties: 10% plus interest. Keep all payment receipts and filing confirmations for 5 years." },
          { heading: "Payslips & Records", body: "Issue payslips to all employees on the date of payment. Payslip must show: gross pay, all deductions itemised, net pay, period, employee name and ID number. Retain all payroll records for a minimum of 5 years. Never process payroll for a person who has not signed an employment contract." },
        ],
      },
      {
        id: "acct-financial-statements",
        title: "SOP: Financial Statement Preparation",
        description: "Preparing monthly management accounts and annual financial statements",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Monthly Management Accounts", body: "By the 10th of each month, prepare: Income Statement (P&L) for the prior month. Balance sheet summary. Accounts receivable ageing report (outstanding invoices by age: 0–30, 31–60, 61–90, 90+ days). Accounts payable summary. Cash position. Export from the admin portal and review for anomalies before presenting to the Managing Member." },
          { heading: "Annual Financial Statements", body: "Annual statements cover 1 March to last day of February. Components: Income Statement, Balance Sheet, Statement of Cash Flows, Notes to the Financial Statements. Preparation begins no later than 1 March. Draft statements must be reviewed by Accounting Officer Rachel N. Kashala (SAIBA 4132) before submission to any external party. Final statements must be signed and dated." },
          { heading: "Audit Trail & Documentation", body: "Every line item in the financial statements must be traceable to a source document. Maintain a working paper file for each financial year containing: trial balance, bank reconciliations, fixed asset register, debtors/creditors listings, PAYE and VAT schedules, loan schedule if applicable. Working papers are confidential — do not share outside the company without written authorisation." },
        ],
      },
      {
        id: "acct-audit-prep",
        title: "SOP: Audit Preparation & Compliance",
        description: "Preparing for external reviews, compliance checks, and regulatory audits",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Pre-Audit Checklist", body: "Complete bank reconciliations for all periods under review. Ensure all source documents are filed and accessible. Reconcile debtors and creditors listings to the general ledger. Confirm all PAYE, VAT, and Social Security filings and payments are up to date. Prepare a fixed asset register with acquisition dates, costs, and depreciation calculations. Have all signed contracts, invoices, and receipts available for inspection." },
          { heading: "During the Audit", body: "Designate one point of contact (Accounting Officer or Managing Member) for all auditor queries. Respond to information requests within 24 hours. Do not alter documents or delete records. If you discover an error, disclose it proactively — concealment during an audit is a criminal offence. All audit correspondence must be copied to the Managing Member." },
          { heading: "Post-Audit Actions", body: "Review the auditor's management letter (if issued) within 5 business days. Implement all recommended corrective actions within the agreed timeframe. Update internal procedures if deficiencies were found. File the audit report with the company records. If a qualified or adverse opinion is issued, escalate to the Managing Member immediately — this requires a response plan." },
        ],
      },
    ],
  },

  // ── Team: Development ────────────────────────────────────────────────────────
  {
    slug: "team-development",
    label: "Development Team",
    description: "Code review, security, database, API standards, and incident response for developers",
    icon: "Code2",
    color: "text-blue-400",
    accentBg: "bg-blue-400/10",
    roles: ["admin", "viewer"],
    items: [
      {
        id: "dev-code-review",
        title: "SOP: Code Review Process",
        description: "Standards for submitting, reviewing, and merging pull requests",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Submitting a PR", body: "Every change to main must go through a pull request (PR). PR title must follow conventional commit format: feat:, fix:, chore:, refactor:, docs:, test:. Description must include: what changed, why it changed, how to test it, any migrations or env var changes required. Self-review your diff before requesting a review — catch your own obvious errors first. PRs that touch the database schema must include a migration file." },
          { heading: "Review Standards", body: "Reviewer checks: correctness (does it do what it says?), security (no injection, no secrets, no XSS), performance (no N+1 queries, no unnecessary re-renders), TypeScript correctness (strict mode, no any), test coverage (does it need a test?), consistency with existing patterns. Approve means you are comfortable with it going to production. Request changes means it must be addressed before merge. Comment means non-blocking feedback." },
          { heading: "Merging & Deployment", body: "PRs require at least 1 approval before merge. Squash-merge to keep main history clean. Delete the feature branch after merge. After merging to dev, test the integration. After merging to main (production), perform a smoke test on the live URL within 10 minutes. If a bug is introduced to production, open a hotfix/xxx branch immediately — do not merge further changes to main until the hotfix is deployed." },
        ],
      },
      {
        id: "dev-security",
        title: "SOP: Security Checklist",
        description: "Security requirements every developer must verify before shipping",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Authentication & Authorisation", body: "All routes that return user data must verify the authenticated user server-side (never trust client-provided user IDs). Use Supabase RLS policies as the last line of defence — but verify at the API/server action layer first. Never expose the service role key client-side. Check that middleware redirects unauthenticated users on every new route. Verify role-based access: admin, viewer, investor, employee must only access what their role permits." },
          { heading: "Input Validation & Injection", body: "Validate all user input at the server boundary — never trust client data. Use parameterised queries (Supabase client handles this) — never string-concatenate SQL. Sanitise any HTML rendered from user input using escapeHtml() from src/lib/utils.ts. Validate file uploads: check MIME type server-side, not just extension. Set maximum file sizes. Env vars: never log them, never include them in error responses." },
          { heading: "Secrets & Credentials", body: "Never commit .env files to git. Never hardcode API keys, passwords, or tokens in source code. Use NEXT_PUBLIC_ prefix only for values that are safe to expose to the browser. Rotate any secret that is accidentally committed immediately — treat it as compromised. All secrets must be in Netlify environment variables for production. Review .gitignore before every commit that touches configuration files." },
          { heading: "Dependencies & Infrastructure", body: "Run npm audit before every release. Address all high and critical vulnerabilities before shipping. Pin dependencies in package.json to exact versions for production builds. Do not install packages you have not reviewed — check npm download count, maintenance status, and license. Infrastructure: Supabase RLS must be enabled on all tables. Netlify: ensure production environment variables are set and not the same as local dev where applicable." },
        ],
      },
      {
        id: "dev-database",
        title: "SOP: Database Management & Migrations",
        description: "Schema changes, migrations, and data integrity standards",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Schema Changes", body: "All schema changes must be written as SQL migration files in supabase/. Name format: descriptive_purpose.sql (e.g. retainer_payments.sql). Never alter the production schema directly in the Supabase dashboard without a corresponding migration file in the repo. Migration files are append-only — never edit a migration that has already been applied to production. Changes that drop columns or tables must be approved by the Managing Member." },
          { heading: "Data Integrity Rules", body: "All monetary values are stored as integer cents (e.g. N$2,500 = 250000). Never store floats for money. All foreign keys must have ON DELETE behaviour explicitly set. Use NOT NULL constraints wherever the application logic requires it. Enums: add new values with ALTER TYPE ... ADD VALUE — never remove values from a live enum (can break existing rows). RLS must be enabled on every table — no exceptions." },
          { heading: "Migrations in Production", body: "Before running a migration on production: test it on a local/staging Supabase project first. Check that the migration is backwards-compatible — the deployed code must work before and after the migration runs (zero-downtime deploys). Migrations that add NOT NULL columns must supply a DEFAULT value or backfill existing rows in the same script. After running a production migration, verify affected queries still return expected results." },
        ],
      },
      {
        id: "dev-api-standards",
        title: "SOP: API Design Standards",
        description: "Conventions for Next.js route handlers and server actions",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Route Handlers", body: "Public endpoints (no auth required): /api/leads, /api/accept/[token], /api/docs/quotations/[token]. All other routes must verify auth server-side. Return standard shapes: { data, error } for all responses. HTTP status codes: 200 success, 400 bad input, 401 unauthenticated, 403 forbidden, 404 not found, 500 internal error. Never return raw Supabase errors to the client — log internally, return a generic message externally." },
          { heading: "Server Actions", body: "Server actions are the preferred pattern over route handlers for form submissions and mutations. Always validate input at the top of the action. Use requireAuth() or requireAdmin() from src/lib/auth.ts as the first call. Return { success: boolean, error?: string } as the action result. Never throw from a server action — catch and return the error. Log unexpected errors with console.error before returning." },
          { heading: "Performance", body: "Avoid N+1 queries: if you need data from two tables for N rows, use a join or batch the secondary query. Use Promise.all() for independent parallel fetches. Do not fetch all columns with select('*') in production code — select only what you need. Add pagination to all list endpoints that could return more than 50 rows. Cache expensive reads where appropriate using Next.js fetch cache or React cache()." },
        ],
      },
      {
        id: "dev-incident-response",
        title: "SOP: Incident Response",
        description: "How to handle production outages, data issues, and security incidents",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Severity Classification", body: "P1 Critical: site down, payments not processing, data loss, active security breach. P2 Major: key feature broken for all users, incorrect billing data, email delivery failed for a client. P3 Minor: cosmetic bug, one-user issue, non-critical feature degraded. P1 and P2 require immediate action regardless of time. P3 is scheduled in the next sprint." },
          { heading: "Response Process", body: "1. Detect: monitor Netlify deploy logs, Supabase logs, and client-reported issues. 2. Triage: classify severity. 3. Communicate: for P1/P2, notify Managing Member immediately with: what is broken, impact, and your initial diagnosis. 4. Contain: if a bad deploy caused the issue, roll back to the previous Netlify deployment immediately — fix forward later. 5. Fix: open a hotfix branch, fix, test, deploy. 6. Verify: confirm the issue is resolved on production. 7. Post-mortem: document what happened and how to prevent recurrence." },
          { heading: "Security Incidents", body: "If you suspect a security breach (unauthorised access, leaked credentials, data exfiltration): 1. Immediately rotate all potentially compromised secrets (API keys, service role key). 2. Disable the compromised account or access path. 3. Notify the Managing Member within 30 minutes. 4. Document the timeline and scope. 5. If client data may have been accessed, the Managing Member will determine whether clients need to be notified. Do not communicate about a security incident to any external party without the Managing Member's authorisation." },
        ],
      },
      {
        id: "dev-performance",
        title: "SOP: Performance & Optimisation",
        description: "Core Web Vitals targets, image handling, and build performance standards",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Core Web Vitals Targets", body: "LCP (Largest Contentful Paint): under 2.5 seconds. INP (Interaction to Next Paint): under 200ms. CLS (Cumulative Layout Shift): under 0.1. Measure using Netlify's built-in analytics, Chrome DevTools Lighthouse, or WebPageTest. These are not aspirational — they are shipping criteria. A page that fails Core Web Vitals is not ready for production." },
          { heading: "Images & Assets", body: "Use Next.js <Image> component for all images — it handles lazy loading, sizing, and WebP conversion automatically. Export images as WebP or AVIF. Maximum image size before optimisation: 500KB. Hero images: compress to under 200KB. Use the sizes prop on <Image> to match the actual rendered size. Never link to images on external domains without approval — always host on the same domain or CDN." },
          { heading: "Bundle & Build", body: "Run npm run build before every production deploy to catch errors. Check the build output for unusually large page bundles (>200KB first load JS is a warning sign). Use dynamic imports (next/dynamic) for heavy components not needed on initial render (PDF renderers, large charts). Avoid importing entire libraries when only a subset is used — use tree-shakeable imports." },
        ],
      },
    ],
  },

  // ── Team: Admin ──────────────────────────────────────────────────────────────
  {
    slug: "team-admin",
    label: "Admin Team",
    description: "Office procedures, communication management, filing, and supplier management for admin staff",
    icon: "Briefcase",
    color: "text-amber-400",
    accentBg: "bg-amber-400/10",
    roles: ["admin", "viewer"],
    items: [
      {
        id: "admin-email-mgmt",
        title: "SOP: Email & Communication Management",
        description: "Inbox management, response standards, and routing procedures",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Inbox Management", body: "The primary business inbox is info@swiftdesignz.co.za. Check it at 08:00 and 13:00 every business day. All emails must be read and actioned (replied, forwarded, or filed) within 1 business day. Use labels/folders: New Enquiry, Client, Invoice, Supplier, Admin, Spam. Archive after actioning — an empty inbox at end of day is the target. Do not delete emails — archive everything for audit trail." },
          { heading: "Response Standards", body: "Client enquiries: respond within 4 business hours. Invoice or payment queries: respond within 1 business day. Supplier communications: respond within 2 business days. All client-facing emails must be proofread before sending. Use the business email signature on all outbound emails. Do not use personal email accounts for business communications. If unsure how to respond, draft and ask the Managing Member to review before sending." },
          { heading: "Routing & Escalation", body: "Leads from the website arrive in the admin portal (Leads module) automatically. Forward any lead that arrives by email to the portal manually. Complaints or negative client feedback: forward to the Managing Member immediately — do not respond without guidance. Legal correspondence: do not respond — forward to Managing Member within 1 hour of receipt. Payment queries: check the admin portal and respond with the correct status — never guess." },
        ],
      },
      {
        id: "admin-document-filing",
        title: "SOP: Document Management & Filing",
        description: "How to organise, name, store, and retrieve company documents",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Naming Convention", body: "All files follow this format: YYYY-MM-DD_ClientOrContext_DocumentType_Version. Examples: 2026-06-01_NamraBank_ProofOfPayment_v1.pdf · 2026-05-15_SD26-INV-042_Invoice.pdf · 2026-06-01_CompanyDocs_CCRegistration.pdf. Never use spaces in file names — use underscores. Never save as 'scan' or 'document1'. Descriptive names save everyone time." },
          { heading: "Folder Structure", body: "Clients/ → [ClientName]/ → Contracts, Invoices, Correspondence. Finance/ → [YYYY-MM]/ → Receipts, Bank Statements, Payroll. Legal/ → CC Registration, NamRA, Contracts, NDAs. HR/ → [EmployeeName]/ → Contract, Payslips, Leave Records. Admin/ → Supplier Invoices, Insurance, Licences. All source documents for accounting must be in Finance/ with the correct month folder." },
          { heading: "Retention & Access", body: "Financial records: 7 years minimum (Namibian Income Tax Act requirement). HR records: 5 years after termination. Client contracts: 7 years from project completion. Do not delete documents without written authorisation from the Managing Member. Physical documents: scan and file digitally within 24 hours, then store the physical in a labelled folder. Confidential documents (contracts, financial records) must not be stored on personal devices." },
        ],
      },
      {
        id: "admin-calendar-meetings",
        title: "SOP: Calendar & Meeting Management",
        description: "Scheduling, preparing, and following up on meetings",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Scheduling", body: "All meetings must have a calendar invite with: date, time, duration, location or video link, agenda. Send invites at least 24 hours in advance (48 hours for external meetings). Confirm client meetings 1 business day before. Internal team meetings: standing weekly check-in on Monday morning. Never double-book the Managing Member's calendar — check availability before confirming any external meeting." },
          { heading: "Meeting Preparation", body: "For external meetings: prepare an agenda and share it with attendees at least 24 hours before. For client meetings: pull up the client's record in the admin portal before the meeting — have the current project status, outstanding invoices, and recent communications on hand. For financial meetings: prepare the latest P&L and AR ageing report. Have action items from the previous meeting ready for review." },
          { heading: "Minutes & Follow-up", body: "Record minutes for all meetings with clients or external parties. Minutes must include: date, attendees, decisions made, action items (owner + deadline). Distribute minutes within 24 hours of the meeting. Log action items in the appropriate system (admin portal, or shared task list). Follow up on open action items weekly until closed." },
        ],
      },
      {
        id: "admin-suppliers",
        title: "SOP: Supplier & Vendor Management",
        description: "Onboarding, evaluating, and managing relationships with suppliers",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Onboarding a New Supplier", body: "Before engaging a new supplier: get at least 2 quotes for any purchase over N$1,000. Verify the supplier's business registration and tax compliance (request their NamRA TIN). Collect a signed agreement or quotation before any work begins. Record the supplier in the company's approved supplier list with: name, contact, TIN, payment terms, and what they supply." },
          { heading: "Payments & Records", body: "Pay suppliers only against a valid invoice (showing supplier name, TIN, date, itemised services, and amount). Process payment via company bank account — no cash payments above N$500. Record every payment in the admin portal under Expense Entries on the date paid. File the supplier invoice in Finance/[YYYY-MM]/Receipts. Reconcile supplier accounts monthly — ensure no duplicate or outstanding invoices." },
          { heading: "Performance Review", body: "Review key suppliers annually: quality of service, pricing competitiveness, responsiveness, compliance with agreements. Replace underperforming suppliers after one documented warning. Never become dependent on a single supplier for a critical service — have at least one alternative identified for every critical vendor. Software subscriptions: review annually for cost-effectiveness and cancel unused tools." },
        ],
      },
      {
        id: "admin-client-records",
        title: "SOP: Client Record Maintenance",
        description: "Keeping client data current, accurate, and accessible in the admin portal",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "New Client Setup", body: "Create the client record in the admin portal immediately when a deal is won. Required fields: full legal name, trading name (if different), physical address, billing email, phone number, VAT number (if applicable), industry. Do not create an invoice for a client without a complete record. Verify the billing email directly with the client before sending the first invoice — bounced invoices delay payment." },
          { heading: "Keeping Records Current", body: "Update the client record whenever contact details change. After every project: update the client's outstanding balance and project history. When a client's status changes (active, inactive, suspended): update in the portal and note the reason. For clients on retainer: ensure the retainer subscription record reflects the current monthly amount and billing day." },
          { heading: "Data Quality Checks", body: "Monthly: run a review of all active clients with outstanding invoices over 60 days — flag to the Managing Member. Quarterly: review all client records for completeness — fill in any missing fields. Annually: reach out to dormant clients (no activity in 12+ months) to confirm whether they wish to remain on record. Archive clients who confirm they are no longer active." },
        ],
      },
    ],
  },

  // ── Team: Project Management ─────────────────────────────────────────────────
  {
    slug: "team-project-management",
    label: "Project Management",
    description: "Project lifecycle, reporting, risk management, and client governance for PMs",
    icon: "TrendingUp",
    color: "text-purple-400",
    accentBg: "bg-purple-400/10",
    roles: ["admin", "viewer"],
    items: [
      {
        id: "pm-kickoff",
        title: "SOP: Project Kickoff",
        description: "Everything that must happen before a project officially starts",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Pre-Kickoff Requirements", body: "Before any work begins: deposit invoice issued and paid (confirmed in portal). Signed quotation or acceptance token confirmed. Project record created in admin portal with: client, project name, start date, estimated end date, assigned team members. Scope of work document shared with the team. Client onboarding document sent and acknowledged." },
          { heading: "Kickoff Meeting", body: "Schedule a kickoff meeting within 3 business days of deposit receipt. Agenda: introductions (for new clients), scope walkthrough, milestone review, communication expectations, client deliverable requirements (logo, content, access), timeline confirmation. Minutes documented and distributed within 24 hours. Any scope misalignments discovered in the kickoff must be resolved before development begins — not after." },
          { heading: "Project Setup", body: "Create the project in the admin portal with all milestones. Assign the project lead and team members in writing. Set up the project's communication channel. If the project requires specific access (hosting, CMS, domain), collect all credentials before work starts — access delays are a project risk. Confirm the definition of done for each milestone with the client in writing." },
        ],
      },
      {
        id: "pm-status-reporting",
        title: "SOP: Status Reporting",
        description: "Weekly internal reporting and client update cadence",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Internal Weekly Report", body: "Every Monday: update all active project statuses in the admin portal. For each project: current status (on track / at risk / blocked), milestones completed in the prior week, milestones planned for the current week, blockers or risks, outstanding client actions. Share the project summary with the Managing Member by 10:00 every Monday. Flag any project that is behind schedule immediately — not at the next check-in." },
          { heading: "Client Updates", body: "Minimum cadence: one written update to the client every 2 weeks. Trigger-based updates (send immediately): milestone completed, blocker requiring client action, timeline change, scope question. Format: concise email with current status, what was done, what is next, any client action required. Do not send a client update that says 'no updates' — if there are genuinely no updates, address why and when the next milestone will be reached." },
          { heading: "Milestone Sign-Off", body: "When a milestone is complete: demonstrate it to the client (screen share, staging link, or document). Obtain written sign-off via email before moving to the next milestone. Milestone sign-off is confirmation that the deliverable meets the agreed scope — it closes the change request window for that milestone. Log sign-off in the admin portal. No milestone is 'done' until the client has confirmed it in writing." },
        ],
      },
      {
        id: "pm-risk-management",
        title: "SOP: Risk & Issue Management",
        description: "Identifying, logging, and mitigating project risks before they become problems",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Risk Identification", body: "At project kickoff, identify and document the top 3–5 risks for each project. Common risks: client content/asset delays, unclear or changing requirements, technical unknowns, team capacity, third-party dependencies (APIs, platforms). Assign each risk a likelihood (low/medium/high) and impact (low/medium/high). High likelihood + high impact risks require a mitigation plan before the project starts." },
          { heading: "Risk Mitigation", body: "Client content delays: set a hard deadline for content delivery in the contract. If missed, the project timeline adjusts proportionally. Technical unknowns: spike the risky component in week 1 — do not design around an assumption. Third-party dependencies: identify the fallback or alternative before committing to a delivery date. Capacity risk: never assign one person as the single point of knowledge on a project. If a risk materialises and threatens the timeline, notify the Managing Member and the client immediately." },
          { heading: "Issue Log", body: "When an issue arises mid-project, log it with: description, date discovered, impact on scope/timeline/budget, owner, resolution plan, target resolution date. Review the issue log at every status check-in. Do not close an issue without confirming the resolution has been implemented and tested. Unresolved issues older than 7 days must be escalated to the Managing Member with a recommended action." },
        ],
      },
      {
        id: "pm-change-management",
        title: "SOP: Budget & Change Management",
        description: "Tracking project costs, handling scope changes, and protecting profitability",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Budget Tracking", body: "For each project, track: quoted amount, invoiced amount, additional charges (change requests), total collected. Alert the Managing Member when a project's time investment is on track to exceed the quoted value by more than 15%. Track unbilled extras — anything done beyond scope that has not yet been quoted in a Change Request. Review budget against actuals at each milestone." },
          { heading: "Scope Creep Prevention", body: "At every client interaction, actively listen for requests that are outside the agreed scope. When you hear a new request, do not say yes or no immediately — say: 'Let me check if that is within the current scope and come back to you.' Log it, check against the quotation, and respond in writing within 1 business day. The golden rule: no new work without a signed Change Request and a supplementary invoice." },
          { heading: "Change Request Financials", body: "Change Requests must include a time estimate and cost breakdown. Price change requests at the same rate as the original project unless the Managing Member approves a different rate. Issue the supplementary invoice before the additional work begins. Track all Change Requests in the project record. At project close, prepare a final cost summary showing original quote, CRs, and total billed." },
        ],
      },
      {
        id: "pm-closure",
        title: "SOP: Project Closure",
        description: "The formal steps to close a project correctly and protect the company",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Final Delivery Checklist", body: "QA sign-off completed (SOP-QA). All milestones signed off in writing by client. All change requests delivered and billed. Final invoice issued. Deployment completed and smoke test passed. All client-facing documentation (Project Handover, user guides) generated via Documents module. Client access credentials delivered securely." },
          { heading: "Financial Close", body: "Confirm all invoices for the project are marked as paid in the admin portal. If any amount is outstanding, escalate to the AR process (reminder → statement) before closing the project. Issue the payment plan final receipt if applicable. Update the project status to 'completed' in the admin portal. Generate the final account statement for the client." },
          { heading: "Retrospective & Archive", body: "Within 5 business days of project close: document lessons learned — what went well, what to improve, what risks materialised. Update the client record with project outcomes. Archive all project files in the correct folder structure. Submit a brief project summary to the Managing Member: scope, timeline, profitability, client satisfaction, and any outstanding risks (e.g. warranty issues). Good retrospectives make the next project better." },
        ],
      },
      {
        id: "pm-stakeholder",
        title: "SOP: Stakeholder & Client Governance",
        description: "Managing expectations, escalations, and difficult conversations professionally",
        type: "sop",
        roles: ["admin", "viewer"],
        sections: [
          { heading: "Expectation Management", body: "Set expectations before issues arise, not after. At kickoff: agree on communication channels, response times, and decision timelines. Document every agreed expectation in writing. When a commitment cannot be met: communicate proactively before the deadline — never let a deadline pass silently. Offer a realistic revised timeline with a reason. Clients can handle bad news; they cannot handle surprises." },
          { heading: "Escalation Triggers", body: "Escalate to the Managing Member immediately when: client threatens to cancel or demand a refund, scope dispute cannot be resolved at PM level, client has not paid for more than 30 days past due, the client has been unresponsive for more than 2 weeks and a milestone is blocked, a legal claim or complaint is received, or you are unsure how to proceed on a sensitive matter. Do not attempt to resolve financial or legal disputes without the Managing Member." },
          { heading: "Difficult Conversations", body: "When a client is unhappy: listen fully before responding. Acknowledge their concern without conceding liability. State what you will investigate and by when. Come back with a factual response and a solution. Never argue over email — offer a call for complex disputes. Document everything. The goal of every difficult conversation is a mutually acceptable resolution, not winning an argument. If in doubt about tone or content, have the Managing Member review your draft before sending." },
        ],
      },
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
  if (role === "employee") {
    return DOC_CATEGORIES.filter((c) => c.roles.includes("employee")).map((c) => ({
      ...c,
      items: c.items.filter((i) => i.roles.includes("employee")),
    }));
  }
  const aud: UserRole = role === "investor" ? "investor" : role === "viewer" ? "viewer" : "admin";
  return DOC_CATEGORIES.filter((c) => c.roles.includes(aud)).map((c) => ({
    ...c,
    items: c.items.filter((i) => i.roles.includes(aud)),
  }));
}

export function getCategoryBySlug(slug: string): DocCategory | undefined {
  return DOC_CATEGORIES.find((c) => c.slug === slug);
}
