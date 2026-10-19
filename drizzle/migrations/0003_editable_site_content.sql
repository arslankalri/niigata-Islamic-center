-- Editable site content. This migration is intentionally additive and does not alter existing content.
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage site settings" ON public.site_settings;
CREATE POLICY "Admins manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.site_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  start_at timestamptz,
  end_at timestamptz,
  reception_at timestamptz,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  poster_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published site events" ON public.site_events;
CREATE POLICY "Public can read published site events" ON public.site_events
  FOR SELECT TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "Admins manage site events" ON public.site_events;
CREATE POLICY "Admins manage site events" ON public.site_events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX IF NOT EXISTS site_events_status_start_idx ON public.site_events(status, start_at);

-- Store a manually verified schedule separately from the external official display.
-- The public site must not switch to this table until the mosque confirms the source of truth.
CREATE TABLE IF NOT EXISTS public.site_prayer_schedule (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  schedule jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_note text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.site_prayer_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage prayer schedule" ON public.site_prayer_schedule;
CREATE POLICY "Admins manage prayer schedule" ON public.site_prayer_schedule
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- These fields are intended for public display (contact details, links and notices).
DROP POLICY IF EXISTS "Public can read public website settings" ON public.site_settings;
CREATE POLICY "Public can read public website settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (key = 'public');
