# Swift Designz Admin Portal

Internal business management portal for Swift Designz — handles the full client lifecycle from lead capture through quotation, invoicing, payments, and account statements.

**Production:** https://admin.swiftdesignz.co.za
**Supabase project:** nxuvzdrqgrmureejigpf

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16.2.3 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password + OTP invite) |
| Storage | Supabase Storage |
| Email | Resend |
| PDFs | @react-pdf/renderer |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Netlify + @netlify/plugin-nextjs |

---

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Resend keys
npm run dev                   # http://localhost:3000
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
EMAIL_BASE_URL=https://admin.swiftdesignz.co.za   # always production — never localhost
RESEND_API_KEY=
```

> `EMAIL_BASE_URL` controls links inside outgoing emails. Keep it pointed at production even in local dev so clients receive correct links.

---

## Database Setup

Run migrations in order in the Supabase SQL editor:

1. `supabase/schema.sql` — core tables
2. `supabase/accounts_receivable.sql` — AR tables (quotations, invoices, payments, reminders, statements, retainers)
3. `supabase/employee_contracts.sql` — employment contracts
4. `supabase/notifications_scheduled.sql` — adds `scheduled_for` column to notifications

Money is stored as **integer cents** throughout (R2,500.00 = `250000`).

---

## Roles

| Role | Access |
|---|---|
| `admin` | Full CRUD across all modules |
| `viewer` | Create/edit invoices, quotations, leads — read everything else |
| `investor` | Restricted portal — Dashboard, Projects, Documents, Investors, Equipment |

---

## Modules

### Pipeline
- **Leads** — kanban-style pipeline (new → contacted → quoted → won/lost), notes timeline
- **Clients** — client profiles with invoice history
- **Projects** — projects with milestone tracking and progress editor

### Accounts Receivable
Full flow: **Quotation → Invoice → Payment → Receipt → Reminder → Statement**

| Route | Description |
|---|---|
| `/accounts-receivable/quotations` | Quotation builder with line items, discount, payment plans |
| `/accounts-receivable/payments` | Payments list with receipt preview modal |
| `/accounts-receivable/reminders` | 4-stage payment reminder approval queue |
| `/accounts-receivable/statements` | Account statements — generate, view, delete |
| `/accounts-receivable/retainers` | Retainer subscriptions (active/paused/cancelled) |
| `/invoices` | Billing hub — invoices with payments, credit notes |
| `/accept/[token]` | **Public** — client-facing quotation acceptance page |

#### Payment Plans
Presets: `full_pay`, `standard` (50/50), `2_month_flex`, `3_month_ease`. Schedules auto-compute in the quotation editor. On convert-to-invoice, only the first instalment invoice is created; subsequent instalments schedule portal notifications keyed to their due dates.

#### AR Numbering
`generate_ar_number(p_type)` → `SD26-Q-001`, `SD26-INV-001`, `SD26-REC-001`, `SD26-CN-001`, `SD26-STMT-001` (resets yearly).

### Accounting
Income, expenses, tax estimates, cashflow, audit log, reports with CSV export.

### Documents
15 templates (10 client-facing, 5 investor-facing) — PDF generation and email delivery. Dynamic builders for retainer contracts and employment contracts.

### Investors
Investor profiles with reporting portal access.

### Team
Employee records + AI agent registry.

### Equipment
Asset tracking with status and assignment.

### Settings
Business details (name, address, bank, VAT), profile, password change.

---

## Email

All transactional email goes through Resend (`src/lib/email.ts`):

| Function | Trigger |
|---|---|
| `sendQuotationEmail` | Send quotation action |
| `sendInvoiceEmail` | Send invoice action — includes logo + payment plan schedule |
| `sendReceiptEmail` | Send receipt action — includes logo + payment summary |
| `sendReminderEmail` | Reminder approval → send (4 urgency levels) |
| `sendQuotationAcceptedNotification` | Client accepts quotation |
| `sendInviteEmail` | Admin invites new team member (OTP flow) |

---

## Key Patterns

**Confirm dialogs** — never use `window.confirm()`. Use the `useConfirm` hook:
```tsx
const { confirm, ConfirmDialog } = useConfirm();
const ok = await confirm("Delete this?", { title: "Delete", confirmLabel: "Delete", variant: "danger" });
if (!ok) return;
// ... {ConfirmDialog} in JSX
```

**Supabase join types** — joined tables return ambiguous types; cast with `as unknown as MyType`.

**Server actions** — all mutations are `"use server"` functions in colocated `actions.ts` files.

**RPC non-fatal** — wrap Supabase RPC calls in `try/catch` since `.catch()` isn't available on `PostgrestFilterBuilder`.

---

## Scripts

```bash
npm run dev       # dev server
npm run build     # production build
npm run lint      # ESLint
npm run typecheck # tsc --noEmit
npm run test      # Vitest unit tests
npm run e2e       # Playwright E2E
```
