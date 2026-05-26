-- Add scheduled_for to notifications so installment reminders only surface on their due date.
-- Run in Supabase SQL Editor.

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- Existing rows without scheduled_for show immediately (NULL = always visible).
