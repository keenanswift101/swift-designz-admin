-- Swift Designz Admin Portal — Supabase Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/nxuvzdrqgrmureejigpf/sql)

-- ═══════════════════════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TYPE user_role AS ENUM ('admin', 'viewer', 'investor');
CREATE TYPE lead_source AS ENUM ('quote_form', 'contact_form', 'manual');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'quoted', 'won', 'lost');
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled');
CREATE TYPE payment_method AS ENUM ('eft', 'cash', 'card', 'other');
CREATE TYPE expense_category AS ENUM ('hosting', 'software', 'subscriptions', 'hardware', 'marketing', 'transport', 'office', 'professional_services', 'other');
CREATE TYPE recurring_interval AS ENUM ('monthly', 'quarterly', 'yearly');
CREATE TYPE income_category AS ENUM ('web_dev', 'ecommerce', 'apps', 'training', 'consulting', 'other');
CREATE TYPE document_type AS ENUM ('contract', 'proposal', 'invoice', 'receipt', 'agreement', 'report', 'other');
CREATE TYPE investor_status AS ENUM ('prospective', 'active', 'exited');
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'terminated');
CREATE TYPE department AS ENUM ('development', 'design', 'marketing', 'operations', 'other');
CREATE TYPE agent_status AS ENUM ('active', 'paused', 'retired');
CREATE TYPE income_source AS ENUM ('invoice', 'manual');
CREATE TYPE liability_type AS ENUM ('loan', 'credit_facility', 'accounts_payable', 'vat_payable', 'tax_provision', 'other');
CREATE TYPE equipment_category AS ENUM ('computing', 'peripherals', 'mobile', 'networking', 'software_licence', 'office', 'other');
CREATE TYPE equipment_condition AS ENUM ('new', 'good', 'fair', 'poor');
CREATE TYPE equipment_status AS ENUM ('active', 'sold', 'disposed');

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source lead_source NOT NULL DEFAULT 'manual',
  status lead_status NOT NULL DEFAULT 'new',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  location TEXT,
  service TEXT,
  package TEXT,
  scope TEXT,
  timeline TEXT,
  budget TEXT,
  message TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead Notes (activity timeline)
CREATE TABLE lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service TEXT,
  package TEXT,
  status project_status NOT NULL DEFAULT 'planning',
  start_date DATE,
  due_date DATE,
  quoted_amount INTEGER, -- cents
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project Milestones
CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- cents (post-discount final amount)
  discount_amount INTEGER NOT NULL DEFAULT 0, -- cents
  discount_type TEXT NOT NULL DEFAULT 'flat', -- 'percent' or 'flat'
  status invoice_status NOT NULL DEFAULT 'draft',
  due_date DATE NOT NULL,
  paid_date DATE,
  paid_amount INTEGER NOT NULL DEFAULT 0, -- cents
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- cents
  method payment_method NOT NULL,
  reference TEXT,
  paid_at DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category expense_category NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL, -- cents
  date DATE NOT NULL,
  recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_interval recurring_interval,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Income Entries
CREATE TABLE income_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source income_source NOT NULL DEFAULT 'manual',
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL, -- cents
  date DATE NOT NULL,
  category income_category NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Income entry reconciliation columns (add to existing DB via migration)
-- ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS reconciled BOOLEAN NOT NULL DEFAULT false;
-- ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMPTZ;

-- Business settings extra fields (add to existing DB via migration)
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS registration_date DATE;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS directors TEXT;

-- Liabilities
CREATE TABLE liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type liability_type NOT NULL DEFAULT 'loan',
  lender TEXT,
  total_amount INTEGER NOT NULL DEFAULT 0,   -- original/credit limit in cents
  outstanding INTEGER NOT NULL DEFAULT 0,    -- current balance in cents
  interest_rate NUMERIC(5,2),                -- annual % e.g. 11.75
  due_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',     -- 'active' | 'settled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Revenue Projections
CREATE TABLE revenue_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL UNIQUE,                    -- first day of month e.g. 2026-04-01
  projected_income INTEGER NOT NULL DEFAULT 0,   -- cents
  projected_expenses INTEGER NOT NULL DEFAULT 0, -- cents
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  investment_amount INTEGER NOT NULL DEFAULT 0, -- cents
  equity_percentage DECIMAL,
  agreement_date DATE,
  status investor_status NOT NULL DEFAULT 'prospective',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0, -- bytes
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL,
  department department NOT NULL DEFAULT 'other',
  salary INTEGER NOT NULL DEFAULT 0, -- cents, monthly
  start_date DATE NOT NULL,
  end_date DATE,
  status employee_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Agents
CREATE TABLE ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  monthly_cost INTEGER NOT NULL DEFAULT 0, -- cents
  status agent_status NOT NULL DEFAULT 'active',
  config_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Salary History
CREATE TABLE salary_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- cents
  effective_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_lead_notes_lead ON lead_notes(lead_id);
CREATE INDEX idx_lead_notes_created ON lead_notes(created_at DESC);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_income_date ON income_entries(date DESC);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_salary_history_employee ON salary_history(employee_id);

-- Equipment
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category equipment_category NOT NULL,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  purchased_at DATE,
  purchase_price INTEGER NOT NULL DEFAULT 0, -- cents
  current_value INTEGER NOT NULL DEFAULT 0,  -- cents
  condition equipment_condition NOT NULL DEFAULT 'good',
  status equipment_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUTO-UPDATE updated_at TRIGGER
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON income_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON investors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON ai_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON liabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON revenue_projections FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'viewer')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_projections ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all tables
CREATE POLICY "Authenticated users can read profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read milestones" ON project_milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read invoices" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read expenses" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read income" ON income_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read investors" ON investors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read employees" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read agents" ON ai_agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read salary history" ON salary_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read lead notes" ON lead_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read equipment" ON equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read liabilities" ON liabilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read projections" ON revenue_projections FOR SELECT TO authenticated USING (true);

-- Only admins can write (insert, update, delete)
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage leads" ON leads FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Viewers can manage leads" ON leads FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));
CREATE POLICY "Admins can manage clients" ON clients FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage projects" ON projects FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage milestones" ON project_milestones FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage invoices" ON invoices FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Viewers can manage invoices" ON invoices FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));
CREATE POLICY "Admins can manage payments" ON payments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Viewers can manage payments" ON payments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));
CREATE POLICY "Admins can manage expenses" ON expenses FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage income" ON income_entries FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Viewers can manage income" ON income_entries FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));
CREATE POLICY "Admins can manage documents" ON documents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage investors" ON investors FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage employees" ON employees FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage agents" ON ai_agents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage salary history" ON salary_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage lead notes" ON lead_notes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage equipment" ON equipment FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage liabilities" ON liabilities FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage projections" ON revenue_projections FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Allow the main website to insert leads via anon key (public API)
-- Restricted: require name + email, source must be a public form (not manual)
CREATE POLICY "Anon can insert leads" ON leads FOR INSERT TO anon
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) > 0 AND
    email IS NOT NULL AND length(trim(email)) > 0 AND
    source IN ('quote_form', 'contact_form')
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

CREATE POLICY "Auth users can read documents bucket" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('documents', 'receipts'));
CREATE POLICY "Admins can upload to documents bucket" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('documents', 'receipts') AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete from documents bucket" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('documents', 'receipts') AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
