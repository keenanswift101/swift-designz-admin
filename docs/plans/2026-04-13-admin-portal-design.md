# Swift Designz Admin Portal — Design Document

**Date:** 2026-04-13  
**Status:** Approved  
**Repo:** `swift-designz-admin` (separate from main website)  
**Domain:** `admin.swiftdesignz.co.za`

---

## Architecture

- **Framework:** Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- **Database:** Supabase (PostgreSQL + Auth + Row Level Security + Storage)
- **UI Components:** Shadcn/ui (Radix-based)
- **Icons:** Lucide React
- **Animations:** Framer Motion (light — page transitions only)
- **PDF Generation:** @react-pdf/renderer
- **Deployment:** Netlify → `admin.swiftdesignz.co.za`
- **DNS:** CNAME record at IT-Guru: `admin` → Netlify deploy URL

## Visual Style

- Dark theme: `#101010` background, `#303030` card surfaces, `#30B0B0` teal accents
- Subtle glassmorphism on cards (not heavy like public site)
- Professional/functional — data-dense tables, readable forms
- Brand-consistent but optimised for productivity, not flash

## Authentication

- Supabase Auth (email/password)
- Middleware session check on every route → redirect to `/login` if unauthenticated
- Roles: `admin` (full CRUD) and `viewer` (read-only)
- Keenan = admin; future assistants get viewer or admin as needed

## Database Schema

### profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid | FK → auth.users |
| full_name | text | |
| email | text | |
| role | enum | 'admin' \| 'viewer' |
| avatar_url | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### leads
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| source | enum | 'quote_form' \| 'contact_form' \| 'manual' |
| status | enum | 'new' \| 'contacted' \| 'quoted' \| 'won' \| 'lost' |
| name | text | |
| email | text | |
| phone | text | |
| company | text | |
| location | text | |
| service | text | |
| package | text | |
| scope | text | |
| timeline | text | |
| budget | text | |
| message | text | |
| notes | text | internal notes |
| assigned_to | uuid | FK → profiles, nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### clients
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| lead_id | uuid | FK → leads, nullable |
| name | text | |
| email | text | |
| phone | text | |
| company | text | |
| location | text | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### projects
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| client_id | uuid | FK → clients |
| name | text | |
| service | text | |
| package | text | |
| status | enum | 'planning' \| 'in_progress' \| 'review' \| 'completed' \| 'on_hold' \| 'cancelled' |
| start_date | date | |
| due_date | date | |
| quoted_amount | integer | cents (R stored as cents) |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### project_milestones
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| title | text | |
| due_date | date | |
| completed | boolean | |
| completed_at | timestamptz | |
| sort_order | integer | |

### invoices
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| invoice_number | text | unique, e.g. "INV-2026-001" |
| project_id | uuid | FK → projects |
| client_id | uuid | FK → clients |
| amount | integer | cents |
| status | enum | 'draft' \| 'sent' \| 'paid' \| 'partial' \| 'overdue' \| 'cancelled' |
| due_date | date | |
| paid_date | date | nullable |
| paid_amount | integer | cents |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### payments
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| invoice_id | uuid | FK → invoices |
| amount | integer | cents |
| method | enum | 'eft' \| 'cash' \| 'card' \| 'other' |
| reference | text | proof of payment ref |
| paid_at | date | |
| notes | text | |
| created_at | timestamptz | |

### expenses
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| category | enum | 'hosting' \| 'software' \| 'subscriptions' \| 'hardware' \| 'marketing' \| 'transport' \| 'office' \| 'professional_services' \| 'other' |
| description | text | |
| amount | integer | cents |
| date | date | |
| recurring | boolean | |
| recurring_interval | enum | 'monthly' \| 'quarterly' \| 'yearly', nullable |
| receipt_url | text | nullable, Supabase Storage |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### income_entries
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| source | enum | 'invoice' \| 'manual' |
| invoice_id | uuid | FK → invoices, nullable |
| description | text | |
| amount | integer | cents |
| date | date | |
| category | enum | 'web_dev' \| 'ecommerce' \| 'apps' \| 'training' \| 'consulting' \| 'other' |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### documents
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| client_id | uuid | FK → clients, nullable |
| project_id | uuid | FK → projects, nullable |
| investor_id | uuid | FK → investors, nullable |
| name | text | |
| type | enum | 'contract' \| 'proposal' \| 'invoice' \| 'receipt' \| 'agreement' \| 'report' \| 'other' |
| file_url | text | Supabase Storage |
| file_size | integer | bytes |
| uploaded_by | uuid | FK → profiles |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### investors
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| email | text | |
| phone | text | |
| company | text | nullable |
| investment_amount | integer | cents |
| equity_percentage | decimal | nullable |
| agreement_date | date | nullable |
| status | enum | 'prospective' \| 'active' \| 'exited' |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### employees
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| email | text | |
| phone | text | |
| role | text | job title |
| department | enum | 'development' \| 'design' \| 'marketing' \| 'operations' \| 'other' |
| salary | integer | cents, monthly |
| start_date | date | |
| end_date | date | nullable |
| status | enum | 'active' \| 'inactive' \| 'terminated' |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### ai_agents
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | e.g. "Swift Marketing Agent" |
| purpose | text | |
| model | text | e.g. "Claude Opus", "GPT-4o" |
| provider | text | e.g. "GitHub Copilot", "OpenAI" |
| monthly_cost | integer | cents |
| status | enum | 'active' \| 'paused' \| 'retired' |
| config_notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### salary_history
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| employee_id | uuid | FK → employees |
| amount | integer | cents |
| effective_date | date | |
| notes | text | |
| created_at | timestamptz | |

## Page Structure

### Navigation (Sidebar)
- Dashboard — overview / KPI stats
- Leads — quote & contact inbox
- Clients — client directory
- Projects — project tracker
- Invoices — billing
- ---
- Accounting — income vs expenses
- Documents — all client docs (PDF)
- Investors — investor profiles
- Team — employees + AI agents
- ---
- Settings — profile, config

### Routes
| Route | Purpose |
|---|---|
| `/login` | Email/password login (public, no sidebar) |
| `/` | Dashboard — KPIs, recent activity |
| `/leads` | Filterable leads table |
| `/leads/[id]` | Lead detail + actions |
| `/clients` | Client directory + search |
| `/clients/[id]` | Client profile + linked projects/invoices |
| `/projects` | Project board (table/kanban) |
| `/projects/[id]` | Project detail + milestones |
| `/invoices` | Invoice table + filters |
| `/invoices/[id]` | Invoice detail + payments + PDF |
| `/accounting` | Financial overview — income vs expenses charts |
| `/accounting/income` | Income records |
| `/accounting/expenses` | Expense tracker + receipts |
| `/accounting/reports` | P&L reports + PDF export |
| `/documents` | Document library — filter by client/project/type |
| `/documents/[id]` | PDF viewer + metadata |
| `/investors` | Investor directory |
| `/investors/[id]` | Investor profile + linked docs |
| `/team` | Overview |
| `/team/employees` | Employee list + management |
| `/team/employees/[id]` | Employee profile + salary history |
| `/team/agents` | AI agent registry |
| `/settings` | Profile, password, team invites |

## Build Phases

### Phase 1 — Foundation
- Create repo, Next.js 15 + TS + Tailwind 4 + Shadcn/ui
- Supabase project (DB, auth, storage)
- All tables + RLS policies
- Auth flow (login, middleware, roles)
- Sidebar layout + dark theme + brand styling
- Dashboard with placeholder KPIs

### Phase 2 — Leads & Clients
- Leads table + detail + status management
- Client directory + profiles
- Lead → Client conversion
- Main website integration (write to Supabase on form submit)

### Phase 3 — Projects & Milestones
- Projects table + detail + status
- Milestones checklist
- Link to clients

### Phase 4 — Invoicing & Payments
- Invoice CRUD + status tracking
- Payment recording (partial / payment plans)
- PDF invoice generation (branded)
- Auto-create income entry on payment

### Phase 5 — Accounting
- Expense tracker + categories + receipts
- Income ledger (auto + manual)
- P&L dashboard with charts
- Report PDF export

### Phase 6 — Documents, Investors, Team
- Document upload + viewer (Supabase Storage)
- Investor profiles + linked docs
- Employee management + salary history
- AI agents registry
- Settings page

## Connection to Main Site
- Quote/contact forms on main site POST to Supabase (new API route) in addition to Resend emails
- Every lead lands in DB automatically
- No direct code dependency between repos
