CREATE OR REPLACE FUNCTION public.grant_initial_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'arslankalri@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_admin
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_initial_admin();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users u WHERE lower(u.email) = 'arslankalri@gmail.com'
AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin');

CREATE TABLE public.page_views (
  day date NOT NULL DEFAULT CURRENT_DATE,
  path text NOT NULL,
  views integer NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read page views" ON public.page_views FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.record_page_view(_path text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _path IS NULL OR length(_path) > 200 OR _path !~ '^/' THEN RETURN; END IF;
  INSERT INTO public.page_views (day, path, views) VALUES (CURRENT_DATE, _path, 1)
  ON CONFLICT (day, path) DO UPDATE SET views = public.page_views.views + 1;
END $$;
REVOKE ALL ON FUNCTION public.record_page_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_page_view(text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_initial_admin() FROM PUBLIC, anon, authenticated;