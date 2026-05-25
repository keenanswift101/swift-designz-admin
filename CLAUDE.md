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
- Money values stored as integer cents (R2,500 = 250000)
- All enums and interfaces: src/types/database.ts

## Auth
- Supabase Auth (email/password)
- Middleware redirects unauthenticated users to /login
- Three roles: `admin` (full CRUD), `viewer` (read-only), `investor` (restricted portal)
- Profile auto-created on signup via database trigger

## Roles & Access
- **admin/viewer**: Full nav — Dashboard, Leads, Clients, Projects, Invoices, Accounting, Documents, Investors, Team, Equipment, Settings
- **investor**: Restricted nav — Dashboard, Projects, Documents, Investors, Equipment, Reports only
- Document templates filtered by role via `getDocumentTemplatesForRole(role)` in src/lib/document-templates.ts

## Modules (App Router routes)
| Route | Description |
|---|---|
| `/` | Dashboard with KPIs, charts |
| `/leads` | Lead pipeline (new/contacted/quoted/won/lost) |
| `/clients` | Client management |
| `/projects` | Projects with milestones |
| `/invoices` | Invoices & quotations with PDF generation |
| `/accounting` | Income, expenses, reports |
| `/documents` | Document library + PDF generation & email |
| `/investors` | Investor management |
| `/team` | Employees + AI agents |
| `/equipment` | Equipment asset tracking |
| `/settings` | Business settings |

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
- src/lib/auth.ts — server-side auth helpers
- src/lib/email.ts — Resend email (document delivery)
- src/lib/document-templates.ts — template registry & role filtering
- src/lib/document-content-client.ts — client PDF content
- src/lib/document-content-investor.ts — investor PDF content
- src/lib/document-content-registry.ts — unified content lookup
- src/lib/supabase/ — client & server Supabase instances
- src/lib/utils.ts — cn(), escapeHtml(), formatting helpers

## Shared Components
- src/components/layout/AppShell.tsx — root layout wrapper
- src/components/layout/Sidebar.tsx — nav with role-aware sections + live counts
- src/components/ui/KpiCard.tsx, PageHeader.tsx, StatusBadge.tsx
- src/components/dashboard/LeadPipelineChart.tsx, RevenueChart.tsx
- src/components/accounting/ExpenseForm.tsx, IncomeForm.tsx, ExportCSV.tsx

## API Routes
- `POST /api/leads` — public endpoint for main site lead submissions
- `/api/accounting`, `/api/docs`, `/api/investors`, `/api/invoices` — internal routes

## Brand
- Colors: #30B0B0 (teal), #303030 (dark), #101010 (background)
- Dark theme default with light/dark toggle (ThemeProvider)
- Glassmorphism cards with teal glow accents
- No emojis, no faith references, no boilerplate

## Domain
- admin.swiftdesignz.co.za (Netlify, @netlify/plugin-nextjs)
- Main site: swiftdesignz.co.za (separate repo)
