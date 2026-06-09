-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email           TEXT        NOT NULL,
  name            TEXT,
  status          TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source          TEXT        NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'public_form')),
  subscribed_at   TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admin/viewer) have full access
CREATE POLICY "auth_all" ON newsletter_subscribers
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anonymous users can subscribe (public form)
CREATE POLICY "public_insert" ON newsletter_subscribers
  FOR INSERT TO anon
  WITH CHECK (status = 'active' AND source = 'public_form');
