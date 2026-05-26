-- Viewer write policies for AR tables
-- Run this in the Supabase SQL editor.
--
-- Context: viewer-role users can generate statements, send receipts, manage
-- reminders and retainers, and add payments (which auto-create income entries).
-- The server actions already allow viewers via requireAuth(); these policies
-- give the DB-level permission to match.

-- account_statements (viewer generates statements)
CREATE POLICY "Viewers can manage statements" ON account_statements FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));

-- account_statement_items (child of account_statements)
CREATE POLICY "Viewers can manage statement items" ON account_statement_items FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));

-- payment_reminders (viewer can approve / send / dismiss reminders)
CREATE POLICY "Viewers can manage reminders" ON payment_reminders FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));

-- payment_confirmations (viewer sends receipts)
CREATE POLICY "Viewers can manage confirmations" ON payment_confirmations FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));

-- retainer_subscriptions (viewer creates / manages retainers)
CREATE POLICY "Viewers can manage retainer subs" ON retainer_subscriptions FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));

-- credit_notes (viewer adds / voids credit notes on invoices)
CREATE POLICY "Viewers can manage credit notes" ON credit_notes FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));

-- income_entries (auto-created when viewer records a payment)
CREATE POLICY "Viewers can manage income" ON income_entries FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));
