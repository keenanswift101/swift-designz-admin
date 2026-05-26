-- ─────────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- Run in Supabase SQL Editor.
-- Created by: service role (admin client) — bypasses RLS.
-- Read/update by: authenticated users via RLS policy.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL DEFAULT 'info',   -- quotation_accepted | payment_received | info
  title      TEXT NOT NULL,
  body       TEXT,
  link       TEXT,                           -- relative URL, e.g. /accounts-receivable/quotations/UUID
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "Auth can read notifications" ON notifications
  FOR SELECT TO authenticated USING (true);

-- All authenticated users can mark as read (UPDATE read column only)
CREATE POLICY "Auth can mark notifications read" ON notifications
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
