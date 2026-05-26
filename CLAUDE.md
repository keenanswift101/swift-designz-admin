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

## Build
- `npm run dev` — runs on localhost:3000
- `npm run build` — production build
- `npm run test` — Vitest unit tests
- `npm run e2e` — Playwright E2E tests

## Database
- Supabase project ID: nxuvzdrqgrmureejigpf
- Schema SQL: supabase/schema.sql
- Accounts Receivable schema: supabase/accounts_receivable.sql (run after schema.sql)
- Employment contracts schema: supabase/employee_contracts.sql
- Money values stored as integer cents (R2,500 = 250000)
- All enums and interfaces: src/types/database.ts

## Auth
- Supabase Auth (email/password)
- Middleware redirects unauthenticated users to /login
- Three roles: `admin` (full CRUD), `viewer` (read-only), `investor` (restricted portal)
- Profile auto-created on signup via database trigger

## Roles & Access
- **admin/viewer**: Full nav — Dashboard, Pipeline (Leads/Clients/Projects), Accounts Receivable (Quotations/Billing/Payments), Accounting, Documents, Investors, Team, Equipment, Settings
- **investor**: Restricted nav — Dashboard, Projects, Documents, Investors, Equipment, Reports only
- Document templates filtered by role via `getDocumentTemplatesForRole(role)` in src/lib/document-templates.ts

## Sidebar Structure (admin/viewer)
The sidebar uses labeled sections rendered via `NAV_SECTIONS` + a hardcoded AR group injected after section 0:
- **PIPELINE**: Dashboard, Leads, Clients, Projects
- **ACCOUNTS RECEIVABLE**: Estimates & Quotations, Billing (→ /invoices), Payments
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
| `/accounts-receivable/payments` | Payment confirmations + statements (Phase 3, stub) |
| `/invoices` | Billing hub — invoices with payment tracking (excludes legacy doc_type=quotation) |
| `/accounting` | Income, expenses, reports |
| `/documents` | Document library + PDF generation & email |
| `/documents/retainers` | Retainer contract builder |
| `/documents/employee-contracts` | Employment contract builder |
| `/investors` | Investor management |
| `/team` | Employees + AI agents |
| `/equipment` | Equipment asset tracking |
| `/settings` | Business settings |

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

### Phase 2 — Billing (stub)
- `invoices` table extended with `ar_number`, `quotation_id`, `installment_number`
- DB table: `credit_notes`, `payment_reminders` (4-stage approval queue)
- DB function: `schedule_invoice_reminders(invoice_id)`
- `/invoices` page = billing hub (direct invoice creation still available)

### Phase 3 — Payments (stub)
- DB table: `payment_confirmations` (receipt_number SD26-REC-001)
- DB table: `account_statements`, `account_statement_items`

### Phase 4 — Retainer Management (stub)
- DB table: `retainer_subscriptions` (links clients to retainer contracts with billing_day)

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
- src/lib/email.ts — Resend email (document delivery)
- src/lib/document-templates.ts — template registry & role filtering
- src/lib/document-content-client.ts — client PDF content
- src/lib/document-content-investor.ts — investor PDF content
- src/lib/document-content-registry.ts — unified content lookup
- src/lib/supabase/ — client & server Supabase instances
- src/lib/utils.ts — cn(), escapeHtml(), formatCurrency(), formatDate()

## Shared Components
- src/components/layout/AppShell.tsx — root layout wrapper
- src/components/layout/Sidebar.tsx — nav with labeled sections, role-aware, live counts
- src/components/ar/ — Accounts Receivable components (QuotationEditor, QuotationActions)
- src/components/ui/KpiCard.tsx, PageHeader.tsx, StatusBadge.tsx
- src/components/dashboard/LeadPipelineChart.tsx, RevenueChart.tsx
- src/components/accounting/ExpenseForm.tsx, IncomeForm.tsx, ExportCSV.tsx

## API Routes
- `POST /api/leads` — public endpoint for main site lead submissions
- `/api/accounting`, `/api/docs`, `/api/investors`, `/api/invoices` — internal routes
- `/api/docs/retainers/[id]` — retainer PDF (embed/preview/download)
- `/api/docs/employee-contracts/[id]` — employment contract PDF (embed/preview/download)

## Brand
- Colors: #30B0B0 (teal), #303030 (dark), #101010 (background)
- Dark theme default with light/dark toggle (ThemeProvider)
- Glassmorphism cards with teal glow accents
- No emojis, no faith references, no boilerplate

## Domain
- admin.swiftdesignz.co.za (Netlify, @netlify/plugin-nextjs)
- Main site: swiftdesignz.co.za (separate repo)
