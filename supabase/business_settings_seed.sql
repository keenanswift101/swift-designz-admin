-- Seed official business registration data for Swift Designz Investments CC
-- Run this after schema.sql in the Supabase SQL editor

UPDATE business_settings SET
  company_name       = 'Swift Designz Investments CC',
  email              = 'info@swiftdesignz.co.za',
  website            = 'swiftdesignz.co.za',
  address            = 'Erf 55 Kenneth McArthur Street, Auas Blick',
  city               = 'Windhoek',
  country            = 'Namibia',
  registration_number = 'CC/2026/055589',
  vat_number         = NULL, -- VAT registration pending; NamRA TIN is 16271273 (ITX, not VAT)
  registration_date  = '2026-05-12',
  directors          = 'Keenan Husselmann',
  updated_at         = now()
WHERE id = (SELECT id FROM business_settings LIMIT 1);
