# Swift Designz Admin Portal

## Tech Stack
- Next.js 16.2.3 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- Supabase (PostgreSQL + Auth + RLS + Storage)
- Lucide React for icons
- Framer Motion (light use)
- Recharts for dashboard charts
- @react-pdf/renderer for document PDFs
- Resend for transactional emails
- Vitest (unit) + Playwright (E2E) for testing

## ALWAYS DO THIS FIRST
Before asking the user for any financial figures, project rates, client counts, revenue data, or business metrics — **query the Supabase database directly**. The admin portal is the source of truth. Use the service role key from `.env.local` and query via the Supabase REST API or `npx supabase` CLI. Never estimate, never ask the user to look it up — look it up yourself.

Key tables for business data:
- `invoices` — project billing, amounts, clients
- `quotations` — project rates and line items
- `retainer_subscriptions` — active retainers, monthly amounts, types
- `clients` — client list
- `income_entries`, `expense_entries` — accounting data
- `projects` — project list and status

## Build
- `npm run dev` — runs on localhost:3000
- `npm run build` — production build
- `npm run test` — Vitest unit tests
- `npm run e2e` — Playwright E2E tests

## Environment Variables
- `NEXT_PUBLIC_APP_URL` — UI base URL (set to http://localhost:3000 in .env.local)
- `EMAIL_BASE_URL` — base URL used in all outgoing email links; defaults to https://admin.swiftdesignz.co.za (never set this to localhost)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

## Database
- Supabase project ID: nxuvzdrqgrmureejigpf
- Schema SQL: supabase/schema.sql
- Accounts Receivable schema: supabase/accounts_receivable.sql (run after schema.sql)
- Employment contracts schema: supabase/employee_contracts.sql
- Notifications scheduled column: supabase/notifications_scheduled.sql (adds `scheduled_for TIMESTAMPTZ` to notifications)
- Retainer payments: supabase/retainer_payments.sql (adds `retainer_payments` table)
- Money values stored as integer cents (R2,500 = 250000)
- All enums and interfaces: src/types/database.ts

## Auth
- Supabase Auth (email/password)
- Middleware redirects unauthenticated users to /login
- Three roles: `admin` (full CRUD), `viewer` (create/edit invoices, quotations, leads), `investor` (restricted portal)
- Profile auto-created on signup via database trigger

## Roles & Access
- **admin/viewer**: Full nav — Dashboard, Pipeline (Leads/Clients/Projects), Accounts Receivable (Quotations/Billing/Payments/Reminders/Statements/Retainers), Accounting, Documents, Investors, Team, Equipment, Settings
- **investor**: Restricted nav — Dashboard, Projects, Documents, Investors, Equipment, Reports only
- Document templates filtered by role via `getDocumentTemplatesForRole(role)` in src/lib/document-templates.ts

## Sidebar Structure (admin/viewer)
The sidebar uses labeled sections rendered via `NAV_SECTIONS` + a hardcoded AR group injected after section 0:
- **PIPELINE**: Dashboard, Leads, Clients, Projects
- **ACCOUNTS RECEIVABLE**: Estimates & Quotations, Billing (→ /invoices), Payments, Reminders, Statements, Retainers
- **FINANCE**: Accounting
- **WORKSPACE**: Documents, Team, Equipment
- **INVESTORS**: Investors
- **SYSTEM**: Settings

## Modules (App Router routes)
| Route | Description |
|---|---|
| `/` | Dashboard with KPIs, charts |
| `/leads` | Lead pipeline (new/contacted/quoted/won/lost) |
| `/clients` | Client management |
| `/projects` | Projects with milestones |
| `/accounts-receivable/quotations` | Quotation builder + list (SD26-Q-001 numbering) |
| `/accounts-receivable/billing` | Redirects → /invoices |
| `/accounts-receivable/payments` | Payments list with receipt preview + send |
| `/accounts-receivable/reminders` | Payment reminder approval queue (4-stage) |
| `/accounts-receivable/statements` | Account statements list + generate |
| `/accounts-receivable/statements/[id]` | Statement detail with brought-forward + in-period invoices |
| `/accounts-receivable/retainers` | Retainer subscriptions (active/paused/cancelled) |
| `/invoices` | Billing hub — invoices with payment tracking |
| `/accounting` | Income, expenses, reports |
| `/documents` | Document library + PDF generation & email |
| `/documents/retainers` | Retainer contract builder |
| `/documents/employee-contracts` | Employment contract builder |
| `/investors` | Investor management |
| `/team` | Employees + AI agents |
| `/equipment` | Equipment asset tracking |
| `/settings` | Business settings |
| `/accept/[token]` | Public quotation acceptance page (client-facing, no auth) |

## Accounts Receivable System
Full AR flow: Quotation → Invoice → Payment Confirmation → Payment Reminder → Account Statement

### Phase 1 — Quotations ✓
- DB table: `quotations` (id, quote_number, client_id, project_id, status, total, payment_plan_*, acceptance_token, ...)
- DB table: `quotation_line_items`, `quotation_versions`
- DB function: `generate_ar_number(p_type)` → SD26-Q-001 format, resets yearly
- DB function: `accept_quotation(token, name, ip)` — public token-based acceptance
- Types: src/types/accounts-receivable.ts
- Editor component: src/components/ar/QuotationEditor.tsx
- Actions component: src/components/ar/QuotationActions.tsx
- Server actions: src/app/(dashboard)/accounts-receivable/quotations/actions.ts
- Status flow: draft → sent (locked) → accepted | expired | cancelled → converted
- Payment plan presets: full_pay, standard (50/50), 2_month_flex, 3_month_ease — auto-compute installment schedules
- Convert-to-invoice: creates first installment invoice only; remaining installments schedule portal notifications with `scheduled_for` dates
- Public acceptance page (`/accept/[token]`): shows line items, payment plan schedule, notes/terms, accept form

### Phase 2 — Billing ✓
- `invoices` table extended with `ar_number`, `quotation_id`, `installment_number`, `created_by`
- DB table: `credit_notes`, `payment_reminders` (4-stage approval queue)
- DB function: `schedule_invoice_reminders(invoice_id)`
- `/invoices` page = billing hub (direct invoice creation still available)
- Invoice email: logo + payment plan schedule table with current instalment highlighted
- Send invoice flow: styled confirm modal → PDF attachment → Resend email
- Credit notes: add/void on invoice detail page

### Phase 2 — Reminders ✓
- DB table: `payment_reminders` — 4 stages (3-days-before, due-day, 3-days-overdue, 7-days-overdue)
- Reminders auto-scheduled when invoice is sent via `schedule_invoice_reminders` RPC
- `/accounts-receivable/reminders` page: overdue/approved/upcoming/history queues
- Actions: approve, send (fires Resend email), dismiss
- Server actions: src/app/(dashboard)/accounts-receivable/reminders/actions.ts
- Component: src/components/ar/ReminderActions.tsx

### Phase 3 — Payments ✓
- DB table: `payment_confirmations` (receipt_number SD26-REC-001)
- `invoice_id NOT NULL` — payment confirmations are always linked to an invoice
- Receipt preview modal before sending (shows amount, client, method, balance)
- Receipt email: logo + payment details + PDF attachment
- Component: src/components/invoices/SendReceiptButton.tsx (previewData prop triggers modal)
- **Resend support**: `sendReceiptAction` checks for existing confirmation and updates `sent_at` instead of inserting; payments page shows Send Receipt button when `sent_at` is null (even if record exists)
- To reset a receipt for resend: set `sent_at = null, sent_to = null` on the `payment_confirmations` row directly in DB

### Phase 3 — Account Statements ✓
- DB table: `account_statements` (statement_number SD26-STMT-001)
- `/accounts-receivable/statements` — list with KPIs, generate form, delete
- `/accounts-receivable/statements/[id]` — detail with brought-forward, in-period invoices, scheduled installments
- Invoice queries always filter `.neq("doc_type", "quotation")` to exclude draft quotations from balances
- Balances recalculated live from invoice data (stored values may be stale — do not trust `stmt.opening_balance` etc.)
- Scheduled installments: detected by querying `retainer_payments` invoices with `quotation_id` → fetching `quotations.payment_plan_schedule` → filtering entries where `installment_number > max_already_invoiced`
- Summary adapts: "Total Contracted" / "Total Outstanding" when active payment plans present
- Send Statement: generates PDF + emails via Resend, marks `sent_at`/`sent_to`; component: src/components/ar/SendStatementButton.tsx
- PDF (src/components/ar/AccountStatementPDF.tsx): due dates, outstanding per invoice, scheduled installments section, payment terms footer
- Server actions: src/app/(dashboard)/accounts-receivable/statements/actions.ts

### Phase 4 — Retainer Subscriptions ✓
- DB table: `retainer_subscriptions` (links clients, monthly_amount cents, billing_day, status)
- DB table: `retainer_payments` (receipt_number SD26-REC-XXX, retainer_subscription_id, amount, payment_method, payment_date, reference, sent_at, sent_to) — migration: supabase/retainer_payments.sql
- `/accounts-receivable/retainers` — list with KPIs, last payment per retainer, Record Payment button
- Record Payment modal: portaled to `document.body` (avoids table overflow clipping), amount pre-filled, cycles payment number 1–12 then restarts
- Button label: "Record Payment" → "Record Payment 2" → ... → "Record Payment 12" → resets (based on `paymentCount % 12`)
- After recording: success state shows receipt number + "Send Receipt" button that emails via existing `sendReceiptEmail`
- Status controls: pause, resume, cancel, delete
- Server actions: src/app/(dashboard)/accounts-receivable/retainers/actions.ts
- Components: src/components/ar/NewRetainerForm.tsx, src/components/ar/RetainerStatusButton.tsx, src/components/ar/RecordRetainerPaymentButton.tsx

## Notifications
- DB table: `notifications` with `scheduled_for TIMESTAMPTZ` column (migration: supabase/notifications_scheduled.sql)
- `scheduled_for` controls when notifications surface in portal (null = immediate)
- Installment-due notifications: type `installment_due`, scheduled for 08:00 on the installment due date
- AppShell filters: `.or('scheduled_for.is.null,scheduled_for.lte.${now}')` for unread count

## Email System (src/lib/email.ts)
- All email links use `EMAIL_BASE_URL` env var (defaults to production URL — never localhost)
- Logo: `${EMAIL_BASE_URL}/logo.png` with `height:auto` (no fixed height to avoid squishing)
- `sendQuotationEmail` — quotation with PDF attachment + acceptance link
- `sendInvoiceEmail` — invoice with logo, payment plan schedule section, PDF attachment
- `sendReceiptEmail` — receipt with logo, payment details, PDF attachment (used for both invoice and retainer receipts)
- `sendStatementEmail` — account statement with financial summary + PDF attachment
- `sendReminderEmail` — 4-stage payment reminder (teal/amber color per urgency)
- `sendQuotationAcceptedNotification` — admin notification on client acceptance
- `sendInviteEmail` — OTP invite for new team members
- `PaymentPlanInstallmentEmail` interface: `{ label, amount_cents, due_date, installment_number }`

## Payment Plan Amounts
- Always stored as `amount_cents` (integer cents) — NOT `amount`
- Field name: `payment_plan_schedule[].amount_cents`
- Read with: `row.amount_cents ?? row.amount ?? 0` for backwards compatibility

## Confirm Dialogs
- Never use `confirm()` — use `useConfirm` hook from `src/hooks/useConfirm.tsx`
- Returns `{ confirm, ConfirmDialog }` — render `{ConfirmDialog}` in JSX, `await confirm(message, options)` returns `Promise<boolean>`
- Variants: `danger` (red), `warning` (amber), `send` (teal + Send icon), `convert` (teal + FileText icon), `default` (teal + Info icon)

## Document Templates (15 total)
**Client-facing (10):** Quotation, Invoice, Client NDA, Terms & Conditions, Client Onboarding, Change Request Form, Proceed to Build, Maintenance Retainer, Payment Plan Agreement, Project Handover

**Investor-facing (5):** Investor NDA, Investor Terms & Conditions, Investor Reporting Policy, Investor Governance Charter, Family Investment Overview

Template logic lives in src/lib/document-templates.ts; content in src/lib/document-content-client.ts and src/lib/document-content-investor.ts.

## Dynamic Contract Builders

### Retainer Contracts (`/documents/retainers`)
- DB table: `retainers` (id, name, content JSONB, contract_type, created_by, updated_by)
- Types: src/types/estore-retainer.ts (`RetainerContent`, `RetainerRecord`)
- PDF: src/components/documents/EstoreRetainerPDF.tsx
- Editor: src/components/documents/RetainerEditor.tsx
- API: `/api/docs/retainers/[id]` — supports `?embed=true`, `?preview=true`, default download
- Templates: `BLANK_RETAINER`, `ESTORE_RETAINER_TEMPLATE`

### Employment Contracts (`/documents/employee-contracts`)
- DB table: `employee_contracts` (id, name, contract_type, content JSONB, created_by, updated_by)
- Types: src/types/employee-contract.ts (`TempContractContent`, `EmployeeContractRecord`, `ContractType`)
- PDF: src/components/documents/TempContractPDF.tsx (temp contract — others to be added)
- Editor: src/components/documents/EmployeeContractEditor.tsx
- API: `/api/docs/employee-contracts/[id]` — supports `?embed=true`, `?preview=true`, default download
- Contract types planned: `temp` ✓, `fixed`, `intern`, `probono`, `outsourcing`, `subcontractor`
- Default content: `DEFAULT_TEMP_CONTRACT` in src/types/employee-contract.ts
- SQL migration: supabase/employee_contracts.sql

## Key Library Files
- src/lib/auth.ts — server-side auth helpers (`requireAuth`, `requireAdmin`, `requireAdminOrInvestor`)
- src/lib/email.ts — Resend email (all transactional emails)
- src/lib/document-templates.ts — template registry & role filtering
- src/lib/document-content-client.ts — client PDF content
- src/lib/document-content-investor.ts — investor PDF content
- src/lib/document-content-registry.ts — unified content lookup
- src/lib/supabase/ — client & server Supabase instances
- src/lib/utils.ts — cn(), escapeHtml(), formatCurrency(), formatDate()
- src/hooks/useConfirm.tsx — styled confirm dialog hook (replaces browser confirm())

## Shared Components
- src/components/layout/AppShell.tsx — root layout wrapper, nav counts for all AR tables
- src/components/layout/Sidebar.tsx — nav with labeled sections, role-aware, live counts
- src/components/layout/Topbar.tsx — top bar with notification bell
- src/components/layout/NotificationBell.tsx — unread notification count (scheduled_for aware)
- src/components/ar/ — AR components: QuotationEditor, QuotationActions, ConvertToInvoiceButton, ReminderActions, GenerateStatementForm, DeleteStatementButton, NewRetainerForm, RetainerStatusButton, SendStatementButton, RecordRetainerPaymentButton (portaled modal)
- src/components/invoices/ — SendInvoiceButton, SendReceiptButton (with preview modal), InvoicePDF, ReceiptPDF, CreditNoteForm, VoidCreditNoteButton, DeleteInvoiceButton
- src/components/ui/KpiCard.tsx, PageHeader.tsx, StatusBadge.tsx
- src/components/dashboard/LeadPipelineChart.tsx, RevenueChart.tsx
- src/components/accounting/ExpenseForm.tsx, IncomeForm.tsx, ExportCSV.tsx

## API Routes
- `POST /api/leads` — public endpoint for main site lead submissions
- `GET/POST /api/accept/[token]` — public quotation acceptance (no auth)
- `/api/accounting`, `/api/docs`, `/api/investors`, `/api/invoices` — internal routes
- `/api/docs/retainers/[id]` — retainer PDF (embed/preview/download)
- `/api/docs/employee-contracts/[id]` — employment contract PDF (embed/preview/download)
- `/api/docs/quotations/[token]` — quotation PDF via acceptance token
- `/api/docs/account-statements/[id]` — statement PDF (recalculates balances live, includes scheduled installments)

## Brand
- Colors: #30B0B0 (teal), #303030 (dark), #101010 (background)
- Dark theme default with light/dark toggle (ThemeProvider)
- Glassmorphism cards with teal glow accents
- No emojis, no faith references, no boilerplate

## Domain
- admin.swiftdesignz.co.za (Vercel, keenanswift101/swift-designz-admin)
- Cron: vercel.json schedules /api/cron/recurring-expenses daily at 06:00 UTC
- Main site: swiftdesignz.co.za (separate repo)

## Company Registration
- **Legal name:** Swift Designz Investments CC
- **CC Registration:** CC/2026/05589
- **NamRA TIN:** 16271273 (Tax Type: ITX 16271273-011)
- **Physical:** Erf 55 Kenneth McArthur Street, Auas Blick, Windhoek, Namibia
- **Postal:** P.O. Box 4655, Rehoboth, Namibia
- **Email:** info@swiftdesignz.co.za
- **Financial year end:** Last day of February each year
- **Registration effective:** 12 May 2026
- **Member / Managing Member:** Keenan Husselmann (correct title for a CC — not "Director")
- **Accounting officer:** Rachel N. Kashala (SAIBA 4132)
