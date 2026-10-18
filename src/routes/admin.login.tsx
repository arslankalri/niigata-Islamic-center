import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/admin/login')({
  head: () => ({ meta: [
    { title: 'Admin sign-in — Islamic Center Niigata' },
    { name: 'description', content: 'Administrator sign-in for Islamic Center Niigata.' },
    { property: 'og:title', content: 'Admin sign-in — Islamic Center Niigata' },
    { property: 'og:description', content: 'Administrator sign-in for Islamic Center Niigata.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: '/admin', replace: true }); });
    const { data } = supabase.auth.onAuthStateChange((e, s) => { if (e === 'SIGNED_IN' && s) navigate({ to: '/admin', replace: true }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);
  async function signIn() {
    setBusy(true); setError('');
    const r = await lovable.auth.signInWithOAuth('google', { redirect_uri: `${window.location.origin}/admin/login`, extraParams: { prompt: 'select_account' } });
    if (r.error) { setError('Sign-in did not complete. Please try again.'); setBusy(false); return; }
    if (r.redirected) return;
    navigate({ to: '/admin', replace: true });
  }
  return (
    <section className="content-width section-space" style={{ maxWidth: 440, textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '.5rem' }}>Admin</h1>
      <p style={{ marginBottom: '1.5rem' }}>Sign in with the center's administrator Google account.</p>
      <Button size="lg" onClick={signIn} disabled={busy}>{busy ? 'Opening Google…' : 'Sign in with Google'}</Button>
      {error && <p role="alert" style={{ marginTop: '1rem' }}>{error}</p>}
    </section>
  );
}
