-- ═══════════════════════════════════════════════════════════════════════════════
-- ACCOUNTS RECEIVABLE — Full Schema Migration
-- Run in Supabase SQL Editor after schema.sql and invoice_items.sql
--
-- Phase 1 — Quotations (foundation everything depends on)
-- Phase 2 — Billing enhancements (credit notes, reminder queue)
-- Phase 3 — Payments (confirmations, statements)
-- Phase 4 — Retainer management
-- ═══════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- SHARED: Document number sequencing
-- Generates SD26-Q-001, SD26-INV-001, SD26-REC-001, SD26-CN-001, SD26-STMT-001
-- Resets per year (SD26 → SD27 → ...) and restarts at 001 each year.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE document_sequences (
  type        TEXT    NOT NULL,
  year        INTEGER NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (type, year)
);

CREATE OR REPLACE FUNCTION generate_ar_number(p_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_year    INTEGER := EXTRACT(YEAR FROM now())::INTEGER;
  v_yr_sh   TEXT    := LPAD((v_year % 100)::TEXT, 2, '0');
  v_seq     INTEGER;
  v_prefix  TEXT;
BEGIN
  INSERT INTO public.document_sequences (type, year, last_number)
  VALUES (p_type, v_year, 1)
  ON CONFLICT (type, year)
  DO UPDATE SET last_number = public.document_sequences.last_number + 1
  RETURNING last_number INTO v_seq;

  v_prefix := CASE p_type
    WHEN 'quotation'   THEN 'SD' || v_yr_sh || '-Q-'
    WHEN 'invoice'     THEN 'SD' || v_yr_sh || '-INV-'
    WHEN 'receipt'     THEN 'SD' || v_yr_sh || '-REC-'
    WHEN 'credit_note' THEN 'SD' || v_yr_sh || '-CN-'
    WHEN 'statement'   THEN 'SD' || v_yr_sh || '-STMT-'
    ELSE                    'SD' || v_yr_sh || '-DOC-'
  END;

  RETURN v_prefix || LPAD(v_seq::TEXT, 3, '0');
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- EXISTING TABLE AMENDMENTS
-- Extend invoices to support AR linkage without breaking the existing /invoices
-- ─────────────────────────────────────────────────────────────────────────────

-- ar_number:          SD26-INV-001 — shown in the AR system (NULL for old invoices)
-- quotation_id:       links an invoice back to the quotation it was converted from
-- installment_number: 1, 2, 3 for payment-plan invoices (NULL for single invoices)
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS ar_number           TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS quotation_id        UUID REFERENCES quotations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS installment_number  INTEGER;

-- accounting_access flag for profiles (referenced in code but not in original schema)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS accounting_access BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_invoices_ar_number   ON invoices(ar_number);
CREATE INDEX IF NOT EXISTS idx_invoices_quotation   ON invoices(quotation_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 1 — QUOTATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- quotations
-- status flow: draft → sent → accepted → converted | expired | cancelled
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE quotations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number     TEXT NOT NULL UNIQUE,             -- SD26-Q-001

  -- Client & Project
  client_id        UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id       UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Status
  status           TEXT NOT NULL DEFAULT 'draft',    -- draft | sent | accepted | converted | expired | cancelled
  locked           BOOLEAN NOT NULL DEFAULT false,   -- locked once sent; edits require new version

  -- Dates & Expiry
  sent_at          TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,                      -- set to sent_at + 7 working days on send
  accepted_at      TIMESTAMPTZ,
  converted_at     TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,

  -- Client acceptance via link
  acceptance_token UUID NOT NULL DEFAULT gen_random_uuid(),  -- one-time token for the accept link
  accepted_by_name TEXT,                             -- client's full name at acceptance
  accepted_by_ip   TEXT,                             -- client's IP address (legal record)

  -- Financials (all cents)
  subtotal         INTEGER NOT NULL DEFAULT 0,
  discount_type    TEXT    NOT NULL DEFAULT 'percentage',   -- 'percentage' | 'fixed'
  discount_value   NUMERIC(10,2) NOT NULL DEFAULT 0,        -- e.g. 20 for 20% or 50000 for R500
  discount_amount  INTEGER NOT NULL DEFAULT 0,
  total            INTEGER NOT NULL DEFAULT 0,

  -- Payment plan stored as JSON array of installments
  -- [{label, amount_cents, due_date, installment_number}]
  payment_plan_enabled  BOOLEAN NOT NULL DEFAULT false,
  payment_plan_type     TEXT,                        -- standard | full_pay | 2_month_flex | 3_month_ease | custom
  payment_plan_schedule JSONB,

  -- Content
  notes            TEXT,
  terms            TEXT,

  -- Version tracking
  current_version  INTEGER NOT NULL DEFAULT 1,

  -- Audit
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotations_client  ON quotations(client_id);
CREATE INDEX idx_quotations_status  ON quotations(status);
CREATE INDEX idx_quotations_token   ON quotations(acceptance_token);
CREATE INDEX idx_quotations_created ON quotations(created_at DESC);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- quotation_line_items
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE quotation_line_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id   UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  description    TEXT NOT NULL,
  quantity       NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_rate      INTEGER NOT NULL DEFAULT 0,         -- cents
  amount         INTEGER NOT NULL DEFAULT 0,         -- cents (quantity × unit_rate)
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quote_items_quote ON quotation_line_items(quotation_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- quotation_versions
-- Immutable history — every edit before send creates a snapshot.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE quotation_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id    UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  -- Full JSON snapshot of the quotation + its line items at that version
  snapshot        JSONB NOT NULL,
  change_notes    TEXT,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quote_versions_quote ON quotation_versions(quotation_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Functions: accept_quotation (called from public acceptance page via token)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION accept_quotation(
  p_token       UUID,
  p_client_name TEXT,
  p_client_ip   TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id      UUID;
  v_status  TEXT;
  v_expiry  TIMESTAMPTZ;
BEGIN
  SELECT id, status, expires_at
  INTO   v_id, v_status, v_expiry
  FROM   public.quotations
  WHERE  acceptance_token = p_token
  LIMIT  1;

  IF NOT FOUND                                        THEN RETURN false; END IF;
  IF v_status <> 'sent'                               THEN RETURN false; END IF;
  IF v_expiry IS NOT NULL AND v_expiry < now()        THEN RETURN false; END IF;

  UPDATE public.quotations
  SET
    status           = 'accepted',
    accepted_at      = now(),
    accepted_by_name = p_client_name,
    accepted_by_ip   = p_client_ip,
    updated_at       = now()
  WHERE id = v_id;

  RETURN true;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Function: expire_quotations
-- Call this on a schedule or at runtime to auto-cancel stale quotes.
-- Works on calendar days for simplicity; working-day calc is done in app code.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION expire_quotations()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.quotations
  SET status = 'expired', updated_at = now()
  WHERE status = 'sent'
    AND expires_at IS NOT NULL
    AND expires_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 2 — BILLING ENHANCEMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- credit_notes
-- Applied against a specific invoice. type: adjustment | refund | credit
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE credit_notes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_number TEXT NOT NULL UNIQUE,           -- SD26-CN-001
  invoice_id         UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  client_id          UUID REFERENCES clients(id) ON DELETE SET NULL,

  type               TEXT NOT NULL DEFAULT 'adjustment',  -- adjustment | refund | credit
  reason             TEXT NOT NULL,
  amount             INTEGER NOT NULL,               -- cents (positive value)

  status             TEXT NOT NULL DEFAULT 'draft',  -- draft | issued | applied | voided

  issued_at          TIMESTAMPTZ,
  applied_at         TIMESTAMPTZ,

  created_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_notes_invoice ON credit_notes(invoice_id);
CREATE INDEX idx_credit_notes_client  ON credit_notes(client_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON credit_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- payment_reminders
-- Approval queue. One row per stage per invoice.
-- Stages: 1=3 days before, 2=due date, 3=3 days after, 4=7 days after
-- WhatsApp message generated at stages 3 & 4 for manual copy-paste.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE payment_reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Stage
  stage           INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 4),
  stage_label     TEXT NOT NULL,                     -- '3 days before due', 'Due today', etc.
  scheduled_for   TIMESTAMPTZ NOT NULL,              -- when this reminder is due to fire

  -- Status
  status          TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | sent | dismissed

  -- Email content (generated from template)
  email_subject   TEXT,
  email_body      TEXT,

  -- WhatsApp copy-paste (stages 3 & 4 only)
  whatsapp_message TEXT,

  -- Approval & send tracking
  approved_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (invoice_id, stage)                         -- one reminder per stage per invoice
);

CREATE INDEX idx_reminders_invoice   ON payment_reminders(invoice_id);
CREATE INDEX idx_reminders_status    ON payment_reminders(status);
CREATE INDEX idx_reminders_scheduled ON payment_reminders(scheduled_for);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON payment_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Function: schedule_invoice_reminders
-- Call this when an invoice is sent (status → sent) to populate the queue.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION schedule_invoice_reminders(p_invoice_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_due DATE;
BEGIN
  SELECT due_date INTO v_due FROM public.invoices WHERE id = p_invoice_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Remove any existing pending reminders for this invoice (re-schedule on due date change)
  DELETE FROM public.payment_reminders
  WHERE invoice_id = p_invoice_id AND status = 'pending';

  INSERT INTO public.payment_reminders
    (invoice_id, stage, stage_label, scheduled_for, email_subject)
  VALUES
    (p_invoice_id, 1, '3 days before due',
      (v_due - INTERVAL '3 days')::TIMESTAMPTZ,
      'Friendly reminder — payment due in 3 days'),

    (p_invoice_id, 2, 'Due today',
      v_due::TIMESTAMPTZ,
      'Payment due today'),

    (p_invoice_id, 3, '3 days overdue',
      (v_due + INTERVAL '3 days')::TIMESTAMPTZ,
      'Payment overdue — 3 days past due'),

    (p_invoice_id, 4, '7 days overdue',
      (v_due + INTERVAL '7 days')::TIMESTAMPTZ,
      'Urgent: payment 7 days overdue');
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 3 — PAYMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- payment_confirmations
-- One per payment recorded. Attached PDF is generated on the fly from this row.
-- References the originating quotation for the paper trail.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE payment_confirmations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number   TEXT NOT NULL UNIQUE,             -- SD26-REC-001

  invoice_id       UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_id       UUID REFERENCES payments(id) ON DELETE SET NULL,
  quotation_id     UUID REFERENCES quotations(id) ON DELETE SET NULL,   -- for paper trail

  -- This specific payment
  amount           INTEGER NOT NULL,                 -- cents
  payment_method   TEXT,                             -- eft | cash | card | other
  payment_date     DATE NOT NULL,

  -- Email delivery
  sent_at          TIMESTAMPTZ,
  sent_to          TEXT,                             -- email address it was sent to

  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_confirmations_invoice  ON payment_confirmations(invoice_id);
CREATE INDEX idx_confirmations_payment  ON payment_confirmations(payment_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- account_statements
-- Flexible period, multiple trigger types.
-- Period types: custom | monthly | project | financial_year | 30_days
-- Trigger types: manual | retainer_monthly | reminders_ignored | project_closure | financial_year | client_request
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE account_statements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_number  TEXT NOT NULL UNIQUE,            -- SD26-STMT-001

  client_id         UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id        UUID REFERENCES projects(id) ON DELETE SET NULL,      -- for project-closure statements
  retainer_id       UUID REFERENCES retainers(id) ON DELETE SET NULL,     -- for retainer monthly statements

  -- Period
  period_type       TEXT NOT NULL DEFAULT 'custom',
  period_from       DATE NOT NULL,
  period_to         DATE NOT NULL,

  -- Trigger
  trigger_type      TEXT NOT NULL DEFAULT 'manual',

  -- Financial summary (computed at generation time and stored)
  opening_balance   INTEGER NOT NULL DEFAULT 0,      -- cents owed at period_from
  total_invoiced    INTEGER NOT NULL DEFAULT 0,      -- cents invoiced in period
  total_paid        INTEGER NOT NULL DEFAULT 0,      -- cents paid in period
  closing_balance   INTEGER NOT NULL DEFAULT 0,      -- cents outstanding at period_to

  -- Delivery
  sent_at           TIMESTAMPTZ,
  sent_to           TEXT,

  -- Notes / context visible on the statement
  notes             TEXT,

  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_statements_client  ON account_statements(client_id);
CREATE INDEX idx_statements_period  ON account_statements(period_from, period_to);
CREATE INDEX idx_statements_trigger ON account_statements(trigger_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- account_statement_items
-- Manual line items added to a statement (e.g. retainer ad-hoc work, adjustments)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE account_statement_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id   UUID NOT NULL REFERENCES account_statements(id) ON DELETE CASCADE,
  description    TEXT NOT NULL,
  amount         INTEGER NOT NULL,                   -- cents (positive = charge, negative = credit)
  item_date      DATE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stmt_items_statement ON account_statement_items(statement_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 4 — RETAINER MANAGEMENT
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- retainer_subscriptions
-- Active retainer clients. Monthly statement auto-generated on billing_day.
-- Links to the retainers table (contract) and the clients table.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE retainer_subscriptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  retainer_id      UUID REFERENCES retainers(id) ON DELETE SET NULL,      -- optional contract link

  name             TEXT NOT NULL,                    -- e.g. "eStore Retainer — Ruby's Faith"
  monthly_amount   INTEGER NOT NULL,                 -- cents
  billing_day      INTEGER NOT NULL DEFAULT 1 CHECK (billing_day IN (1, 28, 29, 30, 31)),
  -- Use 28/29/30/31 to represent "last day of month" (app resolves to actual last day)

  status           TEXT NOT NULL DEFAULT 'active',   -- active | paused | cancelled

  start_date       DATE NOT NULL,
  end_date         DATE,                             -- NULL = open-ended

  notes            TEXT,

  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_retainer_subs_client ON retainer_subscriptions(client_id);
CREATE INDEX idx_retainer_subs_status ON retainer_subscriptions(status);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON retainer_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE quotations               ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_line_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_versions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_confirmations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_statements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_statement_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE retainer_subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sequences       ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "Auth can read quotations"            ON quotations             FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can read quote items"           ON quotation_line_items   FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can read quote versions"        ON quotation_versions     FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can read credit notes"          ON credit_notes           FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can read reminders"             ON payment_reminders      FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can read confirmations"         ON payment_confirmations  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can read statements"            ON account_statements     FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can read statement items"       ON account_statement_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can read retainer subs"         ON retainer_subscriptions FOR SELECT TO authenticated USING (true);

-- Only admins can write
CREATE POLICY "Admins manage quotations"            ON quotations             FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage quote items"           ON quotation_line_items   FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage quote versions"        ON quotation_versions     FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage credit notes"          ON credit_notes           FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage reminders"             ON payment_reminders      FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage confirmations"         ON payment_confirmations  FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage statements"            ON account_statements     FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage statement items"       ON account_statement_items FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage retainer subs"         ON retainer_subscriptions FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- document_sequences: read-only for authenticated; function (SECURITY DEFINER) writes it
CREATE POLICY "Auth can read sequences"             ON document_sequences     FOR SELECT TO authenticated USING (true);

-- Public (anon) can call accept_quotation via RPC — no direct table access needed.
-- The function is SECURITY DEFINER so it bypasses RLS internally.
-- No additional policy needed for anon on quotations.
