ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'announcement';
ALTER TABLE public.announcements ADD CONSTRAINT announcements_content_type_check CHECK (content_type IN ('announcement','article'));
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS excerpt jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS seo_title jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS seo_description jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.announcements DROP CONSTRAINT announcements_status_check;
ALTER TABLE public.announcements ADD CONSTRAINT announcements_status_check CHECK (status IN ('draft','published','archived'));

CREATE TABLE public.admin_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL DEFAULT auth.uid(),
  actor_email text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_activity TO authenticated;
GRANT ALL ON public.admin_activity TO service_role;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read activity" ON public.admin_activity FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins log own activity" ON public.admin_activity FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND actor_id = auth.uid());
CREATE INDEX admin_activity_created_idx ON public.admin_activity (created_at DESC);