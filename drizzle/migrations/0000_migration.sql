CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  publish_date date NOT NULL DEFAULT current_date,
  primary_language text NOT NULL DEFAULT 'ur' CHECK (primary_language IN ('en','ja','ur')),
  title jsonb NOT NULL DEFAULT '{}'::jsonb,
  body jsonb NOT NULL DEFAULT '{}'::jsonb,
  category jsonb NOT NULL DEFAULT '{}'::jsonb,
  author text,
  cover_image_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published announcements" ON public.announcements FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins read all announcements" ON public.announcements FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update announcements" ON public.announcements FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete announcements" ON public.announcements FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.announcement_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  alt jsonb NOT NULL DEFAULT '{}'::jsonb,
  caption jsonb NOT NULL DEFAULT '{}'::jsonb,
  width int,
  height int,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcement_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcement_images TO authenticated;
GRANT ALL ON public.announcement_images TO service_role;
ALTER TABLE public.announcement_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads images of published" ON public.announcement_images FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.announcements a WHERE a.id = announcement_id AND a.status = 'published'));
CREATE POLICY "Admins manage images" ON public.announcement_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.announcements ADD CONSTRAINT announcements_cover_fk FOREIGN KEY (cover_image_id) REFERENCES public.announcement_images(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER announcements_touch BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "Read media of published announcements" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'announcement-media' AND EXISTS (
    SELECT 1 FROM public.announcement_images i JOIN public.announcements a ON a.id = i.announcement_id
    WHERE i.storage_path = storage.objects.name AND a.status = 'published'));
CREATE POLICY "Admins read announcement media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'announcement-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upload announcement media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'announcement-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update announcement media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'announcement-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete announcement media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'announcement-media' AND public.has_role(auth.uid(), 'admin'));