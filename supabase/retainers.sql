-- retainers: user-created retainer contracts for any service type
CREATE TABLE IF NOT EXISTS retainers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  content     JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by  UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE retainers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read retainers"
  ON retainers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage retainers"
  ON retainers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
