-- employee_contracts: employment contracts for all staff types
CREATE TABLE IF NOT EXISTS employee_contracts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'temp',   -- temp | fixed | intern | probono | outsourcing | subcontractor
  content       JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by    UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE employee_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read employee_contracts"
  ON employee_contracts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage employee_contracts"
  ON employee_contracts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
