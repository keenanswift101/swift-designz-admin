-- Payroll module
-- Payroll runs are created monthly and funded via an external payroll company.
-- The company receives a single transfer and handles individual disbursements.

create type payroll_run_status as enum ('draft', 'approved', 'funded', 'paid');

create table payroll_runs (
  id                      uuid primary key default gen_random_uuid(),
  period_year             int not null,
  period_month            int not null check (period_month between 1 and 12),
  status                  payroll_run_status not null default 'draft',
  payroll_company         text,                        -- e.g. "PaySpace", "Sage Payroll"
  total_gross_cents       int not null default 0,
  total_ssc_employee_cents int not null default 0,
  total_ssc_employer_cents int not null default 0,
  total_net_cents         int not null default 0,
  total_to_fund_cents     int not null default 0,      -- gross + employer SSC
  funded_at               timestamptz,
  funded_amount_cents     int,
  paid_at                 timestamptz,
  notes                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (period_year, period_month)
);

create table payroll_entries (
  id                      uuid primary key default gen_random_uuid(),
  payroll_run_id          uuid not null references payroll_runs(id) on delete cascade,
  employee_id             uuid references employees(id) on delete set null,
  employee_name           text not null,               -- snapshot at time of run
  role_snapshot           text,
  gross_cents             int not null,
  ssc_employee_cents      int not null default 0,
  ssc_employer_cents      int not null default 0,
  net_cents               int not null,
  notes                   text,
  created_at              timestamptz not null default now()
);

-- RLS
alter table payroll_runs enable row level security;
alter table payroll_entries enable row level security;

create policy "Authenticated users can manage payroll_runs"
  on payroll_runs for all to authenticated using (true) with check (true);

create policy "Authenticated users can manage payroll_entries"
  on payroll_entries for all to authenticated using (true) with check (true);

-- updated_at trigger for payroll_runs
create or replace function update_payroll_runs_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_payroll_runs_updated_at
  before update on payroll_runs
  for each row execute function update_payroll_runs_updated_at();
