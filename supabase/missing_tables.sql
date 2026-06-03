-- Creates the two tables missing from the live DB: liabilities + revenue_projections
-- Safe to re-run (uses IF NOT EXISTS throughout)

-- Enum (may already exist from initial schema run)
DO $$ BEGIN
  CREATE TYPE liability_type AS ENUM (
    'loan', 'credit_facility', 'accounts_payable', 'vat_payable', 'tax_provision', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Liabilities ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS liabilities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  type          liability_type NOT NULL DEFAULT 'loan',
  lender        TEXT,
  total_amount  INTEGER NOT NULL DEFAULT 0,   -- original / credit limit in cents
  outstanding   INTEGER NOT NULL DEFAULT 0,   -- current balance in cents
  interest_rate NUMERIC(5,2),                 -- annual % e.g. 11.75
  due_date      DATE,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'active', -- 'active' | 'settled'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can read liabilities"
    ON liabilities FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage liabilities"
    ON liabilities FOR ALL TO authenticated
    USING  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON liabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Revenue Projections ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS revenue_projections (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month              DATE NOT NULL UNIQUE,         -- first day of month e.g. 2026-06-01
  projected_income   INTEGER NOT NULL DEFAULT 0,   -- cents
  projected_expenses INTEGER NOT NULL DEFAULT 0,   -- cents
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE revenue_projections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can read projections"
    ON revenue_projections FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage projections"
    ON revenue_projections FOR ALL TO authenticated
    USING  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON revenue_projections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
