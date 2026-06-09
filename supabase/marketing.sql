-- Marketing module tables
-- Run after schema.sql

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  channel      TEXT NOT NULL DEFAULT 'social_media',
  status       TEXT NOT NULL DEFAULT 'draft',
  budget_cents INTEGER NOT NULL DEFAULT 0,
  spent_cents  INTEGER NOT NULL DEFAULT 0,
  start_date   DATE,
  end_date     DATE,
  goal         TEXT,
  target_audience TEXT,
  notes        TEXT,
  created_by   UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  content      TEXT,
  platform     TEXT NOT NULL DEFAULT 'instagram',
  status       TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  notes        TEXT,
  created_by   UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id        UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  name               TEXT NOT NULL,
  subject            TEXT NOT NULL,
  body_html          TEXT NOT NULL DEFAULT '',
  body_text          TEXT NOT NULL DEFAULT '',
  status             TEXT NOT NULL DEFAULT 'draft',
  recipient_type     TEXT NOT NULL DEFAULT 'all_clients',
  custom_recipients  TEXT[] DEFAULT '{}',
  recipient_count    INTEGER DEFAULT 0,
  sent_at            TIMESTAMPTZ,
  created_by         UUID REFERENCES public.profiles(id),
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketing_campaigns_admin_viewer" ON public.marketing_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','viewer'))
  );

CREATE POLICY "content_posts_admin_viewer" ON public.content_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','viewer'))
  );

CREATE POLICY "email_campaigns_admin_viewer" ON public.email_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','viewer'))
  );
