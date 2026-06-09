# Swift Designz Admin Portal — Session Handoff

> **Date:** 2026-06-09
> **Repo:** `https://github.com/keenanswift101/swift-designz-admin.git`
> **Production:** https://admin.swiftdesignz.co.za (Vercel)
> **Build status:** Passing (0 type errors, 0 lint errors)

---

## What This Project Is

A private admin dashboard for **Swift Designz** (`admin.swiftdesignz.co.za`) to manage leads, clients, projects, invoicing, accounting, documents, investors, and team members. Built as a **separate repo** from the main website (`swift-designz-website`).

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database + Auth | Supabase (PostgreSQL) | supabase-js 2.103 |
| Auth SSR | @supabase/ssr | 0.10.2 |
| Icons | Lucide React | 1.8.0 |
| Animation | Framer Motion | 12.38 |
| PDF (future) | @react-pdf/renderer | 4.4.1 |
| Utils | clsx + tailwind-merge | — |
| Deployment | Vercel | — |

---

## Supabase Configuration

| Item | Value |
|------|-------|
| Project ID | `nxuvzdrqgrmureejigpf` |
| URL | `https://nxuvzdrqgrmureejigpf.supabase.co` |
| Env vars | `.env.local` (3 keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) |
| SQL schema | `supabase/schema.sql` — **NOT YET EXECUTED** |
| Auth | Email/password, two roles: `admin` / `viewer` |
| Auto profile | Trigger creates profile row on signup (first user = admin) |

---

## Brand / Design

- **Background:** `#101010` (near-black)
- **Surface/cards:** `#1a1a1a` with glassmorphism (backdrop-blur, border `#2a2a2a`)
- **Accent:** `#30B0B0` (teal), hover `#2a9a9a`
- **Text:** white headings, `gray-400` body, `gray-500` muted
- **Rules:** No emojis, no boilerplate, no faith references
- **CSS:** Custom variables + utility classes in `src/app/globals.css`

---

## Project Structure

```
swift-designz-admin/
├── .env.local                      # Supabase keys (gitignored)
├── .env.example                    # Template for env vars
├── vercel.json                     # Cron job config (recurring expenses daily 06:00 UTC)
├── next.config.ts                  # Security headers
├── supabase/
│   └── schema.sql                  # Full DB schema (14 tables, RLS, triggers, storage)
├── src/
│   ├── middleware.ts                # Auth guard (redirects to /login if no session)
│   ├── types/
│   │   └── database.ts             # All TS interfaces + enum types (16 enums, 14 entities)
│   ├── lib/
│   │   ├── utils.ts                # cn(), formatCurrency(cents), formatDate(), generateInvoiceNumber()
│   │   └── supabase/
│   │       ├── client.ts           # Browser client (createBrowserClient)
│   │       ├── server.ts           # Server client (createServerClient + cookies)
│   │       ├── middleware.ts        # Middleware client (session refresh)
│   │       └── admin.ts            # Service role client (bypasses RLS)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         # Full sidebar nav + mobile slide-over + sign out
│   │   │   └── AppShell.tsx        # Server component: fetches profile, wraps Sidebar + content
│   │   └── ui/
│   │       ├── KpiCard.tsx         # Metric card with icon + trend indicator
│   │       ├── StatusBadge.tsx     # Color-coded status pill (maps status → color)
│   │       └── PageHeader.tsx      # Page title + description + action slot
│   └── app/
│       ├── layout.tsx              # Root layout (dark bg, Inter font)
│       ├── globals.css             # Dark theme, brand vars, glass-card, badge classes
│       ├── login/page.tsx          # Client component: email/password login form
│       ├── auth/
│       │   ├── actions.ts          # Server actions: signIn, signOut, getSession, getProfile
│       │   └── callback/route.ts   # Supabase auth callback handler
│       ├── api/
│       │   └── leads/route.ts      # Public POST endpoint for main website lead ingestion
│       └── (dashboard)/            # Route group — all auth-protected pages
│           ├── layout.tsx          # Wraps pages in AppShell (sidebar + main area)
│           ├── page.tsx            # Dashboard: KPI cards + recent leads/payments
│           ├── leads/page.tsx      # Leads table (name, email, service, status, date)
│           ├── clients/page.tsx    # Clients table (name, email, company, phone)
│           ├── projects/page.tsx   # Projects table with client join
│           ├── invoices/page.tsx   # Invoices table with client join
│           ├── accounting/
│           │   ├── page.tsx        # KPI cards (income/expenses/profit MTD) + nav links
│           │   ├── income/page.tsx # Placeholder — Phase 5
│           │   ├── expenses/page.tsx # Placeholder — Phase 5
│           │   └── reports/page.tsx  # Placeholder — Phase 5
│           ├── documents/page.tsx  # Documents table with client join
│           ├── investors/page.tsx  # Investors table (name, company, investment, equity, status)
│           ├── team/
│           │   ├── page.tsx        # Hub with links to employees + agents
│           │   ├── employees/page.tsx # Employees table (name, role, dept, salary, status)
│           │   └── agents/page.tsx    # AI Agents table (name, purpose, model, provider, cost, status)
│           └── settings/page.tsx   # Profile display (name, email, role)
```

---

## Database Schema (14 tables)

All money is stored as **integer cents** (divide by 100 for Rand display).

| Table | Purpose | Key Relationships |
|-------|---------|------------------|
| `profiles` | User profiles (extends `auth.users`) | PK = auth user ID |
| `leads` | Quote/contact form submissions | `assigned_to` → profiles |
| `clients` | Client directory | `lead_id` → leads (optional) |
| `projects` | Project tracking | `client_id` → clients |
| `project_milestones` | Task/milestone checklist per project | `project_id` → projects |
| `invoices` | Billing records | `client_id` → clients, `project_id` → projects |
| `payments` | Payment records | `invoice_id` → invoices |
| `expenses` | Business expenses | Standalone, can be recurring |
| `income_entries` | Revenue records | `invoice_id` → invoices (optional) |
| `investors` | Investor profiles | Standalone |
| `documents` | File references (contracts, proposals, etc.) | → clients, projects, investors |
| `employees` | Staff directory | Standalone |
| `ai_agents` | AI assistant registry | Standalone |
| `salary_history` | Employee salary change log | `employee_id` → employees |

**RLS Policies:**
- All authenticated users can SELECT all tables
- Only `admin` role can INSERT/UPDATE/DELETE
- Anonymous users can INSERT into `leads` (for public website API)

**Triggers:**
- `update_updated_at()` — auto-updates `updated_at` on all tables
- `handle_new_user()` — auto-creates profile row on signup (first user = admin)

**Storage Buckets:** `documents`, `receipts` (private, admin-write)

---

## How Supabase Is Used (Important for Next Session)

The Supabase client does **NOT** use the `Database` generic type parameter. This was removed to fix `never` type errors since the schema isn't applied yet. Once the schema is executed in Supabase, you could optionally use `supabase gen types` to generate proper types — but the current approach works fine with untyped clients + explicit casting where needed.

```ts
// src/lib/supabase/server.ts — NO Database generic
return createServerClient(url, key, { cookies: { ... } });

// Pages access data with standard .from().select()
const { data: leads } = await supabase.from("leads").select("*");
```

The only place explicit type casting is used is `accounting/page.tsx`:
```ts
const income = (incomeResult.data ?? []) as { amount: number }[];
```

---

## API Endpoint

`POST /api/leads` — Public endpoint for the main Swift Designz website to submit lead data.
- Uses the **service role key** (admin client) to bypass RLS
- Validates name + email required
- Sanitizes all string inputs with length limits
- Returns `{ success: true, id: "uuid" }`

---

## What's Done (Phase 1 — Foundation) ✅

- [x] Next.js 16 scaffold with App Router + TypeScript + Tailwind 4
- [x] All dependencies installed
- [x] Config: next.config.ts (security headers), vercel.json (cron), .env files
- [x] Supabase clients: browser, server, middleware, admin (service role)
- [x] Full TypeScript types for all 14 entities + 16 enum types
- [x] Complete SQL schema (14 tables, indexes, triggers, RLS, storage)
- [x] Auth flow: middleware guard, login page, sign in/out server actions, callback route
- [x] Sidebar layout: collapsible, mobile responsive, 3 nav sections, sign out
- [x] AppShell: server component fetches profile, passes to sidebar
- [x] Dashboard page: 4 KPI cards + recent leads + recent payments feeds
- [x] All 15 module pages created with tables, empty states, Supabase queries
- [x] Reusable UI: KpiCard, StatusBadge, PageHeader
- [x] API route for lead ingestion from main website
- [x] `globals.css`: full dark theme, glass-card class, badge colors
- [x] Build passes clean (21 routes, 0 errors)
- [x] Committed to git

---

## What's NOT Done Yet

### Deployment ✅ Complete
- Deployed on **Vercel** at `admin.swiftdesignz.co.za`
- GitHub repo: `keenanswift101/swift-designz-admin`
- All environment variables set in Vercel dashboard
- Custom domain live with HTTPS (Vercel-managed certificate)
- Cron job active: `vercel.json` calls `/api/cron/recurring-expenses` daily at 06:00 UTC

### Phase 2 — Leads & Quotes (Next Priority)
- Lead detail page (`/leads/[id]`)
- Lead creation form (`/leads/new`)
- Lead editing with status transitions
- Convert lead → client flow
- Notes/activity timeline on lead detail
- Email notification on new lead (optional)

### Phase 3 — Client & Project Management
- Client detail + edit pages
- Project detail + edit pages
- Milestone management (add/complete/reorder)
- Project timeline/progress visualization
- Link projects to invoices

### Phase 4 — Invoicing & Payments
- Invoice creation with line items
- PDF invoice generation (@react-pdf/renderer)
- Payment recording
- Invoice status auto-updates (partial → paid)
- Outstanding balance tracking

### Phase 5 — Full Accounting + Documents + Team
- Expense tracking (CRUD, recurring, receipt upload)
- Income tracking (manual + auto from invoices)
- P&L reports
- Document upload to Supabase Storage
- Employee CRUD + salary history
- AI agent registry CRUD
- Investor profiles + agreements

### Phase 6 — Polish & Integration
- Main website integration (connect quote/contact forms → API)
- Dashboard charts (revenue trends, lead pipeline)
- Search across all modules
- Bulk actions (multi-select leads, batch invoice)
- Export CSV/PDF reports
- Next.js 16 middleware → proxy migration (suppress warning for now)

---

## Known Issues / Warnings

1. **Next.js 16 middleware deprecation** — `src/middleware.ts` works but shows: "The middleware file convention is deprecated. Please use proxy instead." This is a Next.js 16 change; the middleware approach still functions. Migrate to "proxy" convention when Next.js docs stabilize.

2. **Supabase types** — The `Database` generic was removed from all Supabase client factories. If you want full type safety, run `npx supabase gen types typescript --project-id nxuvzdrqgrmureejigpf > src/types/supabase.ts` after executing the schema, then add the generic back.

3. **All money is cents** — `formatCurrency(cents)` in `src/lib/utils.ts` divides by 100. All amount fields in the database are INTEGER (cents). R2,500.00 is stored as `250000`.

---

## Quick Start Commands

```bash
cd C:\Users\keena\Projects\swift-designz-admin
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
```

---

## File-by-File Reference

| File | What It Does |
|------|-------------|
| `src/middleware.ts` | Checks Supabase session; redirects to `/login` if unauthenticated |
| `src/lib/supabase/client.ts` | `createClient()` for browser (client components) |
| `src/lib/supabase/server.ts` | `createClient()` for server (server components + actions) |
| `src/lib/supabase/admin.ts` | `createAdminClient()` with service role key (bypasses RLS) |
| `src/lib/supabase/middleware.ts` | `updateSession()` for refreshing auth cookies in middleware |
| `src/lib/utils.ts` | `cn()`, `formatCurrency()`, `formatDate()`, `generateInvoiceNumber()` |
| `src/types/database.ts` | All entity interfaces + enum types |
| `src/components/layout/Sidebar.tsx` | Full nav sidebar (client component) |
| `src/components/layout/AppShell.tsx` | Layout wrapper (server component) |
| `src/app/auth/actions.ts` | `signIn()`, `signOut()`, `getSession()`, `getProfile()` |
| `src/app/api/leads/route.ts` | Public POST API for lead ingestion |
| `supabase/schema.sql` | Complete database setup (run once in SQL Editor) |
