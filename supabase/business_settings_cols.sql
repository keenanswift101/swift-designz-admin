-- Add missing columns to business_settings
-- Run in the Supabase SQL editor.

ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS registration_date DATE;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS directors TEXT;
