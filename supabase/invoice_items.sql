-- Invoice Items Table (Phase 4)
-- Run this in the Supabase SQL Editor after the main schema.sql

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_rate INTEGER NOT NULL, -- cents
  amount INTEGER NOT NULL,    -- cents (quantity * unit_rate)
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read invoice_items" ON invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage invoice_items" ON invoice_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Viewers can manage invoice_items" ON invoice_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));

-- Add proof_url to payments table for receipt uploads
ALTER TABLE payments ADD COLUMN IF NOT EXISTS proof_url TEXT;
