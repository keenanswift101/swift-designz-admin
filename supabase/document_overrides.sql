-- document_overrides: admin-editable content for document templates
CREATE TABLE IF NOT EXISTS document_overrides (
  slug        TEXT PRIMARY KEY,
  content     JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  updated_by  UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE document_overrides ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read (needed for PDF generation)
CREATE POLICY "Authenticated users can read document_overrides"
  ON document_overrides FOR SELECT TO authenticated USING (true);

-- Only admins can create / update / delete
CREATE POLICY "Admins can manage document_overrides"
  ON document_overrides FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
