-- Retainer payment records — one row per retainer fee received
-- Uses the same AR receipt numbering (generate_ar_number('receipt'))

CREATE TABLE IF NOT EXISTS retainer_payments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number            TEXT NOT NULL UNIQUE,              -- SD26-REC-XXX
  retainer_subscription_id  UUID NOT NULL REFERENCES retainer_subscriptions(id) ON DELETE CASCADE,
  amount                    INTEGER NOT NULL,                  -- cents
  payment_method            TEXT DEFAULT 'eft',               -- eft | cash | card | other
  payment_date              DATE NOT NULL,
  reference                 TEXT,                             -- bank reference
  notes                     TEXT,
  sent_at                   TIMESTAMPTZ,
  sent_to                   TEXT,
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retainer_payments_sub ON retainer_payments(retainer_subscription_id);

ALTER TABLE retainer_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read retainer payments"     ON retainer_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage retainer payments" ON retainer_payments FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Viewers manage retainer payments" ON retainer_payments FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));
