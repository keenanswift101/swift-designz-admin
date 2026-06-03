-- Track receipt sending for investor contributions (income_entries where source='investor')
ALTER TABLE income_entries
  ADD COLUMN IF NOT EXISTS receipt_number TEXT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_to TEXT;
