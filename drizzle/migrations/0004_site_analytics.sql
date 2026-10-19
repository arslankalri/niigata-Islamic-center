-- First-party visitor analytics. Stores page views and anonymous per-tab sessions only; no IP address or raw user agent.
CREATE TABLE IF NOT EXISTS public.site_analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid NOT NULL,
  page_path text NOT NULL,
  referrer_host text,
  source text NOT NULL DEFAULT 'direct' CHECK (source IN ('direct','referral','internal')),
  device_type text NOT NULL DEFAULT 'desktop' CHECK (device_type IN ('mobile','tablet','desktop')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Visitors can record analytics events" ON public.site_analytics_events;
CREATE POLICY "Visitors can record analytics events" ON public.site_analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(page_path) BETWEEN 1 AND 300
    AND page_path NOT LIKE '/admin%'
    AND device_type IN ('mobile','tablet','desktop')
    AND source IN ('direct','referral','internal')
  );
DROP POLICY IF EXISTS "Admins read site analytics" ON public.site_analytics_events;
CREATE POLICY "Admins read site analytics" ON public.site_analytics_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX IF NOT EXISTS site_analytics_created_at_idx ON public.site_analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS site_analytics_page_path_idx ON public.site_analytics_events(page_path, created_at DESC);
