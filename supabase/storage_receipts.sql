-- Create receipts bucket (public = true so getPublicUrl links open in browser)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('receipts', 'receipts', true, 10485760)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760;

-- Allow viewers to upload receipts (admins already covered by existing policy in schema.sql)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Viewers can upload to receipts bucket'
  ) THEN
    CREATE POLICY "Viewers can upload to receipts bucket" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'receipts' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'viewer'));
  END IF;
END $$;

-- Add supplier invoice URL column to expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS invoice_url TEXT;
